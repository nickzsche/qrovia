import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { PhoneMockup } from "@/components/PhoneMockup";
import { PricingTable } from "@/components/PricingTable";
import { Faq } from "@/components/Faq";
import { ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  await ensureSeed();
  return (
    <main className="overflow-x-clip">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)]/60 bg-[#08070d]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--ink-dim)] md:flex">
            <a href="/#how" className="hover:text-white">How it works</a>
            <a href="/#pricing" className="hover:text-white">Pricing</a>
            <a href="/#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn-ghost !px-4 !py-2 text-sm">Log in</Link>
            <Link href="/register" className="btn-primary !px-4 !py-2 text-sm">Get started</Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="hero-glow relative">
        <div className="grid-lines absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 md:grid-cols-2 md:pb-28 md:pt-24">
          <div className="fade-up">
            <span className="chip border border-violet-500/30 bg-violet-500/10 text-violet-200">
              ⚡ Print once · change forever
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              QR codes that <span className="gradient-text">never die</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--ink-dim)] md:text-lg">
              Qrovia QR codes point to a smart short link you control. Change the
              destination any time — even after printing — and see every scan:
              when, where from, on what device.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="btn-lime text-base">Create your first code →</Link>
              <Link href="/login" className="btn-ghost text-base">Try the live demo</Link>
            </div>
            <p className="mt-4 text-xs text-[var(--ink-faint)]">
              Demo account seeded for you: <span className="text-[var(--ink-dim)]">demo@qrovia.app / demo1234</span>
            </p>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* dynamic vs static */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-2xl font-extrabold tracking-tight md:text-4xl">
          Dynamic vs static — <span className="gradient-text">know the difference</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[var(--ink-dim)] md:text-base">
          Most QR generators hand you a frozen image. Qrovia gives you a control panel.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* static card */}
          <div className="card p-7 opacity-90">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-xl">🧊</span>
              <div>
                <p className="font-bold">Static QR</p>
                <p className="text-xs text-[var(--ink-faint)]">The classic, frozen in plastic</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-[var(--ink-dim)]">
              <li className="flex gap-2"><span className="text-red-400">✕</span> Destination burned in at creation</li>
              <li className="flex gap-2"><span className="text-red-400">✕</span> Wrong URL printed = reprint everything</li>
              <li className="flex gap-2"><span className="text-red-400">✕</span> No scans tracked, ever</li>
              <li className="flex gap-2"><span className="text-lime">✓</span> Works with no server dependency</li>
            </ul>
          </div>

          {/* dynamic card */}
          <div className="card relative overflow-hidden border-violet-500/50 p-7 shadow-glow">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-violet-600/20 blur-2xl" />
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-xl">⚡</span>
              <div>
                <p className="font-bold">Dynamic QR <span className="ml-1 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lime">Qrovia</span></p>
                <p className="text-xs text-[var(--ink-faint)]">Editable, measurable, alive</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-[var(--ink-dim)]">
              <li className="flex gap-2"><span className="text-lime">✓</span> Edit destination anytime — even after printing</li>
              <li className="flex gap-2"><span className="text-lime">✓</span> Pause for maintenance, resume in one click</li>
              <li className="flex gap-2"><span className="text-lime">✓</span> Every scan logged: time, device, browser, referrer</li>
              <li className="flex gap-2"><span className="text-lime">✓</span> One code, infinite campaigns</li>
            </ul>
          </div>
        </div>

        {/* how it works strip */}
        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            ["Create", "Pick dynamic, paste your destination, style your QR with live preview."],
            ["Print anywhere", "Download crisp SVG or 512px PNG for menus, packaging, flyers."],
            ["Redirect & learn", "Scans hit /r/<code>, users get forwarded instantly, you watch analytics."],
          ].map(([t, d], i) => (
            <li key={t} className="card flex gap-4 p-5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-sm font-bold text-white">{i + 1}</span>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ink-dim)]">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* pricing */}
      <section id="pricing" className="bg-[#0b0913] py-20">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-center text-2xl font-extrabold tracking-tight md:text-4xl">
            Simple pricing, <span className="gradient-text">serious ROI</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-[var(--ink-dim)]">
            One reprint avoided pays for a year of Pro.
          </p>
          <div className="mt-12">
            <PricingTable />
          </div>
          <p className="mt-6 text-center text-xs text-[var(--ink-faint)]">
            Upgrade buttons are wired to plan selection — billing is stubbed in this demo.
          </p>
        </div>
      </section>

      <Faq />

      {/* final CTA */}
      <section className="hero-glow border-t border-[var(--line)]">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Stop printing dead links.<br />
            <span className="gradient-text">Start printing portals.</span>
          </h2>
          <div className="mt-8 flex justify-center">
            <Link href="/register" className="btn-lime text-base">Get started free →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
