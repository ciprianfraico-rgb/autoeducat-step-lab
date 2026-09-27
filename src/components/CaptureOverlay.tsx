"use client";

import { useEffect, useState } from "react";

/**
 * Overlay mic în colțul de jos, cu URL-ul și data/ora capturii.
 * Se activează cu ?capturi=1 (folosit de scripts/capturi.ts), ca să nu apară în uz normal.
 */
export function CaptureOverlay() {
  const [info, setInfo] = useState<{ url: string; ora: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("capturi")) return;
    // După prima pictură, ca să nu declanșăm re-randări în cascadă în efect.
    const id = requestAnimationFrame(() => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      const ora = `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
      setInfo({ url: window.location.origin + window.location.pathname, ora });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!info) return null;
  return (
    <div className="pointer-events-none fixed bottom-2 right-2 z-50 rounded-md border border-border bg-surface/95 px-2 py-1 text-[11px] leading-tight text-muted shadow-sm tabular">
      <div className="font-medium text-foreground">{info.url}</div>
      <div>Captură: {info.ora}</div>
    </div>
  );
}
