/**
 * ScaleStrip — Phase 3: the horizontal map of all 12 swara positions.
 *
 * Every chromatic position is drawn as a cell. Cells that belong to the
 * selected raga are highlighted; Vadi and Samvadi get extra badges. While a
 * phrase plays, the cell matching the currently-sounding note lights up — even
 * if that note is in a lower/upper octave, since we wrap it back into 0–11.
 */

import { SWARA_POSITIONS, positionForSemitone } from "../music/theory";

interface ScaleStripProps {
  /** Semitone offsets (0–11) that belong to the raga. */
  ragaSwaras: number[];
  /** The raw semitone offset currently sounding (may be <0 or >11), or null. */
  activeSemitone: number | null;
  /** Vadi swara (0–11). */
  vadi: number;
  /** Samvadi swara (0–11). */
  samvadi: number;
}

export function ScaleStrip({
  ragaSwaras,
  activeSemitone,
  vadi,
  samvadi,
}: ScaleStripProps) {
  const inRaga = new Set(ragaSwaras);
  // Map the sounding note (any octave) onto a 0–11 position to light its cell.
  const activePos =
    activeSemitone === null ? null : positionForSemitone(activeSemitone).semitone;

  return (
    <div className="scale-strip" role="group" aria-label="Swara positions">
      {SWARA_POSITIONS.map((pos) => {
        const belongs = inRaga.has(pos.semitone);
        const isActive = activePos === pos.semitone;
        const isVadi = pos.semitone === vadi;
        const isSamvadi = pos.semitone === samvadi;

        const classes = [
          "swara-cell",
          belongs ? "in-raga" : "not-in-raga",
          pos.altered ? "altered" : "natural",
          isActive ? "active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={pos.semitone} className={classes} title={pos.fullName}>
            <span className="swara-symbol">{pos.symbol}</span>
            <span className="swara-semitone">{pos.semitone}</span>
            {belongs && (isVadi || isSamvadi) && (
              <span className={`swara-badge ${isVadi ? "vadi" : "samvadi"}`}>
                {isVadi ? "Vadi" : "Samvadi"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
