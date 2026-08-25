import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { checkPassword } from "@/lib/passwords";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  await ensureSeed();
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email.toLowerCase().trim()),
  });
  if (!user || !checkPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const token = await createSessionToken(user.id, user.email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
