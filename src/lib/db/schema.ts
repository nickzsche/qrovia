import {
  sqliteTable,
  text,
  integer,
  index,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan", { enum: ["free", "pro", "business"] })
    .notNull()
    .default("free"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const campaigns = sqliteTable(
  "campaigns",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // "dynamic" = QR encodes short URL /r/<code>, destination editable.
    // "static" = QR encodes the payload directly; not redirect-tracked.
    type: text("type", { enum: ["dynamic", "static"] }).notNull(),
    code: text("code").notNull().unique(),
    targetUrl: text("target_url"),
    staticPayload: text("static_payload"),
    status: text("status", { enum: ["active", "paused"] })
      .notNull()
      .default("active"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userIx: index("campaigns_user_ix").on(t.userId),
    codeIx: index("campaigns_code_ix").on(t.code),
  }),
);

export const scans = sqliteTable(
  "scans",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    campaignId: integer("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    scannedAt: integer("scanned_at", { mode: "timestamp" }).notNull(),
    userAgentRaw: text("user_agent_raw").notNull().default(""),
    device: text("device"),
    os: text("os"),
    browser: text("browser"),
    refererHost: text("referer_host"),
  },
  (t) => ({
    campaignIx: index("scans_campaign_ix").on(t.campaignId),
    timeIx: index("scans_time_ix").on(t.scannedAt),
  }),
);

export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Scan = typeof scans.$inferSelect;
