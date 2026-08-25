import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getCampaignForUser } from "@/lib/campaigns";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

function csvEscape(v: string | number | null): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  const campaign = await getCampaignForUser(id, user.id);
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const db = getDb();
  const rows = await db.query.scans.findMany({
    where: (s, { eq }) => eq(s.campaignId, id),
    orderBy: (s, { desc }) => desc(s.scannedAt),
  });

  const header = [
    "scanned_at_iso",
    "code",
    "device",
    "os",
    "browser",
    "referer_host",
  ].join(",");
  const lines = rows.map((r) =>
    [
      r.scannedAt.toISOString(),
      csvEscape(campaign.code),
      csvEscape(r.device),
      csvEscape(r.os),
      csvEscape(r.browser),
      csvEscape(r.refererHost),
    ].join(","),
  );
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="qrovia-${campaign.code}-scans.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
