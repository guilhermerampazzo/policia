import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;

  const meta = await prisma.meta.findFirst({ where: { id, userId: user.id } });
  if (!meta) return NextResponse.json({ error: "Meta não encontrada." }, { status: 404 });

  const atualizada = await prisma.meta.update({
    where: { id },
    data: { status: "CONCLUIDA", concluidaEm: new Date() },
  });
  return NextResponse.json({ ok: true, meta: atualizada });
}
