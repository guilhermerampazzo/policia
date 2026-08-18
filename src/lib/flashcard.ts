import type { Erro, Topico, Disciplina } from "@prisma/client";
import { addDays, startOfDay } from "./dates";

export type ErroComContexto = Erro & {
  topico?: (Topico & { disciplina?: Disciplina | null }) | null;
};

/** Conteúdo determinístico do flashcard derivado do erro — sem IA nem aleatoriedade. */
export function flashcardConteudo(erro: ErroComContexto): { pergunta: string; resposta: string } {
  const topico = erro.topico?.titulo ?? "Tópico";
  const disciplina = erro.topico?.disciplina?.nome ?? "Disciplina";
  return {
    pergunta: `${disciplina} — ${topico}: por que você errou?`,
    resposta: erro.descricao || "Revise o tópico e refaça questões da banca.",
  };
}

export interface EstadoRevisao {
  repeticoes: number;
  intervalo: number;
  proximaRevisao: Date;
}

/**
 * Intervalos determinísticos (1, 2, 4, 8, 16, 30 dias).
 * Acerto: dobra o intervalo e avança; erro: zera e agenda para amanhã.
 */
export function aplicarRevisao(f: { repeticoes: number }, acertou: boolean): EstadoRevisao {
  if (acertou) {
    const repeticoes = f.repeticoes + 1;
    const intervalo = Math.min(30, 1 << Math.min(repeticoes, 5));
    return { repeticoes, intervalo, proximaRevisao: addDays(startOfDay(new Date()), intervalo) };
  }
  return { repeticoes: 0, intervalo: 1, proximaRevisao: addDays(startOfDay(new Date()), 1) };
}