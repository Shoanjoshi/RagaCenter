/**
 * RagaColumn — Phase 4: one raga's "card" inside the comparison view.
 *
 * Shows the raga's facts and its three phrases, each with a play button so the
 * two ragas can be heard back-to-back. Playback tracks are namespaced by side
 * ("A:aroha" / "B:pakad") so the sequencer hook can tell the columns apart.
 */

import { positionForSemitone } from "../music/theory";
import type { Raga } from "../music/ragas";
import { PhraseRow } from "./PhraseRow";
import type { PhraseKind } from "../hooks/useSequencer";

interface RagaColumnProps {
  raga: Raga;
  /** "A" or "B" — used to namespace playback track ids. */
  side: "A" | "B";
  /** The track id currently playing (e.g. "A:aroha"), or null. */
  activeTrack: string | null;
  /** Index of the note sounding now within the active track. */
  activeIndex: number | null;
  onPlay: (trackId: string, notes: Raga["aroha"]) => void;
  onStop: () => void;
}

const PHRASES: { kind: PhraseKind; label: string }[] = [
  { kind: "aroha", label: "Aroha ↑" },
  { kind: "avaroha", label: "Avaroha ↓" },
  { kind: "pakad", label: "Pakad ✦" },
];

export function RagaColumn({
  raga,
  side,
  activeTrack,
  activeIndex,
  onPlay,
  onStop,
}: RagaColumnProps) {
  const vadiSymbol = positionForSemitone(raga.vadi).symbol;
  const samvadiSymbol = positionForSemitone(raga.samvadi).symbol;
  const trackId = (kind: PhraseKind) => `${side}:${kind}`;

  return (
    <div className="raga-column">
      <h3>{raga.name}</h3>

      <dl className="raga-facts">
        <div>
          <dt>Thaat</dt>
          <dd>{raga.thaat}</dd>
        </div>
        <div>
          <dt>Vadi · Samvadi</dt>
          <dd>
            {vadiSymbol} · {samvadiSymbol}
          </dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{raga.timeOfDay}</dd>
        </div>
      </dl>

      <p className="raga-mood">{raga.mood}</p>

      <div className="raga-phrases">
        {PHRASES.map(({ kind, label }) => {
          const id = trackId(kind);
          const playing = activeTrack === id;
          return (
            <div key={kind} className="phrase-play-row">
              <button
                className={`phrase-button ${playing ? "is-playing" : ""}`}
                onClick={() =>
                  playing ? onStop() : onPlay(id, raga[kind])
                }
              >
                {playing ? "■" : "▶"} {label}
              </button>
              <PhraseRow
                label=""
                notes={raga[kind]}
                activeIndex={playing ? activeIndex : null}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
