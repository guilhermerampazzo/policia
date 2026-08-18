import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import SimPanel from "@/components/SimPanel";
import MentorToolRail from "@/components/MentorToolRail";
import { Icon } from "@/components/icons";
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

  const ferramentas = [
    { href: "/admin/alunos", label: "Minha tropa", detail: `${alunos.length} aluno${alunos.length === 1 ? "" : "s"} em acompanhamento`, image: "/img/police-training.jpg", icon: "users" },
    { href: "/admin/planejamento", label: "Plano adaptativo", detail: "Pesos, erros e próxima semana", image: "/img/police-operations.jpg", icon: "calendar" },
    { href: "/admin/edital", label: "Edital verticalizado", detail: "Transforme o edital em rota", image: "/img/police-command.jpg", icon: "doc" },
    { href: "/admin/mapas", label: "Mapas mentais", detail: "Conteúdo visual para fixar", image: "/img/police-recruits.jpg", icon: "map" },
    { href: "/admin/simulacoes", label: "Sala de simulação", detail: "Demonstre a evolução", image: "/img/hero-tactical.jpg", icon: "flask" },
    { href: "/admin/redacoes", label: "Banca de redações", detail: `${redacoesPendentes} para corrigir agora`, image: "/img/police-recruits.jpg", icon: "pen" },
  ];

  return (
    <AppShell user={user} active="/admin">
      <section className="mentor-hero" style={{ backgroundImage: "url('/img/hero-tactical.jpg')" }}>
        <div className="mentor-hero-overlay" />
        <div className="mentor-hero-content">
          <span className="mentor-hero-kicker">FORJA · CENTRAL DE COMANDO</span>
          <h1>Comande a preparação.<br /><em>Antecipe a aprovação.</em></h1>
          <p>Leia o ritmo da sua tropa, corrija a rota e transforme cada pendência em uma próxima ação.</p>
          <div className="mentor-hero-actions">
            <Link href="/admin/alunos" className="btn btn-ember"><Icon name="users" size={16} /> Ver meus alunos</Link>
            <Link href="/admin/planejamento" className="btn mentor-btn-ghost"><Icon name="calendar" size={16} /> Abrir planejamento</Link>
          </div>
          <div className="mentor-hero-proof">
            <span><b>{alunos.length}</b> aluno{alunos.length === 1 ? " ativo" : "s ativos"}</span>
            <span><b>{metasHoje}</b> meta{metasHoje === 1 ? " pendente" : "s pendentes"} hoje</span>
            <span><b>{erros.length}</b> erro{erros.length === 1 ? " para revisar" : "s para revisar"}</span>
          </div>
        </div>
      </section>

      <section className="mentor-catalog-section">
        <div className="mentor-catalog-heading">
          <div><span className="eyebrow">Seu catálogo de trabalho</span><h2>Arsenal do mentor</h2></div>
          <span className="mentor-catalog-hint">use as setas para explorar <b>→</b></span>
        </div>
        <MentorToolRail tools={ferramentas} />
      </section>

      <div className="mentor-section-divider" />
      <div className="mentor-section-title"><div><span className="eyebrow">Leitura rápida da operação</span><h2>Hoje na Forja</h2></div><span>atualizado agora</span></div>
      <div className="grid-kpis" style={{ marginBottom: 22 }}>
        {kpis.map((k) => (
          <div key={k.l} className="card mentor-kpi-card" style={{ padding: 18 }}>
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
