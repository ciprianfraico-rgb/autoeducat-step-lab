"use client";

import { useMemo, useState } from "react";
import { genereazaSetDate, SEED_IMPLICIT } from "@/lib/securitate/generator";
import { ETICHETE_FAZA, ETICHETE_SURSA, type Eveniment, type Sursa } from "@/lib/securitate/tipuri";
import { evalueazaRegula, type RezultatEvaluare } from "@/lib/securitate/reguli";
import { REGULI_MODEL } from "@/lib/securitate/reguli-model";
import { procesVerbalMarkdown, sha256, type IntrareCustodie } from "@/lib/custodie";
import { descarcaText, descarcaPdfDinMarkdown } from "@/lib/descarca";
import { Eticheta } from "@/components/ui";

type Tab = "explorer" | "reguli" | "investigare";
const SURSE: Sursa[] = ["suricata", "auth", "web", "email"];

export function LabSecuritate() {
  const set = useMemo(() => genereazaSetDate(SEED_IMPLICIT), []);
  const [tab, setTab] = useState<Tab>("explorer");
  const [marcate, setMarcate] = useState<Set<string>>(new Set());

  function comutaMarcaj(id: string) {
    setMarcate((prev) => {
      const nou = new Set(prev);
      if (nou.has(id)) nou.delete(id);
      else nou.add(id);
      return nou;
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Laboratorul de securitate</h1>
          <Eticheta ton="primary">L3 · cu elemente din L2 și L4</Eticheta>
        </div>
        <p className="mt-2 max-w-3xl text-muted">
          Detecție și investigare pe un set de date <strong>sintetic</strong> generat determinist (seed{" "}
          <span className="tabular">{set.seed}</span>) pentru rețeaua fictivă „{set.organizatie}”, data{" "}
          {set.data}. Scenariul încorporat, reconstituit integral sintetic: SQL injection → scanare → brute-force pe VPN
          → autentificare reușită → mișcare laterală → exfiltrare, plus o regulă de redirecționare și un e-mail cu
          anteturi falsificate.
        </p>
        <div className="mt-2 text-xs text-muted">
          {set.evenimente.length} evenimente · adrese din blocuri de documentație (RFC 5737), domenii „.example”.
        </div>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Secțiunile laboratorului">
        {(
          [
            ["explorer", "Explorer de evenimente"],
            ["reguli", "Reguli de detecție"],
            ["investigare", `Investigare (${marcate.size} marcate)`],
          ] as const
        ).map(([val, txt]) => (
          <button
            key={val}
            role="tab"
            aria-selected={tab === val}
            onClick={() => setTab(val)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              tab === val ? "border-primary bg-primary text-white" : "border-border bg-surface text-foreground hover:bg-background"
            }`}
          >
            {txt}
          </button>
        ))}
      </div>

      {tab === "explorer" && <Explorer evenimente={set.evenimente} marcate={marcate} comuta={comutaMarcaj} />}
      {tab === "reguli" && <Reguli evenimente={set.evenimente} />}
      {tab === "investigare" && (
        <Investigare set={set} marcate={marcate} comuta={comutaMarcaj} />
      )}
    </div>
  );
}

/* ---------------- Explorer ---------------- */
function Explorer({
  evenimente,
  marcate,
  comuta,
}: {
  evenimente: Eveniment[];
  marcate: Set<string>;
  comuta: (id: string) => void;
}) {
  const [sursa, setSursa] = useState<Sursa | "toate">("toate");
  const [q, setQ] = useState("");
  const [dezvaluie, setDezvaluie] = useState(false);

  const filtrate = evenimente.filter((e) => {
    if (sursa !== "toate" && e.sursa !== sursa) return false;
    if (q) {
      const t = q.toLowerCase();
      return (
        e.mesaj.toLowerCase().includes(t) ||
        e.brut.toLowerCase().includes(t) ||
        (e.src_ip ?? "").includes(t) ||
        (e.user ?? "").toLowerCase().includes(t)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <label className="text-sm">
          <span className="mr-2 text-muted">Sursă:</span>
          <select
            value={sursa}
            onChange={(e) => setSursa(e.target.value as Sursa | "toate")}
            className="rounded border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="toate">Toate</option>
            {SURSE.map((s) => (
              <option key={s} value={s}>
                {ETICHETE_SURSA[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-sm">
          <span className="sr-only">Căutare</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută IP, utilizator, text din jurnal…"
            className="w-full rounded border border-border bg-background px-3 py-1 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={dezvaluie} onChange={(e) => setDezvaluie(e.target.checked)} />
          Arată etichetele de adevăr
        </label>
        <span className="text-xs text-muted tabular">{filtrate.length} rezultate</span>
      </div>

      <Cronologie evenimente={evenimente} marcate={marcate} />

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Marcaj</th>
              <th className="px-3 py-2 font-medium">Ora</th>
              <th className="px-3 py-2 font-medium">Sursă</th>
              <th className="px-3 py-2 font-medium">Tip</th>
              <th className="px-3 py-2 font-medium">Mesaj</th>
              {dezvaluie && <th className="px-3 py-2 font-medium">Etichetă</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrate.slice(0, 400).map((e) => (
              <tr key={e.id} className={marcate.has(e.id) ? "bg-warning-soft/40" : ""}>
                <td className="px-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={marcate.has(e.id)}
                    onChange={() => comuta(e.id)}
                    aria-label={`Marchează ${e.id}`}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 tabular text-muted">{e.ora.slice(11)}</td>
                <td className="px-3 py-1.5">{ETICHETE_SURSA[e.sursa]}</td>
                <td className="px-3 py-1.5 text-muted">{e.tip}</td>
                <td className="px-3 py-1.5">{e.mesaj}</td>
                {dezvaluie && (
                  <td className="px-3 py-1.5">
                    <Eticheta ton={e.faza === "benign" ? "neutru" : "danger"}>{ETICHETE_FAZA[e.faza]}</Eticheta>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtrate.length > 400 && (
          <div className="px-3 py-2 text-xs text-muted">Afișate primele 400 de rezultate. Filtrați pentru a restrânge.</div>
        )}
      </div>
    </div>
  );
}

function Cronologie({ evenimente, marcate }: { evenimente: Eveniment[]; marcate: Set<string> }) {
  const tMin = evenimente[0].t;
  const tMax = evenimente[evenimente.length - 1].t;
  const span = Math.max(1, tMax - tMin);
  const CULOARE: Record<string, string> = {
    benign: "#94a3b8",
    sqli: "#9f1239",
    scanare: "#b45309",
    brute_force: "#b91c1c",
    acces_initial: "#7c2d12",
    miscare_laterala: "#a21caf",
    exfiltrare: "#be123c",
    email_frauda: "#c2410c",
  };
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 text-sm font-medium text-foreground">Cronologia evenimentelor (12.03.2026)</div>
      <div className="relative h-12 w-full rounded bg-background">
        {evenimente.map((e) => {
          const x = ((e.t - tMin) / span) * 100;
          const benign = e.faza === "benign";
          return (
            <span
              key={e.id}
              title={`${e.ora.slice(11)} — ${e.mesaj}`}
              className="absolute top-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${x}%`,
                width: marcate.has(e.id) ? 9 : benign ? 3 : 5,
                height: marcate.has(e.id) ? 9 : benign ? 3 : 5,
                background: marcate.has(e.id) ? "#854d0e" : CULOARE[e.faza],
                opacity: benign ? 0.5 : 0.95,
                border: marcate.has(e.id) ? "2px solid #fde68a" : "none",
              }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
        <span className="tabular">{evenimente[0].ora.slice(11)}</span>
        <span className="ml-auto tabular">{evenimente[evenimente.length - 1].ora.slice(11)}</span>
      </div>
    </div>
  );
}

/* ---------------- Reguli ---------------- */
function Reguli({ evenimente }: { evenimente: Eveniment[] }) {
  const [idModel, setIdModel] = useState(REGULI_MODEL[0].id);
  const model = REGULI_MODEL.find((r) => r.id === idModel)!;
  const [yaml, setYaml] = useState(model.yaml);
  const [rez, setRez] = useState<RezultatEvaluare | null>(null);

  function incarca(id: string) {
    const m = REGULI_MODEL.find((r) => r.id === id)!;
    setIdModel(id);
    setYaml(m.yaml);
    setRez(null);
  }

  function testeaza() {
    setRez(evalueazaRegula(yaml, evenimente, model.fazeTinta));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <label className="text-sm">
            <span className="mr-2 text-muted">Regulă-model:</span>
            <select
              value={idModel}
              onChange={(e) => incarca(e.target.value)}
              className="rounded border border-border bg-background px-2 py-1 text-sm"
            >
              {REGULI_MODEL.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titlu}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-sm text-muted">{model.descriere}</p>
          <p className="mt-1 text-xs text-muted">
            Țintă (adevăr): {model.fazeTinta.map((f) => ETICHETE_FAZA[f]).join(", ")}
          </p>
        </div>
        <textarea
          value={yaml}
          onChange={(e) => setYaml(e.target.value)}
          spellCheck={false}
          rows={16}
          className="w-full rounded-xl border border-border bg-surface p-3 font-mono text-xs text-foreground"
          aria-label="Regulă în format YAML"
        />
        <button
          onClick={testeaza}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Testează regula
        </button>
      </div>

      <div className="space-y-3">
        {!rez && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Scrieți o regulă și apăsați „Testează”. Veți vedea adevărat-pozitive, fals-pozitive și ratări față de
            etichetele știute ale scenariului.
          </div>
        )}
        {rez?.eroare && (
          <div className="rounded-xl border border-danger bg-danger-soft p-4 text-sm text-danger">{rez.eroare}</div>
        )}
        {rez?.ok && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Kpi eticheta="Adevărat-pozitive" valoare={rez.metrici.tp} ton="ok" />
              <Kpi eticheta="Fals-pozitive" valoare={rez.metrici.fp} ton="warning" />
              <Kpi eticheta="Ratări" valoare={rez.metrici.fn} ton="danger" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Kpi eticheta="Precizie" valoare={`${(rez.metrici.precizie * 100).toFixed(0)}%`} />
              <Kpi eticheta="Rapel" valoare={`${(rez.metrici.rapel * 100).toFixed(0)}%`} />
              <Kpi eticheta="F1" valoare={rez.metrici.f1.toFixed(2)} />
            </div>
            <ListaId titlu="Adevărat-pozitive" ton="ok" ids={rez.adevaratPozitive} evenimente={evenimente} />
            <ListaId titlu="Fals-pozitive" ton="warning" ids={rez.falsPozitive} evenimente={evenimente} />
            <ListaId titlu="Ratări (evenimente-țintă nesemnalate)" ton="danger" ids={rez.ratari} evenimente={evenimente} />
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ eticheta, valoare, ton = "neutru" }: { eticheta: string; valoare: string | number; ton?: "ok" | "warning" | "danger" | "neutru" }) {
  const c = {
    ok: "border-ok/30 bg-ok-soft text-ok",
    warning: "border-warning/30 bg-warning-soft text-warning",
    danger: "border-danger/30 bg-danger-soft text-danger",
    neutru: "border-border bg-background text-foreground",
  }[ton];
  return (
    <div className={`rounded-lg border p-3 ${c}`}>
      <div className="text-xs opacity-80">{eticheta}</div>
      <div className="mt-1 text-2xl font-bold tabular">{valoare}</div>
    </div>
  );
}

function ListaId({
  titlu,
  ton,
  ids,
  evenimente,
}: {
  titlu: string;
  ton: "ok" | "warning" | "danger";
  ids: string[];
  evenimente: Eveniment[];
}) {
  if (ids.length === 0) return null;
  const dupaId = new Map(evenimente.map((e) => [e.id, e]));
  return (
    <details className="rounded-xl border border-border bg-surface p-3">
      <summary className="cursor-pointer text-sm font-medium text-foreground">
        <Eticheta ton={ton}>{ids.length}</Eticheta> <span className="ml-2">{titlu}</span>
      </summary>
      <ul className="mt-2 max-h-56 space-y-1 overflow-auto text-xs text-muted">
        {ids.slice(0, 60).map((id) => (
          <li key={id} className="tabular">
            <span className="text-foreground">{dupaId.get(id)?.ora.slice(11)}</span> — {dupaId.get(id)?.mesaj}
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ---------------- Investigare ---------------- */
function Investigare({
  set,
  marcate,
  comuta,
}: {
  set: ReturnType<typeof genereazaSetDate>;
  marcate: Set<string>;
  comuta: (id: string) => void;
}) {
  const [operator, setOperator] = useState("Participant STEP Lab");
  const [probe, setProbe] = useState<IntrareCustodie[] | null>(null);
  const [ocupat, setOcupat] = useState(false);

  const marcateEv = set.evenimente.filter((e) => marcate.has(e.id)).sort((a, b) => a.t - b.t);

  async function calculeazaHashuri() {
    setOcupat(true);
    const ora = new Date().toLocaleString("ro-RO");
    const intrari: IntrareCustodie[] = [];
    for (const [nume, continut] of Object.entries(set.fisiere)) {
      intrari.push({ proba: nume, hash: await sha256(continut), ora, operator });
    }
    setProbe(intrari);
    setOcupat(false);
  }

  function construiestePV() {
    return procesVerbalMarkdown({
      organizatie: set.organizatie,
      dataIncident: set.data,
      operator,
      cazId: `CAZ-DEMO-${set.seed}`,
      probe: probe ?? [],
      cronologie: marcateEv.map((e) => ({ id: e.id, ora: e.ora, sursa: ETICHETE_SURSA[e.sursa], mesaj: e.mesaj })),
      generatLa: new Date().toLocaleString("ro-RO"),
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-lg font-semibold text-foreground">1. Marcați evenimentele incidentului</h2>
          <p className="mt-1 text-sm text-muted">
            Marcați în Explorer sau mai jos evenimentele care compun incidentul. Sunt {marcateEv.length} marcate.
          </p>
          <div className="mt-3 max-h-72 space-y-1 overflow-auto">
            {marcateEv.length === 0 && <p className="text-sm text-muted">Niciun eveniment marcat încă.</p>}
            {marcateEv.map((e) => (
              <label key={e.id} className="flex items-start gap-2 rounded border border-border bg-background p-2 text-xs">
                <input type="checkbox" checked onChange={() => comuta(e.id)} className="mt-0.5" />
                <span>
                  <span className="tabular text-foreground">{e.ora.slice(11)}</span> · {ETICHETE_SURSA[e.sursa]} — {e.mesaj}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-lg font-semibold text-foreground">2. Amprente de integritate (SHA-256)</h2>
          <p className="mt-1 text-sm text-muted">
            Se calculează în browser (Web Crypto) hash-ul fiecărui fișier de probă din set.
          </p>
          <button
            onClick={calculeazaHashuri}
            disabled={ocupat}
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {ocupat ? "Se calculează…" : "Calculează SHA-256 al probelor"}
          </button>
          {probe && (
            <ul className="mt-3 space-y-1 text-xs">
              {probe.map((p) => (
                <li key={p.proba} className="rounded border border-border bg-background p-2">
                  <div className="font-medium text-foreground">{p.proba}</div>
                  <div className="break-all font-mono text-muted">{p.hash}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-lg font-semibold text-foreground">3. Proces-verbal de custodie</h2>
          <label className="mt-3 block text-sm">
            <span className="text-muted">Operator investigație:</span>
            <input
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-background px-3 py-1 text-sm"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => descarcaText(`proces-verbal-custodie-${set.seed}.md`, construiestePV())}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Descarcă Markdown
            </button>
            <button
              onClick={() =>
                descarcaPdfDinMarkdown(
                  `proces-verbal-custodie-${set.seed}.pdf`,
                  construiestePV(),
                  "Proces-verbal de custodie a probelor digitale",
                )
              }
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-background"
            >
              Descarcă PDF
            </button>
          </div>
          {(probe === null || marcateEv.length === 0) && (
            <p className="mt-2 text-xs text-warning">
              Recomandat: marcați evenimentele și calculați hash-urile înainte de a genera procesul-verbal.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-foreground">Previzualizare</h3>
          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded bg-background p-3 text-[11px] text-muted">
            {construiestePV()}
          </pre>
        </div>
      </div>
    </div>
  );
}
