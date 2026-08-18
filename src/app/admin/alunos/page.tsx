import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import { startOfDay } from "@/lib/dates";
import AccessStatusBadge from "@/components/AccessStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminAlunos() {
  const user = await requireAdmin();
  const hoje = startOfDay(new Date());

  const alunos = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { criadoEm: "asc" },
  });
  const [metas, erros] = await Promise.all([
    prisma.meta.findMany({ include: { topico: { include: { disciplina: true } } } }),
    prisma.erro.findMany({ where: { status: "PENDENTE" } }),
  ]);

  const linhas = alunos.map((a) => {
    const doAluno = metas.filter((m) => m.userId === a.id);
    const concluidas = doAluno.filter((m) => m.status === "CONCLUIDA").length;
    const progresso = doAluno.length ? Math.round((concluidas / doAluno.length) * 100) : 0;
    const metaHoje = doAluno.find((m) => m.dia.getTime() === hoje.getTime() && m.status !== "CONCLUIDA");
    const atrasadas = doAluno.filter((m) => m.dia < hoje && m.status !== "CONCLUIDA").length;
    const errosPend = erros.filter((e) => e.userId === a.id).length;
    return { a, progresso, metaHoje, atrasadas, errosPend };
  });

  return (
    <AppShell user={user} active="/admin/alunos">
      <span className="eyebrow">Acompanhamento</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 1em" }}>Meus alunos</h1>

      <div className="card scroll-x" style={{ padding: 0 }}>
        <table className="table" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Concurso alvo</th>
              <th>Banca</th>
              <th>Progresso do edital</th>
              <th>Acesso</th>
              <th>Meta de hoje</th>
              <th>Pendências</th>
              <th>Erros p/ revisar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ a, progresso, metaHoje, atrasadas, errosPend }) => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar avatar-sm">{a.name.charAt(0)}</div>
                    <div>
                      <strong>{a.name}</strong>
                      {!a.onboardingDone && <div><span className="tag tag-warn" style={{ fontSize: ".56rem" }}>sem anamnese</span></div>}
                    </div>
                  </div>
                </td>
                <td style={{ color: "var(--ink-dim)" }}>{a.concursoAlvo ?? "—"}</td>
                <td style={{ color: "var(--ink-dim)" }}>{a.banca ?? "—"}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="progress" style={{ width: 90 }}><span style={{ width: `${progresso}%` }} /></div>
                    <span style={{ fontSize: ".76rem", color: "var(--ink-faint)" }}>{progresso}%</span>
                  </div>
                </td>
                <td><AccessStatusBadge acessoAte={a.acessoAte} /></td>
                <td>
                  {metaHoje ? (
                    <span className="tag tag-ember">{metaHoje.topico.disciplina.nome}</span>
                  ) : (
                    <span className="tag">—</span>
                  )}
                </td>
                <td>{atrasadas > 0 ? <span className="tag tag-danger">{atrasadas}</span> : <span className="tag tag-ok">em dia</span>}</td>
                <td>{errosPend > 0 ? <span className="tag tag-warn">{errosPend}</span> : <span className="tag">—</span>}</td>
                <td>
                  <Link href={`/admin/alunos/${a.id}`} className="btn btn-ember btn-sm">Ver perfil</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
