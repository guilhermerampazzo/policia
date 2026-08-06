import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import OnboardingForm from "@/components/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  const [anamnese, disciplinas] = await Promise.all([
    prisma.anamnese.findUnique({ where: { userId: user.id } }),
    prisma.disciplina.findMany({ orderBy: { ordem: "asc" }, select: { nome: true } }),
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(900px 500px at 15% -10%, rgba(243,126,31,.13), transparent 55%), #08090b",
        padding: "48px 20px",
      }}
    >
      <OnboardingForm
        user={{ name: user.name, concursoAlvo: user.concursoAlvo, banca: user.banca, dataProva: user.dataProva }}
        anamnese={
          anamnese
            ? {
                horasPorDia: anamnese.horasPorDia,
                diasDisponiveis: anamnese.diasDisponiveis,
                dificuldades: anamnese.dificuldades,
                formatoPreferido: anamnese.formatoPreferido,
                objetivo: anamnese.objetivo,
              }
            : null
        }
        disciplinas={disciplinas.map((d) => d.nome)}
      />
    </div>
  );
}
