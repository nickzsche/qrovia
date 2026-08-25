import { requireUser } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";
import { PlansClient } from "@/components/PlansClient";

export const metadata = { title: "Plans · Qrovia" };
export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const user = await requireUser();
  return (
    <DashboardShell user={user} active="plans">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Plans</h1>
        <p className="mt-1 text-sm text-[var(--ink-dim)]">
          You&apos;re currently on <b className="text-white">{user.plan}</b>. Billing is stubbed in this
          demo — selecting a plan just updates your workspace.
        </p>
        <PlansClient currentPlan={user.plan} />
      </div>
    </DashboardShell>
  );
}
