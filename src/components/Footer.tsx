import { COMMIT_SCURT, DATA_BUILD } from "@/lib/build-info";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted">
        <p className="tabular">
          Autoeducat STEP Lab — prototip · versiunea {DATA_BUILD} · {COMMIT_SCURT}
        </p>
        <p className="mt-1">
          Prototip realizat de Autoeducat SRL din resurse proprii. Date exclusiv sintetice. Fără logo-uri UE/PEO —
          proiectul nu este finanțat.
        </p>
      </div>
    </footer>
  );
}
