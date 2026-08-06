import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import { Icon } from "@/components/icons";
import { fmtDataCurta } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function MapasPage() {
  const user = await requireUser();
  const mapas = await prisma.mapaMental.findMany({
    where: { publica: true },
    include: { disciplina: true, autor: { select: { name: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <AppShell user={user} active="/aluno/mapas">
      <span className="eyebrow">Revisão visual</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .2em" }}>Mapas mentais</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 26, maxWidth: 640 }}>
        Mapas gerados pelo mentor a partir do conteúdo — perfeitos para revisar antes da prova.
      </p>

      {mapas.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--ink-faint)" }}>
          Nenhum mapa publicado ainda.
        </div>
      ) : (
        <div className="grid-3">
          {mapas.map((m) => (
            <Link key={m.id} href={`/aluno/mapas/${m.id}`} className="card card-hover" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className="tag tag-ember">{m.disciplina.nome}</span>
                <Icon name="map" size={18} style={{ color: "var(--ember-400)" }} />
              </div>
              {m.imagemBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.imagemBase64} alt={m.titulo} style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
              ) : (
                <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-2)", borderRadius: 8, color: "var(--ink-faint)", fontSize: ".8rem" }}>
                  abrir →
                </div>
              )}
              <h3 style={{ fontSize: "1.02rem", marginTop: 10, lineHeight: 1.3 }}>{m.titulo}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: ".74rem", color: "var(--ink-faint)" }}>
                <span>por {m.autor.name}</span>
                <span>{fmtDataCurta(m.criadoEm)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
