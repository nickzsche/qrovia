import { getDb, schema } from "@/lib/db";
import { ensureSeed } from "@/lib/seed";
import { newCode } from "@/lib/codes";
import { eq, and } from "drizzle-orm";

export async function uniqueCode(): Promise<string> {
  const db = getDb();
  for (let i = 0; i < 10; i++) {
    const code = newCode();
    const existing = await db.query.campaigns.findFirst({
      where: (c, { eq }) => eq(c.code, code),
    });
    if (!existing) return code;
  }
  // Practically unreachable; fall back to a longer code.
  return newCode(12);
}

export async function createCampaign(input: {
  userId: number;
  name: string;
  type: "dynamic" | "static";
  targetUrl?: string;
  staticPayload?: string;
}) {
  await ensureSeed();
  const db = getDb();
  const code = await uniqueCode();
  const [campaign] = await db
    .insert(schema.campaigns)
    .values({
      userId: input.userId,
      name: input.name,
      type: input.type,
      code,
      targetUrl: input.type === "dynamic" ? (input.targetUrl ?? "") : null,
      staticPayload: input.type === "static" ? (input.staticPayload ?? null) : null,
      status: "active",
      createdAt: new Date(),
    })
    .returning();
  return campaign;
}

export async function getCampaignForUser(campaignId: number, userId: number) {
  const db = getDb();
  return db.query.campaigns.findFirst({
    where: (c, { and, eq }) => and(eq(c.id, campaignId), eq(c.userId, userId)),
  });
}

export async function updateCampaign(
  campaignId: number,
  userId: number,
  patch: { name?: string; targetUrl?: string; status?: "active" | "paused" },
) {
  const db = getDb();
  await db
    .update(schema.campaigns)
    .set(patch)
    .where(
      // Scope by owner as well as id: callers already authorize, but this keeps
      // a mis-issued id from ever touching another user's row.
      and(eq(schema.campaigns.id, campaignId), eq(schema.campaigns.userId, userId)),
    );
}

export async function deleteCampaign(campaignId: number, userId: number) {
  const db = getDb();
  await db
    .delete(schema.campaigns)
    .where(
      and(eq(schema.campaigns.id, campaignId), eq(schema.campaigns.userId, userId)),
    );
}
