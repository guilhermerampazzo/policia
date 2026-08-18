import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { aplicarRevisao, flashcardConteudo } from "@/lib/flashcard";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;

  const erro = await prisma.erro.findFirst({
    where: { id, userId: user.id },
    include: { topico: { include: { disciplina: true } }, flashcard: true },
  });
  if (!erro) return NextResponse.json({ error: "Erro não encontrado." }, { status: 404 });

  const estado = aplicarRevisao(erro.flashcard ?? { repeticoes: 0 }, true);

  await prisma.$transaction([
    prisma.erro.update({
      where: { id },
      data: { status: "REVISTO", revisadoEm: new Date() },
    }),
    prisma.flashcard.upsert({
      where: { erroId: erro.id },
      update: { ...estado, revisadoEm: new Date() },
      create: {
        userId: user.id,
        erroId: erro.id,
        ...flashcardConteudo(erro),
        ...estado,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}