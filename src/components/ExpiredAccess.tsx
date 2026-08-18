import Link from "next/link";
import { Icon } from "./icons";

export default function ExpiredAccess({ acessoAte }: { acessoAte?: string | null }) {
  const formatted = acessoAte
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(acessoAte))
    : null;

  return (
    <main className="access-closed-page">
      <div className="access-closed-card rise">
        <img src="/logo/logo-horizontal.jpeg" alt="Mentoria Forja" className="access-closed-logo" />
        <div className="hex access-closed-mark" aria-hidden="true"><Icon name="lock" size={28} /></div>
        <span className="eyebrow">Acesso encerrado</span>
        <h1>Seu próximo capítulo começa com uma renovação.</h1>
        <p>
          O período de acesso ao ambiente de estudos foi encerrado{formatted ? ` em ${formatted}` : ""}. Seu histórico permanece protegido, mas o painel e o conteúdo de estudo ficam indisponíveis até a mentoria renovar sua inscrição.
        </p>
        <div className="access-closed-actions">
          <a className="btn btn-ember" href="mailto:mentor@mentoriaforja.com?subject=Renovar%20acesso%20%C3%A0%20Forja">Falar com o mentor</a>
          <Link className="btn btn-line" href="/entrar">Voltar para o login</Link>
        </div>
        <small>Se você acredita que isso é um engano, envie uma mensagem para a mentoria com seu e-mail de cadastro.</small>
      </div>
    </main>
  );
}
