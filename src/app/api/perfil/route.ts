import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const anamneseSchema = z.object({
  horasPorDia: z.number().int().min(1).max(16),
  diasDisponiveis: z.array(z.number().int().min(0).max(6)),
  dificuldades: z.array(z.string().max(60)),
  formatoPreferido: z.string().min(1).max(30),
  objetivo: z.string().min(2).max(200),
});

const schema = z.object({
  name: z.string().min(2).max(80).optional(),
  concursoAlvo: z.string().max(120).optional().nullable(),
  banca: z.string().max(60).optional().nullable(),
  dataProva: z.string().optional().nullable(),
  anamnese: anamneseSchema.optional(),
});

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const d = parsed.data;

  const atualizado = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(d.name ? { name: d.name } : {}),
      ...(d.concursoAlvo !== undefined ? { concursoAlvo: d.concursoAlvo ?? null } : {}),
      ...(d.banca !== undefined ? { banca: d.banca ?? null } : {}),
      ...(d.dataProva !== undefined
        ? { dataProva: d.dataProva ? new Date(d.dataProva + "T12:00:00") : null }
        : {}),
      ...(d.anamnese ? { onboardingDone: true } : {}),
    },
  });

  if (d.anamnese) {
    await prisma.anamnese.upsert({
      where: { userId: user.id },
      update: d.anamnese,
      create: { userId: user.id, ...d.anamnese },
    });
  }

  return NextResponse.json({ ok: true, user: atualizado });
}
