import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  acessoAte: z.union([z.string().min(1), z.null()]),
});

async function updateAccess(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await currentUser();
  if (!actor || actor.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas mentores podem alterar acessos." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data de acesso inválida." }, { status: 400 });

  const { id } = await params;
  const aluno = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!aluno || aluno.role !== "STUDENT") {
    return NextResponse.json({ error: "Aluno não encontrado." }, { status: 404 });
  }

  let acessoAte: Date | null = null;
  if (parsed.data.acessoAte !== null) {
    const date = new Date(parsed.data.acessoAte);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Data de acesso inválida." }, { status: 400 });
    }
    acessoAte = date;
  }

  const atualizado = await prisma.user.update({
    where: { id },
    data: { acessoAte },
    select: { id: true, acessoAte: true },
  });

  return NextResponse.json({ ok: true, aluno: atualizado });
}

export const PATCH = updateAccess;
export const PUT = updateAccess;
