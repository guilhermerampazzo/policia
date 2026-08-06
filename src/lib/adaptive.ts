import { prisma } from "./db";
import { addDays, startOfDay, weekStamp } from "./dates";

/**
 * ============================================================
 * MOTOR ADAPTATIVO (determinístico)
 * ------------------------------------------------------------
 * Decide o quanto cada disciplina pesa na próxima semana a
 * partir de: (1) erros recentes, (2) dificuldades declaradas
 * na anamnese, (3) disponibilidade de horas do aluno.
 *
 * Regra do cliente: "errou bastante em Direito Penal esta
 * semana → semana que vem o sistema direciona mais conteúdo
 * de Direito Penal (seguindo a sequência do currículo)".
 * ============================================================
 */

export const ERROS_JANELA_DIAS = 7;

/** Peso bruto de cada disciplina para a próxima semana. */
export function computeWeights(
  disciplinas: { id: string; nome: string }[],
  errosRecentes: Record<string, number>,
  dificuldadesDeclaradas: string[],
): Record<string, number> {
  const pesos: Record<string, number> = {};
  for (const d of disciplinas) {
    const erros = errosRecentes[d.id] ?? 0;
    const erroFator = Math.min(erros * 0.3, 1.2); // até +120%
    const difFator = dificuldadesDeclaradas.some(
      (dd) => dd.toLowerCase() === d.nome.toLowerCase(),
    )
      ? 0.6
      : 0;
    pesos[d.id] = 1 + erroFator + difFator;
  }
  return pesos;
}

/**
 * Distribui os dias de estudo da semana entre disciplinas,
 * proporcional ao peso (método dos maiores restos) e intercala
 * os dias em round-robin para não amontoar a mesma disciplina.
 * Retorna as metas planejadas (não persiste).
 */
export function distribuirDias(
  pesos: Record<string, number>,
  totalDias: number,
): string[] {
  const ids = Object.keys(pesos).filter((id) => pesos[id] > 0);
  const soma = ids.reduce((acc, id) => acc + pesos[id], 0);
  if (soma <= 0 || totalDias <= 0) return [];

  const fracoes = ids.map((id) => ({ id, frac: (pesos[id] / soma) * totalDias }));
  const contagens: Record<string, number> = {};
  let alocado = 0;
  for (const f of fracoes) {
    const inteiro = Math.floor(f.frac);
    contagens[f.id] = inteiro;
    alocado += inteiro;
    f.frac -= inteiro;
  }
  // maiores restos preenchem o que faltou
  const sobras = [...fracoes].sort((a, b) => b.frac - a.frac);
  for (const s of sobras) {
    if (alocado >= totalDias) break;
    contagens[s.id] += 1;
    alocado += 1;
  }

  const ordem = ids
    .filter((id) => contagens[id] > 0)
    .sort((a, b) => contagens[b] - contagens[a] || pesos[b] - pesos[a]);

  const seq: string[] = [];
  const usados: Record<string, number> = {};
  ordem.forEach((id) => (usados[id] = 0));
  let restantes = totalDias;
  while (restantes > 0) {
    let avancou = false;
    for (const id of ordem) {
      if (usados[id] < contagens[id]) {
        seq.push(id);
        usados[id] += 1;
        restantes -= 1;
        avancou = true;
      }
    }
    if (!avancou) break;
  }
  return seq;
}

export interface TopicoDoPlano {
  id: string;
  titulo: string;
  cargaMin: number;
}

export interface PlanoSemana {
  metas: {
    dia: Date;
    topicoId: string;
    disciplinaId: string;
    origem: "PLANEJADA" | "REVISAO";
    titulo: string;
    disciplina: string;
  }[];
  consumidos: Record<string, number>;
  pesos: Record<string, number>;
}

/**
 * Gera o plano da semana do aluno.
 * - `start`: segunda-feira da semana a planejar
 * - `diasDisponiveis`: weekday numbers (0=domingo) em que estuda
 * - `consumidos`: quantos tópicos de cada disciplina já foram usados
 * - `revisoes`: erros com revisaoEm dentro da semana (viram metas REVISAO)
 */
export async function planWeek(args: {
  userId: string;
  start: Date;
  diasDisponiveis: number[];
  horasPorDia: number;
  pesos: Record<string, number>;
  topicosPorDisciplina: Record<string, TopicoDoPlano[]>;
  consumidos: Record<string, number>;
  revisoes?: { topicoId: string; descricao: string; erroId: string }[];
}): Promise<PlanoSemana> {
  const {
    start,
    diasDisponiveis,
    pesos,
    topicosPorDisciplina,
    consumidos,
    revisoes = [],
  } = args;

  const metas: PlanoSemana["metas"] = [];
  const novosConsumidos = { ...consumidos };

  // dias da semana (seg a dom) que o aluno estuda
  const diasDaSemana: { dia: Date; dow: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const dia = addDays(start, i);
    if (diasDisponiveis.includes(dia.getDay())) diasDaSemana.push({ dia, dow: dia.getDay() });
  }

  // 1) revisões agendadas têm prioridade
  const diasComRevisao = diasDaSemana.filter((_, idx) => idx < revisoes.length);
  const planoDias: { dia: Date; topicoId: string; origem: "REVISAO" | "PLANEJADA"; erroId?: string }[] =
    diasComRevisao.map((d, idx) => ({
      dia: d.dia,
      topicoId: revisoes[idx].topicoId,
      origem: "REVISAO" as const,
      erroId: revisoes[idx].erroId,
    }));

  // 2) dias restantes viram estudo novo (distribuição por peso)
  const diasEstudo = diasDaSemana.slice(diasComRevisao.length);

  // filtra disciplinas que ainda têm tópicos disponíveis
  const pesosUsaveis: Record<string, number> = {};
  for (const [id, p] of Object.entries(pesos)) {
    const topicos = topicosPorDisciplina[id];
    const disponiveis = (topicos ?? []).length - (novosConsumidos[id] ?? 0);
    if (disponiveis > 0) pesosUsaveis[id] = p;
  }
  const seq = distribuirDias(pesosUsaveis, diasEstudo.length);

  for (let i = 0; i < diasEstudo.length; i++) {
    const disciplinaId = seq[i];
    if (!disciplinaId) break;
    const topicos = topicosPorDisciplina[disciplinaId] ?? [];
    const idx = novosConsumidos[disciplinaId] ?? 0;
    const topico = topicos[idx];
    if (!topico) continue;
    novosConsumidos[disciplinaId] = idx + 1;
    planoDias.push({ dia: diasEstudo[i].dia, topicoId: topico.id, origem: "PLANEJADA" });
  }

  // converte em metas (sem persistir) + metadados para UI
  const nomeDisciplina: Record<string, string> = {};
  for (const [id, topicos] of Object.entries(topicosPorDisciplina)) {
    void topicos;
    nomeDisciplina[id] = "";
  }
  const planoMetas: PlanoSemana["metas"] = [];
  for (const p of planoDias) {
    const topico = Object.values(topicosPorDisciplina)
      .flat()
      .find((t) => t.id === p.topicoId);
    if (!topico) continue;
    const disciplinaId = Object.keys(topicosPorDisciplina).find((id) =>
      topicosPorDisciplina[id].some((t) => t.id === p.topicoId),
    )!;
    planoMetas.push({
      dia: p.dia,
      topicoId: p.topicoId,
      disciplinaId,
      origem: p.origem,
      titulo: topico.titulo,
      disciplina: nomeDisciplina[disciplinaId] ?? disciplinaId,
    });
  }

  return { metas: planoMetas, consumidos: novosConsumidos, pesos };
}

/** Persiste as metas de um plano na semana informada (idempotente por (user, dia)). */
export async function persistirPlano(
  userId: string,
  metas: PlanoSemana["metas"],
  semana: number,
): Promise<number> {
  let criadas = 0;
  for (const m of metas) {
    const existente = await prisma.meta.findFirst({
      where: { userId, topicoId: m.topicoId, dia: m.dia },
    });
    if (existente) continue;
    await prisma.meta.create({
      data: {
        userId,
        topicoId: m.topicoId,
        dia: m.dia,
        semana,
        origem: m.origem === "REVISAO" ? "REVISAO" : "PLANEJADA",
      },
    });
    criadas += 1;
  }
  return criadas;
}

/** Recupera erros cuja revisão cai dentro da semana */
export async function revisoesDaSemana(userId: string, start: Date) {
  const fim = addDays(start, 7);
  return prisma.erro.findMany({
    where: {
      userId,
      status: "PENDENTE",
      revisaoEm: { gte: start, lt: fim },
    },
    select: { id: true, topicoId: true, descricao: true },
    orderBy: { revisaoEm: "asc" },
  });
}

/** Consulta auxiliar: erros recentes agrupados por disciplina */
export async function errosRecentesPorDisciplina(userId: string, janelaDias = ERROS_JANELA_DIAS) {
  const desde = addDays(startOfDay(new Date()), -janelaDias);
  const erros = await prisma.erro.findMany({
    where: { userId, data: { gte: desde } },
    select: { topicoId: true, data: true },
  });
  const topicos = await prisma.topico.findMany({ select: { id: true, disciplinaId: true } });
  const map: Record<string, number> = {};
  for (const e of erros) {
    const t = topicos.find((t) => t.id === e.topicoId);
    if (!t) continue;
    map[t.disciplinaId] = (map[t.disciplinaId] ?? 0) + 1;
  }
  return map;
}

export { weekStamp };
