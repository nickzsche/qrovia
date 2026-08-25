import { NextResponse } from "next/server";
import { sanitizeStyle, qrSvg } from "@/lib/qr";

export const runtime = "nodejs";

const MAX_TEXT = 1200;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      text?: string;
      fgColor?: string;
      bgColor?: string;
      size?: number;
      margin?: number;
      ecc?: string;
    };
    const text = String(body.text ?? "").slice(0, MAX_TEXT);
    if (!text.trim()) {
      return NextResponse.json({ error: "Enter a destination URL first" }, { status: 400 });
    }
    if (!/^https?:\/\/.+\..+/i.test(text) && !/^(mailto|tel|sms|wifi):/i.test(text) && !/^BEGIN:VCARD/i.test(text)) {
      return NextResponse.json(
        { error: "Use a full URL like https://example.com" },
        { status: 400 },
      );
    }
    const style = sanitizeStyle({
      fgColor: body.fgColor,
      bgColor: body.bgColor,
      size: body.size,
      margin: body.margin,
      ecc: body.ecc as never,
    });
    // Preview always renders at a crisp fixed size regardless of download size.
    const svg = await qrSvg(text, { ...style, size: 512 });
    return NextResponse.json({ svg });
  } catch {
    return NextResponse.json({ error: "Could not generate QR" }, { status: 500 });
  }
}
