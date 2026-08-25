import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Kick the tires with real dynamic codes.",
    cta: "Start free",
    href: "/register",
    featured: false,
    features: [
      "3 dynamic QR codes",
      "Basic scan stats",
      "PNG & SVG downloads",
      "Color customization",
    ],
  },
  {
    name: "Pro",
    price: "$7",
    period: "/month",
    blurb: "For marketers who print and iterate.",
    cta: "Go Pro",
    href: "/register?plan=pro",
    featured: true,
    features: [
      "Unlimited dynamic codes",
      "Device / browser / OS analytics",
      "30-day time series",
      "CSV export",
      "Pause & resume anytime",
    ],
  },
  {
    name: "Business",
    price: "$29",
    period: "/month",
    blurb: "Teams running campaigns at scale.",
    cta: "Contact us",
    href: "/register?plan=business",
    featured: false,
    features: [
      "Everything in Pro",
      "Team seats & shared folders",
      "Scheduled destination switches",
      "Priority support",
    ],
  },
];

export function PricingTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-5 ${compact ? "md:grid-cols-3" : "md:grid-cols-3"} items-stretch`}>
      {PLANS.map((p) => (
        <div
          key={p.name}
          className={`card relative flex flex-col p-6 ${
            p.featured
              ? "border-violet-500/60 shadow-glow ring-1 ring-violet-500/30"
              : ""
          }`}
        >
          {p.featured && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-violet-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-glow">
              Most popular
            </span>
          )}
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--ink-dim)]">{p.name}</p>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
            <span className="text-sm text-[var(--ink-faint)]">{p.period}</span>
          </p>
          <p className="mt-2 text-sm text-[var(--ink-dim)]">{p.blurb}</p>
          <ul className="mt-5 flex-1 space-y-2.5 text-sm">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[var(--ink-dim)]">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 fill-lime"><path d="M7.6 13.2 4.4 10l-1.1 1.1 4.3 4.3 9-9L15.5 5.3z"/></svg>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href={p.href}
            className={`${p.featured ? "btn-primary mt-6" : "btn-ghost mt-6"} w-full`}
          >
            {p.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
