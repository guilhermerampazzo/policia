import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { gerarArvoreMental, arvoreDeTexto, AiNaoConfiguradoError } from "@/lib/ai";
import { arvoreDeTopicos } from "@/lib/mindmap";
import { arvoreParaDataUri } from "@/lib/mindmapImage";

export const dynamic = "force-dynamic";

const schema = z.object({
  titulo: z.string().min(2).max(120),
  disciplinaId: z.string().min(1),
  modo: z.enum(["ia", "manual"]),
  contexto: z.string().max(12000).optional().default(""),
  topicos: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        children: z.array(z.string().max(120)).optional(),
      }),
    )
    .optional(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const disciplina = await prisma.disciplina.findUnique({ where: { id: parsed.data.disciplinaId } });
  if (!disciplina) return NextResponse.json({ error: "Disciplina não encontrada." }, { status: 404 });

  let arvore;
  let origem: "ia" | "texto" | "manual" = "manual";

  if (parsed.data.modo === "ia") {
    try {
      arvore = await gerarArvoreMental({
        titulo: parsed.data.titulo,
        contexto: parsed.data.contexto || `Mapa mental sobre ${parsed.data.titulo} (${disciplina.nome}).`,
      });
      origem = "ia";
    } catch (e) {
      if (e instanceof AiNaoConfiguradoError) {
        arvore = arvoreDeTexto(parsed.data.contexto || parsed.data.titulo, parsed.data.titulo);
        origem = "texto";
      } else {
        arvore = arvoreDeTexto(parsed.data.contexto || parsed.data.titulo, parsed.data.titulo);
        origem = "texto";
      }
    }
  } else {
    arvore = arvoreDeTopicos(
      parsed.data.titulo,
      (parsed.data.topicos ?? []).length
        ? parsed.data.topicos!.map((t) => ({ label: t.label, children: t.children ?? [] }))
        : [{ label: "Sem tópicos", children: [] }],
    );
  }

  const mapa = await prisma.mapaMental.create({
    data: {
      autorId: user.id,
      disciplinaId: disciplina.id,
      titulo: parsed.data.titulo,
      arvoreJson: JSON.stringify(arvore),
      imagemBase64: arvoreParaDataUri(arvore),
      publica: true,
    },
  });

  return NextResponse.json({ ok: true, mapa, origem, arvore, imagem: arvoreParaDataUri(arvore) });
}
