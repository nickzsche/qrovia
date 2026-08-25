import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const bodySchema = z.object({ plan: z.enum(["free", "pro", "business"]) });

/**
 * STUB: In production this would create a Stripe checkout session and only flip
 * the plan after a webhook confirms payment. For the demo we switch instantly.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const db = getDb();
  await db.update(schema.users).set({ plan: parsed.data.plan }).where(eq(schema.users.id, user.id));
  return NextResponse.json({ ok: true, plan: parsed.data.plan });
}
