export type DeviceKind = "mobile" | "tablet" | "desktop" | "bot" | "other";
export type OsName =
  | "Android"
  | "iOS"
  | "Windows"
  | "macOS"
  | "Linux"
  | "Chrome OS"
  | "Other";
export type BrowserName =
  | "Chrome"
  | "Safari"
  | "Firefox"
  | "Edge"
  | "Samsung Internet"
  | "Opera"
  | "In-App Browser"
  | "Other";

const BOT_RE =
  /bot|crawl|spider|slurp|bing|preview|facebookexternalhit|whatsapp|telegrambot|twitterbot|embedly|quora|outbrain|vkshare|headless/i;

export function parseUserAgent(uaRaw: string): {
  device: DeviceKind;
  os: OsName;
  browser: BrowserName;
} {
  const ua = uaRaw || "";
  if (!ua.trim() || BOT_RE.test(ua)) {
    return { device: "bot", os: "Other", browser: "Other" };
  }

  // --- Device kind ---
  let device: DeviceKind = "desktop";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) {
    device = "tablet";
  } else if (
    /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|Opera Mini/i.test(
      ua,
    )
  ) {
    device = "mobile";
  }

  // --- OS ---
  let os: OsName = "Other";
  if (/Windows NT|Windows Phone/i.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X|Macintosh/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua))
    os = "macOS";
  else if (/CrOS/i.test(ua)) os = "Chrome OS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux|X11|Ubuntu|Fedora/i.test(ua)) os = "Linux";

  // --- Browser (order matters: edge → opera → samsung → firefox → chrome → safari) ---
  let browser: BrowserName = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/SamsungBrowser\//i.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (
    /Chrome\/|CriOS\/|Chromium/i.test(ua) &&
    !/FxiOS/i.test(ua)
  )
    browser = "Chrome";
  else if (/Safari\//i.test(ua) && /Version\//i.test(ua)) browser = "Safari";
  if (
    /FBAV|FBAN|Instagram|Line\/|Snapchat|TikTok|musical_ly|Twitter|X\//i.test(
      ua,
    )
  ) {
    browser = "In-App Browser";
  }

  return { device, os, browser };
}
