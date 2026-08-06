import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  tema: z.string().min(3).max(200),
  texto: z.string().min(10).max(8000),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const redacao = await prisma.redacao.create({
    data: { userId: user.id, tema: parsed.data.tema, texto: parsed.data.texto },
  });
  return NextResponse.json({ ok: true, redacao });
}
