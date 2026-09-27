/** Schemă SVG a arhitecturii-țintă, cu cele două zone (securitate și IA). Legibilă în capturi. */
export function SchemaArhitectura({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 820 380"
      className={className}
      role="img"
      aria-label="Schema arhitecturii-țintă: zona de securitate și zona de IA, izolate pe participant, cu jurnalizare comună."
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <style>{`
          .cutie{fill:#fff;stroke:#dfe3ea;stroke-width:1.5;rx:8}
          .t{font:600 13px system-ui;fill:#12161f}
          .s{font:11px system-ui;fill:#55606f}
          .zt{font:700 13px system-ui;letter-spacing:.02em}
        `}</style>
      </defs>

      {/* Zona securitate */}
      <rect x="16" y="16" width="380" height="300" rx="12" fill="#dcfce7" opacity="0.5" />
      <text x="32" y="40" className="zt" fill="#14532d">ZONA DE SECURITATE</text>
      {[
        ["Rețele virtuale segmentate + firewall", 56],
        ["IDS/IPS (Suricata) → EVE JSON", 100],
        ["SIEM (Wazuh / ELK) — corelare, alerte", 144],
        ["Mașini intenționat vulnerabile", 188],
        ["Scaner (OpenVAS / Greenbone)", 232],
        ["Stație de investigație criminalistică", 276],
      ].map(([txt, y]) => (
        <g key={String(y)}>
          <rect className="cutie" x="32" y={Number(y)} width="348" height="34" rx="8" />
          <text x="48" y={Number(y) + 22} className="t">
            {txt}
          </text>
        </g>
      ))}

      {/* Zona IA */}
      <rect x="424" y="16" width="380" height="300" rx="12" fill="#dbeafe" opacity="0.5" />
      <text x="440" y="40" className="zt" fill="#1d4ed8">ZONA DE IA</text>
      {[
        ["Server de inferență — ponderi deschise", 56],
        ["Bază de date vectorială (index RAG)", 100],
        ["Orchestrare (RAG + agent, instrumente limitate)", 144],
        ["Instrumente de evaluare (test, red-teaming)", 188],
        ["Monitorizare (latență, energie, derivă)", 232],
        ["Dosar de conformitate (AI Act, ISO 42001)", 276],
      ].map(([txt, y]) => (
        <g key={"ia" + String(y)}>
          <rect className="cutie" x="440" y={Number(y)} width="348" height="34" rx="8" />
          <text x="456" y={Number(y) + 22} className="t">
            {txt}
          </text>
        </g>
      ))}

      {/* Bandă comună jos */}
      <rect className="cutie" x="16" y="330" width="788" height="34" rx="8" fill="#f7f8fa" />
      <text x="410" y="352" textAnchor="middle" className="t">
        Izolare pe participant · mediu recreat la fiecare cohortă · jurnalizare · numai date sintetice
      </text>
    </svg>
  );
}
