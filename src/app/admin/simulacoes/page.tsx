import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import SimPanel from "@/components/SimPanel";

export const dynamic = "force-dynamic";

export default async function AdminSimulacoes() {
  const user = await requireAdmin();
  const alunos = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <AppShell user={user} active="/admin/simulacoes">
      <span className="eyebrow">Laboratório da prévia</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .2em" }}>Simulações</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 26, maxWidth: 700 }}>
        A plataforma ainda não é autônoma (sem dados reais de uso). Estes botões injetam dados plausíveis
        para demonstrar o fluxo completo em reunião — e são reais dentro do sistema: o motor adaptativo,
        o relatório e o caderno de erros reagem a eles.
      </p>

      <div className="grid-2-wide">
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Alunos cadastrados</h3>
          <div className="card" style={{ padding: 10 }}>
            {alunos.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px" }}>
                <strong style={{ fontSize: ".92rem" }}>{a.name}</strong>
                <span className="tag tag-ok">seed</span>
              </div>
            ))}
            {alunos.length === 0 && <p style={{ padding: 12, fontSize: ".84rem", color: "var(--ink-faint)" }}>Nenhum aluno.</p>}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Painel de simulação</h3>
          <div className="card card-ember">
            <p style={{ fontSize: ".82rem", color: "var(--ink-dim)", marginBottom: 14 }}>
              As ações aplicam no primeiro aluno cadastrado (Rafael M. no seed).
            </p>
            <SimPanel
              alunoId={alunos[0]?.id ?? null}
              acoes={[
                { acao: "historico", label: "Popular 4 semanas de histórico", payload: { qtd: 4 }, destaque: true, descricao: "Cria metas concluídas, pomodoros e tentativas nas semanas passadas — alimenta o relatório de progressão." },
                { acao: "erros", label: "Simular 5 erros em Direito Penal", payload: { disciplinaSlug: "direito-penal", qtd: 5 }, destaque: true, descricao: "O motor adaptativo passa a pesar mais Direito Penal na próxima semana." },
                { acao: "regenerar", label: "Regenerar semana atual (ver o efeito)", destaque: true },
                { acao: "avancar-semana", label: "Planejar a próxima semana", descricao: "Avança a simulação: gera o plano da semana seguinte já com os pesos atualizados." },
                { acao: "tentativas", label: "Simular 10 questões respondidas", payload: { qtd: 10 } },
                { acao: "pomodoro", label: "Simular 1 sessão de foco (25 min)", payload: { qtd: 25 } },
                { acao: "anamnese", label: "Simular anamnese concluída", descricao: "Cria/confirma a anamnese do aluno com respostas padrão." },
              ]}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
