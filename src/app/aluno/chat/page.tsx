import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import ChatClient from "@/components/ChatClient";

export const dynamic = "force-dynamic";

export default async function ChatAlunoPage() {
  const user = await requireUser();
  const conversas = await prisma.conversa.findMany({
    where: { alunoId: user.id },
    include: {
      aluno: { select: { id: true, name: true } },
      mensagens: {
        include: { autor: { select: { id: true, name: true, role: true } } },
        orderBy: { data: "asc" },
      },
    },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <AppShell user={user} active="/aluno/chat">
      <span className="eyebrow">Dúvidas direto com o mentor</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 1em" }}>Chat com o mentor</h1>
      <ChatClient
        conversas={conversas.map((c) => ({ ...c, criadoEm: c.criadoEm, mensagens: c.mensagens }))}
        eu={{ id: user.id, name: user.name, role: user.role }}
      />
    </AppShell>
  );
}
