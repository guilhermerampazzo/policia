import { prisma } from "./db";

/**
 * ============================================================
 * AGREGAÇÕES SERVER-SIDE REUTILIZÁVEIS
 * ------------------------------------------------------------
 * Tudo derivado dos dados reais (metas, tentativas, pomodoros,
 * tópicos). Tipos exportados para as páginas consumirem direto.
 * ============================================================
 */

export interface ProgressoDisciplina {
  disciplinaId: string;
  nome: string;
  cor: string;
  totalTopicos: number;
  topicosConcluidos: number;
  /** 0..1 */
  cobertura: number;
}

export interface ProgressoEdital {
  totalTopicos: number;
  topicosConcluidos: number;
  /** 0..1 */
  cobertura: number;
  porDisciplina: ProgressoDisciplina[];
}

/**
 * Progresso do edital: tópicos concluídos (metas CONCLUIDA únicas)
 * sobre o total de tópicos cadastrados, por disciplina e global.
 */
export async function progressoEdital(userId: string): Promise<ProgressoEdital> {
  const [disciplinas, metasConcluidas] = await Promise.all([
    prisma.disciplina.findMany({
      orderBy: { ordem: "asc" },
      include: { topicos: { select: { id: true } } },
    }),
    prisma.meta.findMany({
      where: { userId, status: "CONCLUIDA" },
      select: { topicoId: true },
      distinct: ["topicoId"],
    }),
  ]);

  const concluidos = new Set(metasConcluidas.map((m) => m.topicoId));

  const porDisciplina: ProgressoDisciplina[] = disciplinas.map((d) => {
    const totalTopicos = d.topicos.length;
    const topicosConcluidos = d.topicos.filter((t) => concluidos.has(t.id)).length;
    return {
      disciplinaId: d.id,
      nome: d.nome,
      cor: d.cor,
      totalTopicos,
      topicosConcluidos,
      cobertura: totalTopicos > 0 ? topicosConcluidos / totalTopicos : 0,
    };
  });

  const totalTopicos = porDisciplina.reduce((acc, p) => acc + p.totalTopicos, 0);
  const topicosConcluidos = porDisciplina.reduce((acc, p) => acc + p.topicosConcluidos, 0);

  return {
    totalTopicos,
    topicosConcluidos,
    cobertura: totalTopicos > 0 ? topicosConcluidos / totalTopicos : 0,
    porDisciplina,
  };
}

export interface AcertosErrosDisciplina {
  disciplinaId: string;
  nome: string;
  cor: string;
  acertos: number;
  erros: number;
  total: number;
}

/** Acertos/erros por disciplina a partir das tentativas reais. */
export async function acertosErrosPorDisciplina(userId: string): Promise<AcertosErrosDisciplina[]> {
  const [disciplinas, tentativas] = await Promise.all([
    prisma.disciplina.findMany({ orderBy: { ordem: "asc" } }),
    prisma.tentativa.findMany({
      where: { userId },
      select: { acerto: true, questao: { select: { disciplinaId: true } } },
    }),
  ]);

  return disciplinas.map((d) => {
    const ts = tentativas.filter((t) => t.questao.disciplinaId === d.id);
    const acertos = ts.filter((t) => t.acerto).length;
    return {
      disciplinaId: d.id,
      nome: d.nome,
      cor: d.cor,
      acertos,
      erros: ts.length - acertos,
      total: ts.length,
    };
  });
}

export interface HorasDisciplina {
  disciplinaId: string | null;
  nome: string;
  cor: string;
  minutos: number;
  horas: number;
  /** false = sessões antigas sem tópico ("não classificado") */
  classificada: boolean;
}

/**
 * Horas estudadas por disciplina, somando pomodoros pelo tópico vinculado.
 * Sessões sem tópico (antigas ou não classificadas) entram como
 * "Não classificado" no final — nenhum minuto fica de fora.
 */
export async function horasPorDisciplina(userId: string): Promise<HorasDisciplina[]> {
  const [disciplinas, pomodoros] = await Promise.all([
    prisma.disciplina.findMany({ orderBy: { ordem: "asc" } }),
    prisma.pomodoroSessao.findMany({
      where: { userId },
      select: {
        minutos: true,
        topico: { select: { disciplina: { select: { id: true, nome: true, cor: true } } } },
      },
    }),
  ]);

  const toHoras = (minutos: number) => Math.round((minutos / 60) * 10) / 10;

  const porId = new Map<string, { disciplinaId: string; nome: string; cor: string; minutos: number }>();
  for (const d of disciplinas) {
    porId.set(d.id, { disciplinaId: d.id, nome: d.nome, cor: d.cor, minutos: 0 });
  }
  let naoClassificado = 0;

  for (const p of pomodoros) {
    const disc = p.topico?.disciplina;
    if (disc && porId.has(disc.id)) {
      porId.get(disc.id)!.minutos += p.minutos;
    } else {
      naoClassificado += p.minutos;
    }
  }

  const resultado: HorasDisciplina[] = Array.from(porId.values())
    .filter((d) => d.minutos > 0)
    .map((d) => ({ ...d, horas: toHoras(d.minutos), classificada: true }));

  if (naoClassificado > 0) {
    resultado.push({
      disciplinaId: null,
      nome: "Não classificado",
      cor: "#8a8f98",
      minutos: naoClassificado,
      horas: toHoras(naoClassificado),
      classificada: false,
    });
  }

  return resultado;
}