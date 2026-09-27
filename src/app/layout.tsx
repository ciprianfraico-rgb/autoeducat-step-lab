import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CaptureOverlay } from "@/components/CaptureOverlay";

export const metadata: Metadata = {
  title: {
    default: "Autoeducat STEP Lab — prototip laborator virtual",
    template: "%s · Autoeducat STEP Lab",
  },
  description:
    "Prototip funcțional al laboratorului virtual comun pentru cele două cursuri STEP-LLL: securitatea sistemelor informatice și IA generativă în organizații. Date sintetice, modele cu ponderi deschise rulate în browser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ro" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <Footer />
        <Suspense>
          <CaptureOverlay />
        </Suspense>
      </body>
    </html>
  );
}
