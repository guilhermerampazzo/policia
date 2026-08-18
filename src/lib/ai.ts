import { z } from "zod";

/**
 * ============================================================
 * IA — dois clientes compatíveis com a API OpenAI
 * ------------------------------------------------------------
 * • Mapa mental:  MINDMAP_BASE_URL / MINDMAP_API_KEY / MINDMAP_MODEL
 * • Resumo:       DEEPSEEK_BASE_URL / DEEPSEEK_API_KEY / DEEPSEEK_MODEL
 *
 * Sem chave configurada, os modos determinísticos assumem — a demo
 * nunca quebra. O mapa mental NÃO é gerado como imagem: o modelo
 * devolve a ESTRUTURA (JSON) e o app renderiza (React Flow).
 * ============================================================
 */

const TREE_SCHEMA = z.object({
  central: z.string().min(1),
  branches: z
    .array(
      z.object({
        label: z.string().min(1),
        children: z.array(z.string().min(1)).max(9).optional(),
      }),
    )
    .min(2)
    .max(10),
});

export type ArvoreMental = z.infer<typeof TREE_SCHEMA>;

const CONTENT_SCHEMA = z.object({
  resumo: z.string().min(10),
  pontosChave: z.array(z.string().min(3)).min(2).max(8),
  armadilhas: z.array(z.string().min(3)).min(1).max(6),
  planoRevisao: z.string().min(10),
});

export type ConteudoEstrategicoPayload = z.infer<typeof CONTENT_SCHEMA>;

export class AiNaoConfiguradoError extends Error {
  constructor() {
    super("IA não configurada (chave de API ausente).");
    this.name = "AiNaoConfiguradoError";
  }
}

export function mapaIaConfigurado(): boolean {
  return Boolean(process.env.MINDMAP_API_KEY);
}

export function aiConfigurado(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

async function completar(args: {
  baseUrl: string;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const { baseUrl, apiKey, model, system, user, maxTokens = 1600 } = args;
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      stream: false,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const corpo = await res.text().catch(() => "");
    throw new Error(`Erro na IA (${res.status}): ${corpo.slice(0, 300)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Resposta vazia da IA.");
  return content;
}

function extrairJson(texto: string): string {
  const semFence = texto.replace(/```json/gi, "").replace(/```/g, "").trim();
  const inicio = semFence.indexOf("{");
  const fim = semFence.lastIndexOf("}");
  if (inicio === -1 || fim === -1) throw new Error("IA não retornou JSON válido.");
  return semFence.slice(inicio, fim + 1);
}

/**
 * Gera a árvore do mapa mental a partir do contexto fornecido pelo
 * mentor (título + texto colado do edital/apostila/descrição).
 * Fallback determinístico: usa as linhas do texto como ramos.
 */
export async function gerarArvoreMental(args: {
  titulo: string;
  contexto: string;
}): Promise<ArvoreMental> {
  const { titulo, contexto } = args;
  if (!mapaIaConfigurado()) throw new AiNaoConfiguradoError();

  const system =
    "Você é um especialista em mapas mentais para concursos públicos, no estilo de " +
    "mapa mental de caderno de estudo: um tema central, ramos principais como blocos e " +
    "sub-itens sob cada ramo, hierarquia clara do geral para o específico. " +
    "Devolva APENAS um JSON válido neste formato exato: " +
    '{"central":"TEMA CENTRAL","branches":[{"label":"RAMO 1","children":["item","item"]},...]}. ' +
    "Regras: central curto (até 5 palavras); 3 a 6 ramos; cada ramo com 2 a 5 children, " +
    "sendo cada child uma FRASE CURTA e explicativa de 3 a 7 palavras (ex.: 'Norma superior " +
    "valida a inferior', 'Funda o ordenamento jurídico'), nunca uma palavra solta; " +
    "sem markdown, sem texto fora do JSON.";

  const user = `Assunto/contexto para o mapa mental.\nTítulo: ${titulo}\nConteúdo:\n${contexto.slice(0, 8000)}`;

  try {
    const raw = await completar({
      baseUrl: process.env.MINDMAP_BASE_URL ?? "https://omni.codermaster.com.br/v1/",
      apiKey: process.env.MINDMAP_API_KEY!,
      model: process.env.MINDMAP_MODEL ?? "agy/gemini-3.6-flash-high",
      system,
      user,
      maxTokens: 1500,
    });
    return TREE_SCHEMA.parse(JSON.parse(extrairJson(raw)));
  } catch (e) {
    if (e instanceof AiNaoConfiguradoError) throw e;
    // fallback: cada linha do contexto vira um ramo
    return arvoreDeTexto(contexto, titulo);
  }
}

/** Determinístico: converte linhas de texto em ramos ("assunto: detalhes" vira children) */
export function arvoreDeTexto(texto: string, tituloFallback = "Conteúdo"): ArvoreMental {
  const linhas = texto
    .split("\n")
    .map((l) => l.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter((l) => l.length > 2);
  const branches = linhas.slice(0, 10).map((linha) => {
    const [label, ...resto] = linha.split(/[:|]/);
    const children = resto.length
      ? resto.join(":").split(/[;,]/).map((s) => s.trim()).filter((s) => s.length > 1).slice(0, 6)
      : [];
    return { label: label.trim().slice(0, 80), children: children.length ? children : undefined };
  });
  const central = tituloFallback.length > 2 ? tituloFallback : "Conteúdo";
  return {
    central: central.slice(0, 60),
    branches: branches.length >= 2 ? branches : [{ label: "Estudar este conteúdo", children: [] }],
  };
}

/** Resumo de conteúdo (botão "Gerar resumo com IA" na meta do dia) */
export async function gerarResumo(args: { titulo: string; contexto: string }): Promise<string> {
  const system =
    "Você é um professor de concursos policiais. Gere um resumo de estudo objetivo, " +
    "em pt-BR, com tópicos-chave e dicas do que a banca costuma cobrar. Máximo 250 palavras. Markdown simples.";
  try {
    return await completar({
      baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://opencode.ai/zen/go/v1/",
      apiKey: process.env.DEEPSEEK_API_KEY!,
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      system,
      user: `Conteúdo: ${args.titulo}\n\n${args.contexto.slice(0, 4000)}`,
      maxTokens: 800,
    });
  } catch (e) {
    if (e instanceof AiNaoConfiguradoError) throw e;
    return "Resumo indisponível no momento. Sem a chave de IA configurada, o resumo automático fica desativado — o conteúdo da videoaula/PDF está disponível normalmente.";
  }
}

/**
 * Conteúdo estratégico (resumo, pontos-chave, armadilhas, plano de revisão)
 * gerado a partir de um erro registrado. Quando a IA não está configurada
 * (ou falha), o chamador deve usar o fallback determinístico de lib/conteudo.ts.
 */
export async function gerarConteudoEstrategicoIA(args: {
  disciplina: string;
  topico: string;
  descricao: string;
}): Promise<ConteudoEstrategicoPayload> {
  if (!aiConfigurado()) throw new AiNaoConfiguradoError();

  const system =
    "Você é um professor de concursos policiais. Dado o erro que o aluno cometeu, " +
    "elabore conteúdo estratégico de estudo em pt-BR: um resumo objetivo do assunto, " +
    "pontos-chave que a banca cobra, armadilhas típicas das provas e um plano de " +
    "revisão espaçada. Devolva APENAS um JSON válido neste formato exato: " +
    '{"resumo":"...","pontosChave":["...","..."],"armadilhas":["...","..."],"planoRevisao":"..."}. ' +
    "Sem markdown, sem texto fora do JSON.";

  const user = `Disciplina: ${args.disciplina}\nTópico: ${args.topico}\nErro registrado: ${args.descricao}`;

  const raw = await completar({
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://opencode.ai/zen/go/v1/",
    apiKey: process.env.DEEPSEEK_API_KEY!,
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
    system,
    user,
    maxTokens: 900,
  });
  return CONTENT_SCHEMA.parse(JSON.parse(extrairJson(raw)));
}
