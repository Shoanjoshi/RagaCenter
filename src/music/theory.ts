/**
 * theory.ts — the musical "kernel" of RagaCenter.
 *
 * Everything about pitch lives here so the rest of the app never has to do
 * frequency math directly. Two ideas drive the whole design:
 *
 *  1. Sa is MOVABLE. In Hindustani music the whole system is relative to a
 *     tonic, Sa. We store every swara as a number of semitones above Sa, and
 *     only convert to an actual frequency (Hz) at the very last moment, once
 *     the user has picked which absolute pitch Sa should be.
 *
 *  2. We use 12-TONE EQUAL TEMPERAMENT (12-TET). Real tanpuras are tuned with
 *     just-intonation ratios, and the "correct" shruti for a swara can even
 *     vary by raga. Equal temperament is a deliberate simplification: it is
 *     unambiguous and trivial to compute. Because ALL the frequency math is
 *     funnelled through `swaraToFrequency` below, a later phase can swap in
 *     just-intonation ratios in exactly one place without touching any UI.
 */

/** The twelve chromatic pitch classes, used to choose an absolute Sa. */
export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

/**
 * Describes one of the 12 swara positions within a single octave.
 *
 * `semitone` is the offset from Sa (0–11) and is the SOURCE OF TRUTH.
 * The names are just human-friendly labels for that offset.
 *
 * Naming convention (so komal/shuddha/tivra are never ambiguous):
 *   - UPPERCASE letter  = shuddha (natural):   S R G m P D N
 *   - lowercase letter  = komal (flattened):   r g d n
 *   - tivra (sharpened) Madhyam is the lone sharp, written `M`
 */
export interface SwaraPosition {
  /** Semitones above Sa, 0–11. The canonical identifier for the pitch. */
  semitone: number;
  /** Compact label, e.g. "S", "r", "M". */
  symbol: string;
  /** Full Hindustani name, e.g. "Komal Re". */
  fullName: string;
  /** Whether this is an "altered" (komal or tivra) swara — handy for styling. */
  altered: boolean;
}

/**
 * The 12 swara positions of one octave, indexed by semitone offset from Sa.
 * This is the chromatic backbone the scale strip renders, and the table the
 * raga data references by semitone.
 */
export const SWARA_POSITIONS: readonly SwaraPosition[] = [
  { semitone: 0, symbol: "S", fullName: "Shadja (Sa)", altered: false },
  { semitone: 1, symbol: "r", fullName: "Komal Re", altered: true },
  { semitone: 2, symbol: "R", fullName: "Shuddha Re", altered: false },
  { semitone: 3, symbol: "g", fullName: "Komal Ga", altered: true },
  { semitone: 4, symbol: "G", fullName: "Shuddha Ga", altered: false },
  { semitone: 5, symbol: "m", fullName: "Shuddha Ma", altered: false },
  { semitone: 6, symbol: "M", fullName: "Tivra Ma", altered: true },
  { semitone: 7, symbol: "P", fullName: "Pancham (Pa)", altered: false },
  { semitone: 8, symbol: "d", fullName: "Komal Dha", altered: true },
  { semitone: 9, symbol: "D", fullName: "Shuddha Dha", altered: false },
  { semitone: 10, symbol: "n", fullName: "Komal Ni", altered: true },
  { semitone: 11, symbol: "N", fullName: "Shuddha Ni", altered: false },
] as const;

/**
 * MIDI note number for a named pitch at a given octave (scientific pitch
 * notation, where middle C = C4 = MIDI 60). Used only to anchor Sa to an
 * absolute frequency.
 */
function noteToMidi(note: NoteName, octave: number): number {
  const indexInOctave = NOTE_NAMES.indexOf(note);
  // MIDI 12 is C0, so each octave adds 12 and C4 lands on 60.
  return indexInOctave + (octave + 1) * 12;
}

/** Convert a MIDI note number to a frequency in Hz (A4 = MIDI 69 = 440 Hz). */
function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * The absolute frequency (Hz) of Sa, given the pitch class the user chose and
 * which octave we want Sa to live in. Defaults to octave 4 (around middle C),
 * a comfortable register for the melodic scale strip.
 */
export function saFrequency(saNote: NoteName, octave = 4): number {
  return midiToFrequency(noteToMidi(saNote, octave));
}

/**
 * THE central helper: turn a swara (expressed as semitones from Sa) into a
 * frequency in Hz. `semitonesFromSa` may be negative (lower octave) or above
 * 11 (upper octaves) — octave handling is just arithmetic here.
 *
 * This is the single chokepoint for all pitch math. Swap the formula here to
 * change tuning systems (e.g. just intonation) app-wide.
 */
export function swaraToFrequency(
  saFreq: number,
  semitonesFromSa: number,
): number {
  return saFreq * Math.pow(2, semitonesFromSa / 12);
}

/**
 * Look up the swara position for any semitone offset, wrapping into the 0–11
 * range so that upper/lower-octave notes still resolve to the right symbol.
 */
export function positionForSemitone(semitonesFromSa: number): SwaraPosition {
  // JavaScript's % keeps the sign of the dividend, so normalise to 0–11.
  const wrapped = ((semitonesFromSa % 12) + 12) % 12;
  return SWARA_POSITIONS[wrapped];
}
