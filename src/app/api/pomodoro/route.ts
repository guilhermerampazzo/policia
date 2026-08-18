import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  minutos: z.number().int().min(1).max(180),
  topicoId: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  if (parsed.data.topicoId) {
    const topico = await prisma.topico.findUnique({ where: { id: parsed.data.topicoId } });
    if (!topico) return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  }

  const sessao = await prisma.pomodoroSessao.create({
    data: {
      userId: user.id,
      minutos: parsed.data.minutos,
      tipo: "FOCO",
      topicoId: parsed.data.topicoId,
    },
  });
  return NextResponse.json({ ok: true, sessao });
}
