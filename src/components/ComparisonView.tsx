/**
 * ComparisonView — Phase 4: compare two ragas side by side.
 *
 * Composes: two raga pickers, the overlay ComparisonStrip, a short text diff of
 * their swaras, and a RagaColumn for each raga (facts + per-phrase playback).
 *
 * All audio flows through the shared sequencer in App, so only one phrase plays
 * at a time and it sounds over the same drone as everywhere else.
 */

import { useMemo } from "react";
import { RAGAS, type Raga, type RagaNote } from "../music/ragas";
import { positionForSemitone } from "../music/theory";
import { ComparisonStrip } from "./ComparisonStrip";
import { RagaColumn } from "./RagaColumn";

interface ComparisonViewProps {
  ragaA: Raga;
  ragaB: Raga;
  onChangeA: (name: string) => void;
  onChangeB: (name: string) => void;
  activeTrack: string | null;
  activeIndex: number | null;
  activeSemitone: number | null;
  onPlay: (trackId: string, notes: RagaNote[]) => void;
  onStop: () => void;
}

/** Format a set of semitone offsets as readable swara symbols, e.g. "r · g · n". */
function formatSwaras(semitones: number[]): string {
  if (semitones.length === 0) return "—";
  return semitones
    .slice()
    .sort((a, b) => a - b)
    .map((s) => positionForSemitone(s).symbol)
    .join(" · ");
}

export function ComparisonView({
  ragaA,
  ragaB,
  onChangeA,
  onChangeB,
  activeTrack,
  activeIndex,
  activeSemitone,
  onPlay,
  onStop,
}: ComparisonViewProps) {
  // Compute the swara diff between the two ragas once per selection change.
  const diff = useMemo(() => {
    const setB = new Set(ragaB.swaras);
    const setA = new Set(ragaA.swaras);
    return {
      shared: ragaA.swaras.filter((s) => setB.has(s)),
      onlyA: ragaA.swaras.filter((s) => !setB.has(s)),
      onlyB: ragaB.swaras.filter((s) => !setA.has(s)),
    };
  }, [ragaA, ragaB]);

  return (
    <section className="panel comparison-view">
      <h2>Compare ragas</h2>

      <div className="comparison-pickers">
        <div className="control-row">
          <label htmlFor="raga-a">Raga A</label>
          <select id="raga-a" value={ragaA.name} onChange={(e) => onChangeA(e.target.value)}>
            {RAGAS.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="control-row">
          <label htmlFor="raga-b">Raga B</label>
          <select id="raga-b" value={ragaB.name} onChange={(e) => onChangeB(e.target.value)}>
            {RAGAS.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ComparisonStrip ragaA={ragaA} ragaB={ragaB} activeSemitone={activeSemitone} />

      <dl className="diff-summary">
        <div>
          <dt>Shared swaras</dt>
          <dd>{formatSwaras(diff.shared)}</dd>
        </div>
        <div>
          <dt>Only {ragaA.name}</dt>
          <dd>{formatSwaras(diff.onlyA)}</dd>
        </div>
        <div>
          <dt>Only {ragaB.name}</dt>
          <dd>{formatSwaras(diff.onlyB)}</dd>
        </div>
      </dl>

      <div className="comparison-columns">
        <RagaColumn
          raga={ragaA}
          side="A"
          activeTrack={activeTrack}
          activeIndex={activeIndex}
          onPlay={onPlay}
          onStop={onStop}
        />
        <RagaColumn
          raga={ragaB}
          side="B"
          activeTrack={activeTrack}
          activeIndex={activeIndex}
          onPlay={onPlay}
          onStop={onStop}
        />
      </div>

      <p className="panel-hint">
        Tip: start the drone, then play Raga A's aroha and Raga B's aroha
        back-to-back to hear how they differ.
      </p>
    </section>
  );
}
