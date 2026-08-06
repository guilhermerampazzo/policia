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

  return (
    <div className="shell">
      <header className="topbar">
        <Link href={isAdmin ? "/admin" : "/aluno"}>
          <img src="/logo/logo-horizontal.jpeg" alt="Forja" style={{ height: 28 }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {isAdmin ? (
            <span className="tag tag-ember">Modo mentor</span>
          ) : (
            <span className="tag">
              <Icon name="calendar" size={13} />
              {dataHoje}
            </span>
          )}
          <div
            className="avatar"
            style={{
              width: 34,
              height: 34,
              fontSize: "0.95rem",
              background: isAdmin
                ? "linear-gradient(160deg,var(--ember-500),var(--ember-800))"
                : "linear-gradient(160deg,var(--ember-400),var(--ember-600))",
            }}
          >
            {user.name.charAt(0)}
          </div>
          <LogoutButton compact />
        </div>
      </header>

      <div className="shell-body">
        <aside className="sidebar">
          <div className="side-label">{isAdmin ? "Mentor · " + user.name : "Aluno · " + user.name}</div>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={`nav ${active === item.href ? "active" : ""}`}>
              <Icon name={item.icon} size={17} />
              {item.label}
            </Link>
          ))}
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
