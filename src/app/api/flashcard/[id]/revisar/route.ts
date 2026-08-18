import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { aplicarRevisao } from "@/lib/flashcard";

export const dynamic = "force-dynamic";

const schema = z.object({
  acertou: z.boolean().default(true),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const flashcard = await prisma.flashcard.findFirst({
    where: { id, userId: user.id },
  });
  if (!flashcard) return NextResponse.json({ error: "Flashcard não encontrado." }, { status: 404 });

  const estado = aplicarRevisao(flashcard, parsed.data.acertou);
  const atualizado = await prisma.flashcard.update({
    where: { id },
    data: {
      ...estado,
      revisadoEm: new Date(),
    },
  });

  return NextResponse.json({ ok: true, flashcard: atualizado });
}