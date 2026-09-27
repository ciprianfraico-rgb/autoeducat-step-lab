export type Sursa = "suricata" | "auth" | "web" | "email";

/** Eticheta de adevăr a scenariului (cunoscută de laborator, ascunsă participantului până la verificare). */
export type Faza =
  | "benign"
  | "sqli"
  | "scanare"
  | "brute_force"
  | "acces_initial"
  | "miscare_laterala"
  | "exfiltrare"
  | "email_frauda";

export type ValoareCamp = string | number | boolean;

export interface Eveniment {
  id: string;
  /** secunde de la 12.03.2026 00:00:00 (ora locală a rețelei fictive) */
  t: number;
  /** „2026-03-12 02:10:05” */
  ora: string;
  sursa: Sursa;
  tip: string;
  src_ip?: string;
  dest_ip?: string;
  user?: string;
  mesaj: string;
  /** câmpuri aplatizate, folosite de motorul de reguli (ex.: „alert.signature”, „flow.bytes_toserver”) */
  campuri: Record<string, ValoareCamp>;
  /** linia brută, exact cum apare în fișierul de jurnal */
  brut: string;
  faza: Faza;
}

export interface FisiereProbe {
  "eve.json": string;
  "auth.log": string;
  "access.log": string;
  "mail.log": string;
  "email-suspect.eml": string;
}

export interface SetDateSecuritate {
  seed: number;
  organizatie: string;
  data: string;
  evenimente: Eveniment[];
  fisiere: FisiereProbe;
}

export const ETICHETE_FAZA: Record<Faza, string> = {
  benign: "Activitate legitimă",
  sqli: "SQL injection pe aplicația web",
  scanare: "Scanare de porturi",
  brute_force: "Brute-force pe VPN",
  acces_initial: "Autentificare reușită (acces inițial)",
  miscare_laterala: "Mișcare laterală",
  exfiltrare: "Exfiltrare de date",
  email_frauda: "Fraudă prin e-mail / redirecționare",
};

export const ETICHETE_SURSA: Record<Sursa, string> = {
  suricata: "Suricata (EVE JSON)",
  auth: "Autentificare (VPN/SSH/AD)",
  web: "Server web (access.log)",
  email: "Poștă electronică",
};
