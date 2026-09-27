/**
 * Catalogul celor 11 laboratoare (L1–L5 ale Cursului 1; LAB-IA1–LAB-IA6 ale Cursului 2).
 * Orele, competențele și rezultatele verificabile provin din programa celor două cursuri
 * (180 h = 60 T + 120 P), reconstituite pentru prototip. Incidentele DNSC 2025 sunt citate
 * doar ca sursă de inspirație; datele tehnice sunt sintetice.
 */
export type Curs = "curs1" | "curs2";

export interface VerbApel {
  intelegere: string;
  dezvoltare: string;
  testare: string;
  adaptare: string;
}

export interface Scenariu {
  id: string;
  cod: string;
  curs: Curs;
  titlu: string;
  orePractica: number;
  competente: string[];
  incident?: string;
  faceParticipantul: string;
  rezultatVerificabil: string;
  verbe: VerbApel;
  obiective: string[];
  pasi: string[];
  dateFolosite: string[];
  criteriiEvaluare: string[];
  /** ancoră spre demonstrația live, dacă există */
  demo?: "/lab/securitate" | "/lab/ia";
}

export const ETICHETE_CURS: Record<Curs, string> = {
  curs1: "Cursul 1 — Securitatea sistemelor informatice (COR 252913)",
  curs2: "Cursul 2 — IA generativă în organizații (COR 251101)",
};

export const SCENARII: Scenariu[] = [
  {
    id: "L1",
    cod: "L1",
    curs: "curs1",
    titlu: "Igienă și reziliență",
    orePractica: 20,
    competente: ["C13 Politici de securitate", "C22 Exerciții de recuperare", "C2 Protecția mediului"],
    incident: "Reconstrucție sintetică inspirată de un caz de ransomware cu software piratat și backup netestat (DNSC 2025).",
    faceParticipantul:
      "Inventariază activele, aplică regula de backup 3-2-1 și execută un test de restaurare cronometrat, apoi scrie politica de reziliență a organizației.",
    rezultatVerificabil: "Set de politici + plan de recuperare și raport al exercițiului de restaurare, cu timpul de recuperare.",
    verbe: {
      intelegere: "Analizează vectorul incidentului: lipsa igienei de licențiere și a backupului testat.",
      dezvoltare: "Construiește inventarul activelor, licențierea, backupul 3-2-1 și planul de recuperare.",
      testare: "Rulează un exercițiu de restaurare cronometrat.",
      adaptare: "Scrie politica de reziliență adaptată organizației proprii.",
    },
    obiective: [
      "Aplică regula de backup 3-2-1 pe un scenariu real.",
      "Măsoară timpul de restaurare și îl compară cu obiectivul (RTO).",
      "Redactează o politică de reziliență adaptată organizației.",
    ],
    pasi: [
      "Inventarierea activelor și a licențelor.",
      "Configurarea backupului 3-2-1 în mediul izolat.",
      "Simularea pierderii de date și restaurarea cronometrată.",
      "Redactarea politicii și a planului de recuperare.",
    ],
    dateFolosite: ["Inventar sintetic de active", "Set de fișiere de test pentru backup/restore"],
    criteriiEvaluare: [
      "Backupul respectă regula 3-2-1.",
      "Testul de restaurare reușește și este cronometrat.",
      "Politica acoperă rolurile, frecvența și verificarea.",
    ],
  },
  {
    id: "L2",
    cod: "L2",
    curs: "curs1",
    titlu: "Securitatea aplicațiilor și a identității (cu investigare criminalistică)",
    orePractica: 26,
    competente: [
      "C15 Măsuri de securitate a infrastructurii",
      "C16 Confidențialitate",
      "C20 Vulnerabilitățile aplicațiilor web",
      "C23 Investigație digitală",
    ],
    incident: "Reconstrucție sintetică inspirată de un lanț SQL injection → Active Directory → exfiltrare (DNSC 2025).",
    faceParticipantul:
      "Analizează o aplicație web expusă în mediul izolat, segmentează rețeaua, detectează mișcarea laterală și conduce o investigație criminalistică cu lanț de custodie.",
    rezultatVerificabil:
      "Reguli de filtrare + segmentare testate, matrice de clasificare a informațiilor și raport de expertiză digitală cu cronologia din jurnale.",
    verbe: {
      intelegere: "Aplicație web expusă, mișcare laterală, cont privilegiat de persistență.",
      dezvoltare: "Segmentarea rețelei, conturile privilegiate, detecția mișcării laterale.",
      testare: "Testarea aplicației (doar în laborator) și validarea regulilor; probele, cronologia, lanțul de custodie.",
      adaptare: "Întărirea configurației pe arhitectura proprie.",
    },
    obiective: [
      "Recunoaște tiparul de injecție SQL în jurnalele web.",
      "Detectează mișcarea laterală și un cont de persistență.",
      "Colectează probe și reconstruiește cronologia cu lanț de custodie.",
    ],
    pasi: [
      "Explorarea jurnalelor web pentru tipare de injecție.",
      "Corelarea cu autentificările în Active Directory.",
      "Scrierea regulilor de detecție și validarea lor.",
      "Colectarea probelor, calculul SHA-256 și procesul-verbal de custodie.",
    ],
    dateFolosite: ["access.log sintetic", "eve.json (Suricata)", "auth.log (AD/VPN)"],
    criteriiEvaluare: [
      "Regula de injecție SQL prinde atacul fără fals-pozitive majore.",
      "Contul de persistență este identificat.",
      "Procesul-verbal conține hash-urile și cronologia corectă.",
    ],
    demo: "/lab/securitate",
  },
  {
    id: "L3",
    cod: "L3",
    curs: "curs1",
    titlu: "Acces la distanță (cu investigare criminalistică)",
    orePractica: 12,
    competente: ["C17 Monitorizarea incidentelor", "C19 Drepturi de acces / MFA", "C24 Dispozitive mobile și muncă la distanță"],
    incident: "Reconstrucție sintetică inspirată de un atac de brute-force pe VPN urmat de ransomware (DNSC 2025).",
    faceParticipantul:
      "Scrie și testează reguli de detecție într-un SIEM pentru autentificări repetate pe VPN, corelează evenimentele și adaptează politica de acces la distanță.",
    rezultatVerificabil: "Reguli de detecție testate într-un SIEM + jurnal de triaj al alertelor și politica de acces la distanță.",
    verbe: {
      intelegere: "Acces la distanță neprotejat, autentificări repetate (brute-force pe VPN).",
      dezvoltare: "MFA, politici de acces, reguli de detecție a autentificărilor repetate.",
      testare: "Scrierea și testarea regulilor într-un SIEM; corelarea evenimentelor, cronologia, lanțul de custodie.",
      adaptare: "Politica de acces la distanță.",
    },
    obiective: [
      "Scrie o regulă de prag care detectează brute-force fără a semnala greșelile obișnuite.",
      "Corelează reușita de autentificare cu seria de eșecuri.",
      "Adaptează politica de acces (MFA, blocare).",
    ],
    pasi: [
      "Explorarea jurnalelor de autentificare VPN.",
      "Scrierea unei reguli Sigma-like cu prag pe fereastră glisantă.",
      "Testarea regulii și analiza fals-pozitivelor.",
      "Marcarea cronologiei și custodia probelor.",
    ],
    dateFolosite: ["auth.log sintetic (VPN/SSH/AD)", "eve.json (Suricata)"],
    criteriiEvaluare: [
      "Regula are rapel 100% pe faza de brute-force.",
      "Fals-pozitivele sunt explicate și minimizate.",
      "Politica include MFA și un prag de blocare.",
    ],
    demo: "/lab/securitate",
  },
  {
    id: "L4",
    cod: "L4",
    curs: "curs1",
    titlu: "Securitatea e-mailului și controale financiare",
    orePractica: 12,
    competente: ["C18 Planuri de răspuns la incidente", "C8 Legislație TIC", "C1 Competențe digitale"],
    incident: "Reconstrucție sintetică inspirată de o compromitere de e-mail cu MitM și transfer neautorizat (DNSC 2025).",
    faceParticipantul:
      "Verifică o configurație DMARC/SPF/DKIM, detectează o regulă abuzivă de redirecționare și analizează un e-mail cu anteturi falsificate, apoi scrie procedura de verificare financiară.",
    rezultatVerificabil: "Plan de răspuns la incidentul de e-mail și fraudă, testat, plus analiza anteturilor.",
    verbe: {
      intelegere: "Compromiterea căsuțelor, redirecționările de e-mail, MitM.",
      dezvoltare: "DMARC/SPF/DKIM, detecția regulilor de redirecționare, verificarea modificărilor bancare.",
      testare: "Verificarea configurației de e-mail și a regulilor de detecție.",
      adaptare: "Procedura de securitate a e-mailului și de verificare financiară.",
    },
    obiective: [
      "Citește rezultatele SPF/DKIM/DMARC dintr-un antet.",
      "Recunoaște indiciile de fraudă (Reply-To divergent, urgență, schimbare de IBAN).",
      "Detectează o regulă de redirecționare creată abuziv.",
    ],
    pasi: [
      "Analiza fișierului .eml și a antetelor de autentificare.",
      "Detectarea regulii de redirecționare în jurnalele de e-mail.",
      "Redactarea procedurii de verificare a modificărilor bancare.",
    ],
    dateFolosite: ["mail.log sintetic", "email-suspect.eml"],
    criteriiEvaluare: [
      "E-mailul de fraudă este identificat pe baza SPF/DKIM/DMARC.",
      "Regula de redirecționare abuzivă este semnalată.",
      "Procedura financiară cere verificarea pe canal secundar.",
    ],
    demo: "/lab/securitate",
  },
  {
    id: "L5",
    cod: "L5",
    curs: "curs1",
    titlu: "Managementul vulnerabilităților",
    orePractica: 12,
    competente: ["C14 Identificarea vulnerabilităților", "C21 Evaluarea riscurilor", "C6 Gândire critică"],
    incident: "Reconstrucție sintetică inspirată de un ransomware printr-o vulnerabilitate publică nepatchată (DNSC 2025).",
    faceParticipantul:
      "Rulează o scanare autorizată în laborator, prioritizează după CVSS/EPSS, planifică patchingul și ține registrul riscurilor.",
    rezultatVerificabil: "Raport de scanare autorizată + plan de remediere și registrul riscurilor.",
    verbe: {
      intelegere: "Vulnerabilitate publică nepatchată pe echipamentul de perimetru.",
      dezvoltare: "Scanarea, prioritizarea (CVSS/EPSS), patchingul, gestionarea excepțiilor.",
      testare: "Scanarea autorizată și verificarea remedierii.",
      adaptare: "Procesul de management al vulnerabilităților.",
    },
    obiective: [
      "Prioritizează vulnerabilitățile cu CVSS și EPSS.",
      "Construiește un plan de remediere realist.",
      "Documentează excepțiile și riscurile reziduale.",
    ],
    pasi: [
      "Rularea scanării autorizate pe mașini intenționat vulnerabile.",
      "Prioritizarea rezultatelor.",
      "Planul de patching și registrul riscurilor.",
    ],
    dateFolosite: ["Raport de scanare sintetic", "Catalog CVE/CVSS/EPSS didactic"],
    criteriiEvaluare: [
      "Prioritizarea combină CVSS și EPSS.",
      "Planul de remediere are termene și responsabili.",
      "Excepțiile sunt justificate.",
    ],
  },
  {
    id: "LAB-IA1",
    cod: "LAB-IA1",
    curs: "curs2",
    titlu: "Cazul de lucru și proiectarea conceptuală",
    orePractica: 18,
    competente: ["C1 Organizarea locului de muncă", "C3 SSM", "C8 Proiectare conceptuală/logică"],
    faceParticipantul:
      "Alege cazul, construiește corpusul sintetic sau îl anonimizează, proiectează fluxul de date și modelul logic și face încadrarea preliminară după AI Act.",
    rezultatVerificabil:
      "Specificația conceptuală și logică, fișa corpusului și încadrarea preliminară după Regulamentul (UE) 2024/1689.",
    verbe: {
      intelegere: "Cerințele cazului și decizia dacă IA generativă este soluția potrivită.",
      dezvoltare: "Fluxul de date și modelul logic → specificația conceptuală; corpusul sintetic sau anonimizat.",
      testare: "— (sistemul se testează în LAB-IA3 și LAB-IA4).",
      adaptare: "Cazul construit pe tiparul documentelor din tipul de organizație al participantului.",
    },
    obiective: [
      "Formulează cerințele unui asistent RAG pentru un caz real de organizație.",
      "Proiectează structura logică a datelor (documente, fragmente, etichete de acces).",
      "Face încadrarea preliminară de risc după AI Act.",
    ],
    pasi: [
      "Alegerea cazului și a tipului de organizație.",
      "Construirea corpusului sintetic etichetat pe niveluri de acces.",
      "Diagrama fluxului de date și specificația.",
      "Încadrarea preliminară de risc.",
    ],
    dateFolosite: ["Corpus sintetic „Utilități Demo SA” (14 documente)"],
    criteriiEvaluare: [
      "Corpusul este sintetic și etichetat pe niveluri de acces.",
      "Specificația descrie fluxul sursă → răspuns.",
      "Încadrarea de risc este argumentată.",
    ],
    demo: "/lab/ia",
  },
  {
    id: "LAB-IA2",
    cod: "LAB-IA2",
    curs: "curs2",
    titlu: "Proiectarea fizică și prototipul RAG cu agent",
    orePractica: 20,
    competente: ["C2 Întreținerea echipamentelor", "C9 Proiectarea realizării fizice"],
    faceParticipantul:
      "Alege și justifică modelul, încorporările, fragmentarea și indexul, construiește prototipul RAG cu un agent cu instrumente limitate și compară două configurații.",
    rezultatVerificabil: "Arhitectura fizică documentată + prototipul funcțional și jurnalul de întreținere a mediului.",
    verbe: {
      intelegere: "Alegerea și justificarea modelului, a încorporărilor, a fragmentării, a indexului.",
      dezvoltare: "Prototipul RAG cu agent; arhitectura fizică documentată.",
      testare: "Compararea a două strategii de fragmentare și a două configurații de recuperare.",
      adaptare: "Configurația de recuperare aleasă pe corpusul cazului propriu.",
    },
    obiective: [
      "Indexează un corpus în browser cu încorporări și căutare cosinus.",
      "Compară două strategii de fragmentare (mărime/suprapunere).",
      "Justifică alegerea modelului cu ponderi deschise și a configurației.",
    ],
    pasi: [
      "Configurarea fragmentării și a suprapunerii.",
      "Generarea încorporărilor și indexarea în browser.",
      "Interogarea cu citarea fragmentelor recuperate.",
      "Compararea a două configurații.",
    ],
    dateFolosite: ["Corpus sintetic", "Model cu ponderi deschise rulat prin WebGPU"],
    criteriiEvaluare: [
      "Prototipul returnează fragmentele recuperate cu id-uri.",
      "Cele două configurații sunt comparate cu metrici.",
      "Alegerea este argumentată.",
    ],
    demo: "/lab/ia",
  },
  {
    id: "LAB-IA3",
    cod: "LAB-IA3",
    curs: "curs2",
    titlu: "Evaluarea: halucinații, seturi de test, human-in-the-loop",
    orePractica: 10,
    competente: ["C5 Lucrul în echipă (RACI)", "C10 Proiectarea testării"],
    faceParticipantul:
      "Construiește un set de test, măsoară precizia recuperării și fidelitatea citării, organizează revizuirea umană și evaluarea încrucișată.",
    rezultatVerificabil: "Plan și raport de testare cu metrici, raport de evaluare încrucișată și matricea RACI.",
    verbe: {
      intelegere: "Parametrii de evaluare: fidelitatea față de surse, relevanța, rata de halucinație.",
      dezvoltare: "Planul de testare și setul de test de referință.",
      testare: "Măsurarea fidelității, a relevanței, a ratei de halucinație; revizuirea umană.",
      adaptare: "Matricea responsabilităților (RACI) pe rolurile unui proiect de IA.",
    },
    obiective: [
      "Calculează precision@k și un indicator de fidelitate a citării.",
      "Aplică protocolul human-in-the-loop (acceptat/respins).",
      "Exportă rezultatele pentru raportare.",
    ],
    pasi: [
      "Rularea setului de test pe sistem.",
      "Calculul metricilor de recuperare și citare.",
      "Revizuirea umană a unui eșantion.",
      "Exportul CSV.",
    ],
    dateFolosite: ["Set de test de 10 întrebări cu surse și răspuns de referință"],
    criteriiEvaluare: [
      "precision@k este calculat corect.",
      "Fidelitatea citării este evaluată per întrebare.",
      "Revizuirea umană este documentată.",
    ],
    demo: "/lab/ia",
  },
  {
    id: "LAB-IA4",
    cod: "LAB-IA4",
    curs: "curs2",
    titlu: "Atacul controlat și securizarea",
    orePractica: 16,
    competente: ["C7 Protecția datelor (OWASP LLM)", "C9 Măsuri de securitate", "C10 Red-teaming"],
    faceParticipantul:
      "Execută red-teaming pe OWASP LLM01–LLM10 asupra propriului sistem, proiectează și aplică controalele, apoi retestează într-un tabel înainte/după.",
    rezultatVerificabil: "Raport de red-teaming cu retestare, matricea de control al accesului la surse și specificația măsurilor.",
    verbe: {
      intelegere: "Categoriile OWASP LLM01–LLM10 aplicate propriului sistem.",
      dezvoltare: "Filtrele de intrare/ieșire, izolarea instrumentelor, etichetarea pe niveluri de acces.",
      testare: "Red-teaming (injecție directă/indirectă, extragere, otrăvirea indexului) și retestarea după securizare.",
      adaptare: "Matricea de control al accesului la surse pe nivelurile documentelor cazului.",
    },
    obiective: [
      "Rulează 8 atacuri controlate asupra propriului sistem.",
      "Comută măsurile de protecție și observă efectul.",
      "Mapează fiecare atac la categoria OWASP LLM.",
    ],
    pasi: [
      "Selectarea rolului și a nivelurilor de acces.",
      "Rularea atacurilor cu măsurile dezactivate.",
      "Activarea măsurilor și retestarea.",
      "Completarea tabelului înainte/după.",
    ],
    dateFolosite: ["Corpus cu un document otrăvit (injecție indirectă)", "8 atacuri pregătite"],
    criteriiEvaluare: [
      "Toate atacurile sunt rulate înainte și după măsuri.",
      "Injecția indirectă din documentul otrăvit este neutralizată.",
      "Datele confidențiale nu ajung la un rol fără acces.",
    ],
    demo: "/lab/ia",
  },
  {
    id: "LAB-IA5",
    cod: "LAB-IA5",
    curs: "curs2",
    titlu: "Implementarea, operarea și întreținerea",
    orePractica: 34,
    competente: ["C4 Protecția mediului (energie)", "C11 Implementare", "C12 Întreținere"],
    faceParticipantul:
      "Planifică și simulează punerea în funcțiune, configurează monitorizarea și pragurile, rulează testul de regresie și măsoară consumul de energie pentru două configurații.",
    rezultatVerificabil:
      "Plan de implementare și de întreținere, raport de regresie, notă de eficiență energetică și textul de informare (art. 50).",
    verbe: {
      intelegere: "Parametrii de exploatare: calitate, halucinație, derivă, latență, cost, energie.",
      dezvoltare: "Planul de implementare; barierele, limitele și jurnalizarea; tabloul de monitorizare.",
      testare: "Simularea punerii în funcțiune; testul de regresie; măsurarea energiei pe interogare.",
      adaptare: "Decizia de configurare (model mai mare / model mai mic cuantizat); textul art. 50.",
    },
    obiective: [
      "Măsoară latența, tokenii și o estimare orientativă de energie pe interogare.",
      "Compară o configurație mai mare cu una mai mică, cuantizată.",
      "Redactează textul de informare a utilizatorilor (art. 50).",
    ],
    pasi: [
      "Rularea interogărilor cu telemetrie activă.",
      "Compararea a două configurații.",
      "Nota de eficiență energetică și decizia argumentată.",
    ],
    dateFolosite: ["Telemetrie din laboratorul de IA (latență, tokeni, energie estimată)"],
    criteriiEvaluare: [
      "Telemetria este colectată pe interogare.",
      "Decizia de configurare este argumentată cu date.",
      "Textul art. 50 informează corect utilizatorul.",
    ],
    demo: "/lab/ia",
  },
  {
    id: "LAB-IA6",
    cod: "LAB-IA6",
    curs: "curs2",
    titlu: "Dezvoltarea, calitatea și dosarul de conformitate",
    orePractica: 22,
    competente: ["C6 Comunicare", "C13 Dezvoltare", "C14 Calitate (ISO/IEC 42001)", "C15 Documentație (AI Act)"],
    faceParticipantul:
      "Planifică dezvoltarea, testează salvarea și restaurarea indexului, completează registrul riscurilor și dosarul tehnic de conformitate.",
    rezultatVerificabil: "Plan de dezvoltare, registrul riscurilor, dosar tehnic și de conformitate și nota de prezentare.",
    verbe: {
      intelegere: "Încadrarea finală în categoria de risc, cu obligațiile și termenele.",
      dezvoltare: "Planul pe 12–24 de luni; registrul riscurilor; dosarul tehnic.",
      testare: "Evaluarea unui model alternativ pe același set de test; testul de salvare/restaurare; lista ISO/IEC 42001.",
      adaptare: "Nota de prezentare pentru conducere și fișa de informare a utilizatorilor.",
    },
    obiective: [
      "Încadrează sistemul în categoriile de risc ale AI Act.",
      "Verifică proiectul pe o listă derivată din ISO/IEC 42001.",
      "Pregătește dosarul tehnic și de conformitate.",
    ],
    pasi: [
      "Încadrarea finală de risc, cu obligații și termene.",
      "Completarea registrului riscurilor.",
      "Verificarea pe lista de control ISO/IEC 42001.",
      "Redactarea dosarului și a notei de prezentare.",
    ],
    dateFolosite: ["Lista de control ISO/IEC 42001 (didactică)", "Categoriile de risc AI Act"],
    criteriiEvaluare: [
      "Încadrarea de risc este corectă și argumentată.",
      "Registrul riscurilor are măsuri și responsabili.",
      "Dosarul acoperă obligațiile și termenele.",
    ],
  },
];

export function scenariuDupaId(id: string) {
  return SCENARII.find((s) => s.id === id);
}
