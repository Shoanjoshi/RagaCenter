/**
 * App — composes all phases into one screen.
 *
 * State that lives here (the "single source of truth"):
 *   - view:      "explore" (single raga) or "compare" (two ragas, Phase 4)
 *   - saNote:    which pitch class Sa maps to (drives the drone AND playback)
 *   - bpm:       playback tempo for phrases
 *   - ragaName:  the raga shown in Explore
 *   - ragaA/B:   the two ragas shown in Compare
 *
 * Everything pitch-related is derived from `saNote` via `saFrequency`, so the
 * drone and the melodic playback always agree on what Sa is. The drone and the
 * sequencer are shared across both views.
 */

import { useMemo, useState } from "react";
import { saFrequency, type NoteName } from "./music/theory";
import { getRagaByName, DEFAULT_RAGA_NAME, type RagaNote } from "./music/ragas";
import { useDrone } from "./hooks/useDrone";
import { useSequencer, type PhraseKind } from "./hooks/useSequencer";
import { DroneControls } from "./components/DroneControls";
import { RagaSelector } from "./components/RagaSelector";
import { RagaInfo } from "./components/RagaInfo";
import { ScaleStrip } from "./components/ScaleStrip";
import { PlaybackControls } from "./components/PlaybackControls";
import { ComparisonView } from "./components/ComparisonView";

type View = "explore" | "compare";

export default function App() {
  const [view, setView] = useState<View>("explore");
  const [saNote, setSaNote] = useState<NoteName>("C");
  const [bpm, setBpm] = useState<number>(90);

  const [ragaName, setRagaName] = useState<string>(DEFAULT_RAGA_NAME);
  const [ragaAName, setRagaAName] = useState<string>("Yaman");
  const [ragaBName, setRagaBName] = useState<string>("Bhairav");

  // Resolve selected raga objects.
  const raga = useMemo(() => getRagaByName(ragaName), [ragaName]);
  const ragaA = useMemo(() => getRagaByName(ragaAName), [ragaAName]);
  const ragaB = useMemo(() => getRagaByName(ragaBName), [ragaBName]);

  // Drone sits an octave lower (octave 3) so it stays under the melody (octave 4).
  const droneSaFreq = useMemo(() => saFrequency(saNote, 3), [saNote]);
  const melodySaFreq = useMemo(() => saFrequency(saNote, 4), [saNote]);

  const drone = useDrone(droneSaFreq);
  const { activeTrack, activeIndex, activeNote, play, stop } = useSequencer();

  // The note sounding right now lights up whichever strip is on screen.
  const activeSemitone = activeNote?.semitone ?? null;

  // In Explore, track ids ARE the phrase kinds, so map back for the components.
  const playingPhrase =
    view === "explore" ? (activeTrack as PhraseKind | null) : null;

  const handlePlayPhrase = (phrase: PhraseKind) => {
    play(phrase, raga[phrase], melodySaFreq, bpm);
  };

  // Stop any playback when switching views so highlights don't leak across.
  const switchView = (next: View) => {
    if (next === view) return;
    stop();
    setView(next);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>RagaCenter</h1>
        <p className="tagline">
          Explore Hindustani classical ragas — drone, scale, and melody.
        </p>
      </header>

      <nav className="view-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={view === "explore"}
          className={view === "explore" ? "active" : ""}
          onClick={() => switchView("explore")}
        >
          Explore
        </button>
        <button
          role="tab"
          aria-selected={view === "compare"}
          className={view === "compare" ? "active" : ""}
          onClick={() => switchView("compare")}
        >
          Compare
        </button>
      </nav>

      <main className="app-main">
        <DroneControls
          saNote={saNote}
          onSaNoteChange={setSaNote}
          isPlaying={drone.isPlaying}
          onToggle={drone.toggle}
        />

        {view === "explore" ? (
          <>
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
          </>
        ) : (
          <ComparisonView
            ragaA={ragaA}
            ragaB={ragaB}
            onChangeA={setRagaAName}
            onChangeB={setRagaBName}
            activeTrack={activeTrack}
            activeIndex={activeIndex}
            activeSemitone={activeSemitone}
            onPlay={(trackId: string, notes: RagaNote[]) =>
              play(trackId, notes, melodySaFreq, bpm)
            }
            onStop={stop}
          />
        )}

        {view === "compare" && (
          <section className="panel tempo-panel">
            <PlaybackControls
              bpm={bpm}
              onBpmChange={setBpm}
              playingPhrase={null}
              onPlay={handlePlayPhrase}
              onStop={stop}
              tempoOnly
            />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Tuning: 12-tone equal temperament · Sa is movable · Built with Tone.js
        </p>
      </footer>
    </div>
  );
}
