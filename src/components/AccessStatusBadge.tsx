export function accessStatus(acessoAte: Date | string | null, now = Date.now()) {
  if (!acessoAte) return { label: "sem prazo", tone: "ok" as const, detail: "Acesso contínuo" };
  const time = new Date(acessoAte).getTime();
  const days = Math.ceil((time - now) / 86_400_000);
  if (days <= 0) return { label: "expirado", tone: "danger" as const, detail: "Acesso encerrado" };
  if (days <= 7) return { label: "próximo do fim", tone: "warn" as const, detail: `${days} dia${days === 1 ? "" : "s"} restante${days === 1 ? "" : "s"}` };
  return { label: "ativo", tone: "ok" as const, detail: `${days} dias restantes` };
}

export default function AccessStatusBadge({ acessoAte }: { acessoAte: Date | string | null }) {
  const status = accessStatus(acessoAte);
  return <span className={`tag tag-${status.tone}`} title={status.detail}>{status.label}</span>;
}
