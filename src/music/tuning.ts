/**
 * tuning.ts — the mathematics of swara pitch (Phase: "Math" tab).
 *
 * This module is the quantitative companion to theory.ts. Where theory.ts gives
 * each swara a SEMITONE offset (the basis for our 12-tone equal-tempered audio),
 * this file gives each swara its JUST-INTONATION ratio — the small whole-number
 * frequency ratio that classical Indian (and pre-tempered Western) tuning is
 * actually built on — and the tools to compare the two systems.
 *
 * Key relationships used throughout:
 *   - A frequency ratio r corresponds to  1200 · log2(r)  CENTS.
 *     (Cents are a logarithmic pitch unit: 100 cents = one equal-tempered
 *      semitone, 1200 = one octave. The log comes from the fact that pitch
 *      perception is logarithmic in frequency — equal RATIOS sound like equal
 *      steps, which is why we add cents instead of multiplying ratios.)
 *   - Equal temperament puts swara k at exactly 100·k cents (ratio 2^(k/12)).
 *   - The DEVIATION (JI cents − ET cents) is why a raga on a real tanpura sounds
 *     subtly different from the same notes on a piano.
 */

import { SWARA_POSITIONS, type SwaraPosition } from "./theory";

/** One swara described by its just-intonation ratio. */
export interface SwaraRatio {
  semitone: number;
  symbol: string;
  /** Numerator of the just-intonation frequency ratio. */
  num: number;
  /** Denominator of the just-intonation frequency ratio. */
  den: number;
}

/**
 * 5-limit just-intonation ratios for the 12 swaras, the tuning most commonly
 * cited for Hindustani music. "5-limit" means the ratios use only the primes
 * 2, 3 and 5 — octaves (2), fifths (3) and pure thirds (5).
 */
export const SWARA_RATIOS: readonly SwaraRatio[] = [
  { semitone: 0, symbol: "S", num: 1, den: 1 },
  { semitone: 1, symbol: "r", num: 16, den: 15 },
  { semitone: 2, symbol: "R", num: 9, den: 8 },
  { semitone: 3, symbol: "g", num: 6, den: 5 },
  { semitone: 4, symbol: "G", num: 5, den: 4 },
  { semitone: 5, symbol: "m", num: 4, den: 3 },
  { semitone: 6, symbol: "M", num: 45, den: 32 },
  { semitone: 7, symbol: "P", num: 3, den: 2 },
  { semitone: 8, symbol: "d", num: 8, den: 5 },
  { semitone: 9, symbol: "D", num: 5, den: 3 },
  { semitone: 10, symbol: "n", num: 16, den: 9 },
  { semitone: 11, symbol: "N", num: 15, den: 8 },
] as const;

/** Convert any frequency ratio to cents: 1200·log2(ratio). */
export function ratioToCents(ratio: number): number {
  return 1200 * Math.log2(ratio);
}

/** The just-intonation ratio (as a decimal) for a swara semitone. */
export function justRatio(semitone: number): number {
  const r = SWARA_RATIOS[((semitone % 12) + 12) % 12];
  return r.num / r.den;
}

/** Cents above Sa for a swara in just intonation. */
export function justCents(semitone: number): number {
  return ratioToCents(justRatio(semitone));
}

/** Cents above Sa for a swara in 12-tone equal temperament (exactly 100·k). */
export function equalCents(semitone: number): number {
  return 100 * (((semitone % 12) + 12) % 12);
}

/**
 * How far the just-intonation pitch sits from equal temperament, in cents.
 * Positive = JI is sharper than the piano; negative = flatter. (Ga, the pure
 * major third 5/4, is famously ~13.7 cents FLAT of the tempered third.)
 */
export function jiVsEtDeviation(semitone: number): number {
  return justCents(semitone) - equalCents(semitone);
}

/** Frequency (Hz) of a swara in just intonation, given Sa's frequency. */
export function justFrequency(saFreq: number, semitone: number): number {
  // Handle octaves: fold the semitone into 0–11, track the octave separately.
  const octave = Math.floor(semitone / 12);
  const within = ((semitone % 12) + 12) % 12;
  return saFreq * justRatio(within) * Math.pow(2, octave);
}

/**
 * The acoustic "beat rate" you'd hear between a just-intonation swara and its
 * equal-tempered counterpart: the absolute difference of their frequencies in
 * Hz. This is what makes the A/B tuning demo audibly "shimmer".
 */
export function beatRate(saFreq: number, semitone: number): number {
  const ji = justFrequency(saFreq, semitone);
  const et = saFreq * Math.pow(2, semitone / 12);
  return Math.abs(ji - et);
}

/* ------------------------------------------------------------------ *
 *  Consonance / samvad
 * ------------------------------------------------------------------ */

/** Greatest common divisor, for reducing interval fractions. */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export interface Interval {
  /** Reduced numerator of the interval ratio between two swaras. */
  num: number;
  /** Reduced denominator. */
  den: number;
  /** Size of the interval in cents. */
  cents: number;
  /**
   * A simple consonance score: smaller (num + den) = simpler ratio = more
   * consonant. Sa–Pa (3/2) scores 5; Sa–Sa (1/1) scores 2. This is the same
   * "ratio simplicity = consonance" idea that underlies samvad.
   */
  consonanceScore: number;
}

/**
 * The just-intonation interval BETWEEN two swaras (b above a), reduced to lowest
 * terms. E.g. the interval from R (9/8) up to P (3/2) is (3/2)/(9/8) = 4/3.
 */
export function intervalBetween(aSemitone: number, bSemitone: number): Interval {
  const ra = SWARA_RATIOS[((aSemitone % 12) + 12) % 12];
  const rb = SWARA_RATIOS[((bSemitone % 12) + 12) % 12];
  // (rb.num/rb.den) / (ra.num/ra.den) = (rb.num*ra.den)/(rb.den*ra.num)
  let num = rb.num * ra.den;
  let den = rb.den * ra.num;
  const g = gcd(num, den);
  num /= g;
  den /= g;
  return {
    num,
    den,
    cents: ratioToCents(num / den),
    consonanceScore: num + den,
  };
}

/**
 * Whether an interval is a "samvad" — a consonant relationship of a perfect
 * fourth (4/3) or perfect fifth (3/2), the classic vadi–samvadi relationship.
 * We allow a small cents tolerance so near-misses (like 27/16 vs 5/3) still read
 * sensibly.
 */
export function isSamvad(aSemitone: number, bSemitone: number): boolean {
  const { cents } = intervalBetween(aSemitone, bSemitone);
  const fifth = 701.96;
  const fourth = 498.04;
  const tol = 25; // cents
  return Math.abs(cents - fifth) < tol || Math.abs(cents - fourth) < tol;
}

/** Pair theory.ts metadata with ratio metadata for table rendering. */
export function swaraTuningRows(): {
  pos: SwaraPosition;
  ratio: SwaraRatio;
  justCents: number;
  equalCents: number;
  deviation: number;
}[] {
  return SWARA_POSITIONS.map((pos) => ({
    pos,
    ratio: SWARA_RATIOS[pos.semitone],
    justCents: justCents(pos.semitone),
    equalCents: equalCents(pos.semitone),
    deviation: jiVsEtDeviation(pos.semitone),
  }));
}
