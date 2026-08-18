import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import NovoErroForm from "@/components/NovoErroForm";
import ErrorStrategicActions from "@/components/ErrorStrategicActions";
import { fmtData, fmtDataCurta, diasAtras } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function CadernoErros() {
  const user = await requireUser();
  const [erros, topicos, disciplinas] = await Promise.all([
    prisma.erro.findMany({
      where: { userId: user.id },
      include: { topico: { include: { disciplina: true } }, flashcard: true, conteudoEstrategico: true },
      orderBy: { data: "desc" },
    }),
    prisma.topico.findMany({ include: { disciplina: true }, orderBy: { disciplina: { ordem: "asc" } } }),
    prisma.disciplina.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  const contagem = (discId: string) => erros.filter((e) => e.topico.disciplinaId === discId).length;
  const revisoesPendentes = erros.filter((e) => e.status === "PENDENTE").sort((a, b) => a.revisaoEm.getTime() - b.revisaoEm.getTime());
  const proximaRevisao = revisoesPendentes[0];
  const revisarHoje = revisoesPendentes.filter((e) => diasAtras(e.revisaoEm) <= 0);
  const pendentes = erros.filter((e) => e.status === "PENDENTE");

  return (
    <AppShell user={user} active="/aluno/caderno">
      <span className="eyebrow">Sua memória de longo prazo</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .2em" }}>Caderno de erros</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 26, maxWidth: 680 }}>
        Cada erro registrado volta sozinho, no dia certo, até virar acerto automático. Gere uma estratégia e um flashcard sem sair da fila.
      </p>

      <div className="grid-2-wide">
        <div>
          <div className="card card-ember" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <span className="eyebrow" style={{ color: "var(--ember-400)" }}>Revisões agendadas</span>
              <p style={{ marginTop: ".5em", fontSize: ".95rem" }}>
                {proximaRevisao ? <>Próxima: <strong>{proximaRevisao.topico.disciplina.nome} — {proximaRevisao.topico.titulo}</strong> <span className="tag tag-ember" style={{ marginLeft: 6 }}>{fmtData(proximaRevisao.revisaoEm)}</span></> : "Nenhuma revisão pendente."}
              </p>
              {revisarHoje.length > 0 && <p style={{ fontSize: ".8rem", color: "var(--warn)", marginTop: 6 }}>{revisarHoje.length} revisão(ões) para hoje</p>}
            </div>
            <Link href="/aluno/flashcards" className="btn btn-line btn-sm">Abrir flashcards →</Link>
          </div>

          {pendentes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--ink-faint)", padding: 40 }}>
              Nenhum erro pendente. Continue registrando os pontos que exigem uma segunda leitura.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {pendentes.map((e) => {
                const atrasada = diasAtras(e.revisaoEm) > 0;
                return (
                  <article key={e.id} className="card error-notebook-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <span className="tag tag-ember">{e.topico.disciplina.nome}</span>
                        <h2 style={{ marginTop: 9, fontSize: "1rem" }}>{e.topico.titulo}</h2>
                        <p style={{ marginTop: ".6em", fontSize: ".9rem", lineHeight: 1.55, color: "var(--ink-dim)" }}>{e.descricao}</p>
                      </div>
                      <span style={{ fontSize: ".7rem", color: "var(--ink-faint)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{fmtDataCurta(e.data)}</span>
                    </div>
                    <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span className={`tag ${atrasada ? "tag-danger" : "tag-warn"}`}>{atrasada ? `atrasada — venceu em ${fmtDataCurta(e.revisaoEm)}` : `próxima revisão: ${fmtDataCurta(e.revisaoEm)}`}</span>

                    </div>
                    <ErrorStrategicActions erroId={e.id} descricao={e.descricao} hasFlashcard={Boolean(e.flashcard)} hasConteudo={Boolean(e.conteudoEstrategico)} />
                  </article>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <NovoErroForm topicos={topicos.map((t) => ({ id: t.id, titulo: t.titulo, disciplina: t.disciplina.nome }))} />
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 10 }}>
            <div style={{ padding: "12px 14px", fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>Disciplinas</div>
            {disciplinas.map((d) => {
              const total = contagem(d.id);
              const revisar = erros.filter((e) => e.topico.disciplinaId === d.id && e.status === "PENDENTE").length;
              return <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderRadius: 9, gap: 8 }}><span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 500, fontSize: ".9rem" }}><span style={{ width: 8, height: 8, borderRadius: 99, background: d.cor }} />{d.nome}</span><span style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}><span className="tag tag-danger">{revisar} pendentes</span><span className="tag">{total} total</span></span></div>;
            })}
            {disciplinas.length === 0 && <p style={{ padding: 16, color: "var(--ink-faint)", fontSize: ".82rem" }}>As disciplinas do edital aparecerão aqui.</p>}
          </div>
          <div className="card card-flat" style={{ marginTop: 16, padding: 18 }}>
            <span className="eyebrow">Fluxo recomendado</span>
            <p style={{ marginTop: 8, color: "var(--ink-dim)", fontSize: ".82rem", lineHeight: 1.6 }}>1. Registre o erro. 2. Leia a estratégia. 3. Vire o flashcard. 4. Marque a revisão quando conseguir explicar sem consultar.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
