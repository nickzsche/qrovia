import { requireUser } from "@/lib/session";
import { getDb, schema } from "@/lib/db";
import { sql } from "drizzle-orm";
import { DashboardShell } from "@/components/DashboardShell";
import { CampaignGrid } from "@/components/CampaignGrid";

export const metadata = { title: "Dashboard · Qrovia" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();

  const campaigns = await db.query.campaigns.findMany({
    where: (c, { eq }) => eq(c.userId, user.id),
    orderBy: (c, { desc }) => desc(c.createdAt),
  });

  const scanCounts = await db
    .select({
      campaignId: schema.scans.campaignId,
      total: sql<number>`count(*)`.as("total"),
    })
    .from(schema.scans)
    .groupBy(schema.scans.campaignId);

  const countMap = new Map(scanCounts.map((r) => [r.campaignId, Number(r.total)]));

  const cards = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as "dynamic" | "static",
    code: c.code,
    status: c.status as "active" | "paused",
    targetUrl: c.targetUrl,
    staticPayload: c.staticPayload,
    scanCount: countMap.get(c.id) ?? 0,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <DashboardShell user={user} active="dashboard">
      <CampaignGrid initialCards={cards} plan={user.plan} />
    </DashboardShell>
  );
}
