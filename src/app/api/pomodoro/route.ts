import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  minutos: z.number().int().min(1).max(180),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const sessao = await prisma.pomodoroSessao.create({
    data: { userId: user.id, minutos: parsed.data.minutos, tipo: "FOCO" },
  });
  return NextResponse.json({ ok: true, sessao });
}
