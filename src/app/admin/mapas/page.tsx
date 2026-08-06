import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import MapGenerator from "@/components/MapGenerator";
import { fmtDataCurta } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function AdminMapas() {
  const user = await requireAdmin();
  const [disciplinas, mapas] = await Promise.all([
    prisma.disciplina.findMany({ orderBy: { ordem: "asc" }, select: { id: true, nome: true } }),
    prisma.mapaMental.findMany({
      include: { disciplina: true },
      orderBy: { criadoEm: "desc" },
    }),
  ]);

  return (
    <AppShell user={user} active="/admin/mapas">
      <span className="eyebrow">Gerador de mapas mentais</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .2em" }}>Mapas mentais</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 26, maxWidth: 700 }}>
        Informe o contexto de conteúdo e a IA estrutura o mapa mental. Sem chave configurada,
        use o modo manual — a demo nunca quebra.
      </p>

      <MapGenerator disciplinas={disciplinas} />

      <h3 style={{ fontSize: "1rem", margin: "34px 0 14px" }}>Mapas publicados</h3>
      <div className="grid-3">
        {mapas.map((m) => (
          <div key={m.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="tag tag-ember">{m.disciplina.nome}</span>
              <span className="tag">{m.publica ? "público" : "rascunho"}</span>
            </div>
            {m.imagemBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.imagemBase64}
                alt={m.titulo}
                style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }}
              />
            ) : (
              <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-2)", borderRadius: 8, color: "var(--ink-faint)", fontSize: ".8rem" }}>
                imagem pendente
              </div>
            )}
            <h3 style={{ fontSize: "1.02rem", marginTop: 10 }}>{m.titulo}</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: ".72rem", color: "var(--ink-faint)" }}>
              <span>{fmtDataCurta(m.criadoEm)}</span>
              <Link href={`/aluno/mapas/${m.id}`} style={{ color: "var(--ember-400)" }}>ver →</Link>
            </div>
          </div>
        ))}
        {mapas.length === 0 && (
          <div className="card" style={{ color: "var(--ink-faint)", fontSize: ".86rem" }}>Nenhum mapa gerado ainda.</div>
        )}
      </div>
    </AppShell>
  );
}
