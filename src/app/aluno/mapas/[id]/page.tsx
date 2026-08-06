import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import InteractiveMap from "@/components/InteractiveMap";
import { parseArvore } from "@/lib/mindmap";
import { arvoreParaDataUri } from "@/lib/mindmapImage";
import { fmtData } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function MapaView({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  let mapa = await prisma.mapaMental.findUnique({
    where: { id },
    include: { disciplina: true, autor: { select: { name: true } } },
  });
  if (!mapa || !mapa.publica) notFound();
  const arvore = parseArvore(mapa.arvoreJson);

  // auto-repara mapas antigos sem imagem
  let imagem = mapa.imagemBase64;
  if (!imagem) {
    try {
      imagem = arvoreParaDataUri(arvore);
      mapa = await prisma.mapaMental.update({
        where: { id: mapa.id },
        data: { imagemBase64: imagem },
        include: { disciplina: true, autor: { select: { name: true } } },
      });
    } catch {
      imagem = null;
    }
  }

  return (
    <AppShell user={user} active="/aluno/mapas">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <span className="eyebrow">{mapa.disciplina.nome}</span>
          <h1 style={{ fontSize: "1.8rem", margin: ".2em 0 .1em" }}>{mapa.titulo}</h1>
          <p style={{ color: "var(--ink-faint)", fontSize: ".8rem" }}>
            por {mapa.autor.name} · {fmtData(mapa.criadoEm)}
          </p>
        </div>
        <Link href="/aluno/mapas" className="btn btn-line btn-sm">← Todos os mapas</Link>
      </div>

      {imagem ? (
        <div className="card" style={{ padding: 14, background: "#fff", overflow: "auto" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagem} alt={`Mapa mental: ${mapa.titulo}`} style={{ width: "100%", height: "auto", borderRadius: 8 }} />
        </div>
      ) : (
        <InteractiveMap arvore={arvore} />
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
        {imagem && (
          <a className="btn btn-ember" download={`${mapa.titulo.replace(/[^\w\- ]+/g, "").trim() || "mapa"}.png`} href={imagem}>
            Baixar imagem (PNG)
          </a>
        )}
        <InteractiveMap arvore={arvore} />
      </div>
    </AppShell>
  );
}
