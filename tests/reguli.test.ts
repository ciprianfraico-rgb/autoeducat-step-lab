import { describe, expect, it } from "vitest";
import { genereazaSetDate } from "@/lib/securitate/generator";
import { evalueazaRegula } from "@/lib/securitate/reguli";
import { REGULI_MODEL } from "@/lib/securitate/reguli-model";

const set = genereazaSetDate();

function model(id: string) {
  return REGULI_MODEL.find((r) => r.id === id)!;
}

describe("motorul de reguli de detecție", () => {
  it("regula de brute-force are rapel 100% pe faza de brute-force", () => {
    const m = model("brute-force");
    const r = evalueazaRegula(m.yaml, set.evenimente, m.fazeTinta);
    expect(r.ok).toBe(true);
    expect(r.metrici.rapel).toBe(1);
    expect(r.metrici.tp).toBeGreaterThan(0);
  });

  it("regula de scanare prinde faza de scanare", () => {
    const m = model("scanare");
    const r = evalueazaRegula(m.yaml, set.evenimente, m.fazeTinta);
    expect(r.metrici.tp).toBeGreaterThan(0);
    expect(r.metrici.rapel).toBeGreaterThan(0.5);
  });

  it("regula de exfiltrare identifică fluxul de volum mare", () => {
    const m = model("exfiltrare");
    const r = evalueazaRegula(m.yaml, set.evenimente, m.fazeTinta);
    expect(r.adevaratPozitive.length).toBeGreaterThanOrEqual(1);
    // backupul legitim (>250MB dar <500MB) nu trebuie prins ca exfiltrare
    expect(r.metrici.fp).toBe(0);
  });

  it("regula SQLi prinde tiparul UNION SELECT", () => {
    const m = model("sqli");
    const r = evalueazaRegula(m.yaml, set.evenimente, m.fazeTinta);
    expect(r.metrici.tp).toBeGreaterThan(0);
  });

  it("regula de escaladare AD prinde crearea contului de persistență", () => {
    const m = model("cont-persistenta");
    const r = evalueazaRegula(m.yaml, set.evenimente, m.fazeTinta);
    expect(r.metrici.tp).toBeGreaterThanOrEqual(2);
  });

  it("regula de e-mail prinde mesajul cu DMARC=fail", () => {
    const m = model("email-dmarc-fail");
    const r = evalueazaRegula(m.yaml, set.evenimente, m.fazeTinta);
    expect(r.metrici.tp).toBeGreaterThanOrEqual(1);
  });

  it("pragul pe fereastră glisantă filtrează grupurile sub prag", () => {
    // prag foarte mare → nimic nu-l atinge
    const yaml = `title: prag imposibil
sursa: auth
detection:
  selection:
    serviciu: vpn
    tip: auth_failure
  groupby: src_ip
  timeframe: 1
  count: 999
`;
    const r = evalueazaRegula(yaml, set.evenimente, ["brute_force"]);
    expect(r.potriviri.length).toBe(0);
  });

  it("semnalează YAML invalid și selecție lipsă", () => {
    expect(evalueazaRegula(":\n  bad: [", set.evenimente, []).ok).toBe(false);
    expect(evalueazaRegula("title: x\ndetection:\n  condition: selection\n", set.evenimente, []).ok).toBe(false);
  });
});
