import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;

  const erro = await prisma.erro.findFirst({ where: { id, userId: user.id } });
  if (!erro) return NextResponse.json({ error: "Erro não encontrado." }, { status: 404 });

  await prisma.erro.update({
    where: { id },
    data: { status: "REVISTO", revisadoEm: new Date() },
  });
  return NextResponse.json({ ok: true });
}
