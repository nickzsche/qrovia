"use client";

import { useEffect, useState } from "react";

export function QrPreview({
  payload,
  fgColor,
  bgColor,
  size,
  margin,
  ecc,
}: {
  payload: string;
  fgColor: string;
  bgColor: string;
  size: number;
  margin: number;
  ecc: "L" | "M" | "Q" | "H";
}) {
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setErr("");
        const res = await fetch("/api/qr/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: payload, fgColor, bgColor, size, margin, ecc }),
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          setErr(j?.error ?? "Could not generate QR");
          return;
        }
        const j = (await res.json()) as { svg: string };
        setSvg(j.svg);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setErr("Network error");
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [payload, fgColor, bgColor, size, margin, ecc]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-3"
        aria-live="polite"
      >
        {svg ? (
          <div
            className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <span className="text-xs font-medium text-neutral-500">
            {err || "Live preview…"}
          </span>
        )}
      </div>
      {err ? (
        <p className="text-center text-xs font-medium text-red-400">{err}</p>
      ) : (
        <p className="max-w-[220px] truncate text-center text-xs text-[var(--ink-faint)]">
          {payload}
        </p>
      )}
    </div>
  );
}
