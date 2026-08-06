import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const questoes = await prisma.questao.findMany({
    take: 12,
    include: { disciplina: { select: { nome: true, cor: true } } },
    orderBy: { id: "asc" },
  });

  const jaRespondidas = await prisma.tentativa.findMany({
    where: { userId: user.id },
    select: { questaoId: true },
  });
  const respondidas = new Set(jaRespondidas.map((t) => t.questaoId));

  const rnd = Math.random;
  const disponiveis = questoes.filter((q) => !respondidas.has(q.id));
  const pool = (disponiveis.length >= 5 ? disponiveis : questoes).slice().sort(() => rnd() - 0.5).slice(0, 5);

  return NextResponse.json({ questoes: pool });
}
