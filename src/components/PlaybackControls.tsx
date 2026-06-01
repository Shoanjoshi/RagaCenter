/**
 * PlaybackControls — Phase 3: play the raga's aroha / avaroha / pakad over the
 * drone, plus a tempo slider.
 */

import type { PhraseKind } from "../hooks/useSequencer";

interface PlaybackControlsProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  playingPhrase: PhraseKind | null;
  onPlay: (phrase: PhraseKind) => void;
  onStop: () => void;
}

const PHRASES: { kind: PhraseKind; label: string }[] = [
  { kind: "aroha", label: "Aroha ↑" },
  { kind: "avaroha", label: "Avaroha ↓" },
  { kind: "pakad", label: "Pakad ✦" },
];

export function PlaybackControls({
  bpm,
  onBpmChange,
  playingPhrase,
  onPlay,
  onStop,
}: PlaybackControlsProps) {
  const isPlaying = playingPhrase !== null;

  return (
    <div className="playback-controls">
      <div className="phrase-buttons">
        {PHRASES.map(({ kind, label }) => (
          <button
            key={kind}
            className={`phrase-button ${playingPhrase === kind ? "is-playing" : ""}`}
            onClick={() => onPlay(kind)}
          >
            {label}
          </button>
        ))}
        <button
          className="stop-button"
          onClick={onStop}
          disabled={!isPlaying}
        >
          ■ Stop
        </button>
      </div>

      <div className="control-row tempo-row">
        <label htmlFor="tempo">Tempo</label>
        <input
          id="tempo"
          type="range"
          min={30}
          max={240}
          step={5}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
        />
        <span className="tempo-value">{bpm} BPM</span>
      </div>
    </div>
  );
}
