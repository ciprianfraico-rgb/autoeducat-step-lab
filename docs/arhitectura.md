# Arhitectura-țintă a laboratorului virtual comun

Acest document descrie arhitectura-țintă a laboratorului virtual complet propus de Autoeducat SRL pentru cele două cursuri STEP-LLL. Prototipul publicat implementează în browser straturile care se pot demonstra fără server; restul este documentat aici și urmează a fi implementat în luna L4, înainte de prima cohortă.

## Principii

- Numai date **sintetice** sau anonimizate; fără date personale reale.
- Modele de limbaj cu **ponderi deschise**, rulate local; opțional, comparație cu un model prin API (dezactivată implicit, cheia din variabile de mediu).
- **Mediu izolat** pentru fiecare participant, recreat la fiecare cohortă.
- Atacurile controlate vizează **doar sistemul propriu** al participantului.
- Nimic **nu se conectează la infrastructura** niciunui angajator.

## Zona de securitate (Cursul 1)

- Rețele virtuale segmentate și firewall între segmente.
- IDS/IPS cu **Suricata**, care emite alerte și fluxuri în format **EVE JSON**.
- **SIEM** (Wazuh sau ELK) pentru corelarea evenimentelor și regulile de detecție.
- Mașini **intenționat vulnerabile** pentru exercițiile de scanare și remediere.
- Scaner de vulnerabilități (**OpenVAS/Greenbone**).
- Stație de **investigație criminalistică** digitală.

## Zona de IA (Cursul 2)

- **Server de inferență** pentru modele cu ponderi deschise.
- **Bază de date vectorială** pentru indexul RAG.
- **Orchestrare** RAG cu agent cu instrumente limitate.
- Instrumente de **evaluare** (seturi de test, red-teaming, human-in-the-loop).
- **Monitorizare**: latență, cost, derivă, consum de energie.
- Suport pentru **dosarul de conformitate** (Regulamentul (UE) 2024/1689, ISO/IEC 42001).

## Izolare, capacitate, jurnalizare

- Cont individual și mediu izolat per participant, recreat la fiecare cohortă.
- Capacitate-țintă: **28 de participanți** simultan pe cohortă.
- Jurnalizarea activității pentru evidența practicii, fără date personale reale.

## Ce este live în prototip vs. ce este documentat

| Strat | În prototip (rulează în browser) | În versiunea completă |
|---|---|---|
| Detecție și investigare | Explorer de evenimente, motor de reguli Sigma-like, cronologie, custodie SHA-256 — pe date sintetice | Suricata + SIEM real, pe trafic din mașini de laborator |
| RAG și evaluare | Indexare, recuperare (cosinus), generare cu model cu ponderi deschise prin WebGPU, evaluare și red-teaming | Server de inferență dedicat, bază vectorială, orchestrare |
| Izolare | Mediu per-sesiune în browser | Mediu virtual izolat per participant, recreat la cohortă |
| Infrastructură ofensivă | Scenarii pe date sintetice | Mașini intenționat vulnerabile, scaner, segmentare |

## Implementarea în prototip (mapare tehnică)

- Aplicație web **Next.js 16** (App Router, TypeScript strict, Tailwind CSS v4), statică pe cât posibil.
- Model de limbaj în browser prin **WebGPU** cu `@mlc-ai/web-llm` — `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` (Apache 2.0).
- Încorporări în browser cu `@huggingface/transformers` — `Xenova/multilingual-e5-small` (rulează pe WASM, deci și fără WebGPU).
- Laboratorul de securitate lucrează pe seturi de date sintetice în formate reale: Suricata EVE JSON, jurnale de autentificare, jurnale web, anteturi de e-mail — generate determinist (`scripts/genereaza-date-securitate.ts`, seed fix).
- Dacă browserul nu are WebGPU, generarea live nu este posibilă; pagina o spune clar și oferă un **mod demonstrativ** etichetat „rulare înregistrată”. Rezultatele precalculate nu sunt prezentate niciodată ca rulare live.

## Calendar

**Acum — prototip demonstrabil** → **Luna L4 — versiunea completă** → **Luna L5 — startul primului val.**

Dimensionarea resurselor (număr de servere, capacitate de calcul, furnizori, costuri) este **de stabilit la implementare**; prototipul nu inventează costuri sau furnizori.
