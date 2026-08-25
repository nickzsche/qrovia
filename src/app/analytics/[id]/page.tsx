import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getDb, schema } from "@/lib/db";
import { and, eq, gte } from "drizzle-orm";
import { DashboardShell } from "@/components/DashboardShell";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { BreakdownBar } from "@/components/BreakdownBar";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function AnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const db = getDb();
  const campaign = await db.query.campaigns.findFirst({
    where: (c, { and }) => and(eq(c.id, id), eq(c.userId, user.id)),
  });
  if (!campaign) notFound();

  const now = Date.now();
  const since30 = new Date(now - 29 * DAY_MS);
  since30.setHours(0, 0, 0, 0);

  const allScans = await db.query.scans.findMany({
    where: (s, { eq }) => eq(s.campaignId, id),
    orderBy: (s, { desc }) => desc(s.scannedAt),
  });

  // ---- totals ----
  const totalScans = allScans.length;
  const uniqueKeys = new Set(
    allScans.map((s) => `${s.userAgentRaw}|${s.scannedAt.toISOString().slice(0, 10)}`),
  );
  const uniqueScans = uniqueKeys.size;

  // ---- 30-day series ----
  const byDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since30.getTime() + i * DAY_MS);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of allScans) {
    const key = s.scannedAt.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const series = Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));

  // ---- breakdowns over last 30 days ----
  const recent = await db
    .select()
    .from(schema.scans)
    .where(and(eq(schema.scans.campaignId, id), gte(schema.scans.scannedAt, since30)));

  function tally<T extends string>(rows: { device: string | null; os: string | null; browser: string | null; refererHost: string | null }[], pick: "device" | "os" | "browser" | "referer") {
    const m = new Map<string, number>();
    for (const r of rows) {
      let k: string | null;
      if (pick === "referer") {
        k = r.refererHost;
        if (!k) continue;
      } else {
        k = (r[pick] as string | null) || "Other";
      }
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  const devices = tally(recent, "device");
  const oses = tally(recent, "os");
  const browsers = tally(recent, "browser");
  const referers = tally(recent, "referer").slice(0, 5);

  const isStatic = campaign.type === "static";

  return (
    <DashboardShell user={user} active="dashboard">
      <div className="mx-auto max-w-5xl">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/dashboard" className="text-xs font-semibold text-[var(--ink-faint)] hover:text-white">← All campaigns</Link>
            <h1 className="mt-2 truncate text-2xl font-extrabold tracking-tight md:text-3xl">{campaign.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className={`chip ${campaign.type === "dynamic" ? "bg-violet-500/15 text-violet-200" : "bg-white/5 text-[var(--ink-dim)]"}`}>
                {campaign.type === "dynamic" ? "⚡ Dynamic" : "🧊 Static"}
              </span>
              <span className={`chip ${campaign.status === "active" ? "bg-lime/15 text-lime" : "bg-white/10 text-[var(--ink-dim)]"}`}>
                {campaign.status === "active" ? "● Active" : "⏸ Paused"}
              </span>
              {campaign.type === "dynamic" && (
                <code className="rounded bg-black/30 px-2 py-0.5 text-xs text-[var(--ink-dim)]">/r/{campaign.code}</code>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/campaigns/${campaign.id}/download?format=svg`} className="btn-ghost !px-4 !py-2 text-xs">SVG ↓</a>
            <a href={`/api/campaigns/${campaign.id}/download?format=png`} className="btn-ghost !px-4 !py-2 text-xs">PNG 512px ↓</a>
            {!isStatic && (
              <a href={`/api/campaigns/${campaign.id}/export`} className="btn-primary !px-4 !py-2 text-xs">Export CSV</a>
            )}
          </div>
        </div>

        {isStatic && (
          <p className="mt-6 rounded-xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm leading-relaxed text-[var(--ink-faint)]">
            🧊 <b className="text-[var(--ink-dim)]">This is a static code.</b> The payload is encoded directly in the QR image,
            so scans open the destination without touching Qrovia servers. That means: no redirect tracking, no per-scan logs,
            no edit-after-print. Only creation metadata is shown here.
          </p>
        )}

        {/* stat tiles */}
        <div className={`mt-7 grid gap-4 ${isStatic ? "" : "grid-cols-2 lg:grid-cols-4"}`}>
          {[
            ["Total scans", totalScans.toLocaleString()],
            ...(isStatic ? [] : [["Unique scans (UA+day)", String(uniqueScans)] as const]),
            ["Created", campaign.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })],
            ...(!isStatic
              ? [["Avg / day (30d)", (recent.length / 30).toFixed(1)] as const]
              : []),
          ].map(([label, value]) => (
            <div key={label} className="card p-4">
              <p className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">{label}</p>
              <p className="mt-1.5 text-2xl font-extrabold tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        {!isStatic && (
          <>
            {/* time series */}
            <div className="card mt-6 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink-dim)]">Scans · last 30 days</h2>
                <span className="chip bg-violet-500/15 text-violet-200">{recent.length} in window</span>
              </div>
              <TimeSeriesChart series={series} />
            </div>

            {/* breakdowns */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <BreakdownBar title="Devices" rows={devices} accent="#8b5cf6" />
              <BreakdownBar title="Operating systems" rows={oses} accent="#a78bfa" />
              <BreakdownBar title="Browsers" rows={browsers} accent="#c084fc" />
              <BreakdownBar title="Top referrers" rows={referers} accent="#a3e635" emptyHint="No referrer data yet." />
            </div>
          </>
        )}

        {/* raw payload info */}
        <div className="card mt-6 p-5 text-sm">
          <p className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">
            {isStatic ? "Static payload" : "Current destination"}
          </p>
          <p className="mt-1 break-all font-medium text-[var(--ink-dim)]">
            {campaign.staticPayload ?? campaign.targetUrl ?? "—"}
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
