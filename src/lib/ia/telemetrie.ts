/**
 * Telemetrie simplă pentru laboratorul de IA: latență, tokeni, estimare orientativă de energie.
 * Estimarea de energie este DELIBERAT grosieră și marcată ca atare — servește competenței de mediu
 * (LAB-IA5), nu unei măsurători reale de putere.
 */

/** Putere presupusă a unui GPU integrat/de laptop, în wați, pentru estimarea orientativă. */
export const PUTERE_PRESUPUSA_W = 30;

export interface Telemetrie {
  latentaMs: number;
  tokeniPrompt: number;
  tokeniRaspuns: number;
  tokeniPeSecunda: number;
  energieWhEstimata: number;
}

export function estimeazaEnergie(latentaMs: number, putereW = PUTERE_PRESUPUSA_W): number {
  return (putereW * (latentaMs / 1000)) / 3600; // Wh
}

export function compuneTelemetrie(latentaMs: number, tokeniPrompt: number, tokeniRaspuns: number): Telemetrie {
  const tps = latentaMs > 0 ? (tokeniRaspuns / latentaMs) * 1000 : 0;
  return {
    latentaMs,
    tokeniPrompt,
    tokeniRaspuns,
    tokeniPeSecunda: Number(tps.toFixed(1)),
    energieWhEstimata: Number(estimeazaEnergie(latentaMs).toFixed(4)),
  };
}
