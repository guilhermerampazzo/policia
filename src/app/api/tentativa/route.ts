import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { addDays, startOfDay } from "@/lib/dates";
import { flashcardConteudo } from "@/lib/flashcard";
import { gerarConteudoEstrategico } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

const schema = z.object({
  questaoId: z.string().min(1),
  alternativa: z.number().int().min(0).max(4),
});

const LETRAS = ["A", "B", "C", "D", "E"];

async function topicoPadraoDaDisciplina(disciplinaId: string): Promise<string | null> {
  const topico = await prisma.topico.findFirst({
    where: { disciplinaId },
    orderBy: { ordem: "asc" },
    select: { id: true },
  });
  return topico?.id ?? null;
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const questao = await prisma.questao.findUnique({
    where: { id: parsed.data.questaoId },
    include: { disciplina: true, topico: true },
  });
  if (!questao) return NextResponse.json({ error: "Questão não encontrada." }, { status: 404 });

  const acerto = parsed.data.alternativa === questao.gabarito;

  // Não duplica a mesma questão/tentativa: mantém a primeira resposta registrada.
  let tentativa = await prisma.tentativa.findFirst({
    where: { userId: user.id, questaoId: questao.id },
  });
  if (!tentativa) {
    tentativa = await prisma.tentativa.create({
      data: { userId: user.id, questaoId: questao.id, acerto },
    });
  }

  const base = { ok: true, acerto, gabarito: questao.gabarito, comentario: questao.comentario };

  if (!acerto) {
    // Registra o erro vinculado à questão (sem duplicar) + flashcard + conteúdo estratégico.
    let erro = await prisma.erro.findFirst({
      where: { userId: user.id, questaoId: questao.id },
      include: { topico: { include: { disciplina: true } } },
    });

    if (!erro) {
      const topicoId = questao.topicoId ?? (await topicoPadraoDaDisciplina(questao.disciplinaId));
      if (topicoId) {
        erro = await prisma.erro.create({
          data: {
            userId: user.id,
            topicoId,
            questaoId: questao.id,
            descricao: `Errei a questão da banca (${questao.banca || "sem banca"}): ${questao.enunciado.slice(0, 140)}. Gabarito: alternativa ${LETRAS[questao.gabarito] ?? questao.gabarito}.`,
            revisaoEm: addDays(startOfDay(new Date()), 3),
          },
          include: { topico: { include: { disciplina: true } } },
        });
      }
    }

    if (erro) {
      let conteudo = await prisma.conteudoEstrategico.findUnique({ where: { erroId: erro.id } });
      if (!conteudo) {
        const gerado = await gerarConteudoEstrategico({
          disciplina: questao.disciplina.nome,
          topico: questao.topico?.titulo ?? erro.topico?.titulo ?? questao.disciplina.nome,
          descricao: erro.descricao,
        });
        conteudo = await prisma.conteudoEstrategico.create({
          data: {
            userId: user.id,
            erroId: erro.id,
            ...gerado.conteudo,
            origem: gerado.origem,
          },
        });
      }
      const fc = flashcardConteudo(erro);
      await prisma.flashcard.upsert({
        where: { erroId: erro.id },
        update: { pergunta: fc.pergunta, resposta: fc.resposta },
        create: {
          userId: user.id,
          erroId: erro.id,
          pergunta: fc.pergunta,
          resposta: fc.resposta,
          proximaRevisao: erro.revisaoEm,
        },
      });

      return NextResponse.json({
        ...base,
        erro: { id: erro.id, topicoId: erro.topicoId, questaoId: erro.questaoId, descricao: erro.descricao },
        conteudoEstrategico: conteudo,
      });
    }
  }

  return NextResponse.json(base);
}