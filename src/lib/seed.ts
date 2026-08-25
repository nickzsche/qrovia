import { getDb, schema } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { parseUserAgent } from "@/lib/ua";

declare global {
  // eslint-disable-next-line no-var
  var __qroviaSeeded: boolean | undefined;
}

const DEMO_EMAIL = "demo@qrovia.app";
const DEMO_PASSWORD = "demo1234";

// Deterministic PRNG so seeded data is stable-ish across runs.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UAS: Array<[string, string, string, string]> = [
  // [raw ua, device, os, browser]
  [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "mobile",
    "iOS",
    "Safari",
  ],
  [
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
    "mobile",
    "Android",
    "Chrome",
  ],
  [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "desktop",
    "Windows",
    "Chrome",
  ],
  [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "desktop",
    "macOS",
    "Safari",
  ],
  [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    "desktop",
    "Windows",
    "Edge",
  ],
  [
    "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
    "mobile",
    "Android",
    "Samsung Internet",
  ],
  [
    "Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0",
    "desktop",
    "Linux",
    "Firefox",
  ],
];

const REFERRERS = [
  "instagram.com",
  null,
  null,
  null,
  "google.com",
  "x.com",
  "linkedin.com",
  null,
  null,
];

/**
 * Lazy auto-seed. Called on first request via instrumentation or layout.
 * Idempotent: only runs when users table is empty.
 */
export async function ensureSeed(): Promise<void> {
  if (globalThis.__qroviaSeeded) return;
  const db = getDb();
  const existing = db.select().from(schema.users).limit(1).all();
  if (existing.length > 0) {
    globalThis.__qroviaSeeded = true;
    return;
  }

  const rand = mulberry32(20260825);

  const [demoUser] = await db
    .insert(schema.users)
    .values({
      email: DEMO_EMAIL,
      passwordHash: hashPassword(DEMO_PASSWORD),
      plan: "pro",
      createdAt: new Date(),
    })
    .returning();

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  type CampaignSeed = {
    name: string;
    type: "dynamic" | "static";
    code: string;
    targetUrl?: string;
    staticPayload?: string;
    status: "active" | "paused";
    createdDaysAgo: number;
    scanCount: number;
    weightRecent: number; // >1 biases scans toward recent days
  };

  const campaignSeeds: CampaignSeed[] = [
    {
      name: "Restaurant Menu — Summer",
      type: "dynamic",
      code: "menutogo",
      targetUrl: "https://example.com/menu/summer-2026",
      status: "active",
      createdDaysAgo: 58,
      scanCount: 240,
      weightRecent: 1.3,
    },
    {
      name: "Product Packaging Batch #12",
      type: "static",
      code: "pkg12stc",
      staticPayload: "https://example.com/products/batch-12",
      status: "active",
      createdDaysAgo: 45,
      scanCount: 95,
      weightRecent: 0.8,
    },
    {
      name: "Conference Booth Landing",
      type: "dynamic",
      code: "expo26qz",
      targetUrl: "https://example.com/events/expo-2026",
      status: "active",
      createdDaysAgo: 30,
      scanCount: 200,
      weightRecent: 1.6,
    },
    {
      name: "Business Card — Sahan",
      type: "dynamic",
      code: "sahanvcf",
      targetUrl: "https://example.com/contact/sahan.vcf",
      status: "paused",
      createdDaysAgo: 22,
      scanCount: 90,
      weightRecent: 0.5,
    },
    {
      name: "Flyer Discount — 20% OFF",
      type: "dynamic",
      code: "flyer20x",
      targetUrl: "https://example.com/offers/flyer-20",
      status: "active",
      createdDaysAgo: 12,
      scanCount: 130,
      weightRecent: 2.0,
    },
  ];

  for (const seed of campaignSeeds) {
    const createdAt = new Date(now - seed.createdDaysAgo * dayMs);
    const [campaign] = await db
      .insert(schema.campaigns)
      .values({
        userId: demoUser.id,
        name: seed.name,
        type: seed.type,
        code: seed.code,
        targetUrl: seed.targetUrl ?? null,
        staticPayload: seed.staticPayload ?? null,
        status: seed.status,
        createdAt,
      })
      .returning();

    if (seed.type !== "dynamic") continue;

    const rows: Array<typeof schema.scans.$inferInsert> = [];
    for (let i = 0; i < seed.scanCount; i++) {
      // Bias toward recent days using power-ish distribution.
      const r = rand();
      const daysBack = Math.min(
        seed.createdDaysAgo - 1,
        Math.floor(Math.pow(r, 1 / seed.weightRecent) * 59),
      );
      // Realistic hour-of-day: peak 10:00–22:00.
      const hourRoll = rand();
      let hour: number;
      if (hourRoll < 0.08) hour = Math.floor(rand() * 8); // early morning tail
      else if (hourRoll < 0.55) hour = 10 + Math.floor(rand() * 6); // 10-16 lunch/day peak
      else hour = 16 + Math.floor(rand() * 7); // evening
      const minute = Math.floor(rand() * 60);
      const second = Math.floor(rand() * 60);

      const scannedAt = new Date(
        now - daysBack * dayMs - (23 - hour) * 3600000 + minute * 60000 + second * 1000,
      );
      if (scannedAt.getTime() > now) continue;

      const pick = UAS[Math.floor(rand() * UAS.length)];
      const refPick = REFERRERS[Math.floor(rand() * REFERRERS.length)];

      rows.push({
        campaignId: campaign.id,
        scannedAt,
        userAgentRaw: pick[0],
        device: pick[1],
        os: pick[2],
        browser: pick[3],
        refererHost: refPick,
      });
    }
    if (rows.length > 0) {
      await db.insert(schema.scans).values(rows);
    }
  }

  globalThis.__qroviaSeeded = true;
}
