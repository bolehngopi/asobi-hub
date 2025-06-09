"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function hasUserPassword() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;
  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { password: true },
  });
  return accounts.some((acc) => !!acc.password);
}

export async function verifyUserPassword(password: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;
  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    select: { password: true },
  });
  if (!accounts.length) return false;
  const ctxAuth = await auth.$context;
  for (const acc of accounts) {
    if (acc.password) {
      const ok = await ctxAuth.password.verify({ password, hash: acc.password });
      if (ok) return true;
    }
  }
  return false;
}
