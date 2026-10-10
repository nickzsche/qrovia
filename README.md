# Qrovia — QR codes that never die ⚡

**Qrovia** is a dynamic-QR SaaS: you print a QR code **once**, and change where it points **forever** — plus every scan is measured.

A printed static QR code is frozen in plastic: a wrong URL means reprinting everything. A Qrovia code encodes a short link (`/r/x7kq2m`) instead of the final destination. When someone scans it, Qrovia instantly redirects them to your *current* target — which you can edit any time from the dashboard, pause for maintenance, or point at a whole new campaign. The sticker on the window never changes; the destination behind it can change daily.

> Print once. Change the destination forever. Measure every scan.

---

## Table of contents

- [Dynamic vs static (the honest version)](#dynamic-vs-static-the-honest-version)
- [Features](#features)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [API reference](#api-reference)
- [Screenshots](#screenshots)
- [Security](#security)
- [Roadmap](#roadmap)

---

## Dynamic vs static (the honest version)

| | **Dynamic** | **Static** |
|---|---|---|
| What's inside the QR | Short link `/r/<code>` | Your payload directly |
| Editable after printing | ✅ Anytime | ❌ Never |
| Scan tracking | ✅ Full analytics | ❌ Not possible |
| Pause / resume | ✅ Styled "paused" page | ❌ |
| Works without a server | ❌ Needs the redirect service | ✅ Yes |

**What we track for dynamic codes:** timestamp, raw User-Agent, parsed device class (mobile / tablet / desktop / bot), OS, browser, and referer host. Unique scans use a privacy-friendly heuristic — distinct *User-Agent + calendar-day* combinations. No cookies, no fingerprints, no IP storage.

**What we track for static codes: nothing.** The payload lives inside the image itself; scans never touch Qrovia servers, so there is nothing to count. The dashboard says so honestly. This trade-off (permanence vs. control) is exactly why businesses pay for dynamic codes.

---

## Features

- 🎨 **Landing page** — hero with an animated phone mockup, Dynamic-vs-Static explainer, pricing, FAQ
- 🔐 **Auth** — register / login, bcrypt-hashed passwords, HttpOnly cookie sessions (JWT via `jose`)
- 🧾 **Dashboard** — campaign cards with live scan counts, active/paused badges, a create modal with **live QR preview**
- 🎛️ **Customization** — foreground/background color, size, quiet-zone margin, ECC level (L/M/Q/H)
- ⚡ **Dynamic engine** — `GET /r/<code>` → `302` redirect + scan log; paused codes get a branded holding page
- 📊 **Analytics** — totals, unique scans, a 30-day time-series chart, device/OS/browser breakdowns, top referrers (hand-rolled UA parser, zero deps)
- 📤 **Downloads & export** — SVG + 512px PNG per code; CSV export of scan logs
- 💳 **Plans** — Free (3 dynamic codes) · Pro $7/mo (unlimited + full analytics) · Business $29/mo (teams); plan switching is stubbed (no billing)

---

## Architecture

Qrovia is a single Next.js application. Pages are React Server Components that read straight from SQLite; the only client-side islands are the interactive bits (create/edit modals, live QR preview, the analytics chart, the plan switcher).

```
                    ┌─────────────────────────────────────────────┐
   browser / phone  │                 Next.js 14 (App Router)      │
   ────────────────▶│                                             │
        scan        │   /              landing (RSC)              │
   ────────────────▶│   /dashboard     campaign grid (RSC+islands)│
                    │   /analytics/[id] per-code analytics (RSC)   │
                    │   /login /register /plans                   │
                    │                                             │
                    │   ── API route handlers (nodejs runtime) ──  │
                    │   POST /api/auth/{register,login,logout}    │
                    │   GET/POST /api/campaigns                   │
                    │   PATCH/DELETE /api/campaigns/[id]          │
                    │   GET /api/campaigns/[id]/{download,export} │
                    │   POST /api/qr/preview                       │
                    │   GET  /r/[code]  ← the dynamic engine       │
                    │                                             │
                    │   ── lib/ ──                                 │
                    │   auth · session · campaigns · qr · ua ·     │
                    │   urls · codes · seed · app-url              │
                    └───────────────┬─────────────────────────────┘
                                    │ Drizzle ORM
                                    ▼
                          ┌───────────────────┐
                          │  SQLite (WAL)      │
                          │  users · campaigns │
                          │  scans             │
                          └───────────────────┘
```

**The redirect path in one line:** `GET /r/<code>` → look up the campaign → log a scan row (timestamp + parsed UA + referer) → `302` to the current target, or serve the styled "paused" page.

**Data model**

| Table | Columns |
|---|---|
| `users` | `id`, `name`, `email` (unique), `password_hash`, `plan`, `created_at` |
| `campaigns` | `id`, `user_id`, `name`, `type` (`dynamic`\|`static`), `code` (unique), `target_url`, `static_payload`, `status` (`active`\|`paused`), `created_at` |
| `scans` | `id`, `campaign_id`, `scanned_at`, `user_agent_raw`, `device`, `os`, `browser`, `referer_host` |

The schema auto-migrates and **auto-seeds** on first request (see [Quickstart](#quickstart)).

---

## Project structure

```
qrovia/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                 # landing page
│  │  ├─ login/ register/         # auth pages
│  │  ├─ dashboard/               # campaign grid + settings
│  │  ├─ analytics/[id]/          # per-code analytics
│  │  ├─ plans/                   # plan picker
│  │  ├─ r/[code]/route.ts        # ⚡ dynamic redirect engine
│  │  └─ api/                     # auth, campaigns, qr/preview, plan
│  ├─ components/                 # UI: shell, modals, chart, previews
│  └─ lib/
│     ├─ db/                      # Drizzle schema + SQLite bootstrap
│     ├─ auth.ts / session.ts     # JWT cookie sessions
│     ├─ campaigns.ts             # campaign queries
│     ├─ qr.ts                    # SVG / PNG generation + style sanitizing
│     ├─ ua.ts                    # hand-rolled User-Agent parser
│     ├─ urls.ts                  # destination-URL scheme allowlist
│     ├─ codes.ts                 # short-code generation
│     └─ seed.ts                  # demo data seeding
└─ tests/                         # node:test unit tests
```

---

## Tech stack

- **Next.js 14 (App Router) + TypeScript** — server components for data-heavy pages, client islands for modals/charts
- **Tailwind CSS** — one premium dark theme (violet → lime accents), tokens in `globals.css`
- **SQLite via Drizzle ORM + better-sqlite3** — zero-config local persistence, WAL mode, lazy auto-migration + seed
- **bcryptjs + jose** — password hashing and HttpOnly JWT cookies
- **qrcode** — server-side SVG/PNG generation (no canvas)
- **zod** — request-body validation
- Hand-rolled User-Agent regex parser — no tracking dependencies

---

## Quickstart

**Prerequisites:** Node.js **≥ 22.6** (the test runner uses Node's built-in TypeScript type-stripping) and npm.

```bash
npm install
npm run build
npm start          # serves on http://localhost:3430
```

Open <http://localhost:3430> and log in with the seeded demo account:

```
email:    demo@qrovia.app
password: demo1234
```

The SQLite database (`data/qrovia.db`) is created and **seeded automatically on the first request**: the demo account, 5 campaigns (mixed dynamic/static, one paused) and ~600 synthetic scans spread over the past 60 days with realistic hour-of-day weighting, so the charts look alive immediately.

For development: `npm run dev` (also port 3430).

---

## Environment variables

Copy `.env.example` to `.env` and adjust as needed. Both variables have safe defaults so the demo boots with no configuration.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `APP_URL` | no | request `Origin`/`Host`, else `http://localhost:3430` | Public base URL encoded into dynamic QR short links |
| `AUTH_SECRET` | **yes in production** | dev-only fallback | JWT signing key for session cookies — generate with `openssl rand -base64 32` |
| `QROVIA_DATA_DIR` | no | `./data` | Directory holding the SQLite database file |
| `FORCE_INSECURE_COOKIE` | no | unset | Set to `1` to allow non-`Secure` cookies in production (e.g. behind a plain-HTTP proxy) |
| `PORT` | no | `3430` | Used only as a fallback base URL; the dev/start scripts pin the port directly |

> ⚠️ **Production:** always set a strong, unique `AUTH_SECRET`, and serve over HTTPS so session cookies are marked `Secure`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on port 3430 |
| `npm run build` | Production build (also runs the TypeScript type check) |
| `npm start` | Serve the production build on port 3430 |
| `npm run typecheck` | Run `tsc --noEmit` across the project |
| `npm test` | Run the unit test suite (`node:test`) |

---

## Testing

Unit tests cover the pure logic that sits on trust boundaries — URL scheme validation and destination resolution, the User-Agent parser, short-code generation, QR style sanitizing, and app-URL resolution. They run on Node's built-in test runner with zero extra dependencies:

```bash
npm test
```

`src/lib/urls.ts` in particular is load-bearing: it decides which destination schemes are ever emitted as a `302`. The tests assert that `javascript:` and `data:` targets are rejected.

---

## API reference

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` | – | Create an account (`name`, `email`, `password`) and start a session |
| `POST /api/auth/login` | – | Start a session |
| `POST /api/auth/logout` | – | Clear the session cookie |
| `GET /api/campaigns` | ✅ | List the current user's campaigns |
| `POST /api/campaigns` | ✅ | Create a campaign; enforces the free-plan dynamic-code limit |
| `PATCH /api/campaigns/[id]` | ✅ | Edit `name` / `targetUrl` / `status` (dynamic only for `targetUrl`) |
| `DELETE /api/campaigns/[id]` | ✅ | Delete a campaign and its scan history |
| `GET /api/campaigns/[id]/download` | ✅ | QR image (`?format=svg\|png`, plus style params) |
| `GET /api/campaigns/[id]/export` | ✅ | CSV of scan logs |
| `POST /api/qr/preview` | – | Render a QR SVG for the live preview |
| `POST /api/plan` | ✅ | Switch plan (billing stub) |
| `GET /r/[code]` | – | **Public redirect** — `302` to the current target, logs the scan |

---

## Screenshots

<!-- Add product screenshots under docs/screenshots/ and reference them here, e.g.:
     ![Dashboard](docs/screenshots/dashboard.png)
     ![Analytics](docs/screenshots/analytics.png)
     ![Landing](docs/screenshots/landing.png)
-->

> 📷 _Screenshots coming soon._ Suggested set: landing hero, the dashboard campaign grid, the create modal with live QR preview, and the per-code analytics view (time-series + breakdowns).

---

## Security

- Destinations are validated against a **scheme allowlist** (`http`, `https`, `mailto`, `tel`, `sms`) before they are ever stored or emitted as a redirect — `javascript:` and `data:` URLs are rejected.
- Passwords are hashed with **bcrypt**; sessions are **HttpOnly**, `SameSite=Lax` JWT cookies.
- All campaign queries and mutations are **scoped to the authenticated owner**.
- No IP addresses are stored, and unique-visit attribution is a coarse UA + day heuristic.

---

## Roadmap

- **Custom domains** — `qr.yourbrand.com/r/code`, domain verification + automatic TLS
- **Offline geo lookup** — city/country from IP using a bundled MaxMind `.mmdb` file (no external API calls, keeping the "data stays local" promise)
- **Teams & folders** — shared workspaces, role-based access (Business tier)
- **Webhooks** — POST a signed JSON on every scan (or aggregated hourly digests) to Zapier/Make endpoints
- **Scheduled destination switching** — "point to the weekend menu Fri 17:00 → Sun 23:00"
- **UTM builder + A/B destination rotation**
