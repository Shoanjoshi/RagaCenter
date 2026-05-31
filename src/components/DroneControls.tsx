/**
 * DroneControls — Phase 1 UI: pick the Sa pitch and play/stop the drone.
 */

import { NOTE_NAMES, type NoteName } from "../music/theory";

interface DroneControlsProps {
  saNote: NoteName;
  onSaNoteChange: (note: NoteName) => void;
  isPlaying: boolean;
  onToggle: () => void;
}

export function DroneControls({
  saNote,
  onSaNoteChange,
  isPlaying,
  onToggle,
}: DroneControlsProps) {
  return (
    <section className="panel drone-controls">
      <h2>Drone (Tanpura)</h2>
      <p className="panel-hint">
        A continuous Sa–Pa drone, like an open tanpura. Pick the pitch of Sa,
        then press play.
      </p>

      <div className="control-row">
        <label htmlFor="sa-select">Sa pitch</label>
        <select
          id="sa-select"
          value={saNote}
          onChange={(e) => onSaNoteChange(e.target.value as NoteName)}
        >
          {NOTE_NAMES.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>

        <button
          className={`play-button ${isPlaying ? "is-playing" : ""}`}
          onClick={onToggle}
          aria-pressed={isPlaying}
        >
          {isPlaying ? "■ Stop drone" : "▶ Play drone"}
        </button>
      </div>
    </section>
  );
}
