import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import SimPanel from "@/components/SimPanel";
import { startOfDay } from "@/lib/dates";
import { computeXp } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const user = await requireAdmin();

  const alunos = await prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { criadoEm: "asc" } });
  const hoje = startOfDay(new Date());

  const [metasHoje, conversasAbertas, redacoesPendentes, metas, erros] = await Promise.all([
    prisma.meta.count({ where: { dia: hoje, status: { not: "CONCLUIDA" } } }),
    prisma.conversa.count({ where: { aberta: true } }),
    prisma.redacao.count({ where: { status: "PENDENTE" } }),
    prisma.meta.findMany({ include: { topico: { include: { disciplina: true } }, user: true } }),
    prisma.erro.findMany({ where: { status: "PENDENTE" }, include: { user: true } }),
  ]);

  const atrasadas = metas.filter((m) => m.dia < hoje && m.status !== "CONCLUIDA");
  const porAluno = alunos.map((a) => {
    const doAluno = metas.filter((m) => m.userId === a.id);
    const atrasado = doAluno.filter((m) => m.dia < hoje && m.status !== "CONCLUIDA").length;
    const errosPend = erros.filter((e) => e.userId === a.id).length;
    return { aluno: a, total: doAluno.length, atrasado, errosPend };
  });

  const ranking = await Promise.all(
    alunos.map(async (a) => ({ aluno: a, xp: await computeXp(a.id) })),
  );
  ranking.sort((a, b) => b.xp - a.xp);

  const kpis = [
    { l: "Alunos ativos", v: String(alunos.length) },
    { l: "Metas pendentes hoje", v: String(metasHoje) },
    { l: "Dúvidas abertas", v: String(conversasAbertas) },
    { l: "Redações para corrigir", v: String(redacoesPendentes) },
  ];

  return (
    <AppShell user={user} active="/admin">
      <span className="eyebrow">Central do mentor</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 1em" }}>Visão geral</h1>

      <div className="grid-kpis" style={{ marginBottom: 22 }}>
        {kpis.map((k) => (
          <div key={k.l} className="card" style={{ padding: 18 }}>
            <span className="eyebrow">{k.l}</span>
            <div className="stat-num" style={{ marginTop: 8 }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="grid-2-wide">
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Alunos em risco (pendências)</h3>
          <div className="card" style={{ padding: 10 }}>
            {porAluno.some((p) => p.atrasado > 0 || p.errosPend > 0) ? (
              porAluno
                .filter((p) => p.atrasado > 0 || p.errosPend > 0)
                .map((p) => (
                  <div key={p.aluno.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 9 }}>
                    <div>
                      <strong style={{ fontSize: ".92rem" }}>{p.aluno.name}</strong>
                      <div style={{ fontSize: ".76rem", color: "var(--ink-dim)" }}>
                        {p.aluno.concursoAlvo ?? "Sem concurso alvo"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {p.atrasado > 0 && <span className="tag tag-danger">{p.atrasado} pendências</span>}
                      {p.errosPend > 0 && <span className="tag tag-warn">{p.errosPend} erros p/ revisar</span>}
                    </div>
                  </div>
                ))
            ) : (
              <p style={{ padding: 16, fontSize: ".84rem", color: "var(--ink-faint)" }}>Todos os alunos em dia. 🎯</p>
            )}
          </div>

          <h3 style={{ fontSize: "1rem", margin: "22px 0 14px" }}>Ranking de força (XP)</h3>
          <div className="card" style={{ padding: 10 }}>
            {ranking.map((r, i) => (
              <div key={r.aluno.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 9 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: ".8rem", color: "var(--ember-400)", width: 24 }}>{i + 1}º</span>
                <div className="avatar avatar-sm" style={{ background: i === 0 ? "linear-gradient(160deg,var(--gold),var(--ember-600))" : undefined }}>
                  {r.aluno.name.charAt(0)}
                </div>
                <strong style={{ fontSize: ".9rem" }}>{r.aluno.name}</strong>
                <div className="progress" style={{ flex: 1, maxWidth: 180 }}>
                  <span style={{ width: `${Math.min(100, r.xp / 30)}%` }} />
                </div>
                <span className="tag tag-ember">{r.xp} XP</span>
              </div>
            ))}
            {ranking.length === 0 && <p style={{ padding: 16, fontSize: ".84rem", color: "var(--ink-faint)" }}>Nenhum aluno cadastrado.</p>}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Simulações rápidas (prévia)</h3>
          <div className="card card-ember">
            <p style={{ fontSize: ".82rem", color: "var(--ink-dim)", marginBottom: 14 }}>
              A plataforma não é autônoma nesta fase: use os botões para demonstrar o comportamento do sistema
              (semana adaptativa, relatório, caderno de erros) em reunião.
            </p>
            <SimPanel
              alunoId={alunos[0]?.id ?? null}
              acoes={[
                { acao: "historico", label: "Simular 4 semanas de histórico", payload: { qtd: 4 } },
                { acao: "erros", label: "Simular 5 erros em Direito Penal", payload: { disciplinaSlug: "direito-penal", qtd: 5 }, destaque: true },
                { acao: "regenerar", label: "Regenerar semana atual (ver o efeito)", destaque: true },
                { acao: "tentativas", label: "Simular 10 questões respondidas", payload: { qtd: 10 } },
                { acao: "pomodoro", label: "Simular 1 sessão de foco (25 min)", payload: { qtd: 25 } },
              ]}
            />
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "1rem", margin: "26px 0 14px" }}>Alunos</h3>
      <div className="card scroll-x" style={{ padding: 0 }}>
        <table className="table" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Concurso alvo</th>
              <th>Meta de hoje</th>
              <th>Pendências</th>
              <th>Erros p/ revisar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {porAluno.map((p) => {
              const hoje2 = p.aluno;
              void hoje2;
              const metaHoje = metas.find((m) => m.userId === p.aluno.id && m.dia.getTime() === hoje.getTime());
              return (
                <tr key={p.aluno.id}>
                  <td><strong>{p.aluno.name}</strong></td>
                  <td style={{ color: "var(--ink-dim)" }}>{p.aluno.concursoAlvo ?? "—"}</td>
                  <td>
                    {metaHoje ? (
                      <span className="tag tag-ember">{metaHoje.topico.disciplina.nome}</span>
                    ) : (
                      <span className="tag">sem meta</span>
                    )}
                  </td>
                  <td>{p.atrasado > 0 ? <span className="tag tag-danger">{p.atrasado}</span> : <span className="tag tag-ok">em dia</span>}</td>
                  <td>{p.errosPend > 0 ? <span className="tag tag-warn">{p.errosPend}</span> : <span className="tag">—</span>}</td>
                  <td>
                    <Link href={`/admin/alunos/${p.aluno.id}`} className="btn btn-line btn-sm">Perfil completo</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
