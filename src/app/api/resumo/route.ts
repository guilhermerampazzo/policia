import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { aiConfigurado, gerarResumo } from "@/lib/ai";

export const dynamic = "force-dynamic";

const schema = z.object({
  topicoId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const topico = await prisma.topico.findUnique({
    where: { id: parsed.data.topicoId },
    include: { disciplina: true },
  });
  if (!topico) return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });

  let resumo: string;
  let origem: "ia" | "fallback";
  if (aiConfigurado()) {
    try {
      resumo = await gerarResumo({
        titulo: topico.titulo,
        contexto: `Disciplina: ${topico.disciplina.nome}. Tópico do currículo de concursos policiais (banca Vunesp/PC-SP).`,
      });
      origem = "ia";
    } catch {
      resumo =
        "A IA não conseguiu gerar o resumo agora. Confira a videoaula e o PDF da meta — o conteúdo completo está disponível acima.";
      origem = "fallback";
    }
  } else {
    resumo =
      "Chave de IA não configurada — resumo automático desativado na prévia. " +
      "Configure a chave no .env para gerar resumos. O conteúdo da meta (videoaula/PDF) continua acessível.";
    origem = "fallback";
  }

  return NextResponse.json({ ok: true, resumo, origem });
}
