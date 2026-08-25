import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/lib/db";
import {
  verifySessionToken,
  SESSION_COOKIE,
} from "@/lib/auth";
import type { User } from "@/lib/db/schema";

export async function getSessionUser(): Promise<User | null> {
  const store = cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, payload.userId),
  });
  return user ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
