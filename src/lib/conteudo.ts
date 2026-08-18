import type { ConteudoEstrategicoPayload } from "./ai";
import { aiConfigurado, gerarConteudoEstrategicoIA } from "./ai";

export type OrigemConteudo = "ia" | "fallback";

export interface GerarConteudoArgs {
  disciplina: string;
  topico: string;
  descricao: string;
}

export interface ConteudoEstrategicoComOrigem {
  conteudo: ConteudoEstrategicoPayload;
  origem: OrigemConteudo;
}

/**
 * Fallback determinístico em pt-BR derivado de disciplina/tópico/descrição.
 * NUNCA finge ser IA: a origem é "fallback" e o texto é claramente gerado
 * por regras (não há conteúdo inventado apresentado como inteligência artificial).
 */
export function conteudoEstrategicoFallback(args: GerarConteudoArgs): ConteudoEstrategicoPayload {
  const { disciplina, topico, descricao } = args;
  const assunto = topico && topico !== disciplina ? topico : disciplina || "o assunto";
  const contexto = disciplina && disciplina !== assunto ? ` dentro de ${disciplina}` : "";
  return {
    resumo: `Foco em ${assunto}${contexto}. Consolide o ponto que gerou o erro: ${descricao || "revise a teoria e refaça questões do assunto."}`,
    pontosChave: [
      `Entenda os conceitos centrais de ${assunto} antes de avançar.`,
      descricao
        ? `Confira na teoria o ponto que causou o erro: ${descricao}.`
        : "Relacione o conteúdo ao perfil de cobrança da banca do concurso.",
      "Refaça questões comentadas do assunto até acertar duas seguidas.",
    ],
    armadilhas: [
      "A banca costuma trocar termos semelhantes para induzir ao erro.",
      "Leia o enunciado por completo antes de marcar a alternativa.",
    ],
    planoRevisao: "Revise em 1 dia, depois em 3, 7 e 15 dias para fixar o conteúdo no longo prazo.",
  };
}

/**
 * Gera o conteúdo estratégico reutilizando a IA quando configurada e com
 * fallback determinístico sempre disponível. Retorna a origem para que a UI
 * possa distinguir "gerado por IA" de "material padrão do app".
 */
export async function gerarConteudoEstrategico(args: GerarConteudoArgs): Promise<ConteudoEstrategicoComOrigem> {
  if (aiConfigurado()) {
    try {
      return { conteudo: await gerarConteudoEstrategicoIA(args), origem: "ia" };
    } catch {
      // segue para o fallback determinístico — nunca inventa conteúdo como se fosse IA
    }
  }
  return { conteudo: conteudoEstrategicoFallback(args), origem: "fallback" };
}