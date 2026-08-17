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
          {children}
        </main>
      </div>
    </div>
  );
}
