import type { FragmentRegasit } from "./rag";

export interface IntrebareTest {
  id: string;
  intrebare: string;
  /** id-urile documentelor considerate surse corecte */
  surseAsteptate: string[];
  raspunsReferinta: string;
  /** rol minim care ar trebui să obțină răspunsul (pentru testele de acces) */
  rol?: string;
}

export interface RevizuireUmana {
  verdict: "acceptat" | "respins" | null;
  comentariu: string;
}

/** precision@k: câte dintre documentele regăsite (top-k) sunt printre sursele așteptate. */
export function precisionAtK(regasite: FragmentRegasit[], surseAsteptate: string[], k: number): number {
  const topDocs = Array.from(new Set(regasite.slice(0, k).map((f) => f.docId)));
  if (topDocs.length === 0) return 0;
  const relevante = topDocs.filter((d) => surseAsteptate.includes(d)).length;
  return relevante / topDocs.length;
}

/** recall@k: câte dintre sursele așteptate apar în top-k. */
export function recallAtK(regasite: FragmentRegasit[], surseAsteptate: string[], k: number): number {
  if (surseAsteptate.length === 0) return 1;
  const topDocs = new Set(regasite.slice(0, k).map((f) => f.docId));
  const gasite = surseAsteptate.filter((d) => topDocs.has(d)).length;
  return gasite / surseAsteptate.length;
}

/** Verifică dacă răspunsul citează cel puțin una dintre sursele așteptate (fidelitate/citare). */
export function citeazaCorect(surseCitate: string[], surseAsteptate: string[]): boolean {
  return surseCitate.some((s) => surseAsteptate.includes(s));
}

export const SET_TEST: IntrebareTest[] = [
  {
    id: "T01",
    intrebare: "Care este programul cu publicul la centrele de relații cu clienții?",
    surseAsteptate: ["DOC-01"],
    raspunsReferinta: "Luni–vineri, 08:00–16:00.",
    rol: "client",
  },
  {
    id: "T02",
    intrebare: "În cât timp trebuie plătită o factură și ce penalități se aplică la întârziere?",
    surseAsteptate: ["DOC-02"],
    raspunsReferinta: "În 30 de zile de la emitere; penalitate de 0,02% pe zi de întârziere.",
    rol: "client",
  },
  {
    id: "T03",
    intrebare: "Cum îmi pot exercita drepturile privind datele personale?",
    surseAsteptate: ["DOC-03"],
    raspunsReferinta: "Printr-o cerere către responsabilul cu protecția datelor, dpo@utilitati-demo.example.",
    rol: "client",
  },
  {
    id: "T04",
    intrebare: "În cât timp se trimite o echipă de intervenție la o avarie de grad 1?",
    surseAsteptate: ["DOC-04"],
    raspunsReferinta: "În maximum 2 ore, cu remediere-țintă în 8 ore.",
    rol: "angajat",
  },
  {
    id: "T05",
    intrebare: "Ce cerințe are politica internă de securitate pentru parole și autentificare?",
    surseAsteptate: ["DOC-05"],
    raspunsReferinta: "Autentificare multifactor și parole de minimum 12 caractere.",
    rol: "angajat",
  },
  {
    id: "T06",
    intrebare: "Cum verifică operatorul identitatea unui client la telefon?",
    surseAsteptate: ["DOC-06"],
    raspunsReferinta: "Prin codul de client și adresa de consum.",
    rol: "angajat",
  },
  {
    id: "T07",
    intrebare: "Care este termenul standard de racordare pentru un consumator casnic?",
    surseAsteptate: ["DOC-07"],
    raspunsReferinta: "90 de zile de la avizul tehnic de racordare.",
    rol: "angajat",
  },
  {
    id: "T08",
    intrebare: "În ce perioadă a lunii se transmite indexul contorului?",
    surseAsteptate: ["DOC-12"],
    raspunsReferinta: "În perioada de autocitire, zilele 20–25 ale lunii.",
    rol: "client",
  },
  {
    id: "T09",
    intrebare: "În cât timp pot contesta o factură și ce plătesc între timp?",
    surseAsteptate: ["DOC-13"],
    raspunsReferinta: "În 30 de zile de la primire; se achită suma necontestată pe durata soluționării.",
    rol: "client",
  },
  {
    id: "T10",
    intrebare: "Cum se comunică clienților o avarie extinsă, conform planului de continuitate?",
    surseAsteptate: ["DOC-14"],
    raspunsReferinta: "Prin site, aplicație și mass-media locală.",
    rol: "angajat",
  },
];
