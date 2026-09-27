import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ETICHETE_CURS, SCENARII, scenariuDupaId } from "@/lib/scenarii";
import { Eticheta, Sectiune } from "@/components/ui";

export function generateStaticParams() {
  return SCENARII.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/scenarii/[id]">): Promise<Metadata> {
  const { id } = await params;
  const s = scenariuDupaId(id);
  if (!s) return { title: "Scenariu inexistent" };
  return { title: `${s.cod} — ${s.titlu}`, description: s.faceParticipantul };
}

function Lista({ titlu, elemente }: { titlu: string; elemente: string[] }) {
  return (
    <Sectiune titlu={titlu}>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
        {elemente.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ol>
    </Sectiune>
  );
}

export default async function FisaScenariu({ params }: PageProps<"/scenarii/[id]">) {
  const { id } = await params;
  const s = scenariuDupaId(id);
  if (!s) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/scenarii">← Toate laboratoarele</Link>
      </nav>

      <header className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Eticheta ton={s.curs === "curs1" ? "primary" : "accent"}>{s.cod}</Eticheta>
          <span className="text-xs text-muted">{ETICHETE_CURS[s.curs]}</span>
          <span className="ml-auto text-xs text-muted tabular">{s.orePractica} h practică</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-foreground">{s.titlu}</h1>
        {s.incident && <p className="mt-2 text-sm text-muted">{s.incident}</p>}
        <div className="mt-4 flex flex-wrap gap-1">
          {s.competente.map((c) => (
            <span key={c} className="rounded bg-background px-2 py-0.5 text-xs text-muted">
              {c}
            </span>
          ))}
        </div>
        {s.demo && (
          <Link
            href={s.demo}
            className="mt-5 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white no-underline hover:opacity-90"
          >
            Deschide demonstrația live →
          </Link>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Sectiune titlu="Ce face participantul">
          <p className="text-sm text-foreground">{s.faceParticipantul}</p>
          <p className="mt-3 text-sm">
            <span className="font-medium text-foreground">Rezultat verificabil: </span>
            <span className="text-muted">{s.rezultatVerificabil}</span>
          </p>
        </Sectiune>

        <Sectiune titlu="Cele patru verbe ale apelului">
          <dl className="space-y-2 text-sm">
            {(
              [
                ["Înțelegere", s.verbe.intelegere],
                ["Dezvoltare", s.verbe.dezvoltare],
                ["Testare", s.verbe.testare],
                ["Adaptare", s.verbe.adaptare],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-background p-3">
                <dt className="font-semibold text-foreground">{k}</dt>
                <dd className="mt-0.5 text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </Sectiune>
      </div>

      <Sectiune titlu="Obiective">
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
          {s.obiective.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </Sectiune>

      <Lista titlu="Pași" elemente={s.pasi} />

      <div className="grid gap-6 md:grid-cols-2">
        <Sectiune titlu="Date folosite">
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
            {s.dateFolosite.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </Sectiune>
        <Sectiune titlu="Criterii de evaluare">
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
            {s.criteriiEvaluare.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Sectiune>
      </div>
    </div>
  );
}
