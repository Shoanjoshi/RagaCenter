/**
 * PhraseRow — render a melodic phrase (aroha/avaroha/pakad) as swara symbols.
 *
 * Notes in the lower octave are marked with a dot below (̣) and the upper octave
 * with a dot above (̇), matching common Hindustani notation. The note currently
 * sounding (when this row's phrase is playing) is highlighted.
 */

import { noteToSwaraPosition, type RagaNote } from "../music/ragas";

interface PhraseRowProps {
  label: string;
  notes: RagaNote[];
  /** Index of the note sounding right now, or null if this phrase isn't playing. */
  activeIndex: number | null;
}

/** Decorate a swara symbol with octave markers based on its semitone offset. */
function octaveMarkedSymbol(note: RagaNote): string {
  const symbol = noteToSwaraPosition(note).symbol;
  if (note.semitone < 0) return symbol + "̣"; // combining dot below (lower)
  if (note.semitone > 11) return symbol + "̇"; // combining dot above (upper)
  return symbol;
}

export function PhraseRow({ label, notes, activeIndex }: PhraseRowProps) {
  return (
    <div className="phrase-row">
      <span className="phrase-label">{label}</span>
      <span className="phrase-notes">
        {notes.map((note, i) => (
          <span
            key={i}
            className={`phrase-note ${i === activeIndex ? "active" : ""}`}
          >
            {octaveMarkedSymbol(note)}
          </span>
        ))}
      </span>
    </div>
  );
}
