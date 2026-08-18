import AccessStatusBadge, { accessStatus } from "./AccessStatusBadge";

export default function AccessStatusPanel({ acessoAte }: { acessoAte: Date | string | null }) {
  const status = accessStatus(acessoAte);
  return (
    <div className={`access-status-panel access-status-panel--${status.tone}`}>
      <div><span className="eyebrow">Acesso da conta</span><strong>{status.detail}</strong></div>
      <AccessStatusBadge acessoAte={acessoAte} />
    </div>
  );
}
