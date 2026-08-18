import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import FlashcardsReview from "@/components/FlashcardsReview";

export const dynamic = "force-dynamic";

const CAPAS: Record<string, string> = {
  "direito-penal": "/img/hero-tactical.jpg",
  portugues: "/img/police-recruits.jpg",
  "raciocinio-logico": "/img/police-command.jpg",
  "direitos-humanos": "/img/police-training.jpg",
  "legislacao-especial": "/img/police-operations.jpg",
};

export default async function FlashcardsPage() {
  const user = await requireUser();
  const flashcards = await prisma.flashcard.findMany({
    where: { userId: user.id },
    include: { erro: { include: { topico: { include: { disciplina: true } } } } },
    orderBy: [{ proximaRevisao: "asc" }, { criadoEm: "asc" }],
  });
  const cards = flashcards.map((card) => ({
    id: card.id,
    pergunta: card.pergunta,
    resposta: card.resposta,
    repeticoes: card.repeticoes,
    proximaRevisao: card.proximaRevisao.toISOString(),
    disciplina: card.erro.topico.disciplina.nome,
    topico: card.erro.topico.titulo,
    image: CAPAS[card.erro.topico.disciplina.slug] ?? "/img/treino.jpg",
  }));

  return (
    <AppShell user={user} active="/aluno/flashcards">
      <span className="eyebrow">Revisão ativa · memória de longo prazo</span>
      <h1 style={{ margin: ".25em 0 .2em" }}>Flashcards de campo</h1>
      <p style={{ maxWidth: 680, marginBottom: 26 }}>
        O caderno gera perguntas a partir dos seus erros. Vire a carta, responda sem consultar e registre o resultado para ajustar o próximo intervalo.
      </p>
      <FlashcardsReview cards={cards} />
    </AppShell>
  );
}
