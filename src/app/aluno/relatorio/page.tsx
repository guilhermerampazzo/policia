import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import { BarsChart, AreaChartC, LineChartC, DonutChart } from "@/components/Charts";
import { startOfWeek, addDays, weekStamp, isoDate, mulberry32 } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function RelatorioPage() {
  const user = await requireUser();

  const [tentativas, metas, pomodoros, erros, disciplinas] = await Promise.all([
    prisma.tentativa.findMany({ where: { userId: user.id }, include: { questao: { include: { disciplina: true } } } }),
    prisma.meta.findMany({ where: { userId: user.id, status: "CONCLUIDA" } }),
    prisma.pomodoroSessao.findMany({ where: { userId: user.id, tipo: "FOCO" } }),
    prisma.erro.findMany({
      where: { userId: user.id },
      include: { topico: { select: { disciplinaId: true } } },
    }),
    prisma.disciplina.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  const totalTentativas = tentativas.length;
  const acertos = tentativas.filter((t) => t.acerto).length;
  const taxaGeral = totalTentativas > 0 ? Math.round((acertos / totalTentativas) * 100) : 0;
  const horasFoco = Math.round(pomodoros.reduce((acc, p) => acc + p.minutos, 0) / 60);
  const revisoesFeitas = erros.filter((e) => e.status === "REVISTO").length;
  const revisoesPendentes = erros.filter((e) => e.status === "PENDENTE").length;

  // acertos por disciplina
  const acertosPorDisc = disciplinas.map((d) => {
    const ts = tentativas.filter((t) => t.questao.disciplinaId === d.id);
    const ok = ts.filter((t) => t.acerto).length;
    return { nome: d.nome, valor: ok, cor: d.cor };
  });

  // erros por disciplina
  const errosPorDisc = disciplinas.map((d) => ({
    nome: d.nome,
    erros: erros.filter((e) => e.topico.disciplinaId === d.id).length,
  }));

  // metas concluídas por semana (8 semanas) + projeção
  const agora = new Date();
  const semanaAtual = startOfWeek(agora);
  const semanas: { nome: string; metas: number }[] = [];
  for (let s = 7; s >= 0; s--) {
    const inicio = addDays(semanaAtual, -7 * s);
    const stamp = weekStamp(inicio);
    const count = metas.filter((m) => weekStamp(m.concluidaEm ?? m.dia) === stamp).length;
    semanas.push({ nome: isoDate(inicio).slice(5), metas: count });
  }
  const rnd = mulberry32(2026);
  const projetadas = semanas.slice(-3).map((w) => ({ ...w, projecao: Math.round(w.metas * (1 + rnd() * 0.35)) }));

  // horas de foco por semana
  const minutosPorSemana: { nome: string; minutos: number }[] = [];
  for (let s = 7; s >= 0; s--) {
    const inicio = addDays(semanaAtual, -7 * s);
    const fim = addDays(inicio, 7);
    const total = pomodoros.filter((p) => p.inicio >= inicio && p.inicio < fim).reduce((a, p) => a + p.minutos, 0);
    minutosPorSemana.push({ nome: isoDate(inicio).slice(5), minutos: Math.round(total / 60) });
  }

  const kpis = [
    { l: "Questões respondidas", v: totalTentativas.toString(), sub: `${taxaGeral}% de acerto` },
    { l: "Horas de foco", v: `${horasFoco}h`, sub: "pomodoro registrado" },
    { l: "Metas concluídas", v: metas.length.toString(), sub: "no cronograma" },
    { l: "Revisões", v: revisoesFeitas.toString(), sub: `${revisoesPendentes} pendentes` },
  ];

  return (
    <AppShell user={user} active="/aluno/relatorio">
      <span className="eyebrow">Sua progressão</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .2em" }}>Relatório de progressão</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 26, maxWidth: 640 }}>
        A curva real do seu estudo: horas, acertos, metas e revisões — semana a semana.
      </p>

      <div className="grid-kpis" style={{ marginBottom: 22 }}>
        {kpis.map((k) => (
          <div key={k.l} className="card" style={{ padding: 18 }}>
            <span className="eyebrow">{k.l}</span>
            <div className="stat-num" style={{ marginTop: 8 }}>{k.v}</div>
            <div style={{ fontSize: ".74rem", color: "var(--ink-faint)", marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Acertos por disciplina</h3>
          <DonutChart data={acertosPorDisc} centerLabel="acertos" centerValue={String(acertos)} />
        </div>
        <div className="card">
          <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Horas de foco por semana</h3>
          <AreaChartC data={minutosPorSemana} dataKey="minutos" color="#f5b84c" />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Metas concluídas por semana</h3>
          <BarsChart data={projetadas} dataKey="metas" color="#f37e1f" />
          <p style={{ fontSize: ".7rem", color: "var(--ink-faint)", marginTop: 6 }}>
            Últimas semanas incluem projeção simulada (linha de tendência para a prova).
          </p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Erros por disciplina</h3>
          <BarsChart data={errosPorDisc} dataKey="erros" color="#ff6b5e" horizontal height={260} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "1rem", marginBottom: 8 }}>Evolução de acertos (tendência)</h3>
        <LineChartC data={projetadas} dataKey="metas" color="#3dd68c" />
      </div>
    </AppShell>
  );
}
