/**
 * ragas.ts — Phase 2 data model.
 *
 * A raga is described entirely in terms of semitone offsets from Sa (see
 * theory.ts). Because nothing here references an absolute pitch, the same raga
 * object works no matter which Sa the user picks.
 *
 * Design notes for later phases:
 *   - Aroha / avaroha / pakad are stored as arrays of `RagaNote`, where each
 *     note is a semitone offset that MAY cross octave boundaries (negative for
 *     the lower octave, >11 for the upper). This is what lets a phrase like
 *     Yaman's "Ni Re Ga..." start below Sa.
 *   - `swaras` is the set of semitone offsets (0–11) the raga uses within one
 *     octave — this is what the scale strip highlights.
 *   - Everything is plain data, so Phase 4 (raga comparison) and Phase 5
 *     (performance-structure timeline) can consume these objects directly.
 */

import {
  positionForSemitone,
  swaraToFrequency,
  type SwaraPosition,
} from "./theory";

/**
 * A single note inside a melodic phrase. `semitone` is the offset from Sa and
 * can be <0 or >11 to indicate lower/upper octaves.
 */
export interface RagaNote {
  /** Semitones from Sa; may be negative or exceed 11 to cross octaves. */
  semitone: number;
}

/**
 * The ten traditional thaats (parent scales) that ragas are grouped under.
 * Kept as a union so the data stays self-documenting and typo-proof.
 */
export type Thaat =
  | "Bilawal"
  | "Kalyan"
  | "Khamaj"
  | "Bhairav"
  | "Bhairavi"
  | "Asavari"
  | "Todi"
  | "Purvi"
  | "Marwa"
  | "Kafi";

export interface Raga {
  /** Display name, e.g. "Yaman". */
  name: string;
  /** Parent scale this raga is classified under. */
  thaat: Thaat;
  /**
   * The semitone offsets (0–11) used by the raga within one octave. This is
   * the canonical "which notes belong" set the scale strip highlights. It is
   * derived from the aroha/avaroha but stored explicitly for convenience.
   */
  swaras: number[];
  /** Ascending phrase. */
  aroha: RagaNote[];
  /** Descending phrase. */
  avaroha: RagaNote[];
  /** Pakad — the characteristic catch-phrase that identifies the raga. */
  pakad: RagaNote[];
  /** Vadi — the most prominent ("king") swara, as a semitone offset 0–11. */
  vadi: number;
  /** Samvadi — the second-most prominent ("minister") swara, 0–11. */
  samvadi: number;
  /** Traditional time of performance. */
  timeOfDay: string;
  /** A short, evocative description of the raga's emotional colour (rasa). */
  mood: string;
}

/** Tiny helper to keep the raga definitions below terse and readable. */
const n = (semitone: number): RagaNote => ({ semitone });

/**
 * Seed ragas. Aroha / avaroha / pakad here are SIMPLIFIED, representative
 * forms — real performance practice has many more chalan nuances and alternate
 * phrases. They are accurate enough to learn each raga's skeleton.
 */
export const RAGAS: Raga[] = [
  {
    name: "Yaman",
    thaat: "Kalyan",
    // All shuddha except Ma, which is tivra (M = 6). No komal swaras.
    swaras: [0, 2, 4, 6, 7, 9, 11],
    // Classic ascent starts on Ni just below Sa: Ṇ R G M̄ D N Ṡ
    aroha: [n(-1), n(2), n(4), n(6), n(7), n(9), n(11), n(12)],
    // Descent: Ṡ N D P M̄ G R S
    avaroha: [n(12), n(11), n(9), n(7), n(6), n(4), n(2), n(0)],
    // Signature phrase: Ṇ R G, M̄ P, G R S
    pakad: [n(-1), n(2), n(4), n(6), n(7), n(4), n(2), n(0)],
    vadi: 4, // Ga
    samvadi: 11, // Ni
    timeOfDay: "First quarter of the night (early evening)",
    mood: "Serene, devotional and gently romantic — a sense of calm grandeur.",
  },
  {
    name: "Bhairav",
    thaat: "Bhairav",
    // Komal Re (1) and komal Dha (8); everything else shuddha.
    swaras: [0, 1, 4, 5, 7, 8, 11],
    aroha: [n(0), n(1), n(4), n(5), n(7), n(8), n(11), n(12)],
    avaroha: [n(12), n(11), n(8), n(7), n(5), n(4), n(1), n(0)],
    // Characteristic oscillating phrase around komal Re and komal Dha.
    pakad: [n(0), n(1), n(4), n(5), n(7), n(8), n(7), n(5), n(4), n(1), n(0)],
    vadi: 8, // Komal Dha
    samvadi: 1, // Komal Re
    timeOfDay: "Dawn / early morning",
    mood: "Grave, meditative and awe-filled — solemn devotion at daybreak.",
  },
  {
    name: "Bhairavi",
    thaat: "Bhairavi",
    // All four komal swaras: komal Re, Ga, Dha, Ni.
    swaras: [0, 1, 3, 5, 7, 8, 10],
    aroha: [n(0), n(1), n(3), n(5), n(7), n(8), n(10), n(12)],
    avaroha: [n(12), n(10), n(8), n(7), n(5), n(3), n(1), n(0)],
    // m g r S is a hallmark resolving phrase of Bhairavi.
    pakad: [n(5), n(3), n(5), n(8), n(7), n(5), n(3), n(1), n(0)],
    vadi: 5, // Ma
    samvadi: 0, // Sa
    timeOfDay: "Morning (and traditionally the concluding raga of a concert)",
    mood: "Tender, compassionate and devotional — sweet, with a touch of pathos.",
  },
  {
    name: "Bhimpalasi",
    thaat: "Kafi",
    // Komal Ga (3) and komal Ni (10); Re and Dha are shuddha.
    swaras: [0, 2, 3, 5, 7, 9, 10],
    // Audav (5-note) ascent that omits Re and Dha, starting below Sa: ṇ S g m P ṅ Ṡ
    aroha: [n(-2), n(0), n(3), n(5), n(7), n(10), n(12)],
    // Sampurna (7-note) descent: Ṡ n D P m g R S
    avaroha: [n(12), n(10), n(9), n(7), n(5), n(3), n(2), n(0)],
    // Signature: n̦ S m, m g P m g R S
    pakad: [n(-2), n(0), n(5), n(5), n(3), n(7), n(5), n(3), n(2), n(0)],
    vadi: 5, // Ma
    samvadi: 0, // Sa
    timeOfDay: "Afternoon",
    mood: "Yearning and introspective — a gentle, longing devotion.",
  },
];

/** Default raga shown on first load. */
export const DEFAULT_RAGA_NAME = "Yaman";

/** Find a raga by name (returns the first seed raga if not found). */
export function getRagaByName(name: string): Raga {
  return RAGAS.find((r) => r.name === name) ?? RAGAS[0];
}

/**
 * Resolve a raga note to its swara metadata (symbol, full name, etc.),
 * regardless of which octave it sits in.
 */
export function noteToSwaraPosition(note: RagaNote): SwaraPosition {
  return positionForSemitone(note.semitone);
}

/**
 * Convenience helper: the frequency (Hz) of a raga note, given the absolute
 * frequency of Sa. This is a thin pass-through to the theory kernel so callers
 * (drone, sequencer) don't import two modules just to play a note.
 */
export function ragaNoteToFrequency(saFreq: number, note: RagaNote): number {
  return swaraToFrequency(saFreq, note.semitone);
}
