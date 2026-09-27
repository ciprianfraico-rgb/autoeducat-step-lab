import { describe, expect, it } from "vitest";
import { genereazaSetDate, SEED_IMPLICIT } from "@/lib/securitate/generator";

describe("generator determinist de date de securitate", () => {
  it("produce același set pentru același seed", () => {
    const a = genereazaSetDate(SEED_IMPLICIT);
    const b = genereazaSetDate(SEED_IMPLICIT);
    expect(a.evenimente.length).toBe(b.evenimente.length);
    expect(JSON.stringify(a.evenimente)).toBe(JSON.stringify(b.evenimente));
    expect(a.fisiere["eve.json"]).toBe(b.fisiere["eve.json"]);
  });

  it("produce seturi diferite pentru seed-uri diferite", () => {
    const a = genereazaSetDate(1);
    const b = genereazaSetDate(2);
    expect(a.fisiere["auth.log"]).not.toBe(b.fisiere["auth.log"]);
  });

  it("evenimentele sunt sortate cronologic și au id-uri unice", () => {
    const s = genereazaSetDate();
    for (let i = 1; i < s.evenimente.length; i++) {
      expect(s.evenimente[i].t).toBeGreaterThanOrEqual(s.evenimente[i - 1].t);
    }
    const ids = new Set(s.evenimente.map((e) => e.id));
    expect(ids.size).toBe(s.evenimente.length);
  });

  it("conține toate fazele scenariului de atac", () => {
    const s = genereazaSetDate();
    const faze = new Set(s.evenimente.map((e) => e.faza));
    for (const f of ["sqli", "scanare", "brute_force", "acces_initial", "miscare_laterala", "exfiltrare", "email_frauda"]) {
      expect(faze.has(f as never)).toBe(true);
    }
  });

  it("produce toate cele cinci fișiere de probe, nevide", () => {
    const s = genereazaSetDate();
    for (const nume of ["eve.json", "auth.log", "access.log", "mail.log", "email-suspect.eml"] as const) {
      expect(s.fisiere[nume].length).toBeGreaterThan(0);
    }
  });
});
