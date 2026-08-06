import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { EDITAIS } from "@/lib/edital";
import { addDays, startOfDay, startOfWeek, weekStamp } from "@/lib/dates";

export const dynamic = "force-dynamic";

const schema = z.object({
  editalId: z.string().min(1),
  alunoId: z.string().optional(),
  publicar: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const edital = EDITAIS.find((e) => e.id === parsed.data.editalId);
  if (!edital) return NextResponse.json({ error: "Edital não encontrado." }, { status: 404 });

  let alunoId = parsed.data.alunoId;
  if (!alunoId) {
    const primeiro = await prisma.user.findFirst({ where: { role: "STUDENT" }, orderBy: { criadoEm: "asc" } });
    alunoId = primeiro?.id;
  }
  if (!alunoId) return NextResponse.json({ error: "Nenhum aluno cadastrado." }, { status: 400 });

  const disciplinas = await prisma.disciplina.findMany();
  const metas = await prisma.meta.findMany({ where: { userId: alunoId }, include: { topico: true } });
  const estudados = new Set(metas.map((m) => `${m.topico.disciplinaId}|${m.topico.titulo}`));

  const resultados = edital.items.map((item) => {
    const disc = disciplinas.find((d) => d.nome === item.disciplina);
    const estudado = disc ? estudados.has(`${disc.id}|${item.titulo}`) : false;
    const nivel = item.recorrenciaNum >= 0.8 ? "alta" : item.recorrenciaNum >= 0.6 ? "media" : "baixa";
    return {
      titulo: item.titulo,
      disciplina: item.disciplina,
      recorrencia: item.recorrencia,
      recorrenciaNum: item.recorrenciaNum,
      nivel,
      estudado,
      novo: !estudado,
    };
  });

  const priorizados = resultados.sort(
    (a, b) =>
      Number(b.novo) - Number(a.novo) ||
      b.recorrenciaNum - a.recorrenciaNum,
  );

  let publicados = 0;
  if (parsed.data.publicar) {
    const novos = priorizados.filter((r) => r.novo).slice(0, 3);
    const inicio = startOfWeek(new Date());
    const anamnese = await prisma.anamnese.findUnique({ where: { userId: alunoId } });
    const dias = anamnese?.diasDisponiveis?.length ? anamnese.diasDisponiveis : [1, 2, 3, 4, 5];

    let diaIdx = 0;
    for (const item of novos) {
      const disc = disciplinas.find((d) => d.nome === item.disciplina);
      if (!disc) continue;
      const topico = await prisma.topico.findFirst({ where: { disciplinaId: disc.id, titulo: item.titulo } });
      if (!topico) continue;
      // próximo dia disponível
      let dia = addDays(inicio, 0);
      while (!dias.includes(dia.getDay())) dia = addDays(dia, 1);
      const existente = await prisma.meta.findFirst({ where: { userId: alunoId, topicoId: topico.id } });
      if (existente) continue;
      await prisma.meta.create({
        data: { userId: alunoId, topicoId: topico.id, dia, semana: weekStamp(dia), origem: "MANUAL" },
      });
      publicados += 1;
      diaIdx += 1;
      dia = addDays(dia, 1);
    }
  }

  return NextResponse.json({
    ok: true,
    edital: { id: edital.id, nome: edital.nome, banca: edital.banca },
    resultados: priorizados,
    publicados,
  });
}
