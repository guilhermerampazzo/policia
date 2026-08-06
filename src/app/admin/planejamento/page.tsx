import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import SimPanel from "@/components/SimPanel";
import AlunoSelect from "@/components/AlunoSelect";
import { addDays, startOfDay, startOfWeek, DIAS_SEMANA_ABREV } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminPlanejamento({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const user = await requireAdmin();
  const { aluno: alunoParam } = await searchParams;

  const alunos = await prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { criadoEm: "asc" } });
  const selecionado = alunos.find((a) => a.id === alunoParam) ?? alunos[0];

  if (!selecionado) {
    return (
      <AppShell user={user} active="/admin/planejamento">
        <h1 style={{ fontSize: "2rem" }}>Planejamento adaptativo</h1>
        <p style={{ color: "var(--ink-faint)", marginTop: 10 }}>Nenhum aluno cadastrado.</p>
      </AppShell>
    );
  }

  const [anamnese, metas, erros, disc] = await Promise.all([
    prisma.anamnese.findUnique({ where: { userId: selecionado.id } }),
    prisma.meta.findMany({
      where: { userId: selecionado.id },
      include: { topico: { include: { disciplina: true } } },
    }),
    prisma.erro.findMany({
      where: { userId: selecionado.id },
      include: { topico: { select: { disciplinaId: true } } },
    }),
    prisma.disciplina.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  const desde = addDays(startOfDay(new Date()), -7);
  const errosRecentes = erros.filter((e) => e.data >= desde);
  const dificuldades = anamnese?.dificuldades ?? [];

  const pesos = disc.map((d) => {
    const qtdErros = errosRecentes.filter((e) => e.topico.disciplinaId === d.id).length;
    const erroF = Math.min(qtdErros * 0.3, 1.2);
    const difF = dificuldades.some((x) => x.toLowerCase() === d.nome.toLowerCase()) ? 0.6 : 0;
    return { disciplina: d, qtdErros, erroF, difF, total: 1 + erroF + difF };
  });
  pesos.sort((a, b) => b.total - a.total);

  const semanaInicio = startOfWeek(new Date());
  const semanaMetas = metas.filter((m) => m.dia >= semanaInicio && m.dia < addDays(semanaInicio, 7));
  const hoje = startOfDay(new Date());

  return (
    <AppShell user={user} active="/admin/planejamento">
      <span className="eyebrow">Motor adaptativo</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .2em" }}>Planejamento da semana</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 22, maxWidth: 680 }}>
        O sistema distribui os dias de estudo por disciplina proporcional ao peso calculado a partir de
        erros recentes, dificuldades declaradas e disponibilidade do aluno.
      </p>

      <div style={{ marginBottom: 22, maxWidth: 420 }}>
        <label className="label" style={{ marginBottom: 8 }}>Aluno</label>
        <AlunoSelect alunos={alunos} atual={selecionado.id} />
      </div>

      <div className="grid-2-wide">
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>
            Pesos calculados <span style={{ color: "var(--ink-faint)", fontWeight: 400, fontSize: ".82rem" }}>— {selecionado.name}</span>
          </h3>
          <div className="card" style={{ padding: 14 }}>
            {pesos.map((p) => (
              <div key={p.disciplina.id} style={{ padding: "10px 6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".88rem", fontWeight: 500 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: p.disciplina.cor }} />
                    {p.disciplina.nome}
                  </span>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {p.qtdErros > 0 && <span className="tag tag-danger">{p.qtdErros} erros/7d</span>}
                    {p.difF > 0 && <span className="tag tag-warn">dificuldade</span>}
                    <b style={{ fontFamily: "var(--font-mono)", color: "var(--ember-400)", fontSize: ".86rem" }}>{p.total.toFixed(2)}</b>
                  </span>
                </div>
                <div className="progress" style={{ marginTop: 8 }}>
                  <span style={{ width: `${Math.min(100, p.total * 26)}%` }} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: ".7rem", color: "var(--ink-faint)", marginTop: 8 }}>
              Fórmula: peso = 1 + (erros recentes × 0,3, máx. +1,2) + (0,6 se declarado na anamnese)
            </p>
          </div>

          <h3 style={{ fontSize: "1rem", margin: "22px 0 14px" }}>Disponibilidade do aluno</h3>
          <div className="card" style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <div>
              <span className="eyebrow">Horas por dia</span>
              <div className="stat-num" style={{ fontSize: "1.6rem", marginTop: 6 }}>{anamnese?.horasPorDia ?? "—"}h</div>
            </div>
            <div>
              <span className="eyebrow">Dias de estudo</span>
              <div className="stat-num" style={{ fontSize: "1.6rem", marginTop: 6 }}>{anamnese?.diasDisponiveis.length ?? "—"}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <span key={d} className="tag" style={{ fontSize: ".5rem", color: anamnese?.diasDisponiveis.includes(d) ? "var(--ember-300)" : "var(--ink-faint)", borderColor: anamnese?.diasDisponiveis.includes(d) ? "var(--line-ember)" : "var(--line)" }}>
                    {DIAS_SEMANA_ABREV[d].slice(0, 1)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 14 }}>Semana atual gerada</h3>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {semanaMetas.length === 0 && (
                <p style={{ fontSize: ".82rem", color: "var(--ink-faint)", padding: "8px 0" }}>
                  Nenhuma meta planejada para esta semana ainda.
                </p>
              )}
              {semanaMetas.map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 6px", borderBottom: "1px solid var(--line)", fontSize: ".88rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: ".62rem", color: m.dia.getTime() === hoje.getTime() ? "var(--ember-400)" : "var(--ink-faint)", width: 70, flexShrink: 0 }}>
                    {DIAS_SEMANA_ABREV[m.dia.getDay()]}
                    {m.dia.getTime() === hoje.getTime() ? " · hoje" : ""}
                  </span>
                  <span className="tag tag-ember" style={{ fontSize: ".56rem" }}>{m.topico.disciplina.nome}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{m.origem === "REVISAO" ? "Revisão — " : ""}{m.topico.titulo}</span>
                  <span className="tag" style={{ fontSize: ".56rem" }}>
                    {m.status === "CONCLUIDA" ? "feita" : m.status === "ATRASADA" ? "atrasada" : "pendente"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-ember">
            <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>Simular o motor</h3>
            <p style={{ fontSize: ".78rem", color: "var(--ink-dim)", marginBottom: 14 }}>
              Injete erros e veja os pesos e a semana mudarem. Depois regenere para aplicar.
            </p>
            <SimPanel
              alunoId={selecionado.id}
              acoes={[
                { acao: "erros", label: "Simular 5 erros em Direito Penal", payload: { disciplinaSlug: "direito-penal", qtd: 5 }, destaque: true },
                { acao: "regenerar", label: "Regenerar semana atual (aplicar pesos)", destaque: true },
                { acao: "avancar-semana", label: "Planejar a próxima semana" },
                { acao: "historico", label: "Simular 4 semanas de histórico", payload: { qtd: 4 } },
              ]}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
