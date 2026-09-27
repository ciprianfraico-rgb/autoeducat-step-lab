import type { Metadata } from "next";
import { SchemaArhitectura } from "@/components/SchemaArhitectura";
import { Eticheta, Sectiune } from "@/components/ui";

export const metadata: Metadata = {
  title: "Arhitectură",
  description: "Arhitectura-țintă a laboratorului virtual complet și calendarul de implementare.",
};

export default function Arhitectura() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Arhitectura-țintă</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Laboratorul complet are două zone izolate pe participant. Prototipul de față rulează în browser straturile
          care se pot demonstra fără server (detecție pe date sintetice, RAG prin WebGPU). Restul infrastructurii este
          documentat aici ca arhitectură-țintă, urmând să fie implementat în luna L4, înainte de prima cohortă.
        </p>
      </header>

      <Sectiune titlu="Schema celor două zone">
        <SchemaArhitectura className="mx-auto max-w-3xl" />
      </Sectiune>

      <div className="grid gap-6 md:grid-cols-2">
        <Sectiune titlu="Zona de securitate">
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
            <li>Rețele virtuale segmentate și firewall între segmente.</li>
            <li>IDS/IPS cu Suricata, care emite alerte și fluxuri în format EVE JSON.</li>
            <li>SIEM (Wazuh sau ELK) pentru corelarea evenimentelor și regulile de detecție.</li>
            <li>Mașini intenționat vulnerabile pentru exercițiile de scanare și remediere.</li>
            <li>Scaner de vulnerabilități (OpenVAS/Greenbone).</li>
            <li>Stație de investigație criminalistică digitală.</li>
          </ul>
        </Sectiune>
        <Sectiune titlu="Zona de IA">
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
            <li>Server de inferență pentru modele cu ponderi deschise.</li>
            <li>Bază de date vectorială pentru indexul RAG.</li>
            <li>Orchestrare RAG cu agent cu instrumente limitate.</li>
            <li>Instrumente de evaluare (seturi de test, red-teaming, human-in-the-loop).</li>
            <li>Monitorizare: latență, cost, derivă, consum de energie.</li>
            <li>Suport pentru dosarul de conformitate (AI Act, ISO/IEC 42001).</li>
          </ul>
        </Sectiune>
      </div>

      <Sectiune titlu="Izolare, capacitate și jurnalizare">
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
          <li>Fiecare participant are cont individual și un mediu izolat, recreat la fiecare cohortă.</li>
          <li>Capacitate-țintă: 28 de participanți simultan pe cohortă.</li>
          <li>Jurnalizarea activității pentru evidența practicii, fără date personale reale.</li>
          <li>Laboratorul nu se conectează la infrastructura niciunui angajator; se folosesc numai date sintetice sau anonimizate.</li>
        </ul>
      </Sectiune>

      <Sectiune titlu="Ce este live acum vs. ce este documentat">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-4 font-medium">Strat</th>
                <th className="py-2 pr-4 font-medium">În prototip</th>
                <th className="py-2 font-medium">În versiunea completă</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Detecție și investigare", "Explorer de evenimente, motor de reguli, cronologie, custodie — pe date sintetice, în browser", "Suricata + SIEM real, pe trafic din mașini de laborator"],
                ["RAG și evaluare", "Indexare, recuperare, generare cu model cu ponderi deschise prin WebGPU, evaluare și red-teaming", "Server de inferență dedicat, bază vectorială, orchestrare"],
                ["Izolare", "Mediu per-sesiune în browser", "Mediu virtual izolat per participant, recreat la cohortă"],
                ["Infrastructură ofensivă", "Scenarii pe date sintetice", "Mașini intenționat vulnerabile, scaner, segmentare"],
              ].map((r) => (
                <tr key={r[0]}>
                  <td className="py-2 pr-4 font-medium text-foreground">{r[0]}</td>
                  <td className="py-2 pr-4 text-muted">{r[1]}</td>
                  <td className="py-2 text-muted">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sectiune>

      <Sectiune titlu="Calendar">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Eticheta ton="ok">Acum — prototip demonstrabil</Eticheta>
          <span aria-hidden className="text-muted">→</span>
          <Eticheta ton="accent">Luna L4 — versiunea completă</Eticheta>
          <span aria-hidden className="text-muted">→</span>
          <Eticheta ton="primary">Luna L5 — startul primului val</Eticheta>
        </div>
        <p className="mt-3 text-sm text-muted">
          Dimensionarea resurselor (număr de servere, capacitate de calcul, furnizori) este de stabilit la
          implementare; prototipul nu inventează costuri sau furnizori.
        </p>
      </Sectiune>
    </div>
  );
}
