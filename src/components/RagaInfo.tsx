/**
 * RagaInfo — the "ID card" for the selected raga: its classification, key
 * swaras, time of day, mood, and its three phrases shown as swara notation.
 */

import { positionForSemitone } from "../music/theory";
import type { Raga } from "../music/ragas";
import { PhraseRow } from "./PhraseRow";
import type { PhraseKind } from "../hooks/useSequencer";

interface RagaInfoProps {
  raga: Raga;
  playingPhrase: PhraseKind | null;
  activeIndex: number | null;
}

export function RagaInfo({ raga, playingPhrase, activeIndex }: RagaInfoProps) {
  const vadiSymbol = positionForSemitone(raga.vadi).symbol;
  const samvadiSymbol = positionForSemitone(raga.samvadi).symbol;

  // Only pass the active index to the phrase that is actually playing.
  const indexFor = (kind: PhraseKind) =>
    playingPhrase === kind ? activeIndex : null;

  return (
    <section className="panel raga-info">
      <h2>{raga.name}</h2>

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
          <dt>Time of day</dt>
          <dd>{raga.timeOfDay}</dd>
        </div>
      </dl>

      <p className="raga-mood">{raga.mood}</p>

      <div className="raga-phrases">
        <PhraseRow label="Aroha" notes={raga.aroha} activeIndex={indexFor("aroha")} />
        <PhraseRow
          label="Avaroha"
          notes={raga.avaroha}
          activeIndex={indexFor("avaroha")}
        />
        <PhraseRow label="Pakad" notes={raga.pakad} activeIndex={indexFor("pakad")} />
      </div>
    </section>
  );
}
