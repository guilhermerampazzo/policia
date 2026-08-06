import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import EditalWizard from "@/components/EditalWizard";

export const dynamic = "force-dynamic";

export default async function AdminEdital() {
  const user = await requireAdmin();
  const alunos = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <AppShell user={user} active="/admin/edital">
      <span className="eyebrow">Ecossistema de IA do mentor</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .2em" }}>Edital verticalizado</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 26, maxWidth: 700 }}>
        Converta o edital bruto em um syllabus priorizado por recorrência da banca, compare com o que o
        aluno já estudou e publique as metas direto no painel dele.
      </p>
      <EditalWizard alunos={alunos} />
    </AppShell>
  );
}
