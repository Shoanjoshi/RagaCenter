/**
 * ComparisonStrip — Phase 4: overlay two ragas on one 12-position strip.
 *
 * Each chromatic position is categorised by membership:
 *   - "both"    : present in raga A AND raga B (the shared backbone)
 *   - "only-a"  : present only in raga A
 *   - "only-b"  : present only in raga B
 *   - "neither" : used by neither raga
 *
 * As before, the cell matching the currently-sounding note lights up, with the
 * sounding note wrapped into the 0–11 range so any octave maps correctly.
 */

import { SWARA_POSITIONS, positionForSemitone } from "../music/theory";
import type { Raga } from "../music/ragas";

interface ComparisonStripProps {
  ragaA: Raga;
  ragaB: Raga;
  /** Raw semitone offset sounding now (may be <0 or >11), or null. */
  activeSemitone: number | null;
}

type Membership = "both" | "only-a" | "only-b" | "neither";

function membership(semitone: number, a: Set<number>, b: Set<number>): Membership {
  const inA = a.has(semitone);
  const inB = b.has(semitone);
  if (inA && inB) return "both";
  if (inA) return "only-a";
  if (inB) return "only-b";
  return "neither";
}

export function ComparisonStrip({
  ragaA,
  ragaB,
  activeSemitone,
}: ComparisonStripProps) {
  const setA = new Set(ragaA.swaras);
  const setB = new Set(ragaB.swaras);
  const activePos =
    activeSemitone === null ? null : positionForSemitone(activeSemitone).semitone;

  return (
    <div className="comparison">
      <div className="scale-strip" role="group" aria-label="Raga comparison">
        {SWARA_POSITIONS.map((pos) => {
          const kind = membership(pos.semitone, setA, setB);
          const isActive = activePos === pos.semitone;
          const classes = [
            "swara-cell",
            `member-${kind}`,
            isActive ? "active" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={pos.semitone} className={classes} title={pos.fullName}>
              <span className="swara-symbol">{pos.symbol}</span>
              <span className="swara-semitone">{pos.semitone}</span>
            </div>
          );
        })}
      </div>

      <ul className="comparison-legend">
        <li>
          <span className="legend-swatch member-both" /> Shared
        </li>
        <li>
          <span className="legend-swatch member-only-a" /> Only {ragaA.name}
        </li>
        <li>
          <span className="legend-swatch member-only-b" /> Only {ragaB.name}
        </li>
      </ul>
    </div>
  );
}
