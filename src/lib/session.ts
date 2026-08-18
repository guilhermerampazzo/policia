import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { User } from "@prisma/client";

export interface SessionData {
  userId: string;
}

export const sessionOptions = {
  password:
    process.env.SESSION_PASSWORD ??
    "forja_mude_esta_senha_de_sessao_minimo_32_chars",
  cookieName: "forja_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const store = await cookies();
  return getIronSession<SessionData>(store, sessionOptions);
}

/** Acesso individual expirado bloqueia apenas estudantes (mentor nunca é bloqueado). */
export function isAcessoExpirado(user: Pick<User, "role" | "acessoAte">): boolean {
  if (user.role === "ADMIN") return false;
  return !!user.acessoAte && new Date(user.acessoAte).getTime() <= Date.now();
}

export async function currentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session.userId) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || isAcessoExpirado(user)) return null;
  return user;
}
