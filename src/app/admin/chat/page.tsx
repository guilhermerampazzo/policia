import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import ChatClient from "@/components/ChatClient";

export const dynamic = "force-dynamic";

export default async function AdminChat() {
  const user = await requireAdmin();
  const conversas = await prisma.conversa.findMany({
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
    <AppShell user={user} active="/admin/chat">
      <span className="eyebrow">Atendimento</span>
      <h1 style={{ fontSize: "2.1rem", margin: "0.25em 0 1em" }}>Dúvidas dos alunos</h1>
      <ChatClient
        conversas={conversas}
        eu={{ id: user.id, name: user.name, role: user.role }}
      />
    </AppShell>
  );
}
