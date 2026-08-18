import Link from "next/link";
import type { User } from "@prisma/client";
import { Icon } from "./icons";
import LogoutButton from "./LogoutButton";
import { fmtData } from "@/lib/dates";

const NAV_ALUNO = [
  { href: "/aluno", icon: "home", label: "Painel do dia" },
  { href: "/aluno/caderno", icon: "book", label: "Caderno de erros" },
  { href: "/aluno/simulado", icon: "target", label: "Simulado" },
  { href: "/aluno/relatorio", icon: "chart", label: "Relatório" },
  { href: "/aluno/mapas", icon: "map", label: "Mapas mentais" },
  { href: "/aluno/chat", icon: "chat", label: "Chat com o mentor" },
  { href: "/aluno/forum", icon: "forum", label: "Fórum" },
  { href: "/aluno/redacoes", icon: "pen", label: "Redações" },
  { href: "/aluno/perfil", icon: "user", label: "Perfil e anamnese" },
];

const NAV_ADMIN = [
  { href: "/admin", icon: "grid", label: "Visão geral" },
  { href: "/admin/alunos", icon: "users", label: "Alunos" },
  { href: "/admin/planejamento", icon: "calendar", label: "Planejamento adaptativo" },
  { href: "/admin/edital", icon: "doc", label: "Edital verticalizado (IA)" },
  { href: "/admin/mapas", icon: "map", label: "Gerador de mapas mentais" },
  { href: "/admin/simulacoes", icon: "flask", label: "Simulações da prévia" },
  { href: "/admin/chat", icon: "chat", label: "Dúvidas dos alunos" },
  { href: "/admin/redacoes", icon: "pen", label: "Redações" },
];

const SURFACE_ART: Record<string, { image: string; kicker: string; mood: string }> = {
  "/admin/alunos": { image: "/img/police-training.jpg", kicker: "ACOMPANHAMENTO DA TROPA", mood: "Cada aluno, uma rota de aprovação." },
  "/admin/planejamento": { image: "/img/police-operations.jpg", kicker: "MOTOR ADAPTATIVO", mood: "O próximo bloco nasce dos erros de ontem." },
  "/admin/edital": { image: "/img/police-command.jpg", kicker: "INTELIGÊNCIA DE EDITAL", mood: "Do documento bruto à linha de chegada." },
  "/admin/mapas": { image: "/img/police-recruits.jpg", kicker: "ARSENAL VISUAL", mood: "Estruture o conteúdo que fica." },
  "/admin/simulacoes": { image: "/img/hero-tactical.jpg", kicker: "SALA DE SIMULAÇÃO", mood: "Mostre o método em movimento." },
  "/admin/chat": { image: "/img/mentor.jpeg", kicker: "CANAL DIRETO", mood: "Toda dúvida merece uma resposta precisa." },
  "/admin/redacoes": { image: "/img/police-recruits.jpg", kicker: "BANCA DE REDAÇÕES", mood: "A correção que transforma texto em ponto." },
  "/aluno/caderno": { image: "/img/hero-tactical.jpg", kicker: "MEMÓRIA DE LONGO PRAZO", mood: "O erro de hoje vira acerto automático." },
  "/aluno/chat": { image: "/img/mentor.jpeg", kicker: "CANAL COM O MENTOR", mood: "Pergunte. Ajuste. Continue." },
  "/aluno/forum": { image: "/img/police-recruits.jpg", kicker: "COMUNIDADE FORJA", mood: "Preparação também é troca." },
  "/aluno/mapas": { image: "/img/police-training.jpg", kicker: "BIBLIOTECA VISUAL", mood: "Veja a matéria antes de dominá-la." },
  "/aluno/perfil": { image: "/img/mentor.jpeg", kicker: "SEU PERFIL DE MISSÃO", mood: "Um plano bom começa com uma leitura honesta." },
  "/aluno/redacoes": { image: "/img/police-command.jpg", kicker: "PRODUÇÃO ESCRITA", mood: "Cada linha aproxima a aprovação." },
  "/aluno/relatorio": { image: "/img/police-command.jpg", kicker: "LEITURA DE DESEMPENHO", mood: "A curva do estudo não mente." },
  "/aluno/simulado": { image: "/img/hero-tactical.jpg", kicker: "CAMPO DE PROVA", mood: "Treine sob pressão antes do dia decisivo." },
};

export default function AppShell({
  user,
  active,
  children,
}: {
  user: User;
  active: string;
  children: React.ReactNode;
}) {
  const isAdmin = user.role === "ADMIN";
  const nav = isAdmin ? NAV_ADMIN : NAV_ALUNO;
  const dataHoje = fmtData(new Date());
  const activeItem = nav.find((item) => item.href === active);

  return (
    <div className={`shell ${isAdmin ? "shell-mentor" : "shell-student"}`}>
      <header className="topbar">
        <div className="topbar-brand">
          <Link href={isAdmin ? "/admin" : "/aluno"} className="brand-lockup">
            <img src="/logo/logo-horizontal.jpeg" alt="Mentoria Forja" />
          </Link>
          <span className="topbar-divider" />
          <span className="topbar-context">{isAdmin ? "Central do mentor" : "Sala de estudos"}</span>
        </div>
        <div className="topbar-actions">
          <div className="topbar-now">
            <span className="topbar-live-dot" />
            <span>{isAdmin ? "Acompanhamento ativo" : dataHoje}</span>
          </div>
          <div className="topbar-profile">
            <div
              className="avatar"
              style={{
                width: 36,
                height: 36,
                fontSize: "0.9rem",
                background: isAdmin
                  ? "linear-gradient(145deg,var(--ember-400),var(--ember-700))"
                  : "linear-gradient(145deg,#d8a25c,var(--ember-600))",
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="topbar-profile-copy">
              <strong>{user.name}</strong>
              <span>{isAdmin ? "Mentor" : "Aluno"}</span>
            </div>
          </div>
          <LogoutButton compact />
        </div>
      </header>

      <div className="shell-body">
        <aside className="sidebar">
          <div className="sidebar-feature">
            <div className="sidebar-feature-image" />
            <div className="sidebar-feature-copy">
              <span>{isAdmin ? "FORJA · MENTOR" : "FORJA · PROGRAMA"}</span>
              <strong>{isAdmin ? "Veja quem precisa de você." : "Seu próximo nível começa hoje."}</strong>
            </div>
          </div>
          <div className="side-label">Navegação</div>
          <nav className="sidebar-nav" aria-label={isAdmin ? "Navegação do mentor" : "Navegação do aluno"}>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={`nav ${active === item.href ? "active" : ""}`}>
                <span className="nav-icon"><Icon name={item.icon} size={17} /></span>
                <span>{item.label}</span>
                {active === item.href && <span className="nav-active-mark" />}
              </Link>
            ))}
          </nav>
          <div className="sidebar-footnote">
            <span className="sidebar-footnote-mark">FJ</span>
            <span>Disciplina constrói<br /><b>aprovação.</b></span>
          </div>
        </aside>
        <main className="main">
          <div className="page-context-bar">
            <span>{isAdmin ? "MENTOR" : "ALUNO"}</span>
            <span className="page-context-line" />
            <strong>{activeItem?.label ?? "Forja"}</strong>
          </div>
          {SURFACE_ART[active] && (
            <section className="surface-banner" style={{ backgroundImage: `url('${SURFACE_ART[active].image}')` }}>
              <div className="surface-banner-overlay" />
              <div className="surface-banner-copy">
                <span>{SURFACE_ART[active].kicker}</span>
                <strong>{activeItem?.label}</strong>
                <small>{SURFACE_ART[active].mood}</small>
              </div>
              <Link href={isAdmin ? "/admin" : "/aluno"} className="surface-banner-link">Voltar ao painel <b>↗</b></Link>
            </section>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
