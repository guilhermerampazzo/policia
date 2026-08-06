import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import GradeRedacao from "@/components/GradeRedacao";
import { fmtDataCurta } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminRedacoes() {
  const user = await requireAdmin();
  const redacoes = await prisma.redacao.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { data: "desc" },
  });

  const pendentes = redacoes.filter((r) => r.status === "PENDENTE");
  const corrigidas = redacoes.filter((r) => r.status === "CORRIGIDA");

  return (
    <AppShell user={user} active="/admin/redacoes">
      <span className="eyebrow">Produção escrita</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 1em" }}>Redações dos alunos</h1>

      <div className="grid-kpis" style={{ marginBottom: 22, gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="card" style={{ padding: 18 }}>
          <span className="eyebrow">Pendentes</span>
          <div className="stat-num" style={{ marginTop: 8 }}>{pendentes.length}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <span className="eyebrow">Corrigidas</span>
          <div className="stat-num" style={{ marginTop: 8 }}>{corrigidas.length}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <span className="eyebrow">Nota média</span>
          <div className="stat-num" style={{ marginTop: 8 }}>
            {corrigidas.length ? Math.round(corrigidas.reduce((a, r) => a + (r.nota ?? 0), 0) / corrigidas.length) : "—"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {redacoes.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <strong>{r.user.name}</strong>
                  <span className="tag" style={{ fontSize: ".56rem" }}>{fmtDataCurta(r.data)}</span>
                </div>
                <h3 style={{ fontSize: "1.05rem", marginTop: 8 }}>{r.tema}</h3>
                <p style={{ color: "var(--ink-dim)", fontSize: ".86rem", marginTop: 8, lineHeight: 1.55, whiteSpace: "pre-wrap", maxHeight: 130, overflow: "hidden" }}>
                  {r.texto}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {r.status === "CORRIGIDA" ? (
                  <span className="tag tag-ok">nota {r.nota}/100</span>
                ) : (
                  <GradeRedacao id={r.id} />
                )}
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
