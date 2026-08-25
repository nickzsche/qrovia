/**
 * Resolves the public base URL used for short links (/r/<code>) shown in the UI
 * and encoded into dynamic QR codes.
 *
 * Priority: APP_URL env → request Origin/Host headers → localhost:3430 fallback.
 */
export function getAppUrl(req?: Request): string {
  const fromEnv = process.env.APP_URL;
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv.replace(/\/$/, "");
  if (req) {
    try {
      const origin = req.headers.get("origin");
      if (origin && /^https?:\/\//.test(origin)) return origin;
      const host = req.headers.get("host");
      if (host) {
        const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
        return `${proto}://${host}`;
      }
    } catch {
      // fall through
    }
  }
  return process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:3430";
}
