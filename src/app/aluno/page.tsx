import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import ConcluirMeta from "@/components/ConcluirMeta";
import MetaAcoes from "@/components/MetaAcoes";
import Pomodoro from "@/components/Pomodoro";
import { Icon } from "@/components/icons";
import { addDays, startOfDay, startOfWeek, DIAS_SEMANA_ABREV, fmtData } from "@/lib/dates";
import { computeXpEStreak, levelFromXp, nomeNivel, minutosPorDia } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function AlunoDashboard() {
  const user = await requireUser();
  if (!user.onboardingDone) redirect("/aluno/onboarding");

  const hoje = startOfDay(new Date());
  const [anamnese, metas, xpEStreak, pomodoro] = await Promise.all([
    prisma.anamnese.findUnique({ where: { userId: user.id } }),
    prisma.meta.findMany({
      where: { userId: user.id },
      include: { topico: { include: { disciplina: true } } },
      orderBy: { dia: "asc" },
    }),
    computeXpEStreak(user.id),
    prisma.pomodoroSessao.findMany({ where: { userId: user.id, tipo: "FOCO", inicio: { gte: hoje } } }),
  ]);

  const minutosHoje = pomodoro.reduce((acc, p) => acc + p.minutos, 0);

  const metaDoDia =
    metas.find((m) => m.dia.getTime() === hoje.getTime() && m.status !== "CONCLUIDA") ??
    metas.find((m) => m.dia.getTime() === hoje.getTime()) ??
    metas.find((m) => m.status === "PENDENTE" && m.dia >= hoje);

  const pendentes = metas.filter((m) => m.dia < hoje && m.status !== "CONCLUIDA");
  const semanaStart = startOfWeek(new Date());
  const semana = Array.from({ length: 7 }, (_, i) => {
    const dia = addDays(semanaStart, i);
    return { dia, metas: metas.filter((m) => m.dia.getTime() === dia.getTime()) };
  });

  const proximaRevisao = await prisma.erro.findFirst({
    where: { userId: user.id, status: "PENDENTE" },
    include: { topico: { include: { disciplina: true } } },
    orderBy: { revisaoEm: "asc" },
  });

  const nivel = levelFromXp(xpEStreak.xp);

  return (
    <AppShell user={user} active="/aluno">
      <span className="eyebrow">Hoje é a única meta que importa</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 1.1em" }}>Painel do dia</h1>

      {pendentes.length > 0 && (
        <div className="card" style={{ background: "var(--warn-bg)", borderColor: "rgba(240,177,66,.4)", display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
          <Icon name="warn" size={20} style={{ color: "var(--warn)", marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", marginBottom: 3 }}>Você deixou {pendentes.length} meta{pendentes.length > 1 ? "s" : ""} pendente{pendentes.length > 1 ? "s" : ""}</strong>
            <span style={{ color: "var(--ink-dim)", fontSize: ".86rem" }}>
              {pendentes.slice(0, 3).map((p) => `${p.topico.disciplina.nome} — ${p.topico.titulo}`).join(" · ")}
            </span>
          </div>
          <Link href="/aluno/relatorio" className="btn btn-line btn-sm" style={{ whiteSpace: "nowrap" }}>Ver pendências</Link>
        </div>
      )}

      <div className="grid-2-wide" style={{ marginBottom: 24 }}>
        {/* meta do dia */}
        <div>
          <div className="card card-ember" style={{ minHeight: 300, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              {metaDoDia ? (
                <>
                  <div>
                    <span className="tag tag-ember">{metaDoDia.topico.disciplina.nome}</span>
                    <h2 style={{ fontSize: "1.45rem", margin: ".6em 0 .3em", lineHeight: 1.2 }}>
                      {metaDoDia.origem === "REVISAO" ? "Revisão — " : ""}
                      {metaDoDia.topico.titulo}
                    </h2>
                    <p style={{ color: "var(--ink-dim)", fontSize: ".88rem" }}>
                      {metaDoDia.origem === "REVISAO" ? "Revisão do caderno de erros" : "Videoaula + PDF · questões"} · ~{metaDoDia.topico.cargaMin} min
                    </p>
                  </div>
                  <ConcluirMeta metaId={metaDoDia.id} />
                </>
              ) : (
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "1.35rem", marginBottom: ".4em" }}>Nenhuma meta para hoje ainda.</h2>
                  <p style={{ color: "var(--ink-dim)", fontSize: ".9rem" }}>
                    O mentor ainda não planejou esta semana — ou a semana já foi concluída.
                  </p>
                  <Link href="/aluno/simulado" className="btn btn-line btn-sm" style={{ marginTop: 14 }}>
                    <Icon name="target" size={15} /> Treinar questões agora
                  </Link>
                </div>
              )}
            </div>
            {metaDoDia && (
              <>
                <div className="divider" />
                <MetaAcoes topicoId={metaDoDia.topicoId} topicoTitulo={metaDoDia.topico.titulo} />
              </>
            )}
          </div>

          {/* revisão agendada */}
          <Link href="/aluno/caderno" className="card card-ember" style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div>
              <span className="eyebrow" style={{ color: "var(--ember-400)" }}>Caderno de erros</span>
              <p style={{ marginTop: ".5em", fontSize: ".95rem" }}>
                {proximaRevisao ? (
                  <>
                    Próxima revisão agendada: <strong>{proximaRevisao.topico.disciplina.nome} — {proximaRevisao.topico.titulo}</strong>{" "}
                    <span className="tag tag-warn" style={{ marginLeft: 8 }}>{fmtData(proximaRevisao.revisaoEm)}</span>
                  </>
                ) : (
                  "Nenhuma revisão pendente. Registre seus erros ao estudar."
                )}
              </p>
            </div>
            <span className="btn btn-ember btn-sm">Abrir caderno →</span>
          </Link>
        </div>

        {/* coluna direita */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Icon name="clock" size={16} style={{ color: "var(--ember-400)" }} />
              <h3 style={{ fontSize: "1rem" }}>Pomodoro de foco</h3>
            </div>
            <Pomodoro minutosHoje={minutosHoje} />
          </div>

          <div className="card" style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <span className="eyebrow">Sua sequência</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                <span className="stat-num">{xpEStreak.streak}</span>
                <span style={{ color: "var(--ink-dim)", fontSize: ".86rem" }}>dias seguidos</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="eyebrow">Força (XP)</span>
              <div className="stat-num" style={{ marginTop: 8, fontSize: "1.6rem" }}>{xpEStreak.xp}</div>
              <div style={{ fontSize: ".76rem", color: "var(--ink-dim)" }}>
                nível {nivel.nivel} · {nomeNivel(xpEStreak.xp)}
              </div>
              <div className="progress" style={{ width: 140, marginTop: 8 }}>
                <span style={{ width: `${Math.min(100, (xpEStreak.xp / nivel.proximo) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* semana */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ fontSize: "1.05rem" }}>Sua semana</h3>
        <span style={{ fontSize: ".76rem", color: "var(--ink-faint)" }}>
          {anamnese ? `${anamnese.diasDisponiveis.length} dias de estudo · ${anamnese.horasPorDia}h/dia` : "Sem anamnese definida"}
        </span>
      </div>
      <div className="scroll-x" style={{ marginBottom: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(120px,1fr))", gap: 10, minWidth: 840 }}>
          {semana.map(({ dia, metas: ms }, i) => {
            const ehHoje = dia.getTime() === hoje.getTime();
            const m = ms[0];
            const atrasada = m && m.dia < hoje && m.status !== "CONCLUIDA";
            const concluida = m && m.status === "CONCLUIDA";
            const penden = m && !concluida;
            return (
              <div
                key={i}
                className="card"
                style={{
                  padding: 14,
                  textAlign: "center",
                  borderColor: ehHoje ? "var(--ember-500)" : concluida ? "rgba(61,214,140,.4)" : atrasada ? "rgba(255,107,94,.4)" : "var(--line)",
                  borderWidth: ehHoje ? 2 : 1,
                }}
              >
                <div style={{ fontSize: ".64rem", color: "var(--ink-faint)", letterSpacing: ".08em", fontFamily: "var(--font-mono)" }}>
                  {DIAS_SEMANA_ABREV[dia.getDay()]}
                  {ehHoje && <span style={{ color: "var(--ember-400)" }}> · HOJE</span>}
                </div>
                {m ? (
                  <>
                    <div style={{ fontSize: ".82rem", fontWeight: 600, margin: ".45em 0" }}>
                      {m.topico.disciplina.nome}
                    </div>
                    <span
                      className="tag"
                      style={
                        concluida
                          ? { color: "var(--ok)", borderColor: "rgba(61,214,140,.4)" }
                          : atrasada
                            ? { color: "var(--danger)", borderColor: "rgba(255,107,94,.45)" }
                            : { color: "var(--ember-300)", borderColor: "var(--line-ember)" }
                      }
                    >
                      {concluida ? "concluída" : atrasada ? "pendente" : m.origem === "REVISAO" ? "revisão" : "a fazer"}
                    </span>
                  </>
                ) : (
                  <div style={{ fontSize: ".72rem", color: "var(--ink-faint)", margin: ".6em 0" }}>livre</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
