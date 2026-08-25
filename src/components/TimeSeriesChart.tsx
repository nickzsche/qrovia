"use client";

import { useState } from "react";

export function TimeSeriesChart({
  series,
}: {
  series: Array<{ date: string; count: number }>;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((s) => s.count));
  const W = 720;
  const H = 180;
  const PAD_B = 22;
  const barAreaH = H - PAD_B;
  const n = series.length || 1;
  const gap = 2;
  const bw = Math.max(3, W / n - gap);

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Scans per day, last 30 days"
        onMouseLeave={() => setHover(null)}
      >
        {/* horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1="0"
            x2={W}
            y1={barAreaH - f * barAreaH}
            y2={barAreaH - f * barAreaH}
            stroke="#241f38"
            strokeDasharray="3 5"
          />
        ))}
        {series.map((s, i) => {
          const h = (s.count / max) * (barAreaH - 8);
          const x = i * (W / n);
          const isHover = hover === i;
          const isLast = i === n - 1;
          return (
            <g key={s.date}>
              {isHover && (
                <>
                  <rect x={x} y={0} width={bw + gap} height={barAreaH} fill="rgba(139,92,246,0.08)" />
                  <text
                    x={Math.min(W - 90, Math.max(30, x + bw / 2))}
                    y={14}
                    textAnchor="middle"
                    fill="#ece9f6"
                    fontSize="12"
                    fontWeight="700"
                  >
                    {s.count} scans · {s.date.slice(5)}
                  </text>
                </>
              )}
              <rect
                x={x}
                y={barAreaH - h}
                width={bw}
                height={h}
                rx={3}
                fill={isLast ? "#a3e635" : "url(#tsgrad)"}
                opacity={hover == null || isHover ? (isLast ? 1 : 0.9) : 0.45}
                onMouseEnter={() => setHover(i)}
              />
            </g>
          );
        })}
        <defs>
          <linearGradient id="tsgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        {/* x labels: first, middle, last */}
        {[0, Math.floor((n - 1) / 2), n - 1].map((i) =>
          series[i] ? (
            <text
              key={i}
              x={Math.min(W - 24, Math.max(14, i * (W / n) + bw / 2))}
              y={H - 6}
              textAnchor="middle"
              fill="#6b6590"
              fontSize="10"
            >
              {series[i].date.slice(5)}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
