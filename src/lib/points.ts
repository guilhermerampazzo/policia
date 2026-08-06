import { prisma } from "./db";
import { startOfDay, addDays, DAY } from "./dates";

export const XP = {
  META_CONCLUIDA: 10,
  QUESTAO: 2,
  POMODORO: 5,
  REVISAO: 8,
};

export async function computeXp(userId: string): Promise<number> {
  const [metas, questoes, pomodoros, revisoes] = await Promise.all([
    prisma.meta.count({ where: { userId, status: "CONCLUIDA" } }),
    prisma.tentativa.count({ where: { userId } }),
    prisma.pomodoroSessao.count({ where: { userId, tipo: "FOCO" } }),
    prisma.erro.count({ where: { userId, status: "REVISTO" } }),
  ]);
  return (
    metas * XP.META_CONCLUIDA +
    questoes * XP.QUESTAO +
    pomodoros * XP.POMODORO +
    revisoes * XP.REVISAO
  );
}

export function levelFromXp(xp: number): { nivel: number; atual: number; proximo: number } {
  const atual = Math.floor(xp / 500);
  return {
    nivel: atual + 1,
    atual: xp,
    proximo: (atual + 1) * 500,
  };
}

export const NOMES_NIVEIS = [
  "Recruta",
  "Soldado",
  "Cabo",
  "Sargento",
  "Tenente",
  "Capitão",
  "Major",
  "Tenente-Coronel",
  "Coronel",
];

export function nomeNivel(xp: number): string {
  return NOMES_NIVEIS[Math.min(Math.floor(xp / 500), NOMES_NIVEIS.length - 1)];
}

/** Sequência de estudo: dias consecutivos (até hoje) com qualquer atividade */
export async function computeStreak(userId: string): Promise<number> {
  const [metas, tentativas, pomodoros] = await Promise.all([
    prisma.meta.findMany({
      where: { userId, status: "CONCLUIDA" },
      select: { concluidaEm: true },
    }),
    prisma.tentativa.findMany({ where: { userId }, select: { data: true } }),
    prisma.pomodoroSessao.findMany({ where: { userId }, select: { inicio: true } }),
  ]);

  const ativos = new Set<string>();
  metas.forEach((m) => m.concluidaEm && ativos.add(startOfDay(m.concluidaEm).getTime().toString()));
  tentativas.forEach((t) => ativos.add(startOfDay(t.data).getTime().toString()));
  pomodoros.forEach((p) => ativos.add(startOfDay(p.inicio).getTime().toString()));

  let streak = 0;
  let cursor = startOfDay(new Date());
  if (!ativos.has(cursor.getTime().toString())) cursor = addDays(cursor, -1);
  while (ativos.has(cursor.getTime().toString())) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function computeXpEStreak(userId: string) {
  const [xp, streak] = await Promise.all([computeXp(userId), computeStreak(userId)]);
  return { xp, streak };
}

/** Minutos de foco por dia (para relatórios) */
export async function minutosPorDia(userId: string, dias = 14): Promise<{ dia: string; minutos: number }[]> {
  const from = addDays(startOfDay(new Date()), -(dias - 1));
  const sessoes = await prisma.pomodoroSessao.findMany({
    where: { userId, tipo: "FOCO", inicio: { gte: from } },
    select: { inicio: true, minutos: true },
  });
  const map = new Map<string, number>();
  sessoes.forEach((s) => {
    const k = startOfDay(s.inicio).getTime().toString();
    map.set(k, (map.get(k) ?? 0) + s.minutos);
  });
  const out: { dia: string; minutos: number }[] = [];
  for (let i = 0; i < dias; i++) {
    const d = addDays(from, i);
    const t = startOfDay(d).getTime().toString();
    out.push({ dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), minutos: map.get(t) ?? 0 });
  }
  return out;
}
