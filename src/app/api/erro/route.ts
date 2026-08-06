import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { addDays, startOfDay } from "@/lib/dates";

export const dynamic = "force-dynamic";

const schema = z.object({
  topicoId: z.string().min(1),
  descricao: z.string().min(3).max(600),
  revisaoDias: z.number().int().min(1).max(60).default(10),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const topico = await prisma.topico.findUnique({ where: { id: parsed.data.topicoId } });
  if (!topico) return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });

  const erro = await prisma.erro.create({
    data: {
      userId: user.id,
      topicoId: parsed.data.topicoId,
      descricao: parsed.data.descricao,
      revisaoEm: addDays(startOfDay(new Date()), parsed.data.revisaoDias),
    },
  });
  return NextResponse.json({ ok: true, erro });
}
