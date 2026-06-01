/**
 * PerformanceTimeline — Phase 5: the segmented bar showing a performance arc.
 *
 * Each section is a segment whose WIDTH is proportional to its relative
 * duration and whose COLOUR reflects its intensity (calm violet → fiery
 * saffron), so you can see the music heat up from left to right. Clicking a
 * segment selects it; the segment whose demo is playing gets a glow.
 */

import type { PerformanceSection } from "../music/performances";

interface PerformanceTimelineProps {
  sections: PerformanceSection[];
  selectedId: string;
  /** Id of the section whose demo is currently playing, or null. */
  playingId: string | null;
  onSelect: (id: string) => void;
}

/** Map a 0–1 intensity to a hue from violet (calm) to orange (intense). */
function intensityColor(intensity: number): string {
  const hue = 270 - intensity * 240; // 270° violet → 30° orange
  return `hsl(${hue}, 60%, 45%)`;
}

export function PerformanceTimeline({
  sections,
  selectedId,
  playingId,
  onSelect,
}: PerformanceTimelineProps) {
  return (
    <div
      className="timeline-bar"
      role="group"
      aria-label="Performance sections over time"
    >
      {sections.map((section) => {
        const classes = [
          "timeline-segment",
          section.id === selectedId ? "selected" : "",
          section.id === playingId ? "playing" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={section.id}
            className={classes}
            style={{
              flexGrow: section.relativeDuration,
              background: intensityColor(section.intensity),
            }}
            onClick={() => onSelect(section.id)}
            aria-pressed={section.id === selectedId}
            title={section.name}
          >
            <span className="segment-name">{section.name}</span>
            <span className="segment-tempo">{section.tempoLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
