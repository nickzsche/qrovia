/**
 * Destination-URL handling shared by the campaign API, the QR preview endpoint
 * and the redirect engine.
 *
 * This is a trust boundary: user-supplied destinations end up in a `302
 * Location`, so we *allowlist* schemes rather than blocklist the obvious
 * `javascript:`/`data:` payloads.
 */
const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:", "sms:"]);

/**
 * True when `raw` is a well-formed absolute URL using an allowed scheme.
 * `http(s)` destinations must carry a dotted host (so `https://localhost` is
 * rejected as a public destination).
 */
export function isSafeTargetUrl(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  let url: URL;
  try {
    url = new URL(t);
  } catch {
    return false;
  }
  if (!SAFE_SCHEMES.has(url.protocol)) return false;
  return url.protocol.startsWith("http") ? url.hostname.includes(".") : t.length > url.protocol.length;
}

/**
 * Turns a stored destination into a redirect-safe absolute URL, or `null` when
 * it cannot be used. Scheme-less inputs like `example.com/path` become `https`.
 *
 * Never returns a URL outside {@link SAFE_SCHEMES} — a malicious value yields
 * `null` instead of an executable `javascript:` redirect.
 */
export function normalizeTarget(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return isSafeTargetUrl(t) ? t : null;
  if (/^[\w-]+(\.[\w-]+)+/.test(t)) {
    const asHttps = `https://${t}`;
    return isSafeTargetUrl(asHttps) ? asHttps : null;
  }
  if (/^(mailto|tel|sms):/i.test(t) && isSafeTargetUrl(t)) return t;
  return null;
}
