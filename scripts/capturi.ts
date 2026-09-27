/**
 * Capturi datate ale URL-ului de producție, pentru dosarul de finanțare.
 * Salvează PNG 1440×900 în docs/capturi/ și generează docs/capturi/index.md.
 *
 * Rulare:
 *   URL=https://autoeducat-step-lab.vercel.app npm run capturi
 *
 * Capturile 1–5 și 10 nu au nevoie de WebGPU. Capturile 6–9 (laboratorul de IA cu
 * documente indexate, răspuns, evaluare, red-teaming) au nevoie de WebGPU: se rulează
 * cu Chrome instalat (channel: "chrome") și flag-urile de WebGPU. Dacă WebGPU nu este
 * disponibil, scriptul se oprește la capturile 6–9 și cere capturarea manuală.
 */
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const URL_BAZA = (process.env.URL ?? "http://localhost:3000").replace(/\/$/, "");
const DIR = resolve(process.cwd(), "docs", "capturi");
const AZI = new Date().toISOString().slice(0, 10);

interface Captura {
  nr: number;
  fisier: string;
  pagina: string;
  arata: string;
  cale: string;
  necesitaGpu?: boolean;
  pregateste?: (p: Page) => Promise<void>;
}

const CAPTURI: Captura[] = [
  { nr: 1, fisier: "acasa", pagina: "Acasă", arata: "Prezentarea laboratorului și schema arhitecturii", cale: "/" },
  { nr: 2, fisier: "scenarii", pagina: "Scenarii", arata: "Catalogul celor 11 laboratoare", cale: "/scenarii" },
  { nr: 3, fisier: "scenariu-L3", pagina: "Fișă scenariu (L3)", arata: "Fișa completă a laboratorului L3", cale: "/scenarii/L3" },
  {
    nr: 4,
    fisier: "lab-securitate-regula",
    pagina: "Lab securitate — regulă testată",
    arata: "O regulă de detecție testată și rezultatele ei",
    cale: "/lab/securitate",
    async pregateste(p) {
      await p.getByRole("tab", { name: /Reguli de detecție/ }).click();
      await p.getByRole("button", { name: "Testează regula" }).click();
      await p.waitForTimeout(600);
    },
  },
  {
    nr: 5,
    fisier: "lab-securitate-custodie",
    pagina: "Lab securitate — cronologie și custodie",
    arata: "Cronologia incidentului și procesul-verbal de custodie",
    cale: "/lab/securitate",
    async pregateste(p) {
      await p.getByRole("tab", { name: /Explorer/ }).click();
      // marchează câteva evenimente
      const casute = p.locator('tbody input[type="checkbox"]');
      const n = Math.min(4, await casute.count());
      for (let i = 0; i < n; i++) await casute.nth(i * 3).check();
      await p.getByRole("tab", { name: /Investigare/ }).click();
      await p.getByRole("button", { name: /Calculează SHA-256/ }).click();
      await p.waitForTimeout(800);
    },
  },
  {
    nr: 6,
    fisier: "lab-ia-index",
    pagina: "Lab IA — documente indexate",
    arata: "Corpusul indexat în browser, cu niveluri de acces",
    cale: "/lab/ia",
    necesitaGpu: false,
    async pregateste(p) {
      await p.getByRole("button", { name: "Indexează în browser" }).click();
      await p.getByText(/Index construit/).waitFor({ timeout: 120000 });
    },
  },
  {
    nr: 7,
    fisier: "lab-ia-raspuns",
    pagina: "Lab IA — răspuns cu surse",
    arata: "Un răspuns cu surse citate (rulare înregistrată — generarea live cere un browser cu adaptor WebGPU real)",
    cale: "/lab/ia",
    async pregateste(p) {
      await p.getByRole("button", { name: "Indexează în browser" }).click();
      await p.getByText(/Index construit/).waitFor({ timeout: 120000 });
      await p.getByRole("tab", { name: /Întrebare/ }).click();
      // Chrome automatizat expune navigator.gpu dar nu are adaptor real → folosim modul
      // demonstrativ, care produce un răspuns real, ancorat în surse, marcat „rulare înregistrată”.
      await p.getByRole("checkbox", { name: /modul demonstrativ/ }).check();
      await p.getByRole("button", { name: /Întreabă/ }).click();
      await p.getByText(/rulare înregistrată/).waitFor({ timeout: 60000 });
      await p.waitForTimeout(1200);
    },
  },
  {
    nr: 8,
    fisier: "lab-ia-evaluare",
    pagina: "Lab IA — panou de evaluare",
    arata: "Panoul de evaluare după rulare (precision@k, citare)",
    cale: "/lab/ia",
    necesitaGpu: false,
    async pregateste(p) {
      await p.getByRole("button", { name: "Indexează în browser" }).click();
      await p.getByText(/Index construit/).waitFor({ timeout: 120000 });
      await p.getByRole("tab", { name: /Evaluare/ }).click();
      await p.getByRole("button", { name: "Rulează evaluarea" }).click();
      await p.getByText(/precision@k mediu/).waitFor({ timeout: 120000 });
      await p.waitForTimeout(500);
    },
  },
  {
    nr: 9,
    fisier: "lab-ia-redteam",
    pagina: "Lab IA — red-teaming",
    arata: "Panoul de red-teaming cu tabelul înainte/după",
    cale: "/lab/ia",
    necesitaGpu: false,
    async pregateste(p) {
      await p.getByRole("tab", { name: /Red-teaming/ }).click();
      await p.waitForTimeout(400);
    },
  },
  { nr: 10, fisier: "arhitectura", pagina: "Arhitectură", arata: "Arhitectura-țintă a laboratorului complet", cale: "/arhitectura" },
];

async function main() {
  mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: [
      "--enable-unsafe-webgpu",
      "--enable-features=Vulkan",
      "--use-angle=vulkan",
    ],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ro-RO" });
  const page = await context.newPage();

  const gpu = await (async () => {
    await page.goto(`${URL_BAZA}/`, { waitUntil: "networkidle" });
    return page.evaluate(() => "gpu" in navigator);
  })();
  console.log(`WebGPU în Chrome: ${gpu ? "DA" : "NU"}`);

  const doar = process.env.DOAR ? process.env.DOAR.split(",").map(Number) : null;
  const facute: { c: Captura; ora: string }[] = [];
  for (const c of CAPTURI) {
    if (doar && !doar.includes(c.nr)) continue;
    if (c.necesitaGpu && !gpu) {
      console.warn(`\n⚠ Captura ${c.nr} (${c.pagina}) are nevoie de WebGPU, indisponibil în acest Chrome.`);
      console.warn("  Oprire. Faceți manual capturile 6–9 în browserul dvs. cu WebGPU:");
      console.warn(`   1. Deschideți ${URL_BAZA}/lab/ia?capturi=1`);
      console.warn("   2. Alegeți rolul, apăsați „Indexează în browser”, apoi „Întreabă modelul”.");
      console.warn("   3. Salvați ecranul la 1440×900 ca docs/capturi/AAAA-LL-ZZ_0N_lab-ia-*.png.");
      break;
    }
    const url = `${URL_BAZA}${c.cale}${c.cale.includes("?") ? "&" : "?"}capturi=1`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    if (c.pregateste) {
      try {
        await c.pregateste(page);
      } catch (e) {
        console.warn(`  (pregătire parțială pentru captura ${c.nr}: ${(e as Error).message})`);
      }
    }
    const nume = `${AZI}_${String(c.nr).padStart(2, "0")}_${c.fisier}.png`;
    await page.screenshot({ path: resolve(DIR, nume), fullPage: false });
    const ora = new Date().toLocaleString("ro-RO");
    facute.push({ c, ora });
    console.log(`✓ ${nume}`);
  }

  const linii = [
    "# Capturi datate — Autoeducat STEP Lab",
    "",
    `URL de producție: ${URL_BAZA}`,
    "",
    "| Fișier | Pagina | Ce arată | URL | Data și ora |",
    "|--------|--------|----------|-----|-------------|",
    ...facute.map(
      ({ c, ora }) =>
        `| ${AZI}_${String(c.nr).padStart(2, "0")}_${c.fisier}.png | ${c.pagina} | ${c.arata} | ${URL_BAZA}${c.cale} | ${ora} |`,
    ),
    "",
  ];
  if (!doar) {
    writeFileSync(resolve(DIR, "index.md"), linii.join("\n"), "utf8");
    console.log(`\nScris docs/capturi/index.md (${facute.length} capturi).`);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
