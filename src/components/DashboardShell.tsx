import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";

const PLAN_META: Record<string, { label: string; cls: string }> = {
  free: { label: "Free", cls: "bg-white/5 text-[var(--ink-dim)] border border-[var(--line)]" },
  pro: {
    label: "Pro",
    cls: "bg-gradient-to-r from-violet-500/20 to-lime-400/15 text-violet-200 border border-violet-400/40",
  },
  business: {
    label: "Business",
    cls: "bg-gradient-to-r from-lime-400/25 to-violet-500/20 text-lime border border-lime/40",
  },
};

export function DashboardShell({
  user,
  active,
  children,
}: {
  user: { email: string; plan: string };
  active: "dashboard" | "plans" | "settings";
  children: React.ReactNode;
}) {
  const plan = PLAN_META[user.plan] ?? PLAN_META.free;
  return (
    <div className="flex min-h-screen">
      {/* mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[#0a0913]/90 px-4 backdrop-blur md:hidden">
        <Link href="/dashboard"><Logo size={26} /></Link>
        <LogoutButton />
      </div>

      {/* sidebar */}
      <aside className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[var(--line)] bg-[#0a0913]/95 backdrop-blur md:sticky md:top-0 md:h-screen md:w-64 md:flex-col md:justify-start md:border-r md:border-t-0 md:bg-[#0a0913]">
        <div className="hidden px-5 pb-6 pt-6 md:block">
          <Link href="/"><Logo /></Link>
        </div>
        <nav className="flex w-full flex-row justify-around md:flex-col md:gap-1 md:px-3">
          <NavItem href="/dashboard" icon="▦" label="Campaigns" active={active === "dashboard"} />
          <NavItem href="/plans" icon="◈" label="Plans" active={active === "plans"} />
          <NavItem href="/dashboard/settings" icon="⚙" label="Settings" active={active === "settings"} />
        </nav>

        <div className="mt-auto hidden w-full flex-col gap-3 px-4 pb-5 md:flex">
          <Link
            href="/plans"
            className={`chip w-full justify-center py-1.5 ${plan.cls}`}
            title="Current plan — click to manage"
          >
            ✦ {plan.label} plan
          </Link>
          <div className="truncate rounded-xl bg-black/30 px-3 py-2 text-xs text-[var(--ink-faint)]" title={user.email}>
            {user.email}
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* main */}
      <div className="min-w-0 flex-1 px-4 pb-24 pt-20 md:px-8 md:pb-10 md:pt-8">
        {children}
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-violet-500/15 text-white shadow-glow ring-1 ring-violet-500/30"
          : "text-[var(--ink-dim)] hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span className={active ? "text-lime" : "text-[var(--ink-faint)]"}>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
