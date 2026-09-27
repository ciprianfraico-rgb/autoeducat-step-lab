import { describe, expect, it } from "vitest";
import { ATACURI, evalueazaAtac, MASURI_IMPLICITE } from "@/lib/ia/redteam";
import { ACCES_ROL } from "@/lib/ia/corpus";

const areConf = (rol: string) => (ACCES_ROL[rol] ?? []).includes("confidential");

describe("simularea de red-teaming (înainte/după măsuri)", () => {
  it("fără măsuri, majoritatea atacurilor reușesc", () => {
    const compromise = ATACURI.filter((a) => evalueazaAtac(a, MASURI_IMPLICITE, areConf).inainte.compromis);
    expect(compromise.length).toBeGreaterThanOrEqual(6);
  });

  it("cu toate măsurile active, niciun atac nu reușește", () => {
    const toate = { filtrareIntrare: true, separareInstructiuniDate: true, verificareIesire: true, limitareLungime: true };
    const compromise = ATACURI.filter((a) => evalueazaAtac(a, toate, areConf).dupa.compromis);
    expect(compromise.length).toBe(0);
  });

  it("injecția indirectă e neutralizată doar de separarea instrucțiunilor de date", () => {
    const a = ATACURI.find((x) => x.id === "A2")!;
    const doar = { ...MASURI_IMPLICITE, separareInstructiuniDate: true };
    expect(evalueazaAtac(a, MASURI_IMPLICITE, areConf).inainte.compromis).toBe(true);
    expect(evalueazaAtac(a, doar, areConf).dupa.compromis).toBe(false);
    // filtrarea intrării singură nu o oprește
    const alt = { ...MASURI_IMPLICITE, filtrareIntrare: true };
    expect(evalueazaAtac(a, alt, areConf).dupa.compromis).toBe(true);
  });

  it("verificarea ieșirii oprește scurgerea de date confidențiale către client", () => {
    const a = ATACURI.find((x) => x.id === "A4")!;
    expect(evalueazaAtac(a, MASURI_IMPLICITE, areConf).inainte.compromis).toBe(true);
    const cuVerif = { ...MASURI_IMPLICITE, verificareIesire: true };
    expect(evalueazaAtac(a, cuVerif, areConf).dupa.compromis).toBe(false);
  });

  it("limitarea lungimii oprește supraîncărcarea", () => {
    const a = ATACURI.find((x) => x.id === "A7")!;
    expect(evalueazaAtac(a, MASURI_IMPLICITE, areConf).inainte.compromis).toBe(true);
    const cuLimita = { ...MASURI_IMPLICITE, limitareLungime: true };
    expect(evalueazaAtac(a, cuLimita, areConf).dupa.compromis).toBe(false);
  });

  it("fiecare atac are o categorie OWASP LLMxx", () => {
    ATACURI.forEach((a) => expect(a.owasp).toMatch(/^LLM\d{2}$/));
  });
});
