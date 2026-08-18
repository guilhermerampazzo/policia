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
import { computeXpEStreak, levelFromXp, nomeNivel } from "@/lib/points";

export const dynamic = "force-dynamic";

const CAPAS: Record<string, string> = {
  "direito-penal": "/img/hero-tactical.jpg",
  portugues: "/img/police-recruits.jpg",
  "raciocinio-logico": "/img/police-command.jpg",
  "direitos-humanos": "/img/police-training.jpg",
  "legislacao-especial": "/img/police-operations.jpg",
  "direito-consumidor": "/img/police-recruits.jpg",
};

function capaDaDisciplina(slug: string) {
  return CAPAS[slug] ?? "/img/treino.jpg";
}

type DashboardTopic = {
  id: string;
  titulo: string;
  cargaMin: number;
  disciplina: { nome: string; slug: string };
};

type DashboardMeta = {
  id: string;
  topicoId: string;
  topico: DashboardTopic;
  dia: Date;
  status: string;
  origem: string;
};

type DashboardError = {
  id: string;
  topico: DashboardTopic;
  revisaoEm: Date;
};

type DashboardData = {
  anamnese: { diasDisponiveis: number[]; horasPorDia: number } | null;
  metas: DashboardMeta[];
  xpEStreak: { xp: number; streak: number };
  pomodoro: { minutos: number }[];
  erros: DashboardError[];
};

export default async function AlunoDashboard({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const preview = process.env.NODE_ENV === "development" && (await searchParams).preview === "1";
  const hoje = startOfDay(new Date());
  const previewUser = {
    id: "preview-student",
    email: "aluno@forja.com",
    name: "Rafael Monteiro",
    passwordHash: "",
    role: "STUDENT",
    concursoAlvo: "Polícia Civil",
    banca: "FGV",
    dataProva: addDays(hoje, 84),
    onboardingDone: true,
    criadoEm: hoje,
  } as any;
  const user = preview ? previewUser : await requireUser();
  if (!user.onboardingDone) redirect("/aluno/onboarding");

  const previewDiscipline = (id: string, nome: string, slug: string, ordem: number) => ({
    id,
    nome,
    slug,
    ordem,
    cor: "#e86d3f",
  });
  const previewTopic = (id: string, disciplina: ReturnType<typeof previewDiscipline>, titulo: string, cargaMin: number) => ({
    id,
    disciplinaId: disciplina.id,
    disciplina,
    titulo,
    ordem: 1,
    tipo: "QUESTOES",
    cargaMin,
  });
  const penal = previewDiscipline("disc-penal", "Direito Penal", "direito-penal", 1);
  const portugues = previewDiscipline("disc-portugues", "Português", "portugues", 2);
  const logica = previewDiscipline("disc-logica", "Raciocínio Lógico", "raciocinio-logico", 3);
  const direitosHumanos = previewDiscipline("disc-humanos", "Direitos Humanos", "direitos-humanos", 4);
  const topicoPenal = previewTopic("top-penal", penal, "Crimes contra a Administração Pública", 45);
  const topicoPortugues = previewTopic("top-portugues", portugues, "Interpretação de textos e inferência", 35);
  const topicoLogica = previewTopic("top-logica", logica, "Proposições e equivalências", 50);
  const topicoHumanos = previewTopic("top-humanos", direitosHumanos, "Direitos fundamentais na Constituição", 40);
  const previewMeta = (id: string, topico: ReturnType<typeof previewTopic>, dia: Date, status: string, origem: string) => ({
    id,
    userId: user.id,
    topicoId: topico.id,
    topico,
    dia,
    semana: 1,
    status,
    origem,
    concluidaEm: status === "CONCLUIDA" ? dia : null,
    criadoEm: hoje,
  });
  const previewErro = (id: string, topico: ReturnType<typeof previewTopic>, revisaoEm: Date) => ({
    id,
    userId: user.id,
    topicoId: topico.id,
    topico,
    descricao: "Questão de revisão para consolidar o conteúdo.",
    data: addDays(hoje, -2),
    revisaoEm,
    status: "PENDENTE",
    revisadoEm: null,
  });

  const previewData = {
    anamnese: {
      id: "anamnesis-preview",
      userId: user.id,
      horasPorDia: 2,
      diasDisponiveis: [1, 2, 3, 4, 5],
      dificuldades: ["Direito Penal"],
      formatoPreferido: "questoes",
      objetivo: "Aprovação na Polícia Civil",
      criadoEm: hoje,
      atualizadoEm: hoje,
    },
    metas: [
      previewMeta("meta-today", topicoPenal, hoje, "EM_CURSO", "PLANEJADA"),
      previewMeta("meta-late", topicoPortugues, addDays(hoje, -1), "PENDENTE", "PLANEJADA"),
      previewMeta("meta-tomorrow", topicoLogica, addDays(hoje, 1), "PENDENTE", "PLANEJADA"),
      previewMeta("meta-review", topicoHumanos, addDays(hoje, 2), "PENDENTE", "REVISAO"),
      previewMeta("meta-done", topicoPortugues, addDays(hoje, -2), "CONCLUIDA", "PLANEJADA"),
    ],
    xpEStreak: { xp: 1280, streak: 6 },
    pomodoro: [
      { id: "pomodoro-1", userId: user.id, inicio: addDays(hoje, 0), minutos: 45, tipo: "FOCO" },
      { id: "pomodoro-2", userId: user.id, inicio: addDays(hoje, 0), minutos: 25, tipo: "FOCO" },
    ],
    erros: [
      previewErro("erro-1", topicoLogica, addDays(hoje, 1)),
      previewErro("erro-2", topicoPenal, addDays(hoje, 3)),
      previewErro("erro-3", topicoHumanos, addDays(hoje, 5)),
    ],
  };
  const [anamnese, metas, xpEStreak, pomodoro, erros] = preview
    ? [previewData.anamnese, previewData.metas, previewData.xpEStreak, previewData.pomodoro, previewData.erros]
    : await Promise.all([
        prisma.anamnese.findUnique({ where: { userId: user.id } }),
        prisma.meta.findMany({
          where: { userId: user.id },
          include: { topico: { include: { disciplina: true } } },
          orderBy: { dia: "asc" },
        }),
        computeXpEStreak(user.id),
        prisma.pomodoroSessao.findMany({ where: { userId: user.id, tipo: "FOCO", inicio: { gte: hoje } } }),
        prisma.erro.findMany({
          where: { userId: user.id, status: "PENDENTE" },
          include: { topico: { include: { disciplina: true } } },
          orderBy: { revisaoEm: "asc" },
          take: 8,
        }),
      ]);

  const minutosHoje = pomodoro.reduce((acc, p) => acc + p.minutos, 0);
  const metaDoDia =
    metas.find((m) => m.dia.getTime() === hoje.getTime() && m.status !== "CONCLUIDA") ??
    metas.find((m) => m.dia.getTime() === hoje.getTime()) ??
    metas.find((m) => m.status === "PENDENTE" && m.dia >= hoje);
  const pendentes = metas.filter((m) => m.dia < hoje && m.status !== "CONCLUIDA");
  const proximaRevisao = erros[0];
  const nivel = levelFromXp(xpEStreak.xp);

  const semanaStart = startOfWeek(new Date());
  const semana = Array.from({ length: 7 }, (_, i) => {
    const dia = addDays(semanaStart, i);
    return { dia, metas: metas.filter((m) => m.dia.getTime() === dia.getTime()) };
  });

  const trilha = metas
    .filter((m) => m.status !== "CONCLUIDA" && m.dia >= hoje)
    .slice(0, 6);
  const trilhaFallback = trilha.length ? trilha : metas.slice(-6).reverse();

  return (
    <AppShell user={user} active="/aluno">
      <div className="nf-dashboard">
        <section
          className="nf-hero rise"
          style={{ backgroundImage: "url('/img/treino.jpg')" }}
          aria-label="Meta principal do dia"
        >
          <div className="nf-hero-overlay" />
          <div className="nf-hero-content">
            <span className="nf-kicker">FORJA ORIGINAL · PROGRAMA DE HOJE</span>
            <h1>{metaDoDia ? metaDoDia.topico.titulo : "Seu próximo nível começa agora"}</h1>
            <div className="nf-hero-meta">
              <span className="nf-match">100% foco</span>
              <span>{metaDoDia?.topico.disciplina.nome ?? "Treino livre"}</span>
              <span>{metaDoDia ? `${metaDoDia.topico.cargaMin} min` : "questões e revisão"}</span>
              {metaDoDia?.origem === "REVISAO" && <span className="nf-revision">REVISÃO</span>}
            </div>
            <p>
              {metaDoDia
                ? metaDoDia.origem === "REVISAO"
                  ? "Uma revisão certeira para transformar um erro em resposta automática."
                  : "Uma sessão objetiva, com conteúdo e questões para manter sua preparação em movimento."
                : "O mentor ainda não definiu sua meta de hoje. Enquanto isso, mantenha o ritmo com um simulado."}
            </p>
            <div className="nf-hero-actions">
              {metaDoDia ? (
                <ConcluirMeta metaId={metaDoDia.id} label="Concluir meta" />
              ) : (
                <Link href="/aluno/simulado" className="btn btn-ember">
                  <Icon name="target" size={16} /> Treinar agora
                </Link>
              )}
              <Link href={metaDoDia ? "/aluno/caderno" : "/aluno/relatorio"} className="btn nf-btn-more">
                <Icon name="file" size={16} /> Mais informações
              </Link>
            </div>
          </div>
          <div className="nf-hero-stamp">
            <span className="eyebrow">Sua força</span>
            <strong>{xpEStreak.xp} XP</strong>
            <small>Nível {nivel.nivel} · {nomeNivel(xpEStreak.xp)}</small>
          </div>
        </section>

        {metaDoDia && (
          <div className="nf-now-panel">
            <div>
              <span className="nf-section-kicker">CONTINUE DE ONDE PAROU</span>
              <h2>{metaDoDia.origem === "REVISAO" ? "Revisão em andamento" : "Sua sessão de estudo"}</h2>
            </div>
            <MetaAcoes topicoId={metaDoDia.topicoId} topicoTitulo={metaDoDia.topico.titulo} />
          </div>
        )}

        {pendentes.length > 0 && (
          <div className="nf-alert">
            <Icon name="warn" size={19} />
            <div>
              <strong>{pendentes.length} meta{pendentes.length > 1 ? "s" : ""} pendente{pendentes.length > 1 ? "s" : ""}</strong>
              <span>{pendentes.slice(0, 2).map((p) => p.topico.titulo).join(" · ")}</span>
            </div>
            <Link href="/aluno/relatorio" className="btn btn-line btn-sm">Ver pendências</Link>
          </div>
        )}

        <div className="nf-stats-row">
          <div className="nf-stat-card">
            <span className="nf-stat-icon"><Icon name="clock" size={17} /></span>
            <div><small>FOCO HOJE</small><strong>{minutosHoje} min</strong><span>de estudo registrado</span></div>
          </div>
          <div className="nf-stat-card">
            <span className="nf-stat-icon nf-stat-icon--green"><Icon name="fire" size={17} /></span>
            <div><small>SEQUÊNCIA</small><strong>{xpEStreak.streak} dias</strong><span>sem quebrar o ritmo</span></div>
          </div>
          <div className="nf-stat-card">
            <span className="nf-stat-icon nf-stat-icon--gold"><Icon name="target" size={17} /></span>
            <div><small>PRÓXIMA REVISÃO</small><strong>{proximaRevisao ? fmtData(proximaRevisao.revisaoEm) : "Nenhuma"}</strong><span>{proximaRevisao?.topico.disciplina.nome ?? "caderno em dia"}</span></div>
          </div>
        </div>

        <section className="nf-section">
          <div className="nf-section-head">
            <div><span className="nf-section-kicker">SUA FILA DE TREINO</span><h2>Continue estudando</h2></div>
            <Link href="/aluno/relatorio">Ver tudo <span>→</span></Link>
          </div>
          <div className="nf-rail">
            {trilhaFallback.map((meta, index) => (
              <Link
                key={meta.id}
                href={meta.origem === "REVISAO" ? "/aluno/caderno" : "/aluno/simulado"}
                className="nf-content-card"
                style={{ backgroundImage: `url('${capaDaDisciplina(meta.topico.disciplina.slug)}')` }}
              >
                <div className="nf-content-card-overlay" />
                <span className="nf-card-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="nf-content-card-body">
                  <span className="nf-card-tag">{meta.topico.disciplina.nome}</span>
                  <h3>{meta.topico.titulo}</h3>
                  <span className="nf-card-detail">{meta.origem === "REVISAO" ? "Caderno de erros" : `${meta.topico.cargaMin} min · questões`}</span>
                  <div className="nf-card-progress"><span style={{ width: meta.status === "CONCLUIDA" ? "100%" : meta.dia < hoje ? "28%" : "8%" }} /></div>
                </div>
              </Link>
            ))}
            {trilhaFallback.length === 0 && (
              <div className="nf-empty-card">Seu mentor ainda está preparando a próxima trilha.</div>
            )}
          </div>
        </section>

        <section className="nf-section">
          <div className="nf-section-head">
            <div><span className="nf-section-kicker">BASEADO NO SEU DESEMPENHO</span><h2>Recomendado para revisar</h2></div>
            <Link href="/aluno/caderno">Abrir caderno <span>→</span></Link>
          </div>
          <div className="nf-rail">
            {erros.map((erro, index) => (
              <Link
                key={erro.id}
                href="/aluno/caderno"
                className="nf-content-card nf-content-card--review"
                style={{ backgroundImage: `url('${capaDaDisciplina(erro.topico.disciplina.slug)}')` }}
              >
                <div className="nf-content-card-overlay" />
                <span className="nf-card-number">R{String(index + 1).padStart(2, "0")}</span>
                <div className="nf-content-card-body">
                  <span className="nf-card-tag">REVISÃO AGENDADA</span>
                  <h3>{erro.topico.titulo}</h3>
                  <span className="nf-card-detail">{erro.topico.disciplina.nome} · {fmtData(erro.revisaoEm)}</span>
                  <div className="nf-card-progress nf-card-progress--gold"><span style={{ width: "42%" }} /></div>
                </div>
              </Link>
            ))}
            {erros.length === 0 && (
              <Link href="/aluno/caderno" className="nf-empty-card">
                Nenhuma revisão pendente. Registre seus erros ao estudar.
              </Link>
            )}
          </div>
        </section>

        <div className="nf-lower-grid">
          <section className="nf-section nf-week-section">
            <div className="nf-section-head">
              <div><span className="nf-section-kicker">PROGRAMAÇÃO</span><h2>Sua semana</h2></div>
              <span className="nf-section-note">{anamnese ? `${anamnese.diasDisponiveis.length} dias · ${anamnese.horasPorDia}h/dia` : "Sem anamnese"}</span>
            </div>
            <div className="nf-week-row">
              {semana.map(({ dia, metas: ms }, i) => {
                const ehHoje = dia.getTime() === hoje.getTime();
                const m = ms[0];
                const atrasada = m && m.dia < hoje && m.status !== "CONCLUIDA";
                const concluida = m && m.status === "CONCLUIDA";
                return (
                  <div key={i} className={`nf-day-card ${ehHoje ? "is-today" : ""} ${concluida ? "is-done" : ""} ${atrasada ? "is-late" : ""}`}>
                    <span>{DIAS_SEMANA_ABREV[dia.getDay()]}</span>
                    <strong>{ehHoje ? "HOJE" : m ? m.topico.disciplina.nome : "—"}</strong>
                    {m && <small>{concluida ? "concluída" : atrasada ? "pendente" : m.origem === "REVISAO" ? "revisão" : "a fazer"}</small>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="nf-focus-card">
            <div className="nf-section-head">
              <div><span className="nf-section-kicker">MODO FOCO</span><h2>Pomodoro</h2></div>
              <Icon name="clock" size={18} />
            </div>
            <Pomodoro minutosHoje={minutosHoje} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
