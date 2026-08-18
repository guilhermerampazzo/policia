import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import SimPanel from "@/components/SimPanel";
import AccessDateForm from "@/components/AccessDateForm";
import AccessStatusPanel from "@/components/AccessStatusPanel";
import { BarsChart } from "@/components/Charts";
import { Icon } from "@/components/icons";
import { progressoEdital, acertosErrosPorDisciplina, horasPorDisciplina } from "@/lib/agregacoes";
import { addDays, startOfWeek, DIAS_SEMANA_ABREV, fmtData, isoDate } from "@/lib/dates";
import { computeXpEStreak, nomeNivel } from "@/lib/points";

export const dynamic = "force-dynamic";

export default async function AdminAlunoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const aluno = await prisma.user.findUnique({ where: { id }, include: { anamnese: true } });
  if (!aluno || aluno.role !== "STUDENT") notFound();

  const [metas, erros, xpEStreak, progresso, desempenho, horas, flashcards, estrategias] = await Promise.all([
    prisma.meta.findMany({ where: { userId: aluno.id }, include: { topico: { include: { disciplina: true } } }, orderBy: { dia: "desc" } }),
    prisma.erro.findMany({ where: { userId: aluno.id }, include: { topico: { include: { disciplina: true } }, flashcard: true, conteudoEstrategico: true }, orderBy: { data: "desc" } }),
    computeXpEStreak(aluno.id),
    progressoEdital(aluno.id),
    acertosErrosPorDisciplina(aluno.id),
    horasPorDisciplina(aluno.id),
    prisma.flashcard.findMany({ where: { userId: aluno.id }, include: { erro: { include: { topico: { include: { disciplina: true } } } } }, orderBy: { criadoEm: "desc" }, take: 5 }),
    prisma.conteudoEstrategico.findMany({ where: { userId: aluno.id }, include: { erro: { include: { topico: { include: { disciplina: true } } } } }, orderBy: { atualizadoEm: "desc" }, take: 5 }),
  ]);

  const hoje = new Date();
  const acertos = desempenho.reduce((sum, item) => sum + item.acertos, 0);
  const totalTentativas = desempenho.reduce((sum, item) => sum + item.total, 0);
  const minutosFoco = horas.reduce((sum, item) => sum + item.minutos, 0);
  const horasFoco = Math.round(minutosFoco / 60);
  const pendentes = erros.filter((e) => e.status === "PENDENTE");
  const semanaInicio = startOfWeek(hoje);
  const semanaMetas = metas.filter((m) => m.dia >= semanaInicio && m.dia < addDays(semanaInicio, 7));
  const semanaGrid = Array.from({ length: 7 }, (_, i) => {
    const dia = addDays(semanaInicio, i);
    return { dia, m: semanaMetas.find((x) => x.dia.getTime() === dia.getTime()) };
  });
  const stats = [
    { l: "Força (XP)", v: String(xpEStreak.xp), sub: `${nomeNivel(xpEStreak.xp)} · nível ${Math.floor(xpEStreak.xp / 500) + 1}` },
    { l: "Sequência", v: `${xpEStreak.streak}d`, sub: "dias seguidos" },
    { l: "Horas de foco", v: `${horasFoco}h`, sub: "pomodoro" },
    { l: "Questões", v: `${totalTentativas} · ${acertos} acertos`, sub: `${totalTentativas ? Math.round((acertos / totalTentativas) * 100) : 0}% taxa` },
  ];

  return (
    <AppShell user={user} active="/admin/alunos">
      <Link href="/admin/alunos" className="btn btn-line btn-sm" style={{ marginBottom: 16 }}>← Todos os alunos</Link>
      <div className="card card-ember admin-student-hero">
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}><div className="avatar avatar-lg">{aluno.name.charAt(0)}</div><div><h1 style={{ fontSize: "1.7rem" }}>{aluno.name}</h1><p>{aluno.concursoAlvo ?? "Sem concurso alvo"} · {aluno.banca ?? "banca não definida"}</p><div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>{aluno.dataProva && <span className="tag tag-gold">Prova: {fmtData(aluno.dataProva)}</span>}{aluno.anamnese ? <span className="tag tag-ok">anamnese concluída</span> : <span className="tag tag-warn">anamnese pendente</span>}</div></div></div>
        <div className="admin-student-meta"><div><span>Disponibilidade</span><strong>{aluno.anamnese ? `${aluno.anamnese.horasPorDia}h/dia · ${aluno.anamnese.diasDisponiveis.length} dias` : "—"}</strong></div><div><span>Dificuldades</span><strong>{aluno.anamnese?.dificuldades?.length ? aluno.anamnese.dificuldades.join(" · ") : "—"}</strong></div><div><span>Objetivo</span><strong>{aluno.anamnese?.objetivo ?? "—"}</strong></div></div>
      </div>

      <div className="admin-access-grid"><div><AccessStatusPanel acessoAte={aluno.acessoAte} /><div style={{ marginTop: 12 }}><AccessDateForm alunoId={aluno.id} acessoAte={aluno.acessoAte?.toISOString() ?? null} /></div></div><div className="card admin-access-explainer"><span className="eyebrow">Leitura rápida</span><h2>O acesso acompanha a rota.</h2><p>Use um prazo para organizar a renovação do acompanhamento. O mentor nunca é bloqueado e o aluno não recebe conteúdo protegido depois do encerramento.</p><span className="tag tag-ember">última leitura · {fmtData(new Date())}</span></div></div>

      <div className="grid-kpis" style={{ margin: "20px 0" }}>{stats.map((s) => <div key={s.l} className="card" style={{ padding: 18 }}><span className="eyebrow">{s.l}</span><div className="stat-num" style={{ marginTop: 8, fontSize: "1.8rem" }}>{s.v}</div><div style={{ fontSize: ".72rem", color: "var(--ink-faint)", marginTop: 4 }}>{s.sub}</div></div>)}</div>

      <section className="card card-ember edital-progress-card" style={{ marginBottom: 20 }}><div className="edital-progress-head"><div><span className="eyebrow">Edital do aluno</span><h2>{progresso.topicosConcluidos} de {progresso.totalTopicos} tópicos concluídos</h2><p>Progresso calculado por tópicos com metas concluídas, sem estimativa.</p></div><strong>{Math.round(progresso.cobertura * 100)}%</strong></div><div className="progress progress-lg"><span style={{ width: `${progresso.cobertura * 100}%` }} /></div><div className="discipline-progress-list">{progresso.porDisciplina.map((item) => <div key={item.disciplinaId}><div><span style={{ background: item.cor }} />{item.nome}<b>{item.topicosConcluidos}/{item.totalTopicos}</b></div><div className="progress"><span style={{ width: `${item.cobertura * 100}%`, background: item.cor }} /></div></div>)}</div></section>

      <div className="grid-2" style={{ marginBottom: 20 }}><div className="card"><h2 className="chart-title">Acertos por disciplina</h2><BarsChart data={desempenho} dataKey="acertos" color="#3dd68c" horizontal height={Math.max(220, desempenho.length * 34)} /></div><div className="card"><h2 className="chart-title">Erros por disciplina</h2><BarsChart data={desempenho} dataKey="erros" color="#ff6b5e" horizontal height={Math.max(220, desempenho.length * 34)} /></div></div>
      <div className="grid-2" style={{ marginBottom: 20 }}><div className="card"><h2 className="chart-title">Horas por disciplina</h2>{horas.length ? <BarsChart data={horas} dataKey="horas" color="#f5b84c" horizontal height={Math.max(220, horas.length * 36)} /> : <p className="empty-copy">Nenhuma sessão de foco classificada ainda.</p>}<p className="chart-note">Total registrado: {horasFoco}h. Sessões antigas aparecem como não classificadas.</p></div><div><h2 className="admin-subtitle">Semana atual</h2><div className="card"><div className="admin-week-grid">{semanaGrid.map(({ dia, m }, i) => <div key={i} className={m ? "has-meta" : ""}><span>{DIAS_SEMANA_ABREV[dia.getDay()]}</span><strong>{m ? m.topico.disciplina.nome : "—"}</strong>{m && <small>{m.status === "CONCLUIDA" ? "feita" : m.origem === "REVISAO" ? "revisão" : "pendente"}</small>}</div>)}</div></div></div></div>

      <div className="grid-2-wide" style={{ marginBottom: 20 }}><div><h2 className="admin-subtitle">Erros recentes</h2><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{pendentes.slice(0, 6).map((e) => <div key={e.id} className="card" style={{ padding: 14 }}><span className="tag tag-ember">{e.topico.disciplina.nome}</span><p style={{ marginTop: 8, color: "var(--ink-dim)", fontSize: ".84rem", lineHeight: 1.5 }}>{e.descricao}</p><span className="tag tag-warn" style={{ marginTop: 8 }}>revisão {isoDate(e.revisaoEm)}</span></div>)}{pendentes.length === 0 && <div className="card empty-copy">Sem erros pendentes.</div>}</div></div><div><h2 className="admin-subtitle">Memória criada recentemente</h2><div className="card recent-memory-list"><div><span className="eyebrow">Flashcards</span>{flashcards.map((card) => <div key={card.id}><Icon name="brain" size={14} /><span>{card.erro.topico.titulo}</span><small>{card.repeticoes} repetições</small></div>)}{flashcards.length === 0 && <p className="empty-copy">Nenhum flashcard criado.</p>}</div><div><span className="eyebrow">Estratégias</span>{estrategias.map((item) => <div key={item.id}><Icon name="spark" size={14} /><span>{item.erro.topico.titulo}</span><small>{item.origem === "ia" ? "IA" : "base Forja"}</small></div>)}{estrategias.length === 0 && <p className="empty-copy">Nenhuma estratégia gerada.</p>}</div></div></div></div>

      <div className="card card-ember"><div style={{ display: "flex", alignItems: "center", gap: 12 }}><Icon name="flask" size={18} style={{ color: "var(--ember-400)" }} /><p style={{ fontSize: ".84rem", color: "var(--ink-dim)" }}>Simulações continuam disponíveis para testar a rota sem misturar dados de demonstração com a leitura real do aluno.</p></div><div style={{ marginTop: 14 }}><SimPanel alunoId={aluno.id} acoes={[{ acao: "erros", label: "Simular 5 erros em Direito Penal", payload: { disciplinaSlug: "direito-penal", qtd: 5 }, destaque: true }, { acao: "regenerar", label: "Regenerar semana atual", destaque: true }, { acao: "tentativas", label: "Simular 10 questões respondidas", payload: { qtd: 10 } }, { acao: "pomodoro", label: "Simular 1 sessão de foco (25 min)", payload: { qtd: 25 } }]} /></div></div>
    </AppShell>
  );
}
