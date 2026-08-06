import { prisma } from "./db";
import { addDays, startOfDay, startOfWeek, weekStamp, mulberry32 } from "./dates";
import { planWeek as planWeekPure } from "./adaptive";

/**
 * ============================================================
 * SIMULAÇÃO DE PRÉVIA
 * ------------------------------------------------------------
 * A plataforma não é autônoma nesta fase: estes botões injetam
 * dados plausíveis para o mentor demonstrar o fluxo completo em
 * reunião (semana adaptativa, relatório de progressão, etc.).
 * ============================================================
 */

async function disciplinasComTopicos() {
  return prisma.disciplina.findMany({
    orderBy: { ordem: "asc" },
    include: { topicos: { orderBy: { ordem: "asc" } } },
  });
}

/** Histórico de N semanas concluídas: metas feitas + tentativas + pomodoros */
export async function simularHistorico(userId: string, semanas = 4): Promise<number> {
  const disc = await disciplinasComTopicos();
  const rnd = mulberry32(Date.now() % 100000);
  let geradas = 0;

  for (let s = semanas; s >= 1; s--) {
    const inicioSemana = addDays(startOfWeek(new Date()), -7 * s);
    for (let i = 0; i < 7; i++) {
      if (i === 5 || i === 6) continue; // fins de semana livres
      const dia = addDays(inicioSemana, i);
      const metaAntiga = await prisma.meta.findFirst({ where: { userId, dia } });
      if (metaAntiga) continue;
      const d = disc[Math.floor(rnd() * disc.length)];
      const topico = d.topicos[Math.floor(rnd() * d.topicos.length)];
      if (!topico) continue;
      const ok = rnd() > 0.18;
      await prisma.meta.create({
        data: {
          userId,
          topicoId: topico.id,
          dia,
          semana: weekStamp(dia),
          status: ok ? "CONCLUIDA" : rnd() > 0.5 ? "ATRASADA" : "PENDENTE",
          concluidaEm: ok ? addDays(dia, 1) : null,
          origem: "PLANEJADA",
        },
      });
      geradas += 1;
      for (let p = 0; p < 1 + Math.floor(rnd() * 3); p++) {
        await prisma.pomodoroSessao.create({
          data: { userId, inicio: addDays(dia, 1), minutos: 25, tipo: "FOCO" },
        });
      }
    }
  }
  return geradas;
}

/** Injeta erros recentes em uma disciplina (o motor adaptativo responde a isso) */
export async function simularErros(userId: string, disciplinaSlug: string, qtd = 5): Promise<number> {
  const disciplina = await prisma.disciplina.findUnique({
    where: { slug: disciplinaSlug },
    include: { topicos: { orderBy: { ordem: "asc" } } },
  });
  if (!disciplina) return 0;
  const rnd = mulberry32(Date.now() % 997);
  const modelos = [
    "Confundi o conceito central ao responder a questão da banca.",
    "Errei por trocar os termos que a banca cobra com frequência.",
    "Misturei os institutos ao fazer o exercício comentado.",
    "Caí na pegadinha clássica que a banca usa para este tópico.",
  ];
  let criados = 0;
  for (let i = 0; i < qtd; i++) {
    const topico = disciplina.topicos[Math.floor(rnd() * disciplina.topicos.length)];
    if (!topico) continue;
    const data = addDays(startOfDay(new Date()), -Math.floor(rnd() * 6));
    await prisma.erro.create({
      data: {
        userId,
        topicoId: topico.id,
        descricao: modelos[Math.floor(rnd() * modelos.length)],
        data,
        revisaoEm: addDays(data, 10),
      },
    });
    criados += 1;
  }
  return criados;
}

/** Marca a anamnese como concluída (ou a cria com padrão) */
export async function simularAnamnese(userId: string) {
  const existente = await prisma.anamnese.findUnique({ where: { userId } });
  const data = {
    horasPorDia: existente?.horasPorDia || 3,
    diasDisponiveis: existente?.diasDisponiveis?.length ? existente.diasDisponiveis : [1, 2, 3, 4, 5],
    dificuldades: existente?.dificuldades?.length ? existente.dificuldades : ["Direito Penal", "Raciocínio Lógico"],
    formatoPreferido: existente?.formatoPreferido || "video",
    objetivo: existente?.objetivo || "PC-SP Escrivão 2026",
  };
  const anamnese = await prisma.anamnese.upsert({
    where: { userId },
    update: {},
    create: { userId, ...data },
  });
  await prisma.user.update({ where: { id: userId }, data: { onboardingDone: true } });
  return anamnese;
}

export async function simularPomodoro(userId: string, minutos = 25) {
  return prisma.pomodoroSessao.create({ data: { userId, minutos, tipo: "FOCO" } });
}

export async function simularTentativas(userId: string, qtd = 10) {
  const questoes = await prisma.questao.findMany({ take: 40 });
  if (questoes.length === 0) return 0;
  const rnd = mulberry32(Date.now() % 811);
  let criadas = 0;
  for (let i = 0; i < qtd; i++) {
    const q = questoes[Math.floor(rnd() * questoes.length)];
    await prisma.tentativa.create({
      data: {
        userId,
        questaoId: q.id,
        acerto: rnd() > 0.32,
        data: addDays(startOfDay(new Date()), -Math.floor(rnd() * 7)),
      },
    });
    criadas += 1;
  }
  return criadas;
}

async function errosRecentes(userId: string) {
  const desde = addDays(startOfDay(new Date()), -7);
  const erros = await prisma.erro.findMany({ where: { userId, data: { gte: desde } }, select: { topicoId: true } });
  const topicos = await prisma.topico.findMany({ select: { id: true, disciplinaId: true } });
  const map: Record<string, number> = {};
  for (const e of erros) {
    const t = topicos.find((x) => x.id === e.topicoId);
    if (t) map[t.disciplinaId] = (map[t.disciplinaId] ?? 0) + 1;
  }
  return map;
}

/** Planeja a semana seguinte à última já planejada (avanço da simulação) */
export async function simularAvançarSemana(userId: string): Promise<number> {
  const ultima = await prisma.meta.findFirst({
    where: { userId },
    orderBy: { dia: "desc" },
    select: { dia: true },
  });
  const hoje = startOfDay(new Date());
  const base = ultima && ultima.dia > hoje ? addDays(ultima.dia, 1) : addDays(hoje, 1);
  const inicioSemana = startOfWeek(addDays(base, 7));

  const anamnese = await prisma.anamnese.findUnique({ where: { userId } });
  const dias = anamnese?.diasDisponiveis?.length ? anamnese.diasDisponiveis : [1, 2, 3, 4, 5];
  const horas = anamnese?.horasPorDia || 3;

  const metasExistentes = await prisma.meta.count({
    where: { userId, dia: { gte: inicioSemana, lt: addDays(inicioSemana, 7) } },
  });
  if (metasExistentes > 0) return 0;

  const disc = await disciplinasComTopicos();
  const pesos = computePesos(disc, await errosRecentes(userId), anamnese?.dificuldades ?? []);

  const topicosPorDisc: Record<string, { id: string; titulo: string; cargaMin: number }[]> = {};
  const consumidos: Record<string, number> = {};
  for (const d of disc) {
    topicosPorDisc[d.id] = d.topicos.map((t) => ({ id: t.id, titulo: t.titulo, cargaMin: t.cargaMin }));
    consumidos[d.id] = await prisma.meta.count({ where: { userId, topico: { disciplinaId: d.id } } });
  }

  const revisoes = await prisma.erro.findMany({
    where: { userId, status: "PENDENTE", revisaoEm: { gte: inicioSemana, lt: addDays(inicioSemana, 7) } },
    select: { id: true, topicoId: true },
    orderBy: { revisaoEm: "asc" },
  });

  const plano = await planWeekPure({
    userId,
    start: inicioSemana,
    diasDisponiveis: dias,
    horasPorDia: horas,
    pesos,
    topicosPorDisciplina: topicosPorDisc,
    consumidos,
    revisoes: revisoes.map((r) => ({ topicoId: r.topicoId, erroId: r.id, descricao: "" })),
  });

  let criadas = 0;
  for (const m of plano.metas) {
    const exist = await prisma.meta.findFirst({ where: { userId, topicoId: m.topicoId, dia: m.dia } });
    if (exist) continue;
    await prisma.meta.create({
      data: {
        userId,
        topicoId: m.topicoId,
        dia: m.dia,
        semana: weekStamp(m.dia),
        origem: m.origem === "REVISAO" ? "REVISAO" : "PLANEJADA",
      },
    });
    criadas += 1;
  }
  return criadas;
}

function computePesos(
  disciplinas: { id: string; nome: string }[],
  errosRecentes: Record<string, number>,
  dificuldades: string[],
): Record<string, number> {
  const pesos: Record<string, number> = {};
  for (const d of disciplinas) {
    const erros = errosRecentes[d.id] ?? 0;
    const erroFator = Math.min(erros * 0.3, 1.2);
    const difFator = dificuldades.some((dd) => dd.toLowerCase() === d.nome.toLowerCase()) ? 0.6 : 0;
    pesos[d.id] = 1 + erroFator + difFator;
  }
  return pesos;
}

/** Regenera a semana atual com os pesos mais recentes (após simular erros) */
export async function regenerarSemanaAtual(userId: string): Promise<number> {
  const inicioSemana = startOfWeek(new Date());
  await prisma.meta.deleteMany({
    where: { userId, status: "PENDENTE", dia: { gte: inicioSemana, lt: addDays(inicioSemana, 7) } },
  });
  return simularAvançarSemana(userId);
}
