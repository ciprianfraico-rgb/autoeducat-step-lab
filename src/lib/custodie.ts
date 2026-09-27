/** SHA-256 al unui text, prin Web Crypto (rulează în browser). */
export async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface IntrareCustodie {
  proba: string;
  hash: string;
  ora: string;
  operator: string;
  observatii?: string;
}

export interface EvenimentMarcatCustodie {
  id: string;
  ora: string;
  sursa: string;
  mesaj: string;
}

/** Generează procesul-verbal de custodie ca text Markdown. */
export function procesVerbalMarkdown(opts: {
  organizatie: string;
  dataIncident: string;
  operator: string;
  cazId: string;
  probe: IntrareCustodie[];
  cronologie: EvenimentMarcatCustodie[];
  generatLa: string;
}): string {
  const { organizatie, dataIncident, operator, cazId, probe, cronologie, generatLa } = opts;
  const linii: string[] = [];
  linii.push(`# Proces-verbal de custodie a probelor digitale`);
  linii.push("");
  linii.push(`**Caz:** ${cazId}`);
  linii.push(`**Organizație (mediu sintetic):** ${organizatie}`);
  linii.push(`**Data incidentului:** ${dataIncident}`);
  linii.push(`**Operator investigație:** ${operator}`);
  linii.push(`**Generat la:** ${generatLa}`);
  linii.push("");
  linii.push(
    `> Document didactic. Probele provin dintr-un set de date **sintetic**, generat determinist; nu conțin date personale reale.`,
  );
  linii.push("");
  linii.push(`## 1. Probe colectate și amprente de integritate (SHA-256)`);
  linii.push("");
  linii.push(`| # | Probă | SHA-256 | Ora colectării | Operator |`);
  linii.push(`|---|-------|---------|----------------|----------|`);
  probe.forEach((p, i) => {
    linii.push(`| ${i + 1} | \`${p.proba}\` | \`${p.hash}\` | ${p.ora} | ${p.operator} |`);
  });
  linii.push("");
  linii.push(`## 2. Cronologia incidentului (evenimente marcate)`);
  linii.push("");
  if (cronologie.length === 0) {
    linii.push("_Niciun eveniment marcat._");
  } else {
    linii.push(`| Ora | Sursă | ID | Descriere |`);
    linii.push(`|-----|-------|----|-----------|`);
    for (const e of cronologie) {
      linii.push(`| ${e.ora} | ${e.sursa} | ${e.id} | ${e.mesaj.replace(/\|/g, "\\|")} |`);
    }
  }
  linii.push("");
  linii.push(`## 3. Lanțul de custodie`);
  linii.push("");
  linii.push(
    `Probele au fost extrase din laboratorul virtual izolat al participantului, la ${generatLa}, de către ${operator}. ` +
      `Amprentele SHA-256 de mai sus permit verificarea ulterioară a integrității: recalcularea hash-ului aceleiași probe trebuie să dea aceeași valoare. ` +
      `Orice modificare a unui fișier de probă schimbă amprenta.`,
  );
  linii.push("");
  linii.push(`_Semnătura operatorului: __________________________    Data: ${generatLa}_`);
  linii.push("");
  return linii.join("\n");
}
