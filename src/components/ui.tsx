import type { ReactNode } from "react";

export function Sectiune({
  titlu,
  descriere,
  children,
  id,
}: {
  titlu: string;
  descriere?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{titlu}</h2>
      {descriere && <p className="mt-1 text-sm text-muted">{descriere}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Ton = "neutru" | "ok" | "danger" | "warning" | "accent" | "primary";

const TONURI: Record<Ton, string> = {
  neutru: "bg-background text-muted border-border",
  ok: "bg-ok-soft text-ok border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  accent: "bg-accent-soft text-accent border-transparent",
  primary: "bg-primary-soft text-primary border-transparent",
};

export function Eticheta({ ton = "neutru", children }: { ton?: Ton; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONURI[ton]}`}>
      {children}
    </span>
  );
}

export function Metrica({ eticheta, valoare, sufix }: { eticheta: string; valoare: ReactNode; sufix?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs text-muted">{eticheta}</div>
      <div className="mt-1 text-xl font-semibold tabular text-foreground">
        {valoare}
        {sufix && <span className="ml-1 text-sm font-normal text-muted">{sufix}</span>}
      </div>
    </div>
  );
}
