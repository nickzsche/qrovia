"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["3 dynamic QR codes", "Basic scan stats", "PNG & SVG downloads", "Color customization"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$7",
    period: "/month",
    features: [
      "Unlimited dynamic codes",
      "Device / browser / OS analytics",
      "30-day time series",
      "CSV export",
      "Pause & resume anytime",
    ],
  },
  {
    key: "business",
    name: "Business",
    price: "$29",
    period: "/month",
    features: ["Everything in Pro", "Team seats & shared folders", "Scheduled switches", "Priority support"],
  },
] as const;

export function PlansClient({ currentPlan }: { currentPlan: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function choose(planKey: string) {
    setPending(planKey);
    setNote("");
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setNote("Could not switch plan — try again.");
    }
    setPending(null);
  }

  return (
    <>
      {note && (
        <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{note}</p>
      )}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = p.key === currentPlan;
          return (
            <div
              key={p.key}
              className={`card relative flex flex-col p-6 ${isCurrent ? "border-violet-500/60 shadow-glow" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-widest text-[var(--ink-dim)]">{p.name}</p>
                {isCurrent && <span className="chip bg-lime/15 text-lime">✓ Current</span>}
              </div>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
                <span className="text-sm text-[var(--ink-faint)]">{p.period}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-[var(--ink-dim)]">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 fill-lime"><path d="M7.6 13.2 4.4 10l-1.1 1.1 4.3 4.3 9-9L15.5 5.3z" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choose(p.key)}
                disabled={isCurrent || pending != null}
                className={`${p.key === "pro" ? "btn-primary" : "btn-ghost"} mt-6 w-full disabled:cursor-default disabled:opacity-50`}
              >
                {isCurrent ? "Your plan" : pending === p.key ? "Switching…" : `Switch to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
