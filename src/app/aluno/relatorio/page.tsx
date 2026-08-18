import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import { BarsChart, AreaChartC, LineChartC } from "@/components/Charts";
import ForjaPillars from "@/components/ForjaPillars";
import { progressoEdital, acertosErrosPorDisciplina, horasPorDisciplina } from "@/lib/agregacoes";
import { startOfWeek, addDays, weekStamp, isoDate } from "@/lib/dates";
import { computeXpEStreak, levelFromXp, nomeNivel } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function RelatorioPage() {
  const user = await requireUser();
  const [metas, erros, progresso, desempenho, horas, xpEStreak, pomodoros] = await Promise.all([
    prisma.meta.findMany({ where: { userId: user.id, status: "CONCLUIDA" }, select: { dia: true, concluidaEm: true } }),
    prisma.erro.findMany({ where: { userId: user.id }, select: { status: true } }),
    progressoEdital(user.id),
    acertosErrosPorDisciplina(user.id),
    horasPorDisciplina(user.id),
    computeXpEStreak(user.id),
    prisma.pomodoroSessao.findMany({ where: { userId: user.id, tipo: "FOCO" }, select: { inicio: true, minutos: true } }),
  ]);

  const totalTentativas = desempenho.reduce((sum, item) => sum + item.total, 0);
  const acertos = desempenho.reduce((sum, item) => sum + item.acertos, 0);
  const taxaGeral = totalTentativas ? Math.round((acertos / totalTentativas) * 100) : 0;
  const horasFoco = Math.round(pomodoros.reduce((sum, p) => sum + p.minutos, 0) / 60);
  const revisoesFeitas = erros.filter((e) => e.status === "REVISTO").length;
  const revisoesPendentes = erros.length - revisoesFeitas;
  const semanaAtual = startOfWeek(new Date());
  const semanas = Array.from({ length: 8 }, (_, index) => {
    const inicio = addDays(semanaAtual, -7 * (7 - index));
    const stamp = weekStamp(inicio);
    return { nome: isoDate(inicio).slice(5), metas: metas.filter((m) => weekStamp(m.concluidaEm ?? m.dia) === stamp).length };
  });
  const minutosPorSemana = semanas.map((semana, index) => {
    const inicio = addDays(semanaAtual, -7 * (7 - index));
    const fim = addDays(inicio, 7);
    return { nome: semana.nome, minutos: Math.round(pomodoros.filter((p) => p.inicio >= inicio && p.inicio < fim).reduce((sum, p) => sum + p.minutos, 0) / 60) };
  });
  const level = levelFromXp(xpEStreak.xp);
  const levelProgress = Math.round(((xpEStreak.xp - (level.nivel - 1) * 500) / 500) * 100);

  return (
    <AppShell user={user} active="/aluno/relatorio">
      <span className="eyebrow">Sua progressão · dados reais</span>
      <h1 style={{ margin: ".25em 0 .2em" }}>Relatório de progressão</h1>
      <p style={{ marginBottom: 26, maxWidth: 700 }}>Uma leitura clara da rota: o edital mostra cobertura, o desempenho mostra precisão e as horas mostram onde seu esforço está chegando.</p>

      <section className="card card-ember edital-progress-card" aria-labelledby="edital-progress-title">
        <div className="edital-progress-head"><div><span className="eyebrow">Linha do edital</span><h2 id="edital-progress-title">{progresso.topicosConcluidos} de {progresso.totalTopicos} tópicos concluídos</h2><p>{Math.round(progresso.cobertura * 100)}% de cobertura calculada pelas metas concluídas.</p></div><strong>{Math.round(progresso.cobertura * 100)}%</strong></div>
        <div className="progress progress-lg" aria-label={`${Math.round(progresso.cobertura * 100)}% do edital concluído`}><span style={{ width: `${progresso.cobertura * 100}%` }} /></div>
        <div className="discipline-progress-list">{progresso.porDisciplina.map((item) => <div key={item.disciplinaId}><div><span style={{ borderColor: item.cor, background: item.cor }} />{item.nome}<b>{item.topicosConcluidos}/{item.totalTopicos}</b></div><div className="progress"><span style={{ width: `${item.cobertura * 100}%`, background: item.cor }} /></div></div>)}</div>
      </section>

      <div className="grid-kpis" style={{ margin: "20px 0" }}>
        {[{ l: "Questões respondidas", v: String(totalTentativas), sub: `${taxaGeral}% de acerto` }, { l: "Horas de foco", v: `${horasFoco}h`, sub: "pomodoro registrado" }, { l: "Metas concluídas", v: String(metas.length), sub: "no cronograma" }, { l: "Revisões", v: String(revisoesFeitas), sub: `${revisoesPendentes} pendentes` }].map((k) => <div key={k.l} className="card" style={{ padding: 18 }}><span className="eyebrow">{k.l}</span><div className="stat-num" style={{ marginTop: 8 }}>{k.v}</div><div style={{ fontSize: ".74rem", color: "var(--ink-faint)", marginTop: 4 }}>{k.sub}</div></div>)}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card"><h2 className="chart-title">Acertos por disciplina</h2><BarsChart data={desempenho} dataKey="acertos" color="#3dd68c" horizontal height={Math.max(220, desempenho.length * 34)} /><p className="chart-note">Baseado nas tentativas registradas em cada disciplina.</p></div>
        <div className="card"><h2 className="chart-title">Erros por disciplina</h2><BarsChart data={desempenho} dataKey="erros" color="#ff6b5e" horizontal height={Math.max(220, desempenho.length * 34)} /><p className="chart-note">Registre um erro para alimentar o caderno e os flashcards.</p></div>
      </div>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card"><h2 className="chart-title">Horas estudadas por disciplina</h2>{horas.length ? <BarsChart data={horas} dataKey="horas" color="#f5b84c" horizontal height={Math.max(220, horas.length * 36)} /> : <p className="empty-copy">As horas aparecem aqui quando uma sessão de foco é registrada com tópico.</p>}<p className="chart-note">Sessões antigas sem tópico ficam em “Não classificado”.</p></div>
        <div className="card"><h2 className="chart-title">Foco por semana</h2><AreaChartC data={minutosPorSemana} dataKey="minutos" color="#f5b84c" /><p className="chart-note">Horas somadas a partir dos pomodoros de foco.</p></div>
      </div>
      <div className="grid-2" style={{ marginBottom: 20 }}><div className="card"><h2 className="chart-title">Metas concluídas por semana</h2><BarsChart data={semanas} dataKey="metas" color="#f37e1f" /><p className="chart-note">Sem projeções: apenas o que foi concluído.</p></div><div className="card"><h2 className="chart-title">Ritmo recente</h2><LineChartC data={semanas} dataKey="metas" color="#3dd68c" /><p className="chart-note">A linha ajuda a identificar constância, não uma nota.</p></div></div>

      <section className="card gamification-card" aria-labelledby="gamification-title"><div><span className="eyebrow">Gamificação sem distração</span><h2 id="gamification-title">Força acumulada</h2><p>XP nasce de metas, questões, foco e revisões. Cada evento é contado uma vez pelo histórico real.</p></div><div className="gamification-level"><span className="tag tag-gold">NÍVEL {level.nivel} · {nomeNivel(xpEStreak.xp)}</span><strong>{xpEStreak.xp} XP</strong><div className="progress"><span style={{ width: `${Math.max(0, Math.min(100, levelProgress))}%` }} /></div><small>{Math.max(0, level.proximo - xpEStreak.xp)} XP para o próximo nível · sequência de {xpEStreak.streak} dia(s)</small></div></section>
      <ForjaPillars />
    </AppShell>
  );
}
