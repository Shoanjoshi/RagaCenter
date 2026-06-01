/**
 * TimelineView — Phase 5: explore the time-structure of a performance.
 *
 * Pick a format (khyal / dhrupad / instrumental) and a raga, then see the arc
 * as a proportional, colour-coded timeline. Selecting a section shows its
 * detail and lets you play a demo of the chosen raga at that section's tempo —
 * a slow alap vs a fast drut — over the shared drone, lighting a mini scale
 * strip in real time.
 */

import { useMemo, useState } from "react";
import type { Raga, RagaNote } from "../music/ragas";
import {
  PERFORMANCE_FORMATS,
  DEFAULT_FORMAT_NAME,
  getFormatByName,
  buildDemoNotes,
} from "../music/performances";
import { RagaSelector } from "./RagaSelector";
import { ScaleStrip } from "./ScaleStrip";
import { PerformanceTimeline } from "./PerformanceTimeline";

interface TimelineViewProps {
  ragaName: string;
  onRagaChange: (name: string) => void;
  raga: Raga;
  activeTrack: string | null;
  activeSemitone: number | null;
  /** Play a labelled demo track at a section-specific tempo. */
  onPlayDemo: (trackId: string, notes: RagaNote[], bpm: number) => void;
  onStop: () => void;
}

/** Demo track ids are namespaced so the sequencer can tell them apart. */
const trackId = (sectionId: string) => `T:${sectionId}`;

export function TimelineView({
  ragaName,
  onRagaChange,
  raga,
  activeTrack,
  activeSemitone,
  onPlayDemo,
  onStop,
}: TimelineViewProps) {
  const [formatName, setFormatName] = useState<string>(DEFAULT_FORMAT_NAME);
  const format = useMemo(() => getFormatByName(formatName), [formatName]);

  // Which section's detail is shown. Defaults to the first of the format.
  const [selectedId, setSelectedId] = useState<string>(
    format.sections[0].id,
  );

  // Keep the selection valid when the format changes.
  const selected =
    format.sections.find((s) => s.id === selectedId) ?? format.sections[0];

  const handleFormatChange = (name: string) => {
    onStop();
    setFormatName(name);
    setSelectedId(getFormatByName(name).sections[0].id);
  };

  // Which section is currently sounding (track ids look like "T:khyal-alap").
  const playingId =
    activeTrack && activeTrack.startsWith("T:") ? activeTrack.slice(2) : null;
  const isSelectedPlaying = playingId === selected.id;

  const playDemo = () => {
    onPlayDemo(trackId(selected.id), buildDemoNotes(raga, selected), selected.approxBpm);
  };

  return (
    <section className="panel timeline-view">
      <h2>Performance timeline</h2>

      <div className="comparison-pickers">
        <div className="control-row">
          <label htmlFor="format-select">Format</label>
          <select
            id="format-select"
            value={formatName}
            onChange={(e) => handleFormatChange(e.target.value)}
          >
            {PERFORMANCE_FORMATS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <RagaSelector ragaName={ragaName} onRagaChange={onRagaChange} />
      </div>

      <p className="panel-hint">{format.description}</p>

      <PerformanceTimeline
        sections={format.sections}
        selectedId={selected.id}
        playingId={playingId}
        onSelect={setSelectedId}
      />
      <p className="timeline-axis">
        <span>← earlier</span>
        <span>slower → faster, calmer → more intense</span>
        <span>later →</span>
      </p>

      <div className="section-detail">
        <div className="section-detail-head">
          <h3>{selected.name}</h3>
          <span className={`rhythm-badge rhythm-${selected.rhythm}`}>
            {selected.rhythm}
          </span>
          <span className="tempo-badge">
            {selected.tempoLabel} · ~{selected.approxBpm} BPM
          </span>
        </div>
        <p>{selected.description}</p>

        <div className="control-row">
          <button
            className={`phrase-button ${isSelectedPlaying ? "is-playing" : ""}`}
            onClick={() => (isSelectedPlaying ? onStop() : playDemo())}
          >
            {isSelectedPlaying ? "■ Stop demo" : `▶ Play ${raga.name} in this section`}
          </button>
        </div>

        <ScaleStrip
          ragaSwaras={raga.swaras}
          activeSemitone={activeSemitone}
          vadi={raga.vadi}
          samvadi={raga.samvadi}
        />
      </div>

      <p className="panel-hint">
        This is a schematic, educational model — real performances vary widely
        (an alap alone can last many minutes). Segment widths show rough
        proportions, not exact timings. Start the drone first for the full effect.
      </p>
    </section>
  );
}
