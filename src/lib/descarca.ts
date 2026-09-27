"use client";

export function descarcaText(nume: string, continut: string, tip = "text/markdown;charset=utf-8") {
  const blob = new Blob([continut], { type: tip });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nume;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function descarcaCsv(nume: string, randuri: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const continut = "﻿" + randuri.map((r) => r.map(esc).join(",")).join("\r\n");
  descarcaText(nume, continut, "text/csv;charset=utf-8");
}

/** Generează un PDF simplu din text Markdown (redare minimă), prin pdf-lib. */
export async function descarcaPdfDinMarkdown(nume: string, markdown: string, titlu: string) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const latime = 595.28;
  const inaltime = 841.89;
  const marja = 48;
  let pagina = doc.addPage([latime, inaltime]);
  let y = inaltime - marja;
  const latMax = latime - 2 * marja;

  // pdf-lib WinAnsi nu are toate diacriticele; le transliterăm pentru siguranță.
  const curata = (s: string) =>
    s
      .replace(/[țţ]/g, "t").replace(/[ȚŢ]/g, "T")
      .replace(/[șş]/g, "s").replace(/[ȘŞ]/g, "S")
      .replace(/ă/g, "a").replace(/Ă/g, "A")
      .replace(/â/g, "a").replace(/Â/g, "A")
      .replace(/î/g, "i").replace(/Î/g, "I")
      .replace(/[„”]/g, '"').replace(/[’‘]/g, "'").replace(/–/g, "-").replace(/→/g, "->");

  function linieNoua(h: number) {
    y -= h;
    if (y < marja) {
      pagina = doc.addPage([latime, inaltime]);
      y = inaltime - marja;
    }
  }

  function scrieRand(text: string, opt: { size: number; f: typeof font; culoare?: [number, number, number] }) {
    const cuvinte = curata(text).split(" ");
    let linie = "";
    for (const c of cuvinte) {
      const test = linie ? `${linie} ${c}` : c;
      if (opt.f.widthOfTextAtSize(test, opt.size) > latMax && linie) {
        pagina.drawText(linie, { x: marja, y, size: opt.size, font: opt.f, color: rgb(...(opt.culoare ?? [0.07, 0.09, 0.12])) });
        linieNoua(opt.size + 4);
        linie = c;
      } else {
        linie = test;
      }
    }
    if (linie) {
      pagina.drawText(linie, { x: marja, y, size: opt.size, font: opt.f, color: rgb(...(opt.culoare ?? [0.07, 0.09, 0.12])) });
      linieNoua(opt.size + 4);
    }
  }

  scrieRand(titlu, { size: 16, f: fontBold });
  linieNoua(6);

  for (const raw of markdown.split("\n")) {
    const l = raw.replace(/\r$/, "");
    if (l.startsWith("# ")) {
      linieNoua(4);
      scrieRand(l.slice(2), { size: 15, f: fontBold });
    } else if (l.startsWith("## ")) {
      linieNoua(4);
      scrieRand(l.slice(3), { size: 12, f: fontBold });
    } else if (l.startsWith("|")) {
      scrieRand(l.replace(/\|/g, "  ").replace(/`/g, ""), { size: 8, f: mono, culoare: [0.2, 0.24, 0.3] });
    } else if (l.startsWith(">")) {
      scrieRand(l.slice(1).trim(), { size: 9, f: font, culoare: [0.33, 0.37, 0.44] });
    } else if (l.trim() === "") {
      linieNoua(6);
    } else {
      scrieRand(l.replace(/[*`]/g, ""), { size: 10, f: font });
    }
  }

  const bytes = await doc.save();
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([ab], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nume;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
