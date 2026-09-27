/**
 * Motor de reguli de detecție (subset Sigma-like), evaluat integral în browser.
 *
 * Formatul YAML acceptat:
 *   title: text
 *   sursa: suricata | auth | web | email        # opțional: filtrează pe sursă
 *   detection:
 *     selection:                                  # unul sau mai multe câmpuri
 *       camp: valoare                             # egalitate
 *       camp|contains: text                       # subșir (insensibil la majuscule)
 *       camp|gte: 1000                            # >=
 *       camp|lte: 10                              # <=
 *       camp|in: [a, b, c]                        # apartenență
 *     condition: selection                        # doar „selection” (implicit)
 *     # prag pe fereastră glisantă (opțional):
 *     groupby: src_ip                             # câmp de grupare
 *     timeframe: 300                              # secunde
 *     count: 10                                   # nr. minim de potriviri în fereastră
 * Fiecare eveniment este „adevărat” dacă selecția se potrivește ȘI (dacă e definit pragul)
 * face parte dintr-o fereastră glisantă care atinge pragul pe grupul lui.
 */
import { parse } from "yaml";
import type { Eveniment, Faza, Sursa, ValoareCamp } from "./tipuri";

export interface ReiaRegula {
  title: string;
  sursa?: Sursa;
  detection: {
    selection: Record<string, ValoareCamp | ValoareCamp[]>;
    condition?: string;
    groupby?: string;
    timeframe?: number;
    count?: number;
  };
}

export interface RezultatEvaluare {
  ok: boolean;
  eroare?: string;
  regula?: ReiaRegula;
  /** id-urile evenimentelor semnalate de regulă */
  potriviri: string[];
  adevaratPozitive: string[];
  falsPozitive: string[];
  ratari: string[];
  metrici: { tp: number; fp: number; fn: number; precizie: number; rapel: number; f1: number };
}

function valoareCamp(ev: Eveniment, camp: string): ValoareCamp | undefined {
  if (camp in ev.campuri) return ev.campuri[camp];
  const direct = ev as unknown as Record<string, ValoareCamp>;
  return direct[camp];
}

function potrivesteSelectie(ev: Eveniment, selection: ReiaRegula["detection"]["selection"]): boolean {
  for (const [cheie, asteptat] of Object.entries(selection)) {
    const [camp, op] = cheie.split("|");
    const actual = valoareCamp(ev, camp);
    if (op === "contains") {
      if (actual === undefined) return false;
      if (!String(actual).toLowerCase().includes(String(asteptat).toLowerCase())) return false;
    } else if (op === "gte") {
      if (actual === undefined || Number(actual) < Number(asteptat)) return false;
    } else if (op === "lte") {
      if (actual === undefined || Number(actual) > Number(asteptat)) return false;
    } else if (op === "in") {
      const lista = (Array.isArray(asteptat) ? asteptat : [asteptat]).map((v) => String(v).toLowerCase());
      if (actual === undefined || !lista.includes(String(actual).toLowerCase())) return false;
    } else {
      // egalitate (insensibilă la majuscule pentru șiruri)
      if (actual === undefined) return false;
      if (typeof asteptat === "string" || typeof actual === "string") {
        if (String(actual).toLowerCase() !== String(asteptat).toLowerCase()) return false;
      } else if (actual !== asteptat) {
        return false;
      }
    }
  }
  return true;
}

/** Aplică pragul pe fereastră glisantă; întoarce id-urile ce fac parte dintr-o fereastră care atinge count. */
function aplicaPrag(potrivite: Eveniment[], groupby: string | undefined, timeframe: number, count: number): Set<string> {
  const rezultat = new Set<string>();
  const grupuri = new Map<string, Eveniment[]>();
  for (const e of potrivite) {
    const cheie = groupby ? String(valoareCamp(e, groupby) ?? "∅") : "∅";
    if (!grupuri.has(cheie)) grupuri.set(cheie, []);
    grupuri.get(cheie)!.push(e);
  }
  for (const lista of grupuri.values()) {
    lista.sort((a, b) => a.t - b.t);
    let start = 0;
    for (let end = 0; end < lista.length; end++) {
      while (lista[end].t - lista[start].t > timeframe) start++;
      if (end - start + 1 >= count) {
        for (let k = start; k <= end; k++) rezultat.add(lista[k].id);
      }
    }
  }
  return rezultat;
}

export function evalueazaRegula(yamlText: string, evenimente: Eveniment[], fazeTinta: Faza[]): RezultatEvaluare {
  const gol: RezultatEvaluare = {
    ok: false,
    potriviri: [],
    adevaratPozitive: [],
    falsPozitive: [],
    ratari: [],
    metrici: { tp: 0, fp: 0, fn: 0, precizie: 0, rapel: 0, f1: 0 },
  };

  let regula: ReiaRegula;
  try {
    regula = parse(yamlText) as ReiaRegula;
  } catch (e) {
    return { ...gol, eroare: `YAML invalid: ${(e as Error).message}` };
  }
  if (!regula || typeof regula !== "object") return { ...gol, eroare: "Regula este goală." };
  if (!regula.detection || !regula.detection.selection)
    return { ...gol, eroare: "Lipsește „detection.selection”." };
  if (typeof regula.detection.selection !== "object" || Array.isArray(regula.detection.selection))
    return { ...gol, eroare: "„selection” trebuie să fie o listă de câmpuri (cheie: valoare)." };
  if (Object.keys(regula.detection.selection).length === 0)
    return { ...gol, eroare: "„selection” nu conține niciun câmp." };

  const pool = regula.sursa ? evenimente.filter((e) => e.sursa === regula.sursa) : evenimente;
  let potrivite = pool.filter((e) => potrivesteSelectie(e, regula.detection.selection));

  const { count, timeframe, groupby } = regula.detection;
  if (count && count > 1) {
    const tf = timeframe ?? 60;
    const setPrag = aplicaPrag(potrivite, groupby, tf, count);
    potrivite = potrivite.filter((e) => setPrag.has(e.id));
  }

  const potriviri = potrivite.map((e) => e.id);
  const setPotriviri = new Set(potriviri);
  const esteTinta = (e: Eveniment) => fazeTinta.includes(e.faza);

  const adevaratPozitive = potrivite.filter(esteTinta).map((e) => e.id);
  const falsPozitive = potrivite.filter((e) => !esteTinta(e)).map((e) => e.id);
  const ratari = evenimente.filter((e) => esteTinta(e) && !setPotriviri.has(e.id)).map((e) => e.id);

  const tp = adevaratPozitive.length;
  const fp = falsPozitive.length;
  const fn = ratari.length;
  const precizie = tp + fp === 0 ? 0 : tp / (tp + fp);
  const rapel = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precizie + rapel === 0 ? 0 : (2 * precizie * rapel) / (precizie + rapel);

  return {
    ok: true,
    regula,
    potriviri,
    adevaratPozitive,
    falsPozitive,
    ratari,
    metrici: { tp, fp, fn, precizie, rapel, f1 },
  };
}
