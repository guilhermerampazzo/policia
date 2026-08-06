import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { currentUser } from "./session";

export async function hashSenha(senha: string): Promise<string> {
  return hash(senha, 10);
}

export async function verificarSenha(senha: string, hashSenha: string): Promise<boolean> {
  return compare(senha, hashSenha);
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/entrar");
  return user;
}
