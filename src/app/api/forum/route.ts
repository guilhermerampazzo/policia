import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  titulo: z.string().min(3).max(140),
  corpo: z.string().min(3).max(3000),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const topico = await prisma.forumTopico.create({
    data: { autorId: user.id, titulo: parsed.data.titulo, corpo: parsed.data.corpo },
    include: { autor: { select: { name: true } } },
  });
  return NextResponse.json({ ok: true, topico });
}
