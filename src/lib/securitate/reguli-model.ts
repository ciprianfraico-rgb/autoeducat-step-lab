import type { Faza } from "./tipuri";

export interface RegulaModel {
  id: string;
  titlu: string;
  descriere: string;
  fazeTinta: Faza[];
  yaml: string;
}

export const REGULI_MODEL: RegulaModel[] = [
  {
    id: "brute-force",
    titlu: "Brute-force pe VPN",
    descriere:
      "Multe autentificări VPN eșuate de la aceeași sursă într-o fereastră scurtă. Prag: ≥ 10 eșecuri în 300 s pe același src_ip.",
    fazeTinta: ["brute_force"],
    yaml: `title: Brute-force pe VPN
sursa: auth
detection:
  selection:
    serviciu: vpn
    tip: auth_failure
  groupby: src_ip
  timeframe: 300
  count: 10
`,
  },
  {
    id: "scanare",
    titlu: "Scanare de porturi",
    descriere:
      "Aceeași sursă declanșează multe alerte de scanare SYN într-un interval scurt. Prag: ≥ 15 alerte în 120 s pe același src_ip.",
    fazeTinta: ["scanare"],
    yaml: `title: Scanare de porturi
sursa: suricata
detection:
  selection:
    alert.signature|contains: scanare de porturi
  groupby: src_ip
  timeframe: 120
  count: 15
`,
  },
  {
    id: "exfiltrare",
    titlu: "Exfiltrare de date",
    descriere:
      "Flux de ieșire de volum mare de la un server intern către o gazdă externă. Prag: bytes_toserver ≥ 500 MB pe un singur flux.",
    fazeTinta: ["exfiltrare"],
    yaml: `title: Exfiltrare de date
sursa: suricata
detection:
  selection:
    event_type: flow
    flow.bytes_toserver|gte: 500000000
`,
  },
  {
    id: "sqli",
    titlu: "SQL injection pe aplicația web",
    descriere:
      "Cereri web care conțin tipare de injecție SQL (UNION SELECT, OR 1=1, information_schema…) sau semnătura unui instrument automat.",
    fazeTinta: ["sqli"],
    yaml: `title: SQL injection pe aplicatia web
sursa: web
detection:
  selection:
    uri|contains: union select
  condition: selection
`,
  },
  {
    id: "acces-dupa-brute-force",
    titlu: "Autentificare reușită fără MFA de la sursă externă",
    descriere:
      "Autentificare VPN reușită fără MFA. Combinată cu brute-force pe aceeași sursă, marchează accesul inițial.",
    fazeTinta: ["acces_initial"],
    yaml: `title: Autentificare VPN reusita fara MFA
sursa: auth
detection:
  selection:
    serviciu: vpn
    tip: auth_success
    mfa: none
`,
  },
  {
    id: "cont-persistenta",
    titlu: "Creare cont și escaladare în Domain Admins",
    descriere:
      "Cont nou creat sau adăugat într-un grup privilegiat de pe o sursă neobișnuită — tipar de persistență în mișcarea laterală.",
    fazeTinta: ["miscare_laterala"],
    yaml: `title: Escaladare privilegii in AD
sursa: auth
detection:
  selection:
    tip|in: [account_created, group_change]
`,
  },
  {
    id: "email-dmarc-fail",
    titlu: "E-mail cu DMARC eșuat (posibilă fraudă)",
    descriere: "Mesaje primite cu DMARC=fail — impersonare probabilă a expeditorului.",
    fazeTinta: ["email_frauda"],
    yaml: `title: E-mail cu DMARC esuat
sursa: email
detection:
  selection:
    tip: mesaj_primit
    dmarc: fail
`,
  },
];
