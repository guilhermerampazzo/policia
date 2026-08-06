import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import SimPanel from "@/components/SimPanel";
import { DonutChart, BarsChart } from "@/components/Charts";
import { Icon } from "@/components/icons";
import { addDays, startOfWeek, DIAS_SEMANA_ABREV, fmtData, isoDate, weekStamp } from "@/lib/dates";
import { computeXpEStreak, nomeNivel } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function AdminAlunoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;

  const aluno = await prisma.user.findUnique({
    where: { id },
    include: { anamnese: true },
  });
  if (!aluno || aluno.role !== "STUDENT") notFound();

  const [metas, erros, tentativas, disciplinas, xpEStreak, pomodoros] = await Promise.all([
    prisma.meta.findMany({
      where: { userId: aluno.id },
      include: { topico: { include: { disciplina: true } } },
      orderBy: { dia: "desc" },
    }),
    prisma.erro.findMany({
      where: { userId: aluno.id },
      include: { topico: { include: { disciplina: true } } },
      orderBy: { data: "desc" },
    }),
    prisma.tentativa.findMany({
      where: { userId: aluno.id },
      include: { questao: { include: { disciplina: true } } },
    }),
    prisma.disciplina.findMany({ orderBy: { ordem: "asc" } }),
    computeXpEStreak(aluno.id),
    prisma.pomodoroSessao.findMany({ where: { userId: aluno.id, tipo: "FOCO" } }),
  ]);

  const horasFoco = Math.round(pomodoros.reduce((a, p) => a + p.minutos, 0) / 60);
  const acertos = tentativas.filter((t) => t.acerto).length;

  const acertosPorDisc = disciplinas.map((d) => {
    const ts = tentativas.filter((t) => t.questao.disciplinaId === d.id);
    return { nome: d.nome, valor: ts.filter((t) => t.acerto).length, cor: d.cor };
  });

  const semanaInicio = startOfWeek(new Date());
  const semanaMetas = metas.filter((m) => m.dia >= semanaInicio && m.dia < addDays(semanaInicio, 7));
  const semanaGrid = Array.from({ length: 7 }, (_, i) => {
    const dia = addDays(semanaInicio, i);
    return { dia, m: semanaMetas.find((x) => x.dia.getTime() === dia.getTime()) };
  });

  const errosPendentes = erros.filter((e) => e.status === "PENDENTE");
  const pesosExplicacao = [
    { nome: "Direito Penal", base: 1, erros: Math.min(errosPendentes.filter((e) => e.topico.disciplina.nome === "Direito Penal").length * 0.3, 1.2), dif: aluno.anamnese?.dificuldades.includes("Direito Penal") ? 0.6 : 0 },
    { nome: "Raciocínio Lógico", base: 1, erros: Math.min(errosPendentes.filter((e) => e.topico.disciplina.nome === "Raciocínio Lógico").length * 0.3, 1.2), dif: aluno.anamnese?.dificuldades.includes("Raciocínio Lógico") ? 0.6 : 0 },
  ];

  const stats = [
    { l: "Força (XP)", v: String(xpEStreak.xp), sub: `${nomeNivel(xpEStreak.xp)} · nível ${Math.floor(xpEStreak.xp / 500) + 1}` },
    { l: "Sequência", v: `${xpEStreak.streak}d`, sub: "dias seguidos" },
    { l: "Horas de foco", v: `${horasFoco}h`, sub: "pomodoro" },
    { l: "Questões", v: `${tentativas.length} · ${acertos} acertos`, sub: `${tentativas.length ? Math.round((acertos / tentativas.length) * 100) : 0}% taxa` },
  ];

  return (
    <AppShell user={user} active="/admin/alunos">
      <Link href="/admin/alunos" className="btn btn-line btn-sm" style={{ marginBottom: 16 }}>← Todos os alunos</Link>

      <div className="card card-ember" style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div className="avatar avatar-lg">{aluno.name.charAt(0)}</div>
          <div>
            <h1 style={{ fontSize: "1.7rem" }}>{aluno.name}</h1>
            <p style={{ color: "var(--ink-dim)", fontSize: ".92rem" }}>
              {aluno.concursoAlvo ?? "Sem concurso alvo"} · {aluno.banca ?? "banca não definida"}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {aluno.dataProva && <span className="tag tag-gold">Prova: {fmtData(aluno.dataProva)}</span>}
              {aluno.anamnese ? (
                <span className="tag tag-ok">anamnese concluída</span>
              ) : (
                <span className="tag tag-warn">anamnese pendente</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 220 }}>
          {[
            { l: "Disponibilidade", v: aluno.anamnese ? `${aluno.anamnese.horasPorDia}h/dia · ${aluno.anamnese.diasDisponiveis.length} dias` : "—" },
            { l: "Dificuldades", v: aluno.anamnese?.dificuldades?.length ? aluno.anamnese.dificuldades.join(" · ") : "—" },
            { l: "Formato preferido", v: aluno.anamnese?.formatoPreferido ? aluno.anamnese.formatoPreferido : "—" },
          ].map((r) => (
            <div key={r.l} style={{ fontSize: ".8rem" }}>
              <span style={{ color: "var(--ink-faint)" }}>{r.l}: </span>
              <strong>{r.v}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-kpis" style={{ marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.l} className="card" style={{ padding: 18 }}>
            <span className="eyebrow">{s.l}</span>
            <div className="stat-num" style={{ marginTop: 8, fontSize: "1.8rem" }}>{s.v}</div>
            <div style={{ fontSize: ".72rem", color: "var(--ink-faint)", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2-wide">
        {/* semana + erros */}
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Semana atual</h3>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
              {semanaGrid.map(({ dia, m }, i) => (
                <div key={i} style={{ textAlign: "center", padding: "8px 4px", borderRadius: 9, border: m ? "1px solid var(--line-ember)" : "1px solid var(--line)", background: m ? "rgba(243,126,31,.07)" : "transparent" }}>
                  <div style={{ fontSize: ".6rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>
                    {DIAS_SEMANA_ABREV[dia.getDay()]}
                  </div>
                  <div style={{ fontSize: ".68rem", fontWeight: 600, marginTop: 5, minHeight: 30, lineHeight: 1.25 }}>
                    {m ? m.topico.disciplina.nome : "—"}
                  </div>
                  {m && (
                    <span className="tag" style={{ fontSize: ".52rem", marginTop: 4 }}>
                      {m.status === "CONCLUIDA" ? "feita" : m.origem === "REVISAO" ? "revisão" : "pendente"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Erros recentes (caderno)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {errosPendentes.slice(0, 5).map((e) => (
              <div key={e.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span className="tag tag-ember" style={{ fontSize: ".56rem" }}>{e.topico.disciplina.nome}</span>
                  <span style={{ fontSize: ".68rem", color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{isoDate(e.data)}</span>
                </div>
                <p style={{ fontSize: ".84rem", color: "var(--ink-dim)", marginTop: 8, lineHeight: 1.5 }}>{e.descricao}</p>
              </div>
            ))}
            {errosPendentes.length === 0 && (
              <div className="card" style={{ color: "var(--ink-faint)", fontSize: ".84rem" }}>Sem erros pendentes.</div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Motor adaptativo — pesos da próxima semana</h3>
          <div className="card" style={{ marginBottom: 20 }}>
            <p style={{ fontSize: ".78rem", color: "var(--ink-dim)", marginBottom: 14 }}>
              Peso = base (1) + erros recentes (+0,3 por erro, até +1,2) + dificuldade declarada (+0,6).
            </p>
            {pesosExplicacao.map((p) => {
              const total = p.base + p.erros + p.dif;
              return (
                <div key={p.nome} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem" }}>
                    <strong>{p.nome}</strong>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--ember-400)" }}>{total.toFixed(2)}</span>
                  </div>
                  <div className="progress" style={{ marginTop: 6 }}>
                    <span style={{ width: `${Math.min(100, total * 28)}%` }} />
                  </div>
                  <div style={{ fontSize: ".68rem", color: "var(--ink-faint)", marginTop: 4 }}>
                    {p.erros > 0 ? `+${p.erros.toFixed(2)} por erros · ` : ""}
                    {p.dif > 0 ? `+0.60 por dificuldade declarada` : "sem dificuldade declarada"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid-2" style={{ gap: 14 }}>
            <div className="card">
              <h3 style={{ fontSize: ".95rem", marginBottom: 6 }}>Acertos por disciplina</h3>
              <DonutChart data={acertosPorDisc} height={190} centerLabel="acertos" centerValue={String(acertos)} />
            </div>
            <div className="card">
              <h3 style={{ fontSize: ".95rem", marginBottom: 8 }}>Evolução de metas</h3>
              <BarsChart
                data={Array.from({ length: 8 }, (_, i) => {
                  const inicio = addDays(semanaInicio, -7 * (7 - i));
                  const stamp = weekStamp(inicio);
                  return { nome: isoDate(inicio).slice(5), metas: metas.filter((m) => m.status === "CONCLUIDA" && weekStamp(m.concluidaEm ?? m.dia) === stamp).length };
                })}
                dataKey="metas"
                height={190}
              />
            </div>
          </div>

          <h3 style={{ fontSize: "1rem", margin: "20px 0 14px" }}>Simular comportamento do sistema</h3>
          <div className="card card-ember">
            <SimPanel
              alunoId={aluno.id}
              acoes={[
                { acao: "erros", label: "Simular 5 erros em Direito Penal", payload: { disciplinaSlug: "direito-penal", qtd: 5 }, destaque: true, descricao: "O motor passa a pesar mais Direito Penal na próxima semana." },
                { acao: "regenerar", label: "Regenerar semana atual", destaque: true },
                { acao: "avancar-semana", label: "Planejar a próxima semana" },
                { acao: "tentativas", label: "Simular 10 questões respondidas", payload: { qtd: 10 } },
                { acao: "pomodoro", label: "Simular 1 sessão de foco (25 min)", payload: { qtd: 25 } },
                { acao: "historico", label: "Simular 4 semanas de histórico", payload: { qtd: 4 } },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="warn" size={18} style={{ color: "var(--ember-400)" }} />
        <p style={{ fontSize: ".84rem", color: "var(--ink-dim)" }}>
          Prévia: os botões de simulação injetam dados para demonstrar o fluxo completo. Em produção, esses dados
          viriam do uso real do aluno (metas, questões, pomodoro e caderno de erros).
        </p>
      </div>
    </AppShell>
  );
}
