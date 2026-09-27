/**
 * Scrie setul de date sintetic în public/date-securitate/ (fișierele de probe brute),
 * pentru descărcare din laborator și pentru inspecție. Rulare: npm run genereaza-date
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { genereazaSetDate, SEED_IMPLICIT } from "../src/lib/securitate/generator";

const set = genereazaSetDate(SEED_IMPLICIT);
const dir = resolve(process.cwd(), "public", "date-securitate");
mkdirSync(dir, { recursive: true });

for (const [nume, continut] of Object.entries(set.fisiere)) {
  writeFileSync(resolve(dir, nume), continut, "utf8");
}
writeFileSync(
  resolve(dir, "manifest.json"),
  JSON.stringify(
    {
      seed: set.seed,
      organizatie: set.organizatie,
      data: set.data,
      numarEvenimente: set.evenimente.length,
      fisiere: Object.keys(set.fisiere),
      nota: "Date sintetice, generate determinist. Fără date personale reale.",
    },
    null,
    2,
  ),
  "utf8",
);

console.log(`Scris ${Object.keys(set.fisiere).length} fișiere în ${dir} (${set.evenimente.length} evenimente).`);
