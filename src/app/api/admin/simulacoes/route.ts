import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import {
  simularErros,
  simularHistorico,
  simularAnamnese,
  simularPomodoro,
  simularTentativas,
  simularAvançarSemana,
  regenerarSemanaAtual,
} from "@/lib/sim";

export const dynamic = "force-dynamic";

const schema = z.object({
  acao: z.enum(["historico", "erros", "anamnese", "pomodoro", "tentativas", "avancar-semana", "regenerar"]),
  alunoId: z.string().optional(),
  disciplinaSlug: z.string().optional(),
  qtd: z.number().int().min(1).max(60).optional(),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  // admin pode simular em qualquer aluno; por padrão, no primeiro aluno
  let alvoId = parsed.data.alunoId;
  if (!alvoId) {
    const primeiro = await prisma.user.findFirst({ where: { role: "STUDENT" }, orderBy: { criadoEm: "asc" } });
    alvoId = primeiro?.id;
  }
  if (!alvoId) return NextResponse.json({ error: "Nenhum aluno cadastrado." }, { status: 400 });

  let mensagem = "";
  let contagem = 0;

  switch (parsed.data.acao) {
    case "historico":
      contagem = await simularHistorico(alvoId, parsed.data.qtd ?? 4);
      mensagem = `${contagem} metas de histórico adicionadas.`;
      break;
    case "erros":
      contagem = await simularErros(alvoId, parsed.data.disciplinaSlug ?? "direito-penal", parsed.data.qtd ?? 5);
      mensagem = `${contagem} erros registrados em ${parsed.data.disciplinaSlug ?? "Direito Penal"}.`;
      break;
    case "anamnese":
      await simularAnamnese(alvoId);
      mensagem = "Anamnese do aluno concluída.";
      break;
    case "pomodoro":
      await simularPomodoro(alvoId, parsed.data.qtd ?? 25);
      mensagem = `Sessão de ${parsed.data.qtd ?? 25} min registrada.`;
      break;
    case "tentativas":
      contagem = await simularTentativas(alvoId, parsed.data.qtd ?? 10);
      mensagem = `${contagem} questões respondidas (simuladas).`;
      break;
    case "avancar-semana":
      contagem = await simularAvançarSemana(alvoId);
      mensagem = contagem > 0 ? `${contagem} metas planejadas para a próxima semana.` : "A próxima semana já foi planejada.";
      break;
    case "regenerar":
      contagem = await regenerarSemanaAtual(alvoId);
      mensagem = contagem > 0 ? `Semana atual regenerada: ${contagem} metas (pesos atualizados).` : "Semana atual já está planejada.";
      break;
  }

  return NextResponse.json({ ok: true, mensagem, contagem });
}
