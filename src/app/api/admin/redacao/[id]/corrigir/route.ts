import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  nota: z.number().int().min(0).max(100),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const redacao = await prisma.redacao.findUnique({ where: { id } });
  if (!redacao) return NextResponse.json({ error: "Redação não encontrada." }, { status: 404 });

  const atualizada = await prisma.redacao.update({
    where: { id },
    data: { nota: parsed.data.nota, status: "CORRIGIDA" },
  });
  return NextResponse.json({ ok: true, redacao: atualizada });
}
