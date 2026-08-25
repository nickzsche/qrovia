/**
 * Pure-CSS/SVG phone mockup showing a live-looking scan moment.
 * Server component — zero client JS.
 */
export function PhoneMockup() {
  const bars = [
    [30, 62, 38, 55, 70, 45, 82, 58, 66, 74, 52, 88, 60, 78, 95],
  ][0];

  return (
    <div className="animate-floaty relative mx-auto w-[250px] sm:w-[280px]">
      {/* glow behind phone */}
      <div className="absolute inset-0 -z-10 scale-110 rounded-[3rem] bg-gradient-to-br from-violet-600/40 via-transparent to-lime-400/25 blur-2xl" />

      <div className="rounded-[2.6rem] border border-[#2c2647] bg-[#0b0915] p-2.5 shadow-2xl">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-[#12101f] to-[#0a0814] pb-6">
          {/* notch */}
          <div className="mx-auto mt-2.5 h-5 w-24 rounded-full bg-black/80" />

          <div className="px-5 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/90">
              Qrovia scan
            </p>
            <p className="mt-1 text-lg font-extrabold leading-tight text-white">
              Menu — Summer
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--ink-faint)]">
              qrovia.app/r/menutogo → example.com/menu
            </p>
          </div>

          {/* mini QR card */}
          <div className="mx-5 mt-4 rounded-xl border border-[var(--line)] bg-white p-3">
            <svg viewBox="0 0 21 21" className="h-full w-full text-black" fill="currentColor" shapeRendering="crispEdges">
              <path d="M0 0h7v7H0zM2 2v3h3V2zM14 0h7v7h-7zm2 2v3h3V2zM0 14h7v7H0zm2 2v3h3v-3zM9 0h1v1H9zM11 2h1v2h-1zM9 4h2v1H9zM12 5h1v1h-1zM9 7h1v1H9zM13 9h1v1h-1zM15 8h2v1h-2zM18 9h1v2h-1zM20 8h1v1h-1zM0 9h1v2H0zM2 9h2v1H2zM4 11h2v1H4zM1 12h1v1H1zM9 9h2v2H9zM11 11h1v1h-1zM9 13h1v2H9zM11 14h2v1h-2zM9 16h1v1H9zM11 17h2v1h-2zM14 12h1v2h-1zM15 15h2v1h-2zM18 14h1v2h-1zM19 17h2v1h-2zM14 17h1v2h-1zM16 19h2v1h-2zM19 19h2v2h-2z"/>
            </svg>
          </div>

          {/* chart */}
          <div className="mx-5 mt-4 rounded-xl border border-[var(--line)] bg-black/30 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ink-faint)]">Scans · 14d</p>
              <span className="chip bg-lime/15 text-lime">+38%</span>
            </div>
            <svg viewBox="0 0 140 34" className="mt-2 h-9 w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a3e635" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#a3e635" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {bars.map((v, i) => (
                <rect
                  key={i}
                  x={i * 10 + 1}
                  y={34 - (v / 100) * 32}
                  width="6"
                  height={(v / 100) * 32}
                  rx="1.5"
                  fill={i === bars.length - 1 ? "#a3e635" : "#8b5cf6"}
                  opacity={i === bars.length - 1 ? 1 : 0.75}
                />
              ))}
              <rect width="140" height="34" fill="url(#pg)" opacity="0" />
            </svg>
          </div>

          {/* device split */}
          <div className="mx-5 mt-3 flex gap-2">
            <div className="flex-1 rounded-xl border border-[var(--line)] bg-black/30 p-2.5">
              <p className="text-[10px] text-[var(--ink-faint)]">Mobile</p>
              <p className="text-sm font-bold text-white">72%</p>
            </div>
            <div className="flex-1 rounded-xl border border-[var(--line)] bg-black/30 p-2.5">
              <p className="text-[10px] text-[var(--ink-faint)]">Desktop</p>
              <p className="text-sm font-bold text-white">21%</p>
            </div>
            <div className="flex-1 rounded-xl border border-[var(--line)] bg-black/30 p-2.5">
              <p className="text-[10px] text-[var(--ink-faint)]">Tablet</p>
              <p className="text-sm font-bold text-white">7%</p>
            </div>
          </div>
        </div>
      </div>

      {/* floating scan line */}
      <div className="scan-line pointer-events-none absolute left-6 right-6 h-px bg-gradient-to-r from-transparent via-lime to-transparent shadow-limeglow" />
    </div>
  );
}
