/**
 * Data și commit-ul se injectează la build prin variabile de mediu (vezi next.config.ts).
 * Sunt afișate în subsolul fiecărei pagini — importante pentru capturile datate.
 */
export const COMMIT_SCURT = process.env.NEXT_PUBLIC_COMMIT ?? "local";

const ISO = process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString();

export function dataBuildRo(): string {
  const d = new Date(ISO);
  const zz = String(d.getDate()).padStart(2, "0");
  const ll = String(d.getMonth() + 1).padStart(2, "0");
  const aaaa = d.getFullYear();
  return `${zz}.${ll}.${aaaa}`;
}

export const DATA_BUILD = dataBuildRo();
