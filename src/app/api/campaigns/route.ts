import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createCampaign } from "@/lib/campaigns";
import { getDb, schema } from "@/lib/db";
import { isSafeTargetUrl } from "@/lib/urls";

export const runtime = "nodejs";

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  pro: Infinity,
  business: Infinity,
};

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(["dynamic", "static"]),
  targetUrl: z.string().trim().max(1000).optional(),
  staticPayload: z.string().trim().max(1000).optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const campaigns = await db.query.campaigns.findMany({
    where: (c, { eq }) => eq(c.userId, user.id),
    orderBy: (c, { desc }) => desc(c.createdAt),
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Name and a valid type are required" },
      { status: 400 },
    );
  }
  const { name, type, targetUrl, staticPayload } = parsed.data;

  if (type === "dynamic") {
    if (!targetUrl || !/^https?:\/\//i.test(targetUrl) || !isSafeTargetUrl(targetUrl)) {
      return NextResponse.json(
        { error: "Dynamic codes need a full destination URL (https://…)" },
        { status: 400 },
      );
    }
    const limit = PLAN_LIMITS[user.plan] ?? 3;
    const db = getDb();
    const dynamicCount = await db.query.campaigns.findMany({
      where: (c, { and, eq }) => and(eq(c.userId, user.id), eq(c.type, "dynamic")),
    });
    if (dynamicCount.length >= limit) {
      return NextResponse.json(
        {
          error: `Free plan allows ${limit} dynamic codes. Upgrade to Pro for unlimited.`,
          code: "PLAN_LIMIT",
        },
        { status: 402 },
      );
    }
  } else if (!staticPayload || staticPayload.length < 1) {
    return NextResponse.json(
      { error: "Static codes need a payload (URL, text, etc.)" },
      { status: 400 },
    );
  }

  const campaign = await createCampaign({
    userId: user.id,
    name,
    type,
    targetUrl,
    staticPayload,
  });
  return NextResponse.json({ campaign }, { status: 201 });
}
