import type { Metadata } from "next";
import { LabSecuritate } from "./LabSecuritate";

export const metadata: Metadata = {
  title: "Laborator de securitate",
  description:
    "Detecție și investigare pe date sintetice: explorer de evenimente, editor de reguli Sigma-like, cronologie și proces-verbal de custodie.",
};

export default function PaginaLabSecuritate() {
  return <LabSecuritate />;
}
