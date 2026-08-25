import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[#0a0912]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo size={30} />
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-dim)]">
            QR codes that never die. Print once, change destination anytime,
            watch scans roll in.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-faint)]">Product</p>
            <ul className="space-y-2 text-sm text-[var(--ink-dim)]">
              <li><Link className="hover:text-white" href="/#how">How it works</Link></li>
              <li><Link className="hover:text-white" href="/plans">Pricing</Link></li>
              <li><Link className="hover:text-white" href="/login">Log in</Link></li>
              <li><Link className="hover:text-white" href="/register">Create account</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-faint)]">Features</p>
            <ul className="space-y-2 text-sm text-[var(--ink-dim)]">
              <li>Dynamic QR codes</li>
              <li>Scan analytics</li>
              <li>CSV export</li>
              <li>Pause &amp; schedule</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--ink-faint)]">Company</p>
            <ul className="space-y-2 text-sm text-[var(--ink-dim)]">
              <li>About — soon</li>
              <li>Contact — soon</li>
              <li>All systems normal</li>
              <li>© 2026 Qrovia</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
