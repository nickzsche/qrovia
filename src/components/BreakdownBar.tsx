export function BreakdownBar({
  title,
  rows,
  accent,
  emptyHint,
}: {
  title: string;
  rows: Array<{ label: string; count: number }>;
  accent: string;
  emptyHint?: string;
}) {
  const total = rows.reduce((a, r) => a + r.count, 0);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--ink-dim)]">{title}</h3>
        <span className="text-xs text-[var(--ink-faint)]">{total} total</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ink-faint)]">{emptyHint ?? "No data yet."}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{r.label}</span>
                <span className="text-xs text-[var(--ink-dim)]">
                  {r.count} · {total > 0 ? Math.round((r.count / total) * 100) : 0}%
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${total > 0 ? (r.count / total) * 100 : 0}%`,
                    background: `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
