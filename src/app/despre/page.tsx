import type { Metadata } from "next";
import { COMMIT_SCURT, DATA_BUILD } from "@/lib/build-info";
import { Sectiune } from "@/components/ui";

export const metadata: Metadata = {
  title: "Despre",
  description: "Cine a realizat prototipul, data versiunii, licențe și contact.",
};

export default function Despre() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Despre prototip</h1>
      </header>

      <Sectiune titlu="Realizator">
        <p className="text-sm text-foreground">
          Prototip realizat de <strong>Autoeducat SRL</strong> (CUI RO41063642), Constanța, din resurse proprii, pentru
          a demonstra laboratorul virtual comun propus în cererea de finanțare STEP-LLL (PEO 2021–2027). Proiectul{" "}
          <strong>nu este finanțat</strong>; pagina nu folosește logo-uri UE, PEO, MIPE sau ANC.
        </p>
      </Sectiune>

      <Sectiune titlu="Versiune">
        <p className="text-sm text-foreground tabular">
          Versiunea {DATA_BUILD} · commit {COMMIT_SCURT}. Data și commit-ul se injectează la build și apar în subsolul
          fiecărei pagini, pentru capturile datate.
        </p>
      </Sectiune>

      <Sectiune titlu="Licențe">
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
          <li>Cod sursă: <strong>MIT</strong>.</li>
          <li>Scenarii și date sintetice: <strong>CC BY-SA 4.0</strong>.</li>
          <li>Mozilla nu este folosită aici; modelul de limbaj rulat în browser are licență permisivă (Apache 2.0).</li>
        </ul>
      </Sectiune>

      <Sectiune titlu="Confidențialitate">
        <p className="text-sm text-foreground">
          Prototipul nu colectează date despre vizitatori: fără analytics, fără telemetrie de trafic. Modelele și
          încorporările rulează în browserul utilizatorului; conținutul introdus nu părăsește dispozitivul. Toate
          datele din laboratoare sunt sintetice.
        </p>
      </Sectiune>

      <Sectiune titlu="Contact">
        <p className="text-sm text-foreground">
          <a href="mailto:office@autoeducat.ro">office@autoeducat.ro</a>
        </p>
      </Sectiune>
    </div>
  );
}
