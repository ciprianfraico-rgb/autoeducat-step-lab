import Link from "next/link";
import { SchemaArhitectura } from "@/components/SchemaArhitectura";
import { Eticheta, Sectiune } from "@/components/ui";

export default function Acasa() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <Eticheta ton="primary">Prototip funcțional · date sintetice</Eticheta>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Laboratorul virtual comun Autoeducat STEP Lab
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          Un singur laborator virtual servește ambele cursuri STEP-LLL: securitatea sistemelor informatice și
          guvernanța IA generative în organizații. Aici vedeți cum arată practica — detecție și investigare pe date
          sintetice, respectiv un proiect RAG rulat integral în browser.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/lab/securitate"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white no-underline hover:opacity-90"
          >
            Deschide laboratorul de securitate
          </Link>
          <Link
            href="/lab/ia"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white no-underline hover:opacity-90"
          >
            Deschide laboratorul de IA
          </Link>
          <Link
            href="/scenarii"
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground no-underline hover:bg-background"
          >
            Vezi cele 11 laboratoare
          </Link>
        </div>
        <div className="mt-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
          Prototip realizat de Autoeducat SRL din resurse proprii — versiunea completă este planificată înaintea primei
          cohorte.
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Sectiune titlu="Cui servește" descriere="Două cursuri de câte 180 de ore (60 teorie + 120 practică).">
          <ul className="space-y-3 text-sm">
            <li>
              <span className="font-semibold text-foreground">Cursul 1 — Securitatea sistemelor informatice</span>{" "}
              (COR 252913). Cinci laboratoare reconstruiesc sintetic incidente documentate: igienă și reziliență,
              aplicații și identitate, acces la distanță, e-mail și controale financiare, managementul
              vulnerabilităților.
            </li>
            <li>
              <span className="font-semibold text-foreground">Cursul 2 — IA generativă în organizații</span> (COR
              251101). Șase laboratoare formează un singur proiect RAG al participantului: de la caz și prototip la
              evaluare, red-teaming, operare și dosar de conformitate.
            </li>
          </ul>
        </Sectiune>

        <Sectiune titlu="Principii" descriere="Se văd direct în laboratoare.">
          <ul className="space-y-2 text-sm text-foreground">
            <li>• Numai <strong>date sintetice</strong>, fără date personale reale.</li>
            <li>
              • Modele de limbaj cu <strong>ponderi deschise</strong>, rulate local (în browser, prin WebGPU), cu
              opțiunea de comparație prin API.
            </li>
            <li>• <strong>Mediu izolat</strong> pentru fiecare participant, recreat la fiecare cohortă.</li>
            <li>• Atacurile controlate vizează doar sistemul propriu al participantului.</li>
            <li>• Nimic nu se conectează la infrastructura unui angajator.</li>
          </ul>
        </Sectiune>
      </div>

      <Sectiune
        titlu="Arhitectura-țintă"
        descriere="Cele două zone ale laboratorului complet. Prototipul implementează straturile care se pot rula în browser; restul este documentat."
      >
        <SchemaArhitectura className="mx-auto max-w-3xl" />
        <p className="mt-4 text-sm text-muted">
          Detalii și calendar pe pagina <Link href="/arhitectura">Arhitectură</Link>.
        </p>
      </Sectiune>
    </div>
  );
}
