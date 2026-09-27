import type { Metadata } from "next";
import Link from "next/link";
import { ETICHETE_CURS, SCENARII, type Curs } from "@/lib/scenarii";
import { Eticheta } from "@/components/ui";

export const metadata: Metadata = {
  title: "Scenarii",
  description: "Catalogul celor 11 laboratoare — L1–L5 și LAB-IA1–LAB-IA6.",
};

const VERBE: { cheie: keyof (typeof SCENARII)[number]["verbe"]; eticheta: string }[] = [
  { cheie: "intelegere", eticheta: "Înțelegere" },
  { cheie: "dezvoltare", eticheta: "Dezvoltare" },
  { cheie: "testare", eticheta: "Testare" },
  { cheie: "adaptare", eticheta: "Adaptare" },
];

export default function CatalogScenarii() {
  const grupuri: Curs[] = ["curs1", "curs2"];
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cele 11 laboratoare</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Fiecare card arată cursul, orele de practică, competențele, ce face participantul și rezultatul verificabil,
          plus banda celor patru verbe ale apelului: Înțelegere · Dezvoltare · Testare · Adaptare.
        </p>
      </header>

      {grupuri.map((curs) => (
        <section key={curs} className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{ETICHETE_CURS[curs]}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {SCENARII.filter((s) => s.curs === curs).map((s) => (
              <Link
                key={s.id}
                href={`/scenarii/${s.id}`}
                className="group flex flex-col rounded-xl border border-border bg-surface p-5 no-underline shadow-sm transition hover:border-accent hover:shadow"
              >
                <div className="flex items-center justify-between gap-2">
                  <Eticheta ton={curs === "curs1" ? "primary" : "accent"}>{s.cod}</Eticheta>
                  <span className="text-xs text-muted tabular">{s.orePractica} h practică</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-accent">{s.titlu}</h3>
                <p className="mt-2 text-sm text-muted">{s.faceParticipantul}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium text-foreground">Rezultat verificabil: </span>
                  <span className="text-muted">{s.rezultatVerificabil}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {s.competente.map((c) => (
                    <span key={c} className="rounded bg-background px-1.5 py-0.5 text-[11px] text-muted">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-4 overflow-hidden rounded-lg border border-border text-[11px]">
                  {VERBE.map((v, i) => (
                    <div key={v.cheie} className={`p-2 ${i < 3 ? "border-r border-border" : ""}`}>
                      <div className="font-semibold text-foreground">{v.eticheta}</div>
                      <div className="mt-1 text-muted">{s.verbe[v.cheie]}</div>
                    </div>
                  ))}
                </div>
                {s.demo && (
                  <span className="mt-3 text-sm font-medium text-accent">Are demonstrație live →</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
