import QRCode from "qrcode";

export type QrStyle = {
  fgColor: string;
  bgColor: string;
  size: number; // px
  margin: number; // modules
  ecc: "L" | "M" | "Q" | "H";
};

export const DEFAULT_QR_STYLE: QrStyle = {
  fgColor: "#08070d",
  bgColor: "#ffffff",
  size: 512,
  margin: 2,
  ecc: "M",
};

function clampHex(hex: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : fallback;
}

export function sanitizeStyle(raw: Partial<QrStyle> | undefined): QrStyle {
  const s = raw ?? {};
  return {
    fgColor: clampHex(s.fgColor ?? "", DEFAULT_QR_STYLE.fgColor),
    bgColor: clampHex(s.bgColor ?? "", DEFAULT_QR_STYLE.bgColor),
    size: Math.min(2048, Math.max(128, Number(s.size) || DEFAULT_QR_STYLE.size)),
    margin: Math.min(10, Math.max(0, Math.floor(Number(s.margin ?? DEFAULT_QR_STYLE.margin)))),
    ecc: (["L", "M", "Q", "H"] as const).includes(s.ecc as never)
      ? (s.ecc as QrStyle["ecc"])
      : DEFAULT_QR_STYLE.ecc,
  };
}

/** QR as SVG markup string. */
export async function qrSvg(text: string, style: QrStyle): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: style.ecc,
    margin: style.margin,
    width: style.size,
    color: { dark: style.fgColor, light: style.bgColor },
  });
}

/** QR as PNG data URL. */
export async function qrPngDataUrl(text: string, style: QrStyle): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: style.ecc,
    margin: style.margin,
    width: style.size,
    color: { dark: style.fgColor, light: style.bgColor },
  });
}
