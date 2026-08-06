import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import ForumComentar from "@/components/ForumComentar";
import { fmtDataCurta, fmtHora } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ForumTopicoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const topico = await prisma.forumTopico.findUnique({
    where: { id },
    include: {
      autor: { select: { name: true, role: true } },
      comentarios: {
        include: { autor: { select: { name: true, role: true } } },
        orderBy: { data: "asc" },
      },
    },
  });
  if (!topico) notFound();

  return (
    <AppShell user={user} active="/aluno/forum">
      <Link href="/aluno/forum" className="btn btn-line btn-sm" style={{ marginBottom: 16 }}>← Voltar ao fórum</Link>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.5rem", lineHeight: 1.3 }}>{topico.titulo}</h1>
        <p style={{ color: "var(--ink-dim)", lineHeight: 1.6, marginTop: 12, whiteSpace: "pre-wrap" }}>{topico.corpo}</p>
        <div style={{ fontSize: ".74rem", color: "var(--ink-faint)", marginTop: 14 }}>
          {topico.autor.name} {topico.autor.role === "ADMIN" && <span className="tag tag-ember" style={{ marginLeft: 6 }}>mentor</span>} · {fmtDataCurta(topico.data)} às {fmtHora(topico.data)}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {topico.comentarios.map((c) => (
          <div key={c.id} className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: ".9rem", lineHeight: 1.55, color: "var(--ink-dim)" }}>{c.texto}</p>
            <div style={{ fontSize: ".72rem", color: "var(--ink-faint)", marginTop: 10 }}>
              {c.autor.name} {c.autor.role === "ADMIN" && <span className="tag tag-ember" style={{ marginLeft: 4 }}>mentor</span>} · {fmtDataCurta(c.data)} às {fmtHora(c.data)}
            </div>
          </div>
        ))}
        {topico.comentarios.length === 0 && (
          <div className="card" style={{ textAlign: "center", color: "var(--ink-faint)", padding: 30 }}>Sem respostas ainda.</div>
        )}
      </div>

      <ForumComentar topicoId={topico.id} />
    </AppShell>
  );
}
