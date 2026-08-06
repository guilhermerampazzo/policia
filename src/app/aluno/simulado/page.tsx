import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import SimuladoClient from "@/components/SimuladoClient";

export const dynamic = "force-dynamic";

export default async function SimuladoPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} active="/aluno/simulado">
      <span className="eyebrow">Prática rápida</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 .2em" }}>Simulado</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 24, maxWidth: 640 }}>
        Responda com atenção: cada acerto e erro alimenta a semana adaptativa e o caderno de erros.
      </p>
      <SimuladoClient />
    </AppShell>
  );
}
