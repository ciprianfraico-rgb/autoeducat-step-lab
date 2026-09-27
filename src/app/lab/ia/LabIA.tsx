"use client";

import { useEffect, useState } from "react";
import { ACCES_ROL, ETICHETE_NIVEL, ETICHETE_ROL } from "@/lib/ia/corpus";
import {
  celeMaiApropiate,
  documentePermise,
  fragmenteaza,
  type Fragment,
  type FragmentRegasit,
} from "@/lib/ia/rag";
import { citeazaCorect, precisionAtK, recallAtK, SET_TEST, type RevizuireUmana } from "@/lib/ia/evaluare";
import { ATACURI, evalueazaAtac, MASURI_IMPLICITE, type Masuri } from "@/lib/ia/redteam";
import { areWebGPU, incarcaEncoder, incarcaModel, MODEL_ID, MODEL_LICENTA } from "@/lib/ia/model";
import { compuneTelemetrie, type Telemetrie } from "@/lib/ia/telemetrie";
import { raspunsInregistrat } from "@/lib/ia/demo";
import { descarcaCsv } from "@/lib/descarca";
import { Eticheta } from "@/components/ui";

type Rol = "client" | "angajat" | "administrator";
type Tab = "index" | "intrebare" | "evaluare" | "redteam";

interface Index {
  fragmente: Fragment[];
  vectori: number[][];
  marime: number;
  suprapunere: number;
  rol: Rol;
}

export function LabIA() {
  // Determinat după montare, ca să nu difere randarea de pe server (evită erori de hidratare).
  const [gpu, setGpu] = useState(false);
  const [tab, setTab] = useState<Tab>("index");
  const [rol, setRol] = useState<Rol>("angajat");
  const [index, setIndex] = useState<Index | null>(null);
  const [modDemo, setModDemo] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const are = areWebGPU();
      setGpu(are);
      setModDemo(!are);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Laboratorul de IA</h1>
          <Eticheta ton="accent">LAB-IA2 · LAB-IA3 · LAB-IA4</Eticheta>
        </div>
        <p className="mt-2 max-w-3xl text-muted">
          Un proiect RAG rulat integral în browser, pe un corpus <strong>sintetic</strong> pentru organizația fictivă
          „Utilități Demo SA”. Indexare și recuperare cu încorporări (transformers.js), generare cu un model cu ponderi
          deschise prin WebGPU. Un document conține intenționat o injecție indirectă de prompt.
        </p>
        <StareGpu gpu={gpu} modDemo={modDemo} setModDemo={setModDemo} />
      </header>

      <div className="flex flex-wrap gap-2" role="tablist">
        {(
          [
            ["index", "Indexare"],
            ["intrebare", "Întrebare → răspuns"],
            ["evaluare", "Evaluare"],
            ["redteam", "Red-teaming"],
          ] as const
        ).map(([val, txt]) => (
          <button
            key={val}
            role="tab"
            aria-selected={tab === val}
            onClick={() => setTab(val)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              tab === val ? "border-accent bg-accent text-white" : "border-border bg-surface text-foreground hover:bg-background"
            }`}
          >
            {txt}
          </button>
        ))}
      </div>

      {tab === "index" && <Indexare rol={rol} setRol={setRol} index={index} setIndex={setIndex} />}
      {tab === "intrebare" && <Intrebare index={index} modDemo={modDemo} gpu={gpu} />}
      {tab === "evaluare" && <Evaluare index={index} />}
      {tab === "redteam" && <RedTeam rol={rol} />}
    </div>
  );
}

function StareGpu({ gpu, modDemo, setModDemo }: { gpu: boolean; modDemo: boolean; setModDemo: (v: boolean) => void }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-surface p-3 text-sm">
      {gpu ? (
        <div className="flex flex-wrap items-center gap-2">
          <Eticheta ton="ok">WebGPU disponibil</Eticheta>
          <span className="text-muted">
            Model: {MODEL_ID} ({MODEL_LICENTA}). Prima încărcare descarcă modelul în browser (câteva sute de MB).
          </span>
          <label className="ml-auto flex items-center gap-2 text-muted">
            <input type="checkbox" checked={modDemo} onChange={(e) => setModDemo(e.target.checked)} />
            Folosește modul demonstrativ
          </label>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Eticheta ton="warning">WebGPU indisponibil</Eticheta>
          <span className="text-muted">
            Generarea live cu modelul nu este posibilă în acest browser. Indexarea și recuperarea rulează totuși (WASM).
            Răspunsurile folosesc <strong>modul demonstrativ</strong>, marcat „rulare înregistrată”.
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Indexare ---------------- */
function Indexare({
  rol,
  setRol,
  index,
  setIndex,
}: {
  rol: Rol;
  setRol: (r: Rol) => void;
  index: Index | null;
  setIndex: (i: Index) => void;
}) {
  const [marime, setMarime] = useState(60);
  const [suprapunere, setSuprapunere] = useState(15);
  const [stare, setStare] = useState<string>("");
  const [ocupat, setOcupat] = useState(false);

  const docs = documentePermise(rol);
  const fragmentePreview = fragmenteaza(docs, marime, suprapunere);

  async function indexeaza() {
    setOcupat(true);
    setStare("Se încarcă modelul de încorporări (transformers.js)…");
    try {
      const enc = await incarcaEncoder();
      const frag = fragmenteaza(docs, marime, suprapunere);
      setStare(`Se calculează ${frag.length} încorporări…`);
      const vectori = await enc(frag.map((f) => `passage: ${f.text}`));
      setIndex({ fragmente: frag, vectori, marime, suprapunere, rol });
      setStare(`Index construit: ${frag.length} fragmente din ${docs.length} documente permise rolului „${ETICHETE_ROL[rol]}”.`);
    } catch (e) {
      setStare(`Eroare la indexare: ${(e as Error).message}`);
    }
    setOcupat(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-lg font-semibold text-foreground">Rol și control al accesului la surse</h2>
          <p className="mt-1 text-sm text-muted">
            Rolul filtrează documentele după etichetă înainte de recuperare (legătura cu LLM02 și LLM08).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["client", "angajat", "administrator"] as Rol[]).map((r) => (
              <button
                key={r}
                onClick={() => setRol(r)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  rol === r ? "border-accent bg-accent text-white" : "border-border bg-background text-foreground"
                }`}
              >
                {ETICHETE_ROL[r]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Acces permis: {ACCES_ROL[rol].map((n) => ETICHETE_NIVEL[n]).join(", ")}.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-lg font-semibold text-foreground">Fragmentare</h2>
          <label className="mt-3 block text-sm text-muted">
            Mărimea fragmentului (cuvinte): <span className="font-semibold text-foreground tabular">{marime}</span>
            <input type="range" min={20} max={120} value={marime} onChange={(e) => setMarime(+e.target.value)} className="mt-1 w-full" />
          </label>
          <label className="mt-3 block text-sm text-muted">
            Suprapunere (cuvinte): <span className="font-semibold text-foreground tabular">{suprapunere}</span>
            <input type="range" min={0} max={Math.max(0, marime - 5)} value={suprapunere} onChange={(e) => setSuprapunere(+e.target.value)} className="mt-1 w-full" />
          </label>
          <p className="mt-2 text-xs text-muted">
            Din {docs.length} documente permise rezultă {fragmentePreview.length} fragmente cu această configurație.
          </p>
          <button
            onClick={indexeaza}
            disabled={ocupat}
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {ocupat ? "Se indexează…" : "Indexează în browser"}
          </button>
          {stare && <p className="mt-2 text-sm text-muted">{stare}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold text-foreground">Documentele permise rolului</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {docs.map((d) => (
            <li key={d.id} className="rounded border border-border bg-background p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  {d.id} — {d.titlu}
                </span>
                <Eticheta ton={d.nivel === "confidential" ? "danger" : d.nivel === "intern" ? "warning" : "ok"}>
                  {ETICHETE_NIVEL[d.nivel]}
                </Eticheta>
              </div>
              {d.otravit && <div className="mt-1 text-xs text-danger">⚠ conține o injecție indirectă de prompt (pentru LAB-IA4)</div>}
            </li>
          ))}
        </ul>
        {index && (
          <p className="mt-3 text-xs text-ok">
            Index activ: {index.fragmente.length} fragmente, mărime {index.marime}/suprapunere {index.suprapunere}, rol{" "}
            {ETICHETE_ROL[index.rol]}.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Întrebare → răspuns ---------------- */
function Intrebare({
  index,
  modDemo,
  gpu,
}: {
  index: Index | null;
  modDemo: boolean;
  gpu: boolean;
}) {
  const [intrebare, setIntrebare] = useState("Care este termenul de plată al facturii?");
  const [k, setK] = useState(3);
  const [regasite, setRegasite] = useState<FragmentRegasit[] | null>(null);
  const [raspuns, setRaspuns] = useState<string>("");
  const [modRaspuns, setModRaspuns] = useState<"live" | "inregistrat" | "eroare" | null>(null);
  const [tel, setTel] = useState<Telemetrie | null>(null);
  const [ocupat, setOcupat] = useState(false);

  const folosesteModel = gpu && !modDemo;

  async function intreaba() {
    if (!index || !intrebare.trim()) return;
    setOcupat(true);
    setRaspuns("");
    setTel(null);
    try {
      const enc = await incarcaEncoder();
      const [qv] = await enc([`query: ${intrebare}`]);
      const top = celeMaiApropiate(qv, index.fragmente, index.vectori, k);
      setRegasite(top);

      const t0 = performance.now();
      if (folosesteModel) {
        const engine = await incarcaModel(MODEL_ID);
        const context = top.map((f) => `[${f.id}] ${f.text}`).join("\n");
        const raspunsModel = await engine.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Ești un asistent care răspunde DOAR pe baza fragmentelor de context furnizate, în limba română. " +
                "Citează la final id-urile fragmentelor folosite în forma [DOC-XX#n]. Dacă informația nu apare în context, spune că nu o găsești.",
            },
            { role: "user", content: `Context:\n${context}\n\nÎntrebare: ${intrebare}` },
          ],
          temperature: 0.2,
          max_tokens: 220,
        });
        const txt = raspunsModel.choices[0]?.message?.content ?? "";
        const durata = performance.now() - t0;
        const u = raspunsModel.usage;
        setRaspuns(txt);
        setModRaspuns("live");
        setTel(compuneTelemetrie(durata, u?.prompt_tokens ?? 0, u?.completion_tokens ?? txt.split(/\s+/).length));
      } else {
        const rec = raspunsInregistrat(intrebare);
        const durata = performance.now() - t0;
        const txt = rec
          ? `${rec.raspuns}\n\nSurse: ${rec.surse.join(", ")}`
          : "Nu găsesc răspunsul în fragmentele recuperate (rulare înregistrată).";
        setRaspuns(txt);
        setModRaspuns("inregistrat");
        setTel(compuneTelemetrie(durata, intrebare.split(/\s+/).length, txt.split(/\s+/).length));
      }
    } catch (e) {
      setRaspuns(`Eroare: ${(e as Error).message}. Încercați din nou sau comutați pe modul demonstrativ.`);
      setModRaspuns("eroare");
      setTel(null);
    } finally {
      setOcupat(false);
    }
  }

  if (!index) return <NevoieIndex />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <label className="block text-sm">
            <span className="text-muted">Întrebare</span>
            <textarea
              value={intrebare}
              onChange={(e) => setIntrebare(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-3 block text-sm text-muted">
            Fragmente recuperate (k): <span className="font-semibold text-foreground tabular">{k}</span>
            <input type="range" min={1} max={6} value={k} onChange={(e) => setK(+e.target.value)} className="mt-1 w-full" />
          </label>
          <button
            onClick={intreaba}
            disabled={ocupat}
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {ocupat ? "Se procesează…" : folosesteModel ? "Întreabă modelul" : "Întreabă (rulare înregistrată)"}
          </button>
        </div>

        {raspuns && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Răspuns</h3>
              {modRaspuns === "inregistrat" && <Eticheta ton="warning">rulare înregistrată</Eticheta>}
              {modRaspuns === "live" && <Eticheta ton="ok">rulare live</Eticheta>}
              {modRaspuns === "eroare" && <Eticheta ton="danger">eroare</Eticheta>}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{raspuns}</p>
          </div>
        )}

        {tel && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MicKpi eticheta="Latență" valoare={`${(tel.latentaMs / 1000).toFixed(1)} s`} />
            <MicKpi eticheta="Tokeni răspuns" valoare={tel.tokeniRaspuns} />
            <MicKpi eticheta="Tokeni/s" valoare={tel.tokeniPeSecunda} />
            <MicKpi eticheta="Energie (est.)" valoare={`${tel.energieWhEstimata} Wh`} />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-foreground">Fragmente recuperate (surse citate)</h3>
        {!regasite && <p className="mt-2 text-sm text-muted">Puneți o întrebare pentru a vedea fragmentele recuperate.</p>}
        <ul className="mt-3 space-y-2">
          {regasite?.map((f) => (
            <li key={f.id} className="rounded border border-border bg-background p-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-accent">{f.id}</span>
                <span className="flex items-center gap-2">
                  <Eticheta ton={f.nivel === "confidential" ? "danger" : f.nivel === "intern" ? "warning" : "ok"}>
                    {ETICHETE_NIVEL[f.nivel]}
                  </Eticheta>
                  <span className="tabular text-muted">cos {f.scor.toFixed(3)}</span>
                </span>
              </div>
              <p className="mt-1 text-muted">{f.text}</p>
              {f.otravit && <p className="mt-1 text-danger">⚠ fragment dintr-un document otrăvit</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Evaluare ---------------- */
function Evaluare({ index }: { index: Index | null }) {
  const [k, setK] = useState(3);
  const [rezultate, setRezultate] = useState<
    { id: string; intrebare: string; surseAsteptate: string[]; surseCitate: string[]; precizie: number; rapel: number; citeaza: boolean }[]
  >([]);
  const [revizuiri, setRevizuiri] = useState<Record<string, RevizuireUmana>>({});
  const [ocupat, setOcupat] = useState(false);

  async function ruleaza() {
    if (!index) return;
    setOcupat(true);
    try {
      const enc = await incarcaEncoder();
      const vecs = await enc(SET_TEST.map((t) => `query: ${t.intrebare}`));
      const rez = SET_TEST.map((t, i) => {
        const top = celeMaiApropiate(vecs[i], index.fragmente, index.vectori, k);
        const surseCitate = Array.from(new Set(top.map((f) => f.docId)));
        return {
          id: t.id,
          intrebare: t.intrebare,
          surseAsteptate: t.surseAsteptate,
          surseCitate,
          precizie: precisionAtK(top, t.surseAsteptate, k),
          rapel: recallAtK(top, t.surseAsteptate, k),
          citeaza: citeazaCorect(surseCitate, t.surseAsteptate),
        };
      });
      setRezultate(rez);
    } finally {
      setOcupat(false);
    }
  }

  const medPrec = rezultate.length ? rezultate.reduce((s, r) => s + r.precizie, 0) / rezultate.length : 0;
  const medRapel = rezultate.length ? rezultate.reduce((s, r) => s + r.rapel, 0) / rezultate.length : 0;
  const citari = rezultate.filter((r) => r.citeaza).length;

  function exportaCsv() {
    const randuri: (string | number)[][] = [
      ["id", "intrebare", "surse_asteptate", "surse_citate", "precision_at_k", "recall_at_k", "citare_corecta", "revizuire", "comentariu"],
      ...rezultate.map((r) => [
        r.id,
        r.intrebare,
        r.surseAsteptate.join(" "),
        r.surseCitate.join(" "),
        r.precizie.toFixed(2),
        r.rapel.toFixed(2),
        r.citeaza ? "da" : "nu",
        revizuiri[r.id]?.verdict ?? "",
        revizuiri[r.id]?.comentariu ?? "",
      ]),
    ];
    descarcaCsv(`evaluare-rag-k${k}.csv`, randuri);
  }

  if (!index) return <NevoieIndex />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <label className="text-sm text-muted">
          k: <span className="font-semibold text-foreground tabular">{k}</span>
          <input type="range" min={1} max={6} value={k} onChange={(e) => setK(+e.target.value)} className="ml-2 align-middle" />
        </label>
        <button
          onClick={ruleaza}
          disabled={ocupat}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {ocupat ? "Se rulează…" : "Rulează evaluarea"}
        </button>
        {rezultate.length > 0 && (
          <button onClick={exportaCsv} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-background">
            Export CSV
          </button>
        )}
        {rezultate.length > 0 && (
          <div className="ml-auto flex gap-2">
            <MicKpi eticheta="precision@k mediu" valoare={`${(medPrec * 100).toFixed(0)}%`} />
            <MicKpi eticheta="recall@k mediu" valoare={`${(medRapel * 100).toFixed(0)}%`} />
            <MicKpi eticheta="citare corectă" valoare={`${citari}/${rezultate.length}`} />
          </div>
        )}
      </div>

      {rezultate.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Întrebare</th>
                <th className="px-3 py-2 font-medium">Așteptat</th>
                <th className="px-3 py-2 font-medium">Citate</th>
                <th className="px-3 py-2 font-medium">P@k</th>
                <th className="px-3 py-2 font-medium">Citare</th>
                <th className="px-3 py-2 font-medium">Revizuire umană</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rezultate.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 tabular text-muted">{r.id}</td>
                  <td className="px-3 py-2">{r.intrebare}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{r.surseAsteptate.join(", ")}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">{r.surseCitate.join(", ")}</td>
                  <td className="px-3 py-2 tabular">{(r.precizie * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2">
                    <Eticheta ton={r.citeaza ? "ok" : "danger"}>{r.citeaza ? "da" : "nu"}</Eticheta>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {(["acceptat", "respins"] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() =>
                            setRevizuiri((prev) => ({
                              ...prev,
                              [r.id]: { verdict: v, comentariu: prev[r.id]?.comentariu ?? "" },
                            }))
                          }
                          className={`rounded px-2 py-0.5 text-xs ${
                            revizuiri[r.id]?.verdict === v
                              ? v === "acceptat"
                                ? "bg-ok text-white"
                                : "bg-danger text-white"
                              : "border border-border bg-background text-muted"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                      <input
                        placeholder="comentariu"
                        value={revizuiri[r.id]?.comentariu ?? ""}
                        onChange={(e) =>
                          setRevizuiri((prev) => ({
                            ...prev,
                            [r.id]: { verdict: prev[r.id]?.verdict ?? null, comentariu: e.target.value },
                          }))
                        }
                        className="w-28 rounded border border-border bg-background px-2 py-0.5 text-xs"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Red-teaming ---------------- */
function RedTeam({ rol }: { rol: Rol }) {
  const [masuri, setMasuri] = useState<Masuri>({ ...MASURI_IMPLICITE });
  const rolAreConfidential = (r: string) => (ACCES_ROL[r] ?? []).includes("confidential");
  const rezultate = ATACURI.map((a) => evalueazaAtac(a, masuri, rolAreConfidential));
  const compromiseInainte = rezultate.filter((r) => r.inainte.compromis).length;
  const compromiseDupa = rezultate.filter((r) => r.dupa.compromis).length;

  const COMUTATOARE: { cheie: keyof Masuri; eticheta: string }[] = [
    { cheie: "filtrareIntrare", eticheta: "Filtrarea intrării" },
    { cheie: "separareInstructiuniDate", eticheta: "Separarea instrucțiunilor de date" },
    { cheie: "verificareIesire", eticheta: "Verificarea ieșirii (fără date confidențiale)" },
    { cheie: "limitareLungime", eticheta: "Limitarea lungimii" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold text-foreground">Măsuri de protecție</h2>
        <p className="mt-1 text-sm text-muted">
          Rolul curent în test: <strong>{ETICHETE_ROL[rol]}</strong> (îl schimbați în fila „Indexare”). Simularea este
          deterministă și reflectă mecanismul fiecărei apărări OWASP — nu este o rulare LLM live.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {COMUTATOARE.map((c) => (
            <label key={c.cheie} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={masuri[c.cheie]}
                onChange={(e) => setMasuri((m) => ({ ...m, [c.cheie]: e.target.checked }))}
              />
              {c.eticheta}
            </label>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <MicKpi eticheta="Compromise fără măsuri" valoare={`${compromiseInainte}/${ATACURI.length}`} />
          <MicKpi eticheta="Compromise cu măsuri" valoare={`${compromiseDupa}/${ATACURI.length}`} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">OWASP</th>
              <th className="px-3 py-2 font-medium">Atac</th>
              <th className="px-3 py-2 font-medium">Înainte</th>
              <th className="px-3 py-2 font-medium">După măsuri</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rezultate.map((r) => (
              <tr key={r.atac.id}>
                <td className="px-3 py-2">
                  <Eticheta ton="accent">{r.atac.owasp}</Eticheta>
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium text-foreground">{r.atac.titlu}</div>
                  <div className="text-xs text-muted">{r.atac.descriere}</div>
                </td>
                <td className="px-3 py-2">
                  <Eticheta ton={r.inainte.compromis ? "danger" : "ok"}>
                    {r.inainte.compromis ? "compromis" : "blocat"}
                  </Eticheta>
                  <div className="mt-1 text-xs text-muted">{r.inainte.motiv}</div>
                </td>
                <td className="px-3 py-2">
                  <Eticheta ton={r.dupa.compromis ? "danger" : "ok"}>
                    {r.dupa.compromis ? "compromis" : "blocat"}
                  </Eticheta>
                  <div className="mt-1 text-xs text-muted">{r.dupa.motiv}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- comune ---------------- */
function MicKpi({ eticheta, valoare }: { eticheta: string; valoare: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="text-[11px] text-muted">{eticheta}</div>
      <div className="text-lg font-bold tabular text-foreground">{valoare}</div>
    </div>
  );
}

function NevoieIndex() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
      Construiți mai întâi indexul în fila <strong>Indexare</strong> (alegeți rolul și apăsați „Indexează în browser”).
    </div>
  );
}
