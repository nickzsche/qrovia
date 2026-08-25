# Qrovia — QR codes that never die ⚡

**Qrovia** is a dynamic-QR SaaS: you print a QR code **once**, and change where it points **forever** — plus every scan is measured.

A printed static QR code is frozen in plastic: wrong URL printed means reprinting everything. A Qrovia code encodes a short link (`yourapp/r/x7kq2m`) instead of the final destination. When someone scans it, Qrovia instantly redirects them to your *current* target — which you can edit any time from the dashboard, pause for maintenance, or point to a whole new campaign. The sticker on the window never changes; the destination behind it can change daily.

## Dynamic vs Static (the honest version)

| | **Dynamic** | **Static** |
|---|---|---|
| What's inside the QR | Short link `/r/<code>` | Your payload directly |
| Editable after printing | ✅ Anytime | ❌ Never |
| Scan tracking | ✅ Full analytics | ❌ Not possible |
| Pause / resume | ✅ Styled "paused" page | ❌ |
| Works without server | ❌ Needs redirect service | ✅ Yes |

**What we track for dynamic codes:** timestamp, raw User-Agent, parsed device class (mobile/tablet/desktop/bot), OS, browser, referer host. Unique scans use a privacy-friendly heuristic: distinct *User-Agent + calendar day* combinations — no cookies, no fingerprints, no IP storage.

**What we track for static codes: nothing.** The payload lives inside the image itself; scans never touch Qrovia servers, so there is nothing to count. The dashboard says so honestly. This trade-off (permanence vs. control) is exactly why businesses pay for dynamic codes.

## Features

- 🎨 **Landing page** — hero with animated phone mockup, Dynamic-vs-Static explainer, pricing, FAQ
- 🔐 **Auth** — register/login, bcrypt-hashed passwords, HttpOnly cookie sessions (JWT via `jose`)
- 🧾 **Dashboard** — campaign cards with live scan counts, active/paused badges, create modal with **live QR preview**
- 🎛️ **Customization** — foreground/background color, size, quiet-zone margin, ECC level (L/M/Q/H)
- ⚡ **Dynamic engine** — `GET /r/<code>` → 302 redirect + scan log; paused codes get a branded holding page
- 📊 **Analytics** — totals, unique scans, 30-day time-series chart, device/OS/browser breakdowns, top referrers (hand-rolled UA parser, zero deps)
- 📤 **Downloads & export** — SVG + 512px PNG per code; CSV export of scan logs
- 💳 **Plans** — Free (3 dynamic codes) · Pro $7/mo (unlimited + full analytics) · Business $29/mo (teams); plan switching is stubbed (no billing)

## Quickstart

```bash
npm install
npm run build
npm start          # serves on http://localhost:3430
```

Open http://localhost:3430 and log in with the seeded demo account:

```
email:    demo@qrovia.app
password: demo1234
```

The SQLite database (`data/qrovia.db`) is created and **seeded automatically on first request**: the demo account, 5 campaigns (mixed dynamic/static, one paused) and ~600 synthetic scans spread over the past 60 days with realistic hour-of-day weighting, so charts look alive immediately.

For development: `npm run dev` (also port 3430).

Configuration lives in `.env` (see `.env.example`): `APP_URL` (used when encoding short links into QRs) and `AUTH_SECRET` (JWT signing key). No secrets are hardcoded; defaults exist only so the demo boots.

## Tech stack

- **Next.js 14 (App Router) + TypeScript** — server components for data-heavy pages, client islands for modals/charts
- **Tailwind CSS** — single premium dark theme (violet → lime accents), tokens in `globals.css`
- **SQLite via Drizzle ORM + better-sqlite3** — zero-config local persistence, WAL mode, lazy auto-migration + seed
- **bcryptjs + jose** — password hashing and HttpOnly JWT cookies
- **qrcode** — server-side SVG/PNG generation (no canvas)
- Hand-rolled User-Agent regex parser — no tracking dependencies

## Monetization rationale

QR codes are a *purchased-once, regretted-later* commodity; the money is in the **link staying alive and measurable**:

1. **The reprint disaster is real.** Restaurants, event organizers and packaging teams print thousands of codes. One menu change = one reprint = $7/mo suddenly looks like pocket change.
2. **Analytics compound value.** Scan counts prove flyer ROI — a metric small businesses already pay agencies for.
3. **Recurring by nature.** If subscription lapses, redirects stop — painful churn incentive keeps customers honest (and paying).
4. **Free tier as bait, not charity.** Three dynamic codes are enough to hook a business and hit the wall exactly when their usage gets serious.
5. **Business tier sells collaboration**, not features: teams, folders, scheduled switches — the same engine, priced per organization.

## Roadmap

- **Custom domains** — `qr.yourbrand.com/r/code`, domain verification + automatic TLS
- **Offline geo lookup** — city/country from IP using a bundled MaxMind `.mmdb` file (no external API calls, keeping the "data stays local" promise)
- **Teams & folders** — shared workspaces, role-based access (Business tier)
- **Webhooks** — POST a signed JSON on every scan (or aggregated hourly digests) to Zapier/Make endpoints
- Scheduled destination switching ("point to the weekend menu Fri 17:00 → Sun 23:00")
- UTM builder + A/B destination rotation

## License

MIT © Sahan Hasret — see [LICENSE](./LICENSE).
