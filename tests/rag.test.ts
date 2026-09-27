import { describe, expect, it } from "vitest";
import { CORPUS } from "@/lib/ia/corpus";
import { documentePermise, fragmenteaza, cosinus, celeMaiApropiate } from "@/lib/ia/rag";
import { precisionAtK, recallAtK, citeazaCorect } from "@/lib/ia/evaluare";

describe("controlul accesului pe etichete", () => {
  it("clientul vede doar documente publice", () => {
    expect(documentePermise("client").every((d) => d.nivel === "public")).toBe(true);
  });
  it("angajatul vede public + intern, dar nu confidențial", () => {
    const niveluri = new Set(documentePermise("angajat").map((d) => d.nivel));
    expect(niveluri.has("public")).toBe(true);
    expect(niveluri.has("intern")).toBe(true);
    expect(niveluri.has("confidential")).toBe(false);
  });
  it("administratorul vede toate documentele", () => {
    expect(documentePermise("administrator").length).toBe(CORPUS.length);
  });
  it("documentele confidențiale nu apar pentru client", () => {
    const ids = documentePermise("client").map((d) => d.id);
    expect(ids).not.toContain("DOC-09");
    expect(ids).not.toContain("DOC-10");
  });
});

describe("fragmentarea", () => {
  it("respectă mărimea și produce suprapunere", () => {
    const doc = [{ id: "X", titlu: "t", nivel: "public" as const, categorie: "c", text: Array.from({ length: 100 }, (_, i) => `w${i}`).join(" ") }];
    const frag = fragmenteaza(doc, 20, 5);
    expect(frag.length).toBeGreaterThan(1);
    frag.forEach((f) => expect(f.text.split(" ").length).toBeLessThanOrEqual(20));
    // suprapunere: ultimul cuvânt al primului fragment reapare în al doilea
    const primaCuvinte = frag[0].text.split(" ");
    const aDouaCuvinte = frag[1].text.split(" ");
    expect(aDouaCuvinte).toContain(primaCuvinte[primaCuvinte.length - 1]);
  });
});

describe("metricile de evaluare RAG", () => {
  const frag = (docId: string, scor: number) => ({ id: `${docId}#0`, docId, docTitlu: docId, nivel: "public" as const, index: 0, text: "", scor });

  it("precision@k", () => {
    const regasite = [frag("DOC-01", 0.9), frag("DOC-02", 0.8), frag("DOC-03", 0.7)];
    expect(precisionAtK(regasite, ["DOC-01"], 3)).toBeCloseTo(1 / 3);
    expect(precisionAtK(regasite, ["DOC-01", "DOC-02", "DOC-03"], 3)).toBe(1);
    expect(precisionAtK([], ["DOC-01"], 3)).toBe(0);
  });

  it("recall@k", () => {
    const regasite = [frag("DOC-01", 0.9), frag("DOC-02", 0.8)];
    expect(recallAtK(regasite, ["DOC-01", "DOC-04"], 2)).toBe(0.5);
    expect(recallAtK(regasite, ["DOC-01"], 2)).toBe(1);
  });

  it("verificarea citării", () => {
    expect(citeazaCorect(["DOC-01", "DOC-05"], ["DOC-01"])).toBe(true);
    expect(citeazaCorect(["DOC-05"], ["DOC-01"])).toBe(false);
  });
});

describe("similaritatea cosinus și recuperarea", () => {
  it("cosinus: identic = 1, ortogonal = 0", () => {
    expect(cosinus([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosinus([1, 0], [0, 1])).toBeCloseTo(0);
  });
  it("celeMaiApropiate ordonează descrescător după scor", () => {
    const fragmente = [
      { id: "a#0", docId: "a", docTitlu: "a", nivel: "public" as const, index: 0, text: "" },
      { id: "b#0", docId: "b", docTitlu: "b", nivel: "public" as const, index: 0, text: "" },
    ];
    const vectori = [[1, 0], [0.2, 1]];
    const top = celeMaiApropiate([1, 0], fragmente, vectori, 2);
    expect(top[0].docId).toBe("a");
    expect(top[0].scor).toBeGreaterThanOrEqual(top[1].scor);
  });
});
