/**
 * Răspunsuri precalculate pentru MODUL DEMONSTRATIV („rulare înregistrată”), folosit când
 * browserul nu are WebGPU. Sunt răspunsuri extractive, ancorate în surse, marcate vizibil ca
 * rulare înregistrată — niciodată prezentate ca rulare live.
 */
export interface RaspunsInregistrat {
  potrivire: string[]; // cuvinte-cheie din întrebare
  raspuns: string;
  surse: string[];
}

export const RASPUNSURI_INREGISTRATE: RaspunsInregistrat[] = [
  { potrivire: ["program", "public"], raspuns: "Programul cu publicul la centrele de relații cu clienții este luni–vineri, 08:00–16:00.", surse: ["DOC-01"] },
  { potrivire: ["factur", "plat", "termen", "penalit"], raspuns: "Termenul de plată este de 30 de zile de la emiterea facturii; la întârziere se aplică penalități de 0,02% pe zi.", surse: ["DOC-02"] },
  { potrivire: ["date personale", "rgpd", "protecția datelor", "drepturi"], raspuns: "Vă puteți exercita drepturile printr-o cerere către responsabilul cu protecția datelor, la dpo@utilitati-demo.example.", surse: ["DOC-03"] },
  { potrivire: ["avarie", "intervenție", "grad 1"], raspuns: "Pentru o avarie de grad 1 (critic) se trimite o echipă în maximum 2 ore, cu timp-țintă de remediere de 8 ore.", surse: ["DOC-04"] },
  { potrivire: ["parol", "autentificare", "securitate", "mfa"], raspuns: "Politica internă cere autentificare multifactor și parole de minimum 12 caractere.", surse: ["DOC-05"] },
  { potrivire: ["verific", "identitate", "telefon", "operator"], raspuns: "Operatorul verifică identitatea clientului prin codul de client și adresa de consum.", surse: ["DOC-06"] },
  { potrivire: ["racordare", "consumator", "termen"], raspuns: "Termenul standard de racordare pentru un consumator casnic este de 90 de zile de la avizul tehnic de racordare.", surse: ["DOC-07"] },
  { potrivire: ["index", "contor", "autocitire", "transmit"], raspuns: "Indexul se transmite în perioada de autocitire, zilele 20–25 ale lunii, prin aplicație, site sau telefonic.", surse: ["DOC-12"] },
  { potrivire: ["contest", "factur"], raspuns: "O factură poate fi contestată în 30 de zile de la primire; pe durata soluționării se achită suma necontestată.", surse: ["DOC-13"] },
  { potrivire: ["continuitate", "avarie extinsă", "comunic"], raspuns: "Conform planului de continuitate, clienții sunt anunțați prin site, aplicație și mass-media locală.", surse: ["DOC-14"] },
];

export function raspunsInregistrat(intrebare: string): RaspunsInregistrat | null {
  const t = intrebare.toLowerCase();
  let best: RaspunsInregistrat | null = null;
  let bestScor = 0;
  for (const r of RASPUNSURI_INREGISTRATE) {
    const scor = r.potrivire.filter((k) => t.includes(k)).length;
    if (scor > bestScor) {
      bestScor = scor;
      best = r;
    }
  }
  return bestScor > 0 ? best : null;
}
