/**
 * App — composes all three phases into one screen.
 *
 * State that lives here (the "single source of truth"):
 *   - saNote:   which pitch class Sa maps to (drives the drone AND playback)
 *   - ragaName: the selected raga
 *   - bpm:      playback tempo for phrases
 *
 * Everything pitch-related is derived from `saNote` via `saFrequency`, so the
 * drone and the melodic playback always agree on what Sa is.
 */

import { useMemo, useState } from "react";
import { saFrequency, type NoteName } from "./music/theory";
import { getRagaByName, DEFAULT_RAGA_NAME } from "./music/ragas";
import { useDrone } from "./hooks/useDrone";
import { useSequencer, type PhraseKind } from "./hooks/useSequencer";
import { DroneControls } from "./components/DroneControls";
import { RagaSelector } from "./components/RagaSelector";
import { RagaInfo } from "./components/RagaInfo";
import { ScaleStrip } from "./components/ScaleStrip";
import { PlaybackControls } from "./components/PlaybackControls";

export default function App() {
  const [saNote, setSaNote] = useState<NoteName>("C");
  const [ragaName, setRagaName] = useState<string>(DEFAULT_RAGA_NAME);
  const [bpm, setBpm] = useState<number>(90);

  // The selected raga object and the two Sa frequencies it needs.
  const raga = useMemo(() => getRagaByName(ragaName), [ragaName]);
  // Drone sits an octave lower (octave 3) so it stays under the melody (octave 4).
  const droneSaFreq = useMemo(() => saFrequency(saNote, 3), [saNote]);
  const melodySaFreq = useMemo(() => saFrequency(saNote, 4), [saNote]);

  const drone = useDrone(droneSaFreq);
  const { activeIndex, playingPhrase, play, stop } = useSequencer();

  // The raw semitone of the note sounding right now, used to light the strip.
  const activeSemitone = useMemo(() => {
    if (playingPhrase === null || activeIndex === null) return null;
    return raga[playingPhrase][activeIndex]?.semitone ?? null;
  }, [raga, playingPhrase, activeIndex]);

  const handlePlayPhrase = (phrase: PhraseKind) => {
    play(phrase, raga[phrase], melodySaFreq, bpm);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>RagaCenter</h1>
        <p className="tagline">
          Explore Hindustani classical ragas — drone, scale, and melody.
        </p>
      </header>

      <main className="app-main">
        <DroneControls
          saNote={saNote}
          onSaNoteChange={setSaNote}
          isPlaying={drone.isPlaying}
          onToggle={drone.toggle}
        />

        <section className="panel raga-panel">
          <h2>Explore a raga</h2>
          <RagaSelector ragaName={ragaName} onRagaChange={setRagaName} />

          <ScaleStrip
            ragaSwaras={raga.swaras}
            activeSemitone={activeSemitone}
            vadi={raga.vadi}
            samvadi={raga.samvadi}
          />

          <PlaybackControls
            bpm={bpm}
            onBpmChange={setBpm}
            playingPhrase={playingPhrase}
            onPlay={handlePlayPhrase}
            onStop={stop}
          />
          <p className="panel-hint">
            Tip: start the drone first, then play a phrase to hear it in context.
          </p>
        </section>

        <RagaInfo
          raga={raga}
          playingPhrase={playingPhrase}
          activeIndex={activeIndex}
        />
      </main>

      <footer className="app-footer">
        <p>
          Tuning: 12-tone equal temperament · Sa is movable · Built with Tone.js
        </p>
      </footer>
    </div>
  );
}
