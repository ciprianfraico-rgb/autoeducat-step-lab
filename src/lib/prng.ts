/**
 * Generator pseudo-aleator determinist (mulberry32).
 * Același seed produce mereu aceeași secvență — condiție pentru seturi de date reproductibile.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Aleator {
  private next: () => number;
  constructor(seed: number) {
    this.next = mulberry32(seed);
  }
  /** număr real în [0, 1) */
  real(): number {
    return this.next();
  }
  /** întreg în [min, max] */
  intreg(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
  alege<T>(lista: readonly T[]): T {
    return lista[Math.floor(this.next() * lista.length)];
  }
  hex(lungime: number): string {
    let s = "";
    for (let i = 0; i < lungime; i++) s += "0123456789abcdef"[this.intreg(0, 15)];
    return s;
  }
}
