"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QrPreview } from "@/components/QrPreview";

export type CampaignCardData = {
  id: number;
  name: string;
  type: "dynamic" | "static";
  code: string;
  status: "active" | "paused";
  targetUrl: string | null;
  staticPayload: string | null;
  scanCount: number;
  createdAt: string;
};

const FG_SWATCHES = ["#08070d", "#1e1b4b", "#4c1d95", "#166534", "#7f1d1d", "#0c4a6e"];
const BG_SWATCHES = ["#ffffff", "#fef9c3", "#ede9fe", "#dcfce7", "#ffe4e6", "#08070d"];

export function CampaignGrid({
  initialCards,
  plan,
}: {
  initialCards: CampaignCardData[];
  plan: string;
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<CampaignCardData | null>(null);
  const [deleting, setDeleting] = useState<CampaignCardData | null>(null);
  const [limitWarn, setLimitWarn] = useState<string>("");

  const dynamicCount = useMemo(() => cards.filter((c) => c.type === "dynamic").length, [cards]);
  const totalScans = useMemo(() => cards.reduce((a, c) => a + c.scanCount, 0), [cards]);

  async function togglePause(card: CampaignCardData) {
    const next = card.status === "active" ? "paused" : "active";
    setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, status: next } : c)));
    await fetch(`/api/campaigns/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setCards((cs) => cs.filter((c) => c.id !== deleting.id));
    setDeleting(null);
    await fetch(`/api/campaigns/${deleting.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Campaigns</h1>
          <p className="mt-1 text-sm text-[var(--ink-dim)]">
            {cards.length} codes · {dynamicCount} dynamic
            {plan === "free" && ` · ${Math.max(0, 3 - dynamicCount)} of 3 free dynamic left`} ·{" "}
            {totalScans.toLocaleString()} scans tracked
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-lime">
          + New QR code
        </button>
      </div>

      {limitWarn && (
        <div className="mt-5 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
          {limitWarn}{" "}
          <a href="/plans" className="font-bold text-lime hover:underline">See plans →</a>
        </div>
      )}

      {/* grid */}
      {cards.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="text-4xl">🔳</span>
          <p className="font-semibold">No codes yet</p>
          <p className="max-w-xs text-sm text-[var(--ink-dim)]">
            Create your first dynamic QR — print it once, change where it points forever.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-2">+ New QR code</button>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <article key={c.id} className="card group flex flex-col p-5 transition-colors hover:border-violet-500/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-bold leading-snug" title={c.name}>{c.name}</h3>
                  <p className="mt-0.5 text-xs text-[var(--ink-faint)]">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <span className={`chip shrink-0 ${c.status === "active" ? "bg-lime/15 text-lime" : "bg-white/10 text-[var(--ink-dim)]"}`}>
                  {c.status === "active" ? "● Active" : "⏸ Paused"}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className={`chip ${c.type === "dynamic" ? "bg-violet-500/15 text-violet-200" : "bg-white/5 text-[var(--ink-dim)]"}`}>
                  {c.type === "dynamic" ? "⚡ Dynamic" : "🧊 Static"}
                </span>
                {c.type === "dynamic" && (
                  <code className="truncate rounded bg-black/30 px-2 py-0.5 text-[11px] text-[var(--ink-dim)]" title={`/r/${c.code}`}>
                    /r/{c.code}
                  </code>
                )}
              </div>

              <p className="mt-2 truncate text-xs text-[var(--ink-faint)]" title={(c.targetUrl ?? c.staticPayload ?? "")}>
                → {c.type === "static" && !c.staticPayload?.startsWith("http") ? c.staticPayload : c.targetUrl ?? c.staticPayload}
              </p>

              <div className="mt-4 flex items-end justify-between border-t border-[var(--line)] pt-4">
                <div>
                  <p className="text-xl font-extrabold leading-none">{c.scanCount.toLocaleString()}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">scans</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <a href={`/analytics/${c.id}`} className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-dim)] transition-colors hover:border-violet-500/50 hover:text-white">Stats</a>
                  <button onClick={() => setEditing(c)} disabled={c.type !== "dynamic"} title={c.type !== "dynamic" ? "Static payloads can't be changed" : "Edit destination"} className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-dim)] transition-colors hover:border-violet-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Edit</button>
                  <button onClick={() => togglePause(c)} disabled={c.type !== "dynamic"} title={c.status === "active" ? "Pause link" : "Resume link"} className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-dim)] transition-colors hover:border-violet-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">{c.status === "active" ? "Pause" : "Resume"}</button>
                  <button onClick={() => setDeleting(c)} className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-medium text-red-300/80 transition-colors hover:border-red-500/50 hover:text-red-300" title="Delete">✕</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal
          plan={plan}
          currentDynamic={dynamicCount}
          onClose={() => setShowCreate(false)}
          onCreated={(card) => {
            setCards((cs) => [card, ...cs]);
            setShowCreate(false);
            router.refresh();
          }}
          onLimitHit={(msg) => {
            setShowCreate(false);
            setLimitWarn(msg);
          }}
        />
      )}

      {editing && (
        <EditModal
          card={editing}
          onClose={() => setEditing(null)}
          onSaved={(name, targetUrl) => {
            setCards((cs) =>
              cs.map((c) =>
                c.id === editing.id ? { ...c, name: name ?? c.name, targetUrl: targetUrl ?? c.targetUrl } : c,
              ),
            );
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          card={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* ---------------- create modal ---------------- */

function CreateModal({
  plan,
  currentDynamic,
  onClose,
  onCreated,
  onLimitHit,
}: {
  plan: string;
  currentDynamic: number;
  onClose: () => void;
  onCreated: (c: CampaignCardData) => void;
  onLimitHit: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"dynamic" | "static">("dynamic");
  const [targetUrl, setTargetUrl] = useState("");
  const [staticPayload, setStaticPayload] = useState("");
  const [fgColor, setFgColor] = useState("#08070d");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(2);
  const [ecc, setEcc] = useState<"L" | "M" | "Q" | "H">("M");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const atFreeLimit = plan === "free" && currentDynamic >= 3;
  const previewPayload =
    type === "dynamic"
      ? targetUrl.trim()
        ? `https://qrovia.app/r/preview` // placeholder short-link shape; actual code assigned on save
        : ""
      : staticPayload.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          targetUrl: type === "dynamic" ? targetUrl.trim() : undefined,
          staticPayload: type === "static" ? staticPayload.trim() : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        campaign?: {
          id: number;
          name: string;
          type: "dynamic" | "static";
          code: string;
          status: "active" | "paused";
          targetUrl: string | null;
          staticPayload: string | null;
        };
        error?: string;
        code?: string;
      };
      if (!res.ok || !data.campaign) {
        if (data.code === "PLAN_LIMIT") {
          onLimitHit(data.error ?? "Plan limit reached.");
          return;
        }
        setError(data.error ?? "Could not create campaign");
        setBusy(false);
        return;
      }
      const c = data.campaign;
      onCreated({
        id: c.id,
        name: c.name,
        type: c.type,
        code: c.code,
        status: c.status,
        targetUrl: c.targetUrl,
        staticPayload: c.staticPayload,
        scanCount: 0,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  return (
    <ModalShell title="Create a QR code" onClose={onClose}>
      {atFreeLimit ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[var(--ink-dim)]">
            You&apos;ve used all <b>3 dynamic codes</b> on the Free plan. Upgrade to Pro for
            unlimited dynamic codes, full analytics and CSV export.
          </p>
          <div className="flex gap-3">
            <a href="/plans" className="btn-primary flex-1">Upgrade →</a>
            <button onClick={onClose} className="btn-ghost flex-1">Maybe later</button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="min-w-0 space-y-4">
            <div>
              <label className="label">Campaign name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Restaurant menu — summer" required maxLength={80} />
            </div>

            <div>
              <label className="label">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <TypeOption selected={type === "dynamic"} onClick={() => setType("dynamic")} icon="⚡" title="Dynamic" sub="Editable + tracked" />
                <TypeOption selected={type === "static"} onClick={() => setType("static")} icon="🧊" title="Static" sub="Fixed payload" />
              </div>
            </div>

            {type === "dynamic" ? (
              <div>
                <label className="label">Destination URL</label>
                <input className="input" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://example.com/menu" required type="url" />
                <p className="mt-1.5 text-xs text-[var(--ink-faint)]">Changeable anytime after printing.</p>
              </div>
            ) : (
              <div>
                <label className="label">Static payload</label>
                <input className="input" value={staticPayload} onChange={(e) => setStaticPayload(e.target.value)} placeholder="https://example.com or any text" required />
                <p className="mt-1.5 text-xs text-[var(--ink-faint)]">Encoded directly in the QR — cannot be changed later.</p>
              </div>
            )}

            <fieldset className="rounded-xl border border-[var(--line)] p-4">
              <legend className="px-1 text-xs font-bold uppercase tracking-wider text-[var(--ink-faint)]">Customize</legend>
              <div className="space-y-4">
                <ColorRow label="Foreground" value={fgColor} setValue={setFgColor} swatches={FG_SWATCHES} />
                <ColorRow label="Background" value={bgColor} setValue={setBgColor} swatches={BG_SWATCHES} />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Size (px)</label>
                    <select className="input" value={size} onChange={(e) => setSize(Number(e.target.value))}>
                      {[256, 512, 1024, 2048].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Margin</label>
                    <select className="input" value={margin} onChange={(e) => setMargin(Number(e.target.value))}>
                      {[0, 1, 2, 3, 4].map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" title="Higher ECC = more damage tolerance">ECC level</label>
                    <select className="input" value={ecc} onChange={(e) => setEcc(e.target.value as never)}>
                      <option value="L">L · 7%</option>
                      <option value="M">M · 15%</option>
                      <option value="Q">Q · 25%</option>
                      <option value="H">H · 30%</option>
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
            )}
          </div>

          <div className="flex flex-col items-center justify-start gap-4 md:w-[260px]">
            <QrPreview
              payload={previewPayload || "https://qrovia.app/welcome"}
              fgColor={fgColor}
              bgColor={bgColor}
              size={size}
              margin={margin}
              ecc={ecc}
            />
            <p className="text-center text-[11px] leading-relaxed text-[var(--ink-faint)]">
              Live preview updates with your style settings.
            </p>
            <button type="submit" disabled={busy} className={`${type === "dynamic" ? "btn-lime" : "btn-primary"} w-full disabled:opacity-60`}>
              {busy ? "Creating…" : "Create code"}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

function TypeOption({
  selected,
  onClick,
  icon,
  title,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left transition-all ${
        selected ? "border-violet-500/70 bg-violet-500/10 shadow-glow" : "border-[var(--line)] hover:border-violet-500/40"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className={`block text-sm font-bold ${selected ? "text-white" : ""}`}>{title}</span>
      <span className="block text-[11px] text-[var(--ink-faint)]">{sub}</span>
    </button>
  );
}

function ColorRow({
  label,
  value,
  setValue,
  swatches,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  swatches: string[];
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-transparent p-1"
          aria-label={label}
        />
        {swatches.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`${label} ${s}`}
            onClick={() => setValue(s)}
            style={{ backgroundColor: s }}
            className={`h-7 w-7 rounded-full border transition-transform hover:scale-110 ${value.toLowerCase() === s.toLowerCase() ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-[#12101d]" : "border-black/20"}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- edit modal ---------------- */

function EditModal({
  card,
  onClose,
  onSaved,
}: {
  card: CampaignCardData;
  onClose: () => void;
  onSaved: (name?: string, targetUrl?: string) => void;
}) {
  const [name, setName] = useState(card.name);
  const [targetUrl, setTargetUrl] = useState(card.targetUrl ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/campaigns/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(name !== card.name ? { name } : {}),
        ...(targetUrl !== (card.targetUrl ?? "") ? { targetUrl } : {}),
      }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Could not save");
      setBusy(false);
      return;
    }
    onSaved(name, targetUrl);
  }

  return (
    <ModalShell title="Edit destination" onClose={onClose}>
      <p className="-mt-1 mb-5 rounded-xl border border-lime/25 bg-lime/10 px-4 py-2.5 text-xs leading-relaxed text-lime">
        ⚡ This is the Qrovia superpower — the printed QR stays the same, only the
        destination changes.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Campaign name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </div>
        <div>
          <label className="label">Destination URL</label>
          <input className="input" type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required />
          <p className="mt-1.5 text-xs text-[var(--ink-faint)]">
            Short link <code className="text-[var(--ink-dim)]">/r/{card.code}</code> keeps pointing here.
          </p>
        </div>
        {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={busy} className="btn-lime flex-1 disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---------------- delete confirm ---------------- */

function ConfirmDeleteModal({
  card,
  onCancel,
  onConfirm,
}: {
  card: CampaignCardData;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell title="Delete campaign?" onClose={onCancel}>
      <p className="text-sm leading-relaxed text-[var(--ink-dim)]">
        You&apos;re about to delete <b className="text-white">{card.name}</b>{" "}
        (<code className="text-xs">/r/{card.code}</code>) and its scan history.
        {card.type === "dynamic" && " Any printed material pointing at this code will stop working."}
      </p>
      <p className="mt-3 text-sm font-semibold text-red-300">This cannot be undone.</p>
      <div className="mt-6 flex gap-3">
        <button onClick={onConfirm} className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-900/40 hover:brightness-110">
          Yes, delete forever
        </button>
        <button onClick={onCancel} className="btn-ghost flex-1">Keep it</button>
      </div>
    </ModalShell>
  );
}

/* ---------------- modal shell ---------------- */

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="fade-up max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-[var(--line)] bg-[#100e1a] p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--ink-faint)] hover:bg-white/5 hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
