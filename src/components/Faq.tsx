import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

const FAQS = [
  {
    q: "What exactly is a dynamic QR code?",
    a: "The printed QR doesn't contain your final URL. It contains a short Qrovia link (/r/x7kq2m). When someone scans it, our server instantly redirects them to your current destination — which you can change any time, even after the code is printed on 10,000 flyers.",
  },
  {
    q: "When would I use a static code instead?",
    a: "Static codes encode your content directly (URL, text, Wi-Fi, vCard) and work forever with no dependency on any server — but they can never be changed and scans can't be tracked. Dynamic codes are editable and measurable; static is permanent but frozen.",
  },
  {
    q: "Do QR codes expire on Qrovia?",
    a: "No. As long as your subscription is active, your dynamic codes keep redirecting. You can also pause a code temporarily — scanners see a friendly 'link paused' page instead of an error.",
  },
  {
    q: "What analytics do I get?",
    a: "Every scan is logged: total + unique counts (distinct device per day), 30-day time series, device / operating-system / browser breakdowns and top referrers. Pro plans export everything as CSV.",
  },
  {
    q: "Can I style the QR to match my brand?",
    a: "Yes — foreground color, background color, size, quiet-zone margin and error-correction level, with a live preview before you download SVG or print-ready PNG.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="text-center text-2xl font-extrabold tracking-tight md:text-4xl">
        Questions, <span className="gradient-text">answered</span>
      </h2>
      <div className="mt-10 space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="card group px-5 py-4 open:border-violet-500/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold md:text-base">
              {f.q}
              <span className="text-[var(--ink-faint)] transition-transform group-open:rotate-45">＋</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-dim)]">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-[var(--ink-faint)]">
        Still curious? <Link href="/register" className="text-lime hover:underline">Try the live demo →</Link>
      </p>
    </section>
  );
}
