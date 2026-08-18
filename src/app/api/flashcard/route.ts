import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { flashcardConteudo } from "@/lib/flashcard";
import { startOfDay } from "@/lib/dates";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  erroId: z.string().min(1),
});

const includeErro = {
  erro: {
    include: { topico: { include: { disciplina: true } } },
  },
} as const;

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const url = new URL(req.url);
  const devidas = url.searchParams.get("devidas") === "true";
  const erroId = url.searchParams.get("erroId");

  const where = {
    userId: user.id,
    ...(erroId ? { erroId } : {}),
    ...(devidas ? { proximaRevisao: { lte: startOfDay(new Date()) } } : {}),
  };

  const flashcards = await prisma.flashcard.findMany({
    where,
    include: includeErro,
    orderBy: [{ proximaRevisao: "asc" }, { criadoEm: "asc" }, { id: "asc" }],
  });

  return NextResponse.json({ ok: true, flashcards });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const erro = await prisma.erro.findFirst({
    where: { id: parsed.data.erroId, userId: user.id },
    include: { topico: { include: { disciplina: true } } },
  });
  if (!erro) return NextResponse.json({ error: "Erro não encontrado." }, { status: 404 });

  const conteudo = flashcardConteudo(erro);
  const flashcard = await prisma.flashcard.upsert({
    where: { erroId: erro.id },
    update: { pergunta: conteudo.pergunta, resposta: conteudo.resposta },
    create: {
      userId: user.id,
      erroId: erro.id,
      pergunta: conteudo.pergunta,
      resposta: conteudo.resposta,
      proximaRevisao: erro.revisaoEm,
    },
  });

  return NextResponse.json({ ok: true, flashcard });
}