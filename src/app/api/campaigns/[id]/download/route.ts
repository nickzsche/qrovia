import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getCampaignForUser } from "@/lib/campaigns";
import { qrPngDataUrl, qrSvg, sanitizeStyle, type QrStyle } from "@/lib/qr";
import { getAppUrl } from "@/lib/app-url";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  const campaign = await getCampaignForUser(id, user.id);
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const urlObj = new URL(req.url);
  const format = urlObj.searchParams.get("format") === "png" ? "png" : "svg";

  // What the QR encodes:
  // - dynamic → short link /r/<code> (destination lives on our server, editable)
  // - static  → payload directly
  const payload =
    campaign.type === "dynamic"
      ? `${getAppUrl(req)}/r/${campaign.code}`
      : campaign.staticPayload || "https://qrovia.app";

  const style: Partial<QrStyle> = {
    fgColor: urlObj.searchParams.get("fg") ?? undefined,
    bgColor: urlObj.searchParams.get("bg") ?? undefined,
    size: Number(urlObj.searchParams.get("size")) || 512,
    margin: Number(urlObj.searchParams.get("margin")) || undefined,
    ecc: (urlObj.searchParams.get("ecc") as never) ?? undefined,
  };
  const s = sanitizeStyle(style);

  if (format === "png") {
    const dataUrl = await qrPngDataUrl(payload, s);
    const base64 = dataUrl.split(",")[1] ?? "";
    return new NextResponse(Buffer.from(base64, "base64"), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qrovia-${campaign.code}-512.png"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const svg = await qrSvg(payload, s);
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="qrovia-${campaign.code}.svg"`,
      "Cache-Control": "no-store",
    },
  });
}
