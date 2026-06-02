/**
 * CurvePlot — a tiny dependency-free SVG line plot.
 *
 * Used by the Math tab to draw a pitch curve cents(t) and, overlaid, its
 * derivative (velocity). Kept deliberately minimal: it maps data arrays to a
 * fixed viewBox and draws polylines, with an optional moving playhead.
 */

interface Series {
  /** y-values (one per x sample). */
  values: number[];
  color: string;
  label: string;
  /** Optional independent y-range; defaults to the series' own min/max. */
  range?: [number, number];
}

interface CurvePlotProps {
  /** x-values shared by all series (e.g. time in seconds). */
  x: number[];
  series: Series[];
  /** 0–1 fraction marking the playhead position, or null. */
  playhead?: number | null;
  height?: number;
  yLabel?: string;
}

const W = 600;

export function CurvePlot({
  x,
  series,
  playhead = null,
  height = 180,
  yLabel,
}: CurvePlotProps) {
  const H = height;
  const padX = 36;
  const padY = 16;
  const xMin = x[0];
  const xMax = x[x.length - 1];

  const sx = (xv: number) =>
    padX + ((xv - xMin) / (xMax - xMin || 1)) * (W - padX - 8);

  const makePath = (s: Series): string => {
    const lo = s.range ? s.range[0] : Math.min(...s.values);
    const hi = s.range ? s.range[1] : Math.max(...s.values);
    const span = hi - lo || 1;
    const sy = (v: number) => padY + (1 - (v - lo) / span) * (H - 2 * padY);
    return s.values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${sx(x[i]).toFixed(1)} ${sy(v).toFixed(1)}`)
      .join(" ");
  };

  const playX = playhead === null ? null : sx(xMin + playhead * (xMax - xMin));

  return (
    <figure className="curve-plot">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img">
        {/* zero/reference baseline */}
        <line x1={padX} y1={H - padY} x2={W - 8} y2={H - padY} className="plot-axis" />
        <line x1={padX} y1={padY} x2={padX} y2={H - padY} className="plot-axis" />

        {series.map((s) => (
          <path key={s.label} d={makePath(s)} fill="none" stroke={s.color} strokeWidth={2} />
        ))}

        {playX !== null && (
          <line x1={playX} y1={padY} x2={playX} y2={H - padY} className="plot-playhead" />
        )}
      </svg>

      <figcaption className="plot-legend">
        {yLabel && <span className="plot-ylabel">{yLabel}</span>}
        {series.map((s) => (
          <span key={s.label} className="plot-key">
            <span className="plot-swatch" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
