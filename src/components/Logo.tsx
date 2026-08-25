export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="relative grid place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-glow"
        style={{ width: size, height: size }}
      >
        {/* mini QR glyph */}
        <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="currentColor">
          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zM13 3h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zM13 13h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3z" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-lime" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Qro<span className="gradient-text">via</span>
      </span>
    </span>
  );
}
