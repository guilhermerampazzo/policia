export const DAY = 86400000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Segunda-feira da semana que contém d */
export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(x, diff);
}

/** Carimbo de semana (grupo de 7 dias desde a época) — estável para agrupar */
export function weekStamp(d: Date): number {
  return Math.floor(startOfDay(d).getTime() / DAY / 7);
}

export function isoDate(d: Date): string {
  const x = startOfDay(d);
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${mm}-${dd}`;
}

export function parseIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return startOfDay(new Date(y, m - 1, d));
}

export const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const DIAS_SEMANA_ABREV = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export function fmtData(d: Date, incluirAno = false): string {
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    ...(incluirAno ? { year: "numeric" } : {}),
  });
}

export function fmtDataCurta(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function fmtHora(d: Date): string {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Dias que passaram desde a data até hoje */
export function diasAtras(d: Date): number {
  return Math.round((startOfDay(new Date()).getTime() - startOfDay(d).getTime()) / DAY);
}

/** PRNG determinístico (mulberry32) para dados simulados reproduzíveis */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
