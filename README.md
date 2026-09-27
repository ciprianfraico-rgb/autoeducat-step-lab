# Autoeducat STEP Lab — prototip laborator virtual

Prototip funcțional minimal al **laboratorului virtual comun** propus de Autoeducat SRL (Constanța) în cererea de finanțare **STEP-LLL** (PEO 2021–2027). Un evaluator deschide linkul de producție și vede cum arată practica pentru cele două cursuri:

- **Cursul 1 — Securitatea sistemelor informatice** (COR 252913): detecție și investigare pe date sintetice.
- **Cursul 2 — IA generativă în organizații** (COR 251101): un proiect RAG rulat integral în browser.

> Prototip realizat de Autoeducat SRL din resurse proprii. Proiectul **nu este finanțat**; nu se folosesc logo-uri UE/PEO/MIPE/ANC. Toate datele sunt **sintetice**.

## Ce funcționează live

- **Laboratorul de securitate** (`/lab/securitate`) — funcționează în orice browser, fără WebGPU:
  - set de date sintetic generat determinist (seed fix) pentru rețeaua fictivă „Firma Demo SRL”;
  - explorer de evenimente (tabel filtrabil, căutare, cronologie vizuală);
  - editor de reguli de detecție (subset Sigma-like în YAML), evaluat în browser cu adevărat-pozitive / fals-pozitive / ratări;
  - investigare: marcarea cronologiei, hash SHA-256 al probelor (Web Crypto), proces-verbal de custodie descărcabil (Markdown/PDF);
  - cel puțin 3 reguli-model cu rezultate (brute-force, scanare, exfiltrare) + SQLi, escaladare AD, DMARC.
- **Laboratorul de IA** (`/lab/ia`):
  - corpus sintetic de 14 documente pentru „Utilități Demo SA”, etichetate public/intern/confidențial (unul conține o injecție indirectă de prompt);
  - indexare în browser cu fragmentare configurabilă și încorporări (transformers.js, WASM — rulează și fără WebGPU);
  - întrebare → răspuns cu model cu ponderi deschise prin **WebGPU**, cu citarea surselor;
  - selector de rol (client/angajat/administrator) care filtrează sursele înainte de recuperare;
  - panou de evaluare (precision@k, verificarea citării, human-in-the-loop, export CSV);
  - panou de red-teaming OWASP LLM01–LLM10 cu tabel înainte/după măsuri;
  - telemetrie: latență, tokeni, estimare orientativă de energie.

Dacă browserul **nu are WebGPU**, generarea live cu modelul nu este posibilă; pagina o spune și oferă un **mod demonstrativ** etichetat „rulare înregistrată”. Indexarea și evaluarea rulează totuși (WASM).

## Ce este documentat (nu implementat acum)

Infrastructura completă (Suricata, SIEM Wazuh/ELK, mașini vulnerabile, server de inferență, bază vectorială) este descrisă ca **arhitectură-țintă** în `/arhitectura` și în [`docs/arhitectura.md`](docs/arhitectura.md).

## Rulare locală

Cerințe: Node.js 20+ (testat pe 24), un browser cu WebGPU (Chrome/Edge recent) pentru generarea live.

```bash
npm install
npm run dev             # http://localhost:3000
npm run test            # teste unitare (Vitest)
npm run lint            # ESLint
npm run build           # build de producție
npm run genereaza-date  # scrie fișierele de probe în public/date-securitate/
npm run capturi         # capturi datate (Playwright) ale URL-ului de producție
```

## Model și încorporări

- Model de limbaj: `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` (licență **Apache 2.0**), rulat prin `@mlc-ai/web-llm` (WebGPU). Alternativă: `Llama-3.2-1B-Instruct-q4f16_1-MLC`.
- Încorporări: `Xenova/multilingual-e5-small` prin `@huggingface/transformers` (suportă româna, rulează pe WASM).
- Totul rulează **client-side**; conținutul introdus nu părăsește browserul. Fără chei API în cod.

## Licențe

- Cod sursă: **MIT**.
- Scenarii și date sintetice: **CC BY-SA 4.0**.

## Legătura cu cererea STEP-LLL

Prototipul demonstrează cerința privind laboratorul virtual comun (un singur laborator pentru ambele cursuri, construit din resurse proprii, cu mediu izolat per participant și numai date sintetice). Incidentele din Raportul anual DNSC 2025 sunt citate **doar ca sursă de inspirație**, cu datele tehnice reconstituite integral sintetic. Fără date personale reale și fără date ale unor organizații reale.

Contact: office@autoeducat.ro · Autoeducat SRL, CUI RO41063642, Constanța.
