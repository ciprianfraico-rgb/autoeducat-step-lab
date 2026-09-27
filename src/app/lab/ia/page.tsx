import type { Metadata } from "next";
import { LabIA } from "./LabIA";

export const metadata: Metadata = {
  title: "Laborator de IA",
  description:
    "Proiect RAG rulat în browser: indexare cu încorporări, întrebare-răspuns cu citarea surselor, evaluare (precision@k) și red-teaming OWASP LLM01–LLM10.",
};

export default function PaginaLabIA() {
  return <LabIA />;
}
