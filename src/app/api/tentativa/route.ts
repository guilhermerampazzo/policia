import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  questaoId: z.string().min(1),
  alternativa: z.number().int().min(0).max(4),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const questao = await prisma.questao.findUnique({ where: { id: parsed.data.questaoId } });
  if (!questao) return NextResponse.json({ error: "Questão não encontrada." }, { status: 404 });

  const acerto = parsed.data.alternativa === questao.gabarito;
  await prisma.tentativa.create({
    data: {
      userId: user.id,
      questaoId: questao.id,
      acerto,
    },
  });
  return NextResponse.json({ ok: true, acerto, gabarito: questao.gabarito, comentario: questao.comentario });
}
