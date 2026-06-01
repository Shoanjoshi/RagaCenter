/**
 * performances.ts — Phase 5 data model: the time-structure of a performance.
 *
 * A Hindustani raga performance is not a single piece but an ARC that unfolds
 * over time, growing from a slow, free-rhythm exploration into fast, intense,
 * rhythmically-driven climaxes. The exact stages depend on the genre (vocal
 * khyal, vocal dhrupad, instrumental gat), so we model a few "formats", each a
 * sequence of sections.
 *
 * IMPORTANT — this is a SCHEMATIC, EDUCATIONAL model. Real performances vary
 * enormously (an alap alone can last 20+ minutes), so `relativeDuration` is an
 * illustrative proportion for the timeline bar, not a literal timing. The UI
 * says as much.
 *
 * Like the raga model, this is plain data, so it's easy to extend with new
 * formats or richer per-section detail later.
 */

import type { PhraseKind, Raga, RagaNote } from "./ragas";

/** How a section is organised rhythmically. */
export type RhythmType = "unmetered" | "pulse" | "metered";

export interface PerformanceSection {
  /** Stable id, unique within its format (used as a React key / track id). */
  id: string;
  /** Display name, e.g. "Alap", "Vilambit Khyal". */
  name: string;
  /** One-line explanation of what happens in this section. */
  description: string;
  /** Rhythmic organisation of the section. */
  rhythm: RhythmType;
  /** Human-friendly tempo label, e.g. "Very slow", "Fast". */
  tempoLabel: string;
  /** Approximate tempo (BPM) used when playing a demo of this section. */
  approxBpm: number;
  /** Relative width of this section on the timeline bar (a unitless weight). */
  relativeDuration: number;
  /** 0–1 intensity, used to colour the timeline (calm → fiery). */
  intensity: number;
  /**
   * Which raga phrase(s) to play as a demo of this section. They are played
   * back-to-back at `approxBpm`, so a slow alap and a fast drut sound different
   * even though they draw on the same raga material.
   */
  demoPhrases: PhraseKind[];
}

export interface PerformanceFormat {
  /** Display name, e.g. "Khyal (vocal)". */
  name: string;
  /** Short description of the genre. */
  description: string;
  /** Ordered sections, earliest first. */
  sections: PerformanceSection[];
}

export const PERFORMANCE_FORMATS: PerformanceFormat[] = [
  {
    name: "Khyal (vocal)",
    description:
      "The dominant modern vocal genre: a slow free alap, then slow and fast compositions with tabla, building to fast taans.",
    sections: [
      {
        id: "khyal-alap",
        name: "Alap",
        description:
          "Slow, free-rhythm unfolding of the raga, swara by swara — no tabla yet. Establishes the raga's mood.",
        rhythm: "unmetered",
        tempoLabel: "Very slow",
        approxBpm: 40,
        relativeDuration: 3,
        intensity: 0.1,
        demoPhrases: ["aroha"],
      },
      {
        id: "khyal-vilambit",
        name: "Vilambit Khyal",
        description:
          "The 'bada khyal': a slow composition in a tala, expanded gradually (badhat) with bol-alap and slow taans.",
        rhythm: "metered",
        tempoLabel: "Slow",
        approxBpm: 60,
        relativeDuration: 5,
        intensity: 0.35,
        demoPhrases: ["pakad", "aroha"],
      },
      {
        id: "khyal-drut",
        name: "Drut Khyal",
        description:
          "The 'chota khyal': a fast composition with energetic taans (fast melodic runs) and rhythmic play.",
        rhythm: "metered",
        tempoLabel: "Fast",
        approxBpm: 140,
        relativeDuration: 3,
        intensity: 0.75,
        demoPhrases: ["aroha", "avaroha"],
      },
      {
        id: "khyal-tihai",
        name: "Taan & Tihai",
        description:
          "The climax: very fast taans resolving in a tihai (a phrase repeated three times) landing on the sam.",
        rhythm: "metered",
        tempoLabel: "Very fast",
        approxBpm: 200,
        relativeDuration: 1,
        intensity: 1,
        demoPhrases: ["aroha", "avaroha"],
      },
    ],
  },
  {
    name: "Dhrupad (vocal)",
    description:
      "The oldest surviving vocal genre: a long free alap with jod and jhala, then a composition with the pakhawaj drum.",
    sections: [
      {
        id: "dhrupad-alap",
        name: "Alap",
        description:
          "Extended, free-rhythm meditation on the raga using meaningless syllables (nom-tom). No percussion.",
        rhythm: "unmetered",
        tempoLabel: "Very slow",
        approxBpm: 40,
        relativeDuration: 4,
        intensity: 0.1,
        demoPhrases: ["aroha"],
      },
      {
        id: "dhrupad-jod",
        name: "Jod",
        description:
          "A steady pulse emerges in the alap, giving forward motion — still without a drum.",
        rhythm: "pulse",
        tempoLabel: "Medium",
        approxBpm: 90,
        relativeDuration: 3,
        intensity: 0.45,
        demoPhrases: ["aroha"],
      },
      {
        id: "dhrupad-jhala",
        name: "Jhala",
        description:
          "Fast, rhythmic climax of the alap section, with rapid pulsation building excitement.",
        rhythm: "pulse",
        tempoLabel: "Fast",
        approxBpm: 160,
        relativeDuration: 2,
        intensity: 0.8,
        demoPhrases: ["aroha", "avaroha"],
      },
      {
        id: "dhrupad-bandish",
        name: "Dhrupad Bandish",
        description:
          "The composition, set to a tala (often Chautal) and accompanied by the pakhawaj, with rhythmic layakari.",
        rhythm: "metered",
        tempoLabel: "Medium",
        approxBpm: 80,
        relativeDuration: 3,
        intensity: 0.6,
        demoPhrases: ["pakad", "aroha"],
      },
    ],
  },
  {
    name: "Instrumental Gat (sitar / sarod)",
    description:
      "Instrumental format: a free alap with jod and jhala, then slow and fast compositions (gats) with tabla.",
    sections: [
      {
        id: "gat-alap",
        name: "Alap",
        description:
          "Slow, free-rhythm exploration of the raga on the instrument, no tabla.",
        rhythm: "unmetered",
        tempoLabel: "Very slow",
        approxBpm: 40,
        relativeDuration: 4,
        intensity: 0.1,
        demoPhrases: ["aroha"],
      },
      {
        id: "gat-jod",
        name: "Jod",
        description: "A pulse appears; the music gains rhythmic momentum, still drumless.",
        rhythm: "pulse",
        tempoLabel: "Medium",
        approxBpm: 90,
        relativeDuration: 3,
        intensity: 0.4,
        demoPhrases: ["aroha"],
      },
      {
        id: "gat-jhala",
        name: "Jhala",
        description:
          "Fast strumming climax of the alap using the drone strings (chikari) for rhythmic drive.",
        rhythm: "pulse",
        tempoLabel: "Fast",
        approxBpm: 170,
        relativeDuration: 2,
        intensity: 0.8,
        demoPhrases: ["aroha", "avaroha"],
      },
      {
        id: "gat-vilambit",
        name: "Vilambit Gat",
        description: "A slow fixed composition with tabla, elaborated with vistar and taans.",
        rhythm: "metered",
        tempoLabel: "Slow",
        approxBpm: 60,
        relativeDuration: 3,
        intensity: 0.5,
        demoPhrases: ["pakad"],
      },
      {
        id: "gat-drut",
        name: "Drut Gat & Jhala",
        description:
          "A fast composition driving to a jhala climax — the energetic conclusion of the recital.",
        rhythm: "metered",
        tempoLabel: "Very fast",
        approxBpm: 160,
        relativeDuration: 2,
        intensity: 1,
        demoPhrases: ["aroha", "avaroha"],
      },
    ],
  },
];

/** Default format shown on first load. */
export const DEFAULT_FORMAT_NAME = PERFORMANCE_FORMATS[0].name;

/** Find a format by name (returns the first one if not found). */
export function getFormatByName(name: string): PerformanceFormat {
  return PERFORMANCE_FORMATS.find((f) => f.name === name) ?? PERFORMANCE_FORMATS[0];
}

/**
 * Build the note sequence for a section's demo by concatenating the chosen
 * raga phrases. Returns the actual notes the sequencer will play.
 */
export function buildDemoNotes(raga: Raga, section: PerformanceSection): RagaNote[] {
  return section.demoPhrases.flatMap((phrase) => raga[phrase]);
}
