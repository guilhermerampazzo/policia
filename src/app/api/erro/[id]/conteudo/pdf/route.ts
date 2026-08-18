import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { strategicPdf } from "@/lib/strategic-pdf";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { id } = await params;
  const erro = await prisma.erro.findFirst({
    where: { id, userId: user.id },
    include: { topico: { include: { disciplina: true } }, conteudoEstrategico: true },
  });
  if (!erro) return NextResponse.json({ error: "Erro não encontrado." }, { status: 404 });
  if (!erro.conteudoEstrategico) return NextResponse.json({ error: "Gere a estratégia antes de exportar o PDF." }, { status: 404 });

  const pdf = strategicPdf({
    title: erro.topico.titulo,
    discipline: erro.topico.disciplina.nome,
    resumo: erro.conteudoEstrategico.resumo,
    pontosChave: erro.conteudoEstrategico.pontosChave,
    armadilhas: erro.conteudoEstrategico.armadilhas,
    planoRevisao: erro.conteudoEstrategico.planoRevisao,
  });
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="forja-estrategia-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
