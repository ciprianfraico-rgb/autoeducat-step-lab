import { ACCES_ROL, CORPUS, type Document, type NivelAcces } from "./corpus";

export interface Fragment {
  id: string;
  docId: string;
  docTitlu: string;
  nivel: NivelAcces;
  otravit?: boolean;
  index: number;
  text: string;
}

export interface FragmentRegasit extends Fragment {
  scor: number;
}

/** Fragmentare pe cuvinte, cu mărime și suprapunere configurabile (LAB-IA2). */
export function fragmenteaza(docs: Document[], marime: number, suprapunere: number): Fragment[] {
  const pas = Math.max(1, marime - suprapunere);
  const fragmente: Fragment[] = [];
  for (const doc of docs) {
    const cuvinte = doc.text.split(/\s+/).filter(Boolean);
    let idx = 0;
    for (let start = 0; start < cuvinte.length; start += pas) {
      const felie = cuvinte.slice(start, start + marime);
      if (felie.length === 0) break;
      fragmente.push({
        id: `${doc.id}#${idx}`,
        docId: doc.id,
        docTitlu: doc.titlu,
        nivel: doc.nivel,
        otravit: doc.otravit,
        index: idx,
        text: felie.join(" "),
      });
      idx++;
      if (start + marime >= cuvinte.length) break;
    }
  }
  return fragmente;
}

/** Filtrează documentele după nivelurile de acces permise rolului (controlul accesului la surse). */
export function documentePermise(rol: string): Document[] {
  const permise = ACCES_ROL[rol] ?? ["public"];
  return CORPUS.filter((d) => permise.includes(d.nivel));
}

export function cosinus(a: Float32Array | number[], b: Float32Array | number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Top-k fragmente după similaritate cosinus. */
export function celeMaiApropiate(
  intrebareVec: Float32Array | number[],
  fragmente: Fragment[],
  vectori: (Float32Array | number[])[],
  k: number,
): FragmentRegasit[] {
  const scoruri = fragmente.map((f, i) => ({ ...f, scor: cosinus(intrebareVec, vectori[i]) }));
  scoruri.sort((a, b) => b.scor - a.scor);
  return scoruri.slice(0, k);
}
