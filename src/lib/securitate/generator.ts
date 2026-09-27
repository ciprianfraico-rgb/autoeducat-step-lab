/**
 * Generator determinist al setului de date sintetic pentru rețeaua fictivă „Firma Demo SRL”.
 *
 * Toate adresele externe sunt din blocurile rezervate pentru documentație (RFC 5737:
 * 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) sau din spațiul CGNAT (100.64.0.0/10),
 * iar domeniile folosesc TLD-ul rezervat „.example” (RFC 2606). Nu există date personale
 * reale; conturile sunt denumite după funcție.
 *
 * Scenariul încorporat (inspirat de tipare descrise în Raportul anual DNSC 2025, reconstituit
 * integral sintetic): SQL injection pe aplicația web → scanare de porturi → brute-force pe VPN →
 * autentificare reușită → mișcare laterală și cont de persistență → exfiltrare; în paralel,
 * o regulă de redirecționare a e-mailului și un e-mail cu anteturi falsificate.
 */
import { Aleator } from "../prng";
import type { Eveniment, Faza, SetDateSecuritate, ValoareCamp } from "./tipuri";

export const SEED_IMPLICIT = 20260312;

const ORGANIZATIE = "Firma Demo SRL";
const DOMENIU = "firma-demo.example";

// Topologia rețelei fictive
const IP = {
  vpnPublic: "198.51.100.10",
  webPublic: "198.51.100.20",
  dc: "10.10.1.10",
  fisiere: "10.10.1.20",
  backup: "10.10.1.30",
  scanerIntern: "10.10.5.5",
  statieIT: "10.10.3.15",
  atacatorWeb: "192.0.2.77",
  atacator: "203.0.113.45",
  destinatieExfil: "203.0.113.200",
  furnizorBackup: "192.0.2.10",
  vpnAtacator: "10.10.200.14",
} as const;

const ANGAJATI = [
  "contabilitate01",
  "contabilitate02",
  "hr01",
  "vanzari01",
  "vanzari02",
  "vanzari03",
  "logistica01",
  "achizitii01",
  "director01",
  "it.admin",
];

const LUNI = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const p2 = (n: number) => String(n).padStart(2, "0");

function hms(t: number) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return `${p2(h)}:${p2(m)}:${p2(s)}`;
}

export function formatOra(t: number) {
  return `2026-03-12 ${hms(t)}`;
}
function tsSuricata(t: number, micro: number) {
  return `2026-03-12T${hms(t)}.${String(micro).padStart(6, "0")}+0200`;
}
function tsSyslog(t: number) {
  return `${LUNI[2]} 12 ${hms(t)}`;
}
function tsApache(t: number) {
  return `[12/Mar/2026:${hms(t)} +0200]`;
}

type Ciorna = Omit<Eveniment, "id" | "ora">;

export function genereazaSetDate(seed: number = SEED_IMPLICIT): SetDateSecuritate {
  const r = new Aleator(seed);
  const ev: Ciorna[] = [];
  let flowId = 1_000_000_000_000 + r.intreg(0, 999_999);

  const ipAcasa = () => `100.64.${r.intreg(1, 60)}.${r.intreg(2, 250)}`;
  const ipStatie = () => `10.10.3.${r.intreg(20, 90)}`;

  // ---------- Suricata ----------
  function suricataAlerta(
    t: number,
    faza: Faza,
    src: string,
    dest: string,
    destPort: number,
    sid: number,
    signature: string,
    categorie: string,
    severitate: number,
    proto = "TCP",
  ) {
    const srcPort = r.intreg(1024, 65000);
    const obj = {
      timestamp: tsSuricata(t, r.intreg(0, 999999)),
      flow_id: flowId++,
      in_iface: "eth0",
      event_type: "alert",
      src_ip: src,
      src_port: srcPort,
      dest_ip: dest,
      dest_port: destPort,
      proto,
      alert: {
        action: "allowed",
        gid: 1,
        signature_id: sid,
        rev: 1,
        signature,
        category: categorie,
        severity: severitate,
      },
    };
    ev.push({
      t,
      sursa: "suricata",
      tip: "alert",
      src_ip: src,
      dest_ip: dest,
      mesaj: `${signature} (${src} → ${dest}:${destPort})`,
      campuri: {
        event_type: "alert",
        src_ip: src,
        src_port: srcPort,
        dest_ip: dest,
        dest_port: destPort,
        proto,
        "alert.signature_id": sid,
        "alert.signature": signature,
        "alert.category": categorie,
        "alert.severity": severitate,
      },
      brut: JSON.stringify(obj),
      faza,
    });
  }

  function suricataFlow(
    t: number,
    faza: Faza,
    src: string,
    dest: string,
    destPort: number,
    bytesToServer: number,
    bytesToClient: number,
    durata: number,
    appProto = "tls",
  ) {
    const srcPort = r.intreg(1024, 65000);
    const pktsTs = Math.max(1, Math.round(bytesToServer / 1200));
    const pktsTc = Math.max(1, Math.round(bytesToClient / 1200));
    const obj = {
      timestamp: tsSuricata(t + durata, r.intreg(0, 999999)),
      flow_id: flowId++,
      in_iface: "eth0",
      event_type: "flow",
      src_ip: src,
      src_port: srcPort,
      dest_ip: dest,
      dest_port: destPort,
      proto: "TCP",
      app_proto: appProto,
      flow: {
        pkts_toserver: pktsTs,
        pkts_toclient: pktsTc,
        bytes_toserver: bytesToServer,
        bytes_toclient: bytesToClient,
        start: tsSuricata(t, r.intreg(0, 999999)),
        end: tsSuricata(t + durata, r.intreg(0, 999999)),
        age: durata,
        state: "closed",
        reason: "timeout",
      },
    };
    ev.push({
      t: t + durata,
      sursa: "suricata",
      tip: "flow",
      src_ip: src,
      dest_ip: dest,
      mesaj: `Flux ${appProto} ${src} → ${dest}:${destPort}, ${(bytesToServer / 1_000_000).toFixed(1)} MB trimiși`,
      campuri: {
        event_type: "flow",
        src_ip: src,
        src_port: srcPort,
        dest_ip: dest,
        dest_port: destPort,
        proto: "TCP",
        app_proto: appProto,
        "flow.bytes_toserver": bytesToServer,
        "flow.bytes_toclient": bytesToClient,
        "flow.pkts_toserver": pktsTs,
        "flow.age": durata,
      },
      brut: JSON.stringify(obj),
      faza,
    });
  }

  // ---------- Autentificare ----------
  function auth(
    t: number,
    faza: Faza,
    gazda: string,
    program: string,
    serviciu: "vpn" | "ssh" | "ad",
    tip: "auth_failure" | "auth_success" | "vpn_session" | "account_created" | "group_change",
    user: string,
    src: string,
    extra: Record<string, ValoareCamp> = {},
  ) {
    const pid = r.intreg(900, 9999);
    let text: string;
    if (serviciu === "ssh") {
      text =
        tip === "auth_success"
          ? `Accepted password for ${user} from ${src} port ${r.intreg(40000, 60000)} ssh2`
          : `Failed password for ${user} from ${src} port ${r.intreg(40000, 60000)} ssh2`;
    } else if (serviciu === "vpn") {
      if (tip === "auth_success") text = `authentication success user=${user} rhost=${src} method=password mfa=none`;
      else if (tip === "vpn_session")
        text = `session start user=${user} rhost=${src} assigned_ip=${String(extra.assigned_ip)}`;
      else text = `authentication failure user=${user} rhost=${src} method=password reason=bad_credentials`;
    } else {
      if (tip === "account_created")
        text = `EventID=4720 account created target=${String(extra.target)} by=${user} src=${src}`;
      else if (tip === "group_change")
        text = `EventID=4728 member added target=${String(extra.target)} group="${String(extra.group)}" by=${user} src=${src}`;
      else if (tip === "auth_success") text = `EventID=4624 logon success user=${user} src=${src} logon_type=3 auth=${String(extra.auth ?? "kerberos")}`;
      else text = `EventID=4625 logon failure user=${user} src=${src} logon_type=3`;
    }
    const brut = `${tsSyslog(t)} ${gazda} ${program}[${pid}]: ${text}`;
    ev.push({
      t,
      sursa: "auth",
      tip,
      src_ip: src,
      user,
      mesaj: `${gazda}: ${text}`,
      campuri: { host: gazda, program, serviciu, tip, user, src_ip: src, ...extra },
      brut,
      faza,
    });
  }

  // ---------- Web ----------
  const UA_BROWSER = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  ];
  function web(t: number, faza: Faza, src: string, metoda: string, uri: string, status: number, bytes: number, ua: string) {
    const brut = `${src} - - ${tsApache(t)} "${metoda} ${uri} HTTP/1.1" ${status} ${bytes} "-" "${ua}"`;
    ev.push({
      t,
      sursa: "web",
      tip: "http_request",
      src_ip: src,
      dest_ip: IP.webPublic,
      mesaj: `${metoda} ${uri} → ${status}`,
      campuri: { src_ip: src, metoda, uri: decodeURIComponent(uri), status, bytes, user_agent: ua },
      brut,
      faza,
    });
  }

  // ---------- E-mail ----------
  function mail(
    t: number,
    faza: Faza,
    tip: "mesaj_primit" | "regula_redirectionare",
    campuri: Record<string, ValoareCamp>,
    mesaj: string,
  ) {
    const pid = r.intreg(900, 9999);
    const kv = Object.entries(campuri)
      .map(([k, v]) => `${k}=${typeof v === "string" && v.includes(" ") ? `"${v}"` : v}`)
      .join(" ");
    ev.push({
      t,
      sursa: "email",
      tip,
      src_ip: typeof campuri.client_ip === "string" ? campuri.client_ip : undefined,
      user: typeof campuri.mailbox === "string" ? campuri.mailbox : undefined,
      mesaj,
      campuri: { tip, ...campuri },
      brut: `${tsSyslog(t)} mx01 mail-gw[${pid}]: ${tip} ${kv}`,
      faza,
    });
  }

  // ======================= FUNDAL LEGITIM =======================
  // Trafic web obișnuit, 00:00–08:30
  const pagini = ["/", "/despre", "/contact", "/produse.php?id=", "/static/css/site.css", "/static/js/app.js", "/favicon.ico"];
  for (let i = 0; i < 130; i++) {
    const t = r.intreg(0, 8.5 * 3600);
    let uri = r.alege(pagini);
    if (uri.endsWith("=")) uri += r.intreg(1, 48);
    const status = r.real() < 0.06 ? 404 : r.real() < 0.15 ? 304 : 200;
    web(t, "benign", ipAcasa(), "GET", uri, status, status === 304 ? 0 : r.intreg(900, 24000), r.alege(UA_BROWSER));
  }

  // Fluxuri legitime spre internet (actualizări, navigare)
  for (let i = 0; i < 45; i++) {
    const t = r.intreg(0, 8.4 * 3600);
    suricataFlow(t, "benign", ipStatie(), `198.51.100.${r.intreg(100, 240)}`, 443, r.intreg(2_000, 900_000), r.intreg(10_000, 9_000_000), r.intreg(1, 120));
  }
  // Backup legitim spre furnizorul de backup în cloud (volum notabil, dar sub pragul de exfiltrare
  // și către o gazdă cunoscută) — 04:00–04:40. Sursă tipică de fals-pozitiv de studiat.
  for (let i = 0; i < 5; i++) {
    const t = 4 * 3600 + i * 480 + r.intreg(0, 60);
    suricataFlow(t, "benign", IP.backup, IP.furnizorBackup, 443, r.intreg(250_000_000, 460_000_000), r.intreg(200_000, 900_000), r.intreg(300, 420));
  }
  // Alerte de politică benigne
  for (let i = 0; i < 6; i++) {
    const t = r.intreg(0, 8.3 * 3600);
    suricataAlerta(t, "benign", ipStatie(), `198.51.100.${r.intreg(100, 240)}`, 443, 1000101, "LOCAL POLICY Descărcare actualizare software", "Potential Corporate Privacy Violation", 3);
  }
  // Scanarea autorizată, programată, a scanerului intern de vulnerabilități — 05:00–05:04
  for (let i = 0; i < 24; i++) {
    const t = 5 * 3600 + r.intreg(0, 240);
    const dest = r.real() < 0.5 ? `10.10.1.${r.intreg(10, 40)}` : ipStatie();
    suricataAlerta(t, "benign", IP.scanerIntern, dest, r.alege([21, 22, 23, 25, 80, 135, 139, 443, 445, 3389, 5985, 8080]), 1000001, "LOCAL SCAN Posibilă scanare de porturi SYN", "Attempted Information Leak", 2);
  }

  // Autentificări VPN legitime, dimineața, 07:25–08:30
  for (const user of ANGAJATI.filter((u) => u !== "it.admin")) {
    const t = r.intreg(7.4 * 3600, 8.5 * 3600);
    const ip = ipAcasa();
    if (r.real() < 0.35) auth(t - r.intreg(20, 90), "benign", "vpn-gw01", "vpn-auth", "vpn", "auth_failure", user, ip); // greșeală de tastare
    auth(t, "benign", "vpn-gw01", "vpn-auth", "vpn", "auth_success", user, ip, { mfa: "totp" });
    auth(t + 2, "benign", "vpn-gw01", "vpn-auth", "vpn", "vpn_session", user, ip, { assigned_ip: `10.10.200.${r.intreg(30, 99)}` });
  }
  // Administrare legitimă: it.admin pe SSH de la stația IT
  for (let i = 0; i < 4; i++) {
    const t = r.intreg(7.8 * 3600, 8.4 * 3600);
    auth(t, "benign", r.alege(["srv-fisiere", "srv-backup"]), "sshd", "ssh", "auth_success", "it.admin", IP.statieIT);
  }
  // Autentificări AD legitime
  for (let i = 0; i < 14; i++) {
    const t = r.intreg(7.5 * 3600, 8.5 * 3600);
    auth(t, "benign", "srv-dc01", "security", "ad", "auth_success", r.alege(ANGAJATI), ipStatie(), { auth: "kerberos" });
  }

  // E-mailuri legitime
  const expeditoriLegitimi = [
    ["facturi@furnizor-demo.example", "Factura martie 2026"],
    ["noreply@banca-demo.example", "Extras de cont"],
    ["office@client-demo.example", "Comandă nouă nr. 1042"],
    ["hr01@firma-demo.example", "Program sărbători"],
    ["suport@software-demo.example", "Actualizare licență"],
    ["vanzari02@firma-demo.example", "Ofertă revizuită"],
  ];
  for (const [from, subiect] of expeditoriLegitimi) {
    const t = r.intreg(6.5 * 3600, 8.5 * 3600);
    mail(t, "benign", "mesaj_primit", {
      from,
      to: `${r.alege(ANGAJATI)}@${DOMENIU}`,
      return_path: from,
      subject: subiect,
      spf: "pass",
      dkim: "pass",
      dmarc: "pass",
      client_ip: `198.51.100.${r.intreg(100, 240)}`,
    }, `Primit de la ${from}: „${subiect}” (SPF pass, DKIM pass, DMARC pass)`);
  }
  // Newsletter legitim cu configurare SPF imperfectă (sursă tipică de fals-pozitive)
  mail(r.intreg(6 * 3600, 7 * 3600), "benign", "mesaj_primit", {
    from: "noutati@newsletter-demo.example",
    to: `vanzari01@${DOMENIU}`,
    return_path: "bounce@mailer-demo.example",
    subject: "Noutăți din industrie",
    spf: "softfail",
    dkim: "pass",
    dmarc: "none",
    client_ip: "198.51.100.201",
  }, "Primit de la noutati@newsletter-demo.example: „Noutăți din industrie” (SPF softfail, DMARC none)");

  // ======================= SCENARIUL DE ATAC =======================
  // 1) SQL injection pe aplicația web publică — 01:40–01:52
  const payloaduri = [
    "1'",
    "1 AND 1=1",
    "1 AND 1=2",
    "1' OR '1'='1",
    "1' AND SLEEP(5)-- -",
    "1 ORDER BY 5-- -",
    "1 ORDER BY 6-- -",
    "1 UNION SELECT NULL,NULL,NULL,NULL,NULL-- -",
    "1 UNION SELECT 1,@@version,3,4,5-- -",
    "1 UNION SELECT 1,table_name,3,4,5 FROM information_schema.tables-- -",
    "1 UNION SELECT 1,column_name,3,4,5 FROM information_schema.columns WHERE table_name='utilizatori'-- -",
    "1 UNION SELECT 1,concat(nume_cont,0x3a,hash_parola),3,4,5 FROM utilizatori-- -",
  ];
  let tWeb = 1 * 3600 + 40 * 60;
  for (let rep = 0; rep < 3; rep++) {
    for (const p of payloaduri) {
      tWeb += r.intreg(8, 25);
      const ultim = p.includes("hash_parola");
      const status = p === "1'" ? 500 : 200;
      web(tWeb, "sqli", IP.atacatorWeb, "GET", `/produse.php?id=${encodeURIComponent(p)}`, status, ultim ? r.intreg(180_000, 260_000) : r.intreg(900, 6000), "sqlmap/1.8.3#stable (https://sqlmap.org)");
    }
  }

  // 2) Scanare de porturi pe poarta VPN — 02:10:00–02:11:30
  const porturi = [
    21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 995, 1194, 1433, 1723, 3306, 3389,
    4443, 5432, 5900, 5985, 8080, 8443, 8888, 9443, 500, 4500, 2049, 6379, 9200, 161, 389, 636, 88, 1521,
  ];
  let tScan = 2 * 3600 + 10 * 60;
  for (const port of porturi) {
    tScan += r.intreg(1, 3);
    suricataAlerta(tScan, "scanare", IP.atacator, IP.vpnPublic, port, 1000001, "LOCAL SCAN Posibilă scanare de porturi SYN", "Attempted Information Leak", 2);
  }

  // 3) Brute-force pe VPN — 02:15:00–02:41:00 (numeroase eșecuri, apoi o reușită)
  let tBf = 2 * 3600 + 15 * 60;
  const tintaBf = "director01";
  for (let i = 0; i < 220; i++) {
    tBf += r.intreg(5, 9);
    auth(tBf, "brute_force", "vpn-gw01", "vpn-auth", "vpn", "auth_failure", tintaBf, IP.atacator);
  }
  // 4) Autentificare reușită (acces inițial) — parola ghicită, fără MFA
  const tAcces = tBf + r.intreg(8, 15);
  auth(tAcces, "acces_initial", "vpn-gw01", "vpn-auth", "vpn", "auth_success", tintaBf, IP.atacator, { mfa: "none" });
  auth(tAcces + 2, "acces_initial", "vpn-gw01", "vpn-auth", "vpn", "vpn_session", tintaBf, IP.atacator, { assigned_ip: IP.vpnAtacator });

  // 5) Mișcare laterală — de pe IP-ul VPN atribuit atacatorului, logări către servere + cont de persistență
  let tLat = tAcces + r.intreg(120, 300);
  // recunoaștere internă (scanare de pe gazda internă compromisă)
  for (const port of [445, 3389, 22, 5985, 1433]) {
    tLat += r.intreg(2, 6);
    suricataAlerta(tLat, "miscare_laterala", IP.vpnAtacator, IP.dc, port, 1000001, "LOCAL SCAN Posibilă scanare de porturi SYN", "Attempted Information Leak", 2);
  }
  // autentificări eșuate apoi reușite pe DC (folosind credențiale furate)
  for (let i = 0; i < 6; i++) {
    tLat += r.intreg(4, 10);
    auth(tLat, "miscare_laterala", "srv-dc01", "security", "ad", "auth_failure", "director01", IP.vpnAtacator);
  }
  tLat += r.intreg(6, 12);
  auth(tLat, "miscare_laterala", "srv-dc01", "security", "ad", "auth_success", "director01", IP.vpnAtacator, { logon_type: 3, auth: "ntlm" });
  // creare cont de persistență și adăugare în grupul de administratori
  tLat += r.intreg(20, 45);
  auth(tLat, "miscare_laterala", "srv-dc01", "security", "ad", "account_created", "director01", IP.vpnAtacator, { target: "svc-backup2" });
  tLat += r.intreg(3, 8);
  auth(tLat, "miscare_laterala", "srv-dc01", "security", "ad", "group_change", "director01", IP.vpnAtacator, { target: "svc-backup2", group: "Domain Admins" });
  // logare pe serverul de fișiere cu contul de persistență
  tLat += r.intreg(15, 40);
  auth(tLat, "miscare_laterala", "srv-fisiere", "security", "ad", "auth_success", "svc-backup2", IP.vpnAtacator, { logon_type: 3, auth: "ntlm" });

  // 6) Exfiltrare — flux mare de la serverul de fișiere spre o destinație externă necunoscută — ~03:30
  const tExfil = tLat + r.intreg(60, 180);
  suricataAlerta(tExfil, "exfiltrare", IP.fisiere, IP.destinatieExfil, 443, 1000003, "LOCAL EXFIL Volum ieșit neobișnuit către gazdă externă necunoscută", "Potential Data Exfiltration", 1);
  suricataFlow(tExfil, "exfiltrare", IP.fisiere, IP.destinatieExfil, 443, r.intreg(1_800_000_000, 2_400_000_000), r.intreg(400_000, 1_200_000), r.intreg(600, 900));
  // câteva fluxuri suplimentare de exfiltrare, în tranșe
  for (let i = 0; i < 3; i++) {
    const t = tExfil + (i + 1) * r.intreg(300, 600);
    suricataFlow(t, "exfiltrare", IP.fisiere, IP.destinatieExfil, 443, r.intreg(700_000_000, 1_500_000_000), r.intreg(200_000, 800_000), r.intreg(400, 800));
  }

  // ======================= FIRUL DE E-MAIL (L4) =======================
  // Regulă de redirecționare creată abuziv pe căsuța compromisă (persistență pe e-mail)
  const tReg = 2 * 3600 + 55 * 60;
  mail(tReg, "email_frauda", "regula_redirectionare", {
    mailbox: `director01@${DOMENIU}`,
    action: "creare regulă",
    forward_to: "colector@mail-extern.example",
    keep_copy: false,
    client_ip: IP.atacator,
    created_by: "owa",
  }, "Regulă nouă de redirecționare pe director01: copiază toate mesajele către colector@mail-extern.example (fără păstrarea copiei)");

  // E-mail de fraudă cu anteturi falsificate (impersonare furnizor, schimbare de IBAN)
  const tFrauda = 3 * 3600 + 20 * 60;
  mail(tFrauda, "email_frauda", "mesaj_primit", {
    from: "facturi@furnizor-demo.example",
    reply_to: "facturi@furnizor-demo.example.mail-extern.example",
    return_path: "bounce@mail-extern.example",
    to: `contabilitate01@${DOMENIU}`,
    subject: "URGENT: modificare cont bancar factura 1042",
    spf: "fail",
    dkim: "fail",
    dmarc: "fail",
    client_ip: "203.0.113.99",
    auth_results: "spf=fail dkim=fail dmarc=fail",
  }, "Primit „URGENT: modificare cont bancar factura 1042” de la facturi@furnizor-demo.example (SPF fail, DKIM fail, DMARC fail; Reply-To pe domeniu extern)");

  // ---------- sortare cronologică și asamblare ----------
  ev.sort((a, b) => a.t - b.t);
  const evenimente: Eveniment[] = ev.map((e, i) => ({
    ...e,
    id: `EV-${String(i + 1).padStart(4, "0")}`,
    ora: formatOra(e.t),
  }));

  const fisiere = construiesteFisiere(evenimente, tFrauda);
  return { seed, organizatie: ORGANIZATIE, data: "2026-03-12", evenimente, fisiere };
}

function construiesteFisiere(evenimente: Eveniment[], tFrauda: number) {
  const linii = (s: Eveniment["sursa"]) =>
    evenimente
      .filter((e) => e.sursa === s)
      .map((e) => e.brut)
      .join("\n");

  const eml = [
    "Return-Path: <bounce@mail-extern.example>",
    "Received: from mail-extern.example (unknown [203.0.113.99])",
    "\tby mx01.firma-demo.example with ESMTP id 4F2A9;",
    `\t${new Date(Date.UTC(2026, 2, 12, tFrauda / 3600 - 2, (tFrauda % 3600) / 60, 0)).toUTCString().replace("GMT", "+0000")}`,
    "Authentication-Results: mx01.firma-demo.example;",
    "\tspf=fail (sender IP is 203.0.113.99) smtp.mailfrom=mail-extern.example;",
    "\tdkim=fail reason=\"signature verification failed\";",
    "\tdmarc=fail action=quarantine header.from=furnizor-demo.example",
    "From: \"Facturi Furnizor Demo\" <facturi@furnizor-demo.example>",
    "Reply-To: facturi@furnizor-demo.example.mail-extern.example",
    "To: contabilitate01@firma-demo.example",
    "Subject: URGENT: modificare cont bancar factura 1042",
    "Date: Thu, 12 Mar 2026 03:20:00 +0200",
    "Message-ID: <9f8c2a10-fraud@mail-extern.example>",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    "Bună ziua,",
    "",
    "Vă informăm că am schimbat contul bancar. Vă rugăm ca factura 1042 să fie",
    "achitată în noul cont IBAN RO00 DEMO 0000 0000 0000 9999 (Banca Demo).",
    "Confirmarea este urgentă, plata trebuie efectuată astăzi.",
    "",
    "Cu stimă,",
    "Departament Facturare",
    "",
    "-- ",
    "Notă de laborator: e-mail sintetic. Indicii de fraudă — SPF/DKIM/DMARC=fail,",
    "Reply-To pe domeniu diferit de From, ton de urgență, schimbare de IBAN.",
    "",
  ].join("\n");

  return {
    "eve.json": linii("suricata"),
    "auth.log": linii("auth"),
    "access.log": linii("web"),
    "mail.log": linii("email"),
    "email-suspect.eml": eml,
  };
}
