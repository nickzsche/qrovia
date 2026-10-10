import { requireUser } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";

export const metadata = { title: "Settings · Qrovia" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <DashboardShell user={user} active="settings">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Settings</h1>
        <div className="card mt-8 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink-dim)]">Account</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-[var(--ink-faint)]">Name</dt>
              <dd className="font-medium">{user.name?.trim() || user.email.split("@")[0]}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-[var(--ink-faint)]">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-[var(--ink-faint)]">Plan</dt>
              <dd className="font-medium capitalize">{user.plan}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-[var(--ink-faint)]">Member since</dt>
              <dd className="font-medium">
                {user.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card mt-6 p-6 opacity-70">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink-dim)]">Coming soon</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--ink-dim)]">
            <li>• Custom domains (yourbrand.com/r/code)</li>
            <li>• Offline geo lookup via MaxMind mmdb</li>
            <li>• Team seats &amp; shared folders (Business)</li>
            <li>• Webhooks on scan events</li>
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
