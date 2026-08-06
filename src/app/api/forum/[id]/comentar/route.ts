import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  texto: z.string().min(1).max(1500),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const comentario = await prisma.forumComentario.create({
    data: { topicoId: id, autorId: user.id, texto: parsed.data.texto },
    include: { autor: { select: { name: true, role: true } } },
  });
  return NextResponse.json({ ok: true, comentario });
}
