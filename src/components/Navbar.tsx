"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKURI = [
  { href: "/", eticheta: "Acasă" },
  { href: "/scenarii", eticheta: "Scenarii" },
  { href: "/lab/securitate", eticheta: "Lab securitate" },
  { href: "/lab/ia", eticheta: "Lab IA" },
  { href: "/arhitectura", eticheta: "Arhitectură" },
  { href: "/despre", eticheta: "Despre" },
];

export function Navbar() {
  const cale = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground no-underline">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-md bg-primary text-sm text-white">
            AS
          </span>
          Autoeducat STEP Lab
        </Link>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {LINKURI.slice(1).map((l) => {
            const activ = cale === l.href || (l.href !== "/" && cale.startsWith(l.href));
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={activ ? "page" : undefined}
                  className={`no-underline ${activ ? "font-semibold text-primary" : "text-muted hover:text-foreground"}`}
                >
                  {l.eticheta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
