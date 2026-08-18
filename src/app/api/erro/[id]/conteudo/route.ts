import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { gerarConteudoEstrategico } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

async function erroDoUsuario(id: string, userId: string) {
  return prisma.erro.findFirst({
    where: { id, userId },
    include: {
      conteudoEstrategico: true,
      topico: { include: { disciplina: true } },
      questao: { include: { disciplina: true } },
    },
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;

  const erro = await erroDoUsuario(id, user.id);
  if (!erro) return NextResponse.json({ error: "Erro não encontrado." }, { status: 404 });

  // Consulta auto-geradora: se ainda não existe, gera e persiste na primeira leitura.
  let conteudo = erro.conteudoEstrategico;
  if (!conteudo) {
    const gerado = await gerarConteudoEstrategico({
      disciplina: erro.topico?.disciplina.nome ?? erro.questao?.disciplina.nome ?? "Disciplina",
      topico: erro.topico?.titulo ?? erro.questao?.disciplina.nome ?? "Tópico",
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

  return NextResponse.json({
    ok: true,
    erro: { id: erro.id, topicoId: erro.topicoId, questaoId: erro.questaoId, descricao: erro.descricao },
    conteudo,
  });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;

  const erro = await erroDoUsuario(id, user.id);
  if (!erro) return NextResponse.json({ error: "Erro não encontrado." }, { status: 404 });

  const gerado = await gerarConteudoEstrategico({
    disciplina: erro.topico?.disciplina.nome ?? erro.questao?.disciplina.nome ?? "Disciplina",
    topico: erro.topico?.titulo ?? erro.questao?.disciplina.nome ?? "Tópico",
    descricao: erro.descricao,
  });

  const conteudo = await prisma.conteudoEstrategico.upsert({
    where: { erroId: erro.id },
    update: { ...gerado.conteudo, origem: gerado.origem },
    create: {
      userId: user.id,
      erroId: erro.id,
      ...gerado.conteudo,
      origem: gerado.origem,
    },
  });

  return NextResponse.json({ ok: true, conteudo, origem: gerado.origem });
}