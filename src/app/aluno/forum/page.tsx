import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import NovoTopicoForm from "@/components/NovoTopicoForm";
import { fmtDataCurta, fmtHora } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const user = await requireUser();
  const topicos = await prisma.forumTopico.findMany({
    include: {
      autor: { select: { name: true, role: true } },
      _count: { select: { comentarios: true } },
    },
    orderBy: { data: "desc" },
  });

  return (
    <AppShell user={user} active="/aluno/forum">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
        <div>
          <span className="eyebrow">Comunidade</span>
          <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .1em" }}>Fórum</h1>
          <p style={{ color: "var(--ink-dim)", fontSize: ".9rem" }}>Troque experiências com os colegas de turma.</p>
        </div>
        <NovoTopicoForm />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 26 }}>
        {topicos.map((t) => (
          <Link key={t.id} href={`/aluno/forum/${t.id}`} className="card card-hover">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <h3 style={{ fontSize: "1.05rem", lineHeight: 1.35 }}>{t.titulo}</h3>
              <span className="tag">{t._count.comentarios} respostas</span>
            </div>
            <p style={{ color: "var(--ink-dim)", fontSize: ".88rem", lineHeight: 1.5, marginTop: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {t.corpo}
            </p>
            <div style={{ fontSize: ".74rem", color: "var(--ink-faint)", marginTop: 14 }}>
              {t.autor.name} {t.autor.role === "ADMIN" && <span className="tag tag-ember" style={{ marginLeft: 6 }}>mentor</span>} · {fmtDataCurta(t.data)} às {fmtHora(t.data)}
            </div>
          </Link>
        ))}
        {topicos.length === 0 && (
          <div className="card" style={{ textAlign: "center", color: "var(--ink-faint)", padding: 44 }}>Nenhum tópico ainda.</div>
        )}
      </div>
    </AppShell>
  );
}
