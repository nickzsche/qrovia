# QROVIA — Build Brief

You are an elite full-stack engineer working autonomously until DONE. No questions; decide and ship.
LOCATION: `/home/agartha/qrovia/` (exists with partial files from an aborted attempt — overwrite freely, start clean where needed).

## Product identity
- Name: **Qrovia**. Tagline: "QR codes that never die."
- Core value: DYNAMIC QR — print once, change destination anytime (QR encodes short link /r/<code>, we redirect) + scan analytics. Businesses pay subscriptions for this.
- Pricing story on landing: Free (3 dynamic QR, basic stats) · Pro $7/mo (unlimited dynamic, device/browser analytics, CSV export) · Business $29/mo (teams, folders, pause/schedule). Upgrade buttons = stubs.
- Brand: electric, modern. ONE premium dark theme with violet→lime accent energy, tokens in globals.css. No default Next.js look.

## Environment facts (verified)
- Ubuntu Linux home server. Node v22.23.2, npm 10.9.8, bun/pnpm available.
- Work ONLY inside `/home/agartha/qrovia/`. Nothing else touched.
- Network: npm registry only; no runtime external calls. Data stays local.
- Do NOT push remotes. `git init` + single local commit.
- No secrets hardcoded; `.env.example`; proper `.gitignore`.
- Assigned PORT: **3430**.

## Stack mandate
- Next.js App Router + TypeScript + Tailwind.
- SQLite via Drizzle ORM (+ better-sqlite3); lazy auto-seed demo data on first request.
- Auth: bcryptjs + jose HttpOnly cookie JWT. Seeded demo login: demo@qrovia.app / demo1234 (hinted on login page).
- QR generation: `qrcode` npm package server-side (SVG string + PNG dataURL). No canvas libs.

## Features (all required)
1. Landing page: hero with CSS/SVG phone mockup, Dynamic vs Static explainer, pricing table, FAQ, footer.
2. Auth: /login, /register.
3. Dashboard: campaign cards (name, type static/dynamic, scan count, active/paused badge), create modal.
4. Create flow: name, type (dynamic|static), destination URL, customization (fg color, bg color, size, margin, ECC level) with LIVE QR preview.
5. Dynamic engine: GET /r/<code> → 302 to current target; logs scan row (timestamp, code, raw User-Agent, referer); paused code serves styled "link temporarily paused" page. Static codes store direct payload; document honestly in README what is/isn't tracked for static.
6. Analytics per code: total + unique scans (distinct UA+day heuristic), 30-day time-series chart, device/browser/OS breakdown (hand-rolled UA regex parser — no dep), top referrers, CSV export endpoint.
7. Edit destination anytime (THE selling point), pause/resume toggle, delete with confirm.
8. Download QR as SVG and PNG (512px).
9. Plans page + current-plan chip in sidebar; upgrade stubs.
10. Seed: demo account, 5 campaigns (mixed types/statuses) + ~600 synthetic scan rows over past 60 days with realistic hour-of-day distribution so charts look alive.

## Acceptance gate (ALL mandatory)
1. `npm run build` exits 0 — paste last ~15 lines as proof.
2. Prod boot on 3430; `curl -s localhost:3430 | head -30` shows landing; then KILL server.
3. Verify dynamic redirect: `curl -sI http://localhost:3430/r/<seeded-code>` returns 302 to target — include output.
4. Premium responsive 390px + desktop, one dark theme.
5. README.md (English): pitch, dynamic-vs-static explanation, quickstart, tech stack, monetization rationale, roadmap (custom domains, geo via offline mmdb, teams, webhooks).
6. LICENSE MIT (Sahan Hasret). git init + initial commit.

## Time discipline
Core (auth + create + redirect + analytics) green first, extras later; cut into roadmap if context tightens.

## Report back
Features shipped vs cut, build proof tail, demo credentials, run commands, redirect test output.
