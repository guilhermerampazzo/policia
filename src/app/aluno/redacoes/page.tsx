import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import NovaRedacaoForm from "@/components/NovaRedacaoForm";
import { fmtDataCurta } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function RedacoesPage() {
  const user = await requireUser();
  const redacoes = await prisma.redacao.findMany({
    where: { userId: user.id },
    orderBy: { data: "desc" },
  });

  return (
    <AppShell user={user} active="/aluno/redacoes">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
        <div>
          <span className="eyebrow">Produção escrita</span>
          <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .1em" }}>Redações</h1>
          <p style={{ color: "var(--ink-dim)", fontSize: ".9rem" }}>O mentor corrige com nota de 0 a 100 e comentários.</p>
        </div>
        <NovaRedacaoForm />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 26 }}>
        {redacoes.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem" }}>{r.tema}</h3>
                <p style={{ color: "var(--ink-dim)", fontSize: ".86rem", marginTop: 8, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {r.texto}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {r.status === "CORRIGIDA" ? (
                  <span className="tag tag-ok">nota {r.nota}/100</span>
                ) : (
                  <span className="tag tag-warn">aguardando correção</span>
                )}
                <div style={{ fontSize: ".7rem", color: "var(--ink-faint)", marginTop: 6 }}>{fmtDataCurta(r.data)}</div>
              </div>
            </div>
          </div>
        ))}
        {redacoes.length === 0 && (
          <div className="card" style={{ textAlign: "center", color: "var(--ink-faint)", padding: 44 }}>Nenhuma redação enviada.</div>
        )}
      </div>
    </AppShell>
  );
}
