import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { parseUserAgent } from "@/lib/ua";
import type { DeviceKind, OsName, BrowserName } from "@/lib/ua";
import { normalizeTarget } from "@/lib/urls";

export const runtime = "nodejs";
// Never cache: each scan must hit the server so we can log it and honor pause state.
export const dynamic = "force-dynamic";

type Params = { params: { code: string } };

const PAUSED_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Link temporarily paused — Qrovia</title>
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #08070d; color: #ece9f6;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    padding: 24px;
  }
  .box {
    max-width: 420px; width: 100%; text-align: center;
    background: #12101d; border: 1px solid #241f38; border-radius: 20px; padding: 40px 28px;
  }
  .qr { width: 64px; height: 64px; margin: 0 auto 18px; border-radius: 14px;
        background: linear-gradient(135deg, rgba(139,92,246,.25), rgba(163,230,53,.15));
        display: flex; align-items: center; justify-content: center; font-size: 30px; }
  h1 { font-size: 20px; margin: 0 0 10px; }
  p { color: #a49ec2; font-size: 14px; line-height: 1.6; margin: 0; }
  .brand { margin-top: 22px; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
  .brand b { background: linear-gradient(92deg,#8b5cf6,#a3e635); -webkit-background-clip: text; background-clip: text; color: transparent; }
</style>
</head>
<body>
  <div class="box">
    <div class="qr">⏸️</div>
    <h1>This link is temporarily paused</h1>
    <p>The owner has paused this QR destination for the moment. It may be back soon — try scanning again later.</p>
    <div class="brand">Powered by <b>QROVIA</b></div>
  </div>
</body>
</html>`;

export async function GET(_req: Request, { params }: Params) {
  const code = params.code;

  const db = getDb();
  const campaign = await db.query.campaigns.findFirst({
    where: (c, { eq }) => eq(c.code, code),
  });

  if (!campaign || campaign.type !== "dynamic") {
    return NextResponse.redirect(new URL("/?gone=1", _req.url), 302);
  }

  // Log the scan (we log attempts on paused codes too — they represent real-world
  // engagement with printed material, and owners want to know the QR is still alive).
  let device: DeviceKind = "other";
  let os: OsName = "Other";
  let browser: BrowserName = "Other";
  let refererHost: string | null = null;
  try {
    const uaRaw = _req.headers.get("user-agent") ?? "";
    ({ device, os, browser } = parseUserAgent(uaRaw));
    const referer = _req.headers.get("referer");
    if (referer) {
      refererHost = safeHost(referer);
    }
    await db.insert(schema.scans).values({
      campaignId: campaign.id,
      scannedAt: new Date(),
      userAgentRaw: uaRaw,
      device,
      os,
      browser,
      refererHost,
    });
  } catch (e) {
    console.error("[qrovia] scan log failed", e);
  }

  if (campaign.status === "paused") {
    return new NextResponse(PAUSED_PAGE, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const target = normalizeTarget(campaign.targetUrl ?? "");
  if (!target) {
    return new NextResponse(
      `<!doctype html><html><body style="font-family:sans-serif;background:#08070d;color:#ece9f6;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><p>This link has no destination configured yet.</p></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.redirect(target, 302);
}

function safeHost(referer: string): string | null {
  try {
    return new URL(referer).hostname || null;
  } catch {
    return null;
  }
}
