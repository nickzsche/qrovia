"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      disabled={busy}
      className="rounded-xl border border-[var(--line)] px-3.5 py-2 text-xs font-semibold text-[var(--ink-dim)] transition-colors hover:border-red-500/40 hover:text-red-300 disabled:opacity-50 md:w-full"
    >
      Log out
    </button>
  );
}
