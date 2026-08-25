import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const msg =
      parsed.error.issues.find((i) => i.path[0] === "password") != null
        ? "Password must be at least 8 characters"
        : "Enter a valid name, email and password (8+ chars)";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const db = getDb();
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, normalizedEmail),
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }
  const [user] = await db
    .insert(schema.users)
    .values({
      email: normalizedEmail,
      // `name` is accepted for profile completeness; display uses email prefix for now.
      passwordHash: hashPassword(password),
      plan: "free",
    })
    .returning();

  void name;
  const token = await createSessionToken(user.id, user.email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
