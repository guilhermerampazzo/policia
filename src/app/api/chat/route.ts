import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  conversaId: z.string().optional(),
  topico: z.string().min(2).max(120).optional(),
  texto: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  let conversaId = parsed.data.conversaId;
  if (!conversaId) {
    const topico = parsed.data.topico ?? "Nova dúvida";
    if (user.role === "STUDENT") {
      const nova = await prisma.conversa.create({
        data: { alunoId: user.id, topico },
      });
      conversaId = nova.id;
    } else {
      return NextResponse.json({ error: "Selecione o aluno para abrir uma dúvida." }, { status: 400 });
    }
  }

  const conversa = await prisma.conversa.findUnique({
    where: { id: conversaId },
    include: { aluno: { select: { id: true } } },
  });
  if (!conversa) return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  if (user.role === "STUDENT" && conversa.alunoId !== user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const msg = await prisma.mensagem.create({
    data: { conversaId, autorId: user.id, texto: parsed.data.texto },
    include: { autor: { select: { name: true, role: true } } },
  });
  await prisma.conversa.update({ where: { id: conversaId }, data: { aberta: true } });

  return NextResponse.json({ ok: true, msg });
}
