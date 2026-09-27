"use client";

/**
 * Client WebLLM (model cu ponderi deschise, rulat în browser prin WebGPU) + încorporări
 * cu transformers.js. Totul rulează client-side; nimic nu pleacă de pe dispozitiv.
 */
import type { MLCEngine } from "@mlc-ai/web-llm";

// ID verificat în prebuiltAppConfig al versiunii instalate (@mlc-ai/web-llm ^0.2.85).
export const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
export const MODEL_ALT_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
export const MODEL_LICENTA = "Apache 2.0";
export const MODEL_EMBED_ID = "Xenova/multilingual-e5-small";

export function areWebGPU(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export const WEBLLM_CDN = "https://esm.run/@mlc-ai/web-llm@0.2.85";

let enginePromise: Promise<MLCEngine> | null = null;

export async function incarcaModel(
  modelId: string,
  onProgres?: (raport: { progress: number; text: string }) => void,
): Promise<MLCEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const importExtern = new Function("u", "return import(u)") as (u: string) => Promise<typeof import("@mlc-ai/web-llm")>;
      const webllm = await importExtern(WEBLLM_CDN);
      return webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (r) => onProgres?.({ progress: r.progress, text: r.text }),
      });
    })();
  }
  return enginePromise;
}

export function reseteazaModel() {
  enginePromise = null;
}

// ---------- încorporări ----------
// transformers.js se încarcă din CDN (ESM), nu prin bundler: onnxruntime-web împachetat
// de Turbopack pierde calea către fișierele WASM. Modelul se descarcă tot de pe CDN-ul HF.
export const TRANSFORMERS_CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";

let embedderPromise: Promise<(texte: string[]) => Promise<number[][]>> | null = null;

export async function incarcaEncoder(): Promise<(texte: string[]) => Promise<number[][]>> {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      // import dinamic dintr-o variabilă, ca bundler-ul să nu încerce să-l rescrie.
      const importExtern = new Function("u", "return import(u)") as (u: string) => Promise<typeof import("@huggingface/transformers")>;
      const t = await importExtern(TRANSFORMERS_CDN);
      const extractor = await t.pipeline("feature-extraction", MODEL_EMBED_ID);
      return async (texte: string[]) => {
        // e5 recomandă prefixele „query:” / „passage:”; le lăsăm în seama apelantului.
        const out = await extractor(texte.map((s) => String(s)), { pooling: "mean", normalize: true });
        return out.tolist() as number[][];
      };
    })();
  }
  return embedderPromise;
}
