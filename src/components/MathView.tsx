/**
 * MathView — Phase: the "Math" tab.
 *
 * Three sections, mixing genuine calculus with the key non-calculus number
 * theory behind ragas:
 *
 *   1. Continuous pitch (CALCULUS): meend & andolan as functions f(t) with their
 *      exact derivatives f'(t), plotted and playable on a real ramping
 *      oscillator — the thing a keyboard cannot do.
 *   2. Tuning: just intonation vs equal temperament — ratios, cents, deviation,
 *      and an audible A/B (including the beats between the two tunings).
 *   3. Samvad / consonance: interval ratios and why vadi–samvadi is a 4/3 or 3/2.
 *
 * It reuses the shared Sa frequency from App so everything is in the user's key.
 */

import { useMemo, useState } from "react";
import { positionForSemitone } from "../music/theory";
import type { Raga } from "../music/ragas";
import {
  swaraTuningRows,
  justFrequency,
  beatRate,
  intervalBetween,
  isSamvad,
  SWARA_RATIOS,
} from "../music/tuning";
import {
  meend,
  andolan,
  type GlideShape,
  type PitchCurve,
} from "../music/glide";
import { CurvePlot } from "./CurvePlot";
import { useGlidePlayer } from "../hooks/useGlidePlayer";
import { useTuningPlayer } from "../hooks/useTuningPlayer";

interface MathViewProps {
  /** Sa frequency (melody register) so demos sound in the user's chosen key. */
  saFreq: number;
  /** The currently-selected raga, used for the samvad/vadi illustration. */
  raga: Raga;
}

const SHAPES: GlideShape[] = ["linear", "smoothstep", "ease"];

export function MathView({ saFreq, raga }: MathViewProps) {
  const glide = useGlidePlayer();
  const tuning = useTuningPlayer();

  /* ---- Section 1: continuous pitch (calculus) ---- */
  const [mode, setMode] = useState<"meend" | "andolan">("meend");
  const [shape, setShape] = useState<GlideShape>("ease");
  const [duration, setDuration] = useState(2);
  const [amplitude, setAmplitude] = useState(50); // cents (andolan)
  const [oscHz, setOscHz] = useState(1.5); // andolan oscillations/sec

  // Build the active curve. Meend glides Sa(0¢) → Pa(700¢); andolan wobbles
  // around komal Ga (300¢) — a swara that is classically "alive" with andolan.
  const curve: PitchCurve = useMemo(() => {
    if (mode === "meend") {
      return meend(0, 700, duration, shape);
    }
    return andolan(300, amplitude, oscHz, duration);
  }, [mode, shape, duration, amplitude, oscHz]);

  /* ---- Section 2: tuning rows ---- */
  const rows = useMemo(() => swaraTuningRows(), []);

  /* ---- Section 3: samvad for the selected raga ---- */
  const vadiInterval = useMemo(
    () => intervalBetween(raga.vadi, raga.samvadi),
    [raga],
  );
  const vadiSym = positionForSemitone(raga.vadi).symbol;
  const samvadiSym = positionForSemitone(raga.samvadi).symbol;
  const samvad = isSamvad(raga.vadi, raga.samvadi);

  return (
    <section className="panel math-view">
      <h2>The mathematics of ragas</h2>
      <p className="panel-hint">
        Three lenses on the structure beneath the music: continuous pitch
        (calculus), tuning systems, and consonance. Start the drone for context;
        each demo is playable.
      </p>

      {/* ============ 1. CONTINUOUS PITCH (CALCULUS) ============ */}
      <div className="math-section">
        <h3>1 · Continuous pitch — meend &amp; andolan (calculus)</h3>
        <p>
          A keyboard only plays fixed points. A sitar <em>glides</em>. So pitch
          is a continuous function of time, <code>f(t)</code>, and the feeling
          lives in its derivative <code>f′(t)</code> — how fast the pitch moves.
          We measure pitch in <strong>cents</strong> (1200 cents = one octave;
          cents = 1200·log₂(ratio)), then convert to Hz with a single
          exponential, <code>freq = Sa·2^(cents/1200)</code>.
        </p>

        <div className="control-row">
          <div className="seg-toggle">
            <button
              className={mode === "meend" ? "active" : ""}
              onClick={() => setMode("meend")}
            >
              Meend (glide)
            </button>
            <button
              className={mode === "andolan" ? "active" : ""}
              onClick={() => setMode("andolan")}
            >
              Andolan (oscillation)
            </button>
          </div>
        </div>

        {mode === "meend" ? (
          <div className="control-row math-controls">
            <label>Curve</label>
            <div className="seg-toggle">
              {SHAPES.map((s) => (
                <button
                  key={s}
                  className={shape === s ? "active" : ""}
                  onClick={() => setShape(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <label htmlFor="m-dur">Duration {duration.toFixed(1)}s</label>
            <input
              id="m-dur"
              type="range"
              min={0.5}
              max={5}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        ) : (
          <div className="control-row math-controls">
            <label htmlFor="a-amp">Amplitude {amplitude}¢</label>
            <input
              id="a-amp"
              type="range"
              min={10}
              max={120}
              step={5}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
            />
            <label htmlFor="a-hz">Rate {oscHz.toFixed(1)} Hz</label>
            <input
              id="a-hz"
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={oscHz}
              onChange={(e) => setOscHz(Number(e.target.value))}
            />
            <label htmlFor="a-dur">Duration {duration.toFixed(1)}s</label>
            <input
              id="a-dur"
              type="range"
              min={1}
              max={6}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        )}

        <CurvePlot
          x={curve.t}
          playhead={glide.playhead}
          yLabel="pitch (cents) & velocity (¢/s)"
          series={[
            { values: curve.cents, color: "#f0a830", label: "f(t): pitch (cents)" },
            {
              values: curve.velocity,
              color: "#6bb3d9",
              label: "f′(t): velocity (cents/s)",
            },
          ]}
        />

        <div className="control-row">
          <button className="phrase-button" onClick={() => glide.play(curve, saFreq)}>
            ▶ Play gesture
          </button>
          <button className="stop-button" onClick={glide.stop}>
            ■ Stop
          </button>
          <span className="math-note">
            {mode === "meend"
              ? shape === "linear"
                ? "Linear: constant velocity — a steady, mechanical slide."
                : "Eased: velocity is zero at the ends — the glide leans into each swara."
              : "Velocity peaks as it crosses the centre and is zero at the extremes — the andolan's characteristic 'breathing'."}
          </span>
        </div>
      </div>

      {/* ============ 2. TUNING: JI vs ET ============ */}
      <div className="math-section">
        <h3>2 · Tuning — just intonation vs equal temperament</h3>
        <p>
          Swaras are really small whole-number frequency <strong>ratios</strong>{" "}
          above Sa. Our audio uses 12-tone equal temperament (each step exactly
          100 cents) for simplicity, but classical tuning uses these just ratios.
          The gap is why a raga on a tanpura sounds subtly different from a piano.
          Tap a row to hear just intonation and equal temperament together — the
          shimmer you hear is the <strong>beats</strong> at |f₍JI₎ − f₍ET₎| Hz.
        </p>

        <div className="tuning-table" role="table">
          <div className="tuning-row tuning-head" role="row">
            <span>Swara</span>
            <span>Ratio</span>
            <span>JI ¢</span>
            <span>ET ¢</span>
            <span>Δ ¢</span>
            <span>Beats</span>
            <span></span>
          </div>
          {rows.map((r) => {
            const beats = beatRate(saFreq, r.pos.semitone);
            return (
              <div className="tuning-row" role="row" key={r.pos.semitone}>
                <span className="t-sym">{r.pos.symbol}</span>
                <span>
                  {r.ratio.num}/{r.ratio.den}
                </span>
                <span>{r.justCents.toFixed(1)}</span>
                <span>{r.equalCents.toFixed(0)}</span>
                <span className={r.deviation >= 0 ? "dev-pos" : "dev-neg"}>
                  {r.deviation >= 0 ? "+" : ""}
                  {r.deviation.toFixed(1)}
                </span>
                <span>{beats.toFixed(1)} Hz</span>
                <button
                  className="mini-play"
                  title="Hear JI + ET together"
                  onClick={() =>
                    tuning.play([
                      justFrequency(saFreq, r.pos.semitone),
                      saFreq * Math.pow(2, r.pos.semitone / 12),
                    ])
                  }
                >
                  ▶
                </button>
              </div>
            );
          })}
        </div>
        <p className="math-note">
          Note Ga (5/4) sits ~13.7¢ <em>below</em> the tempered major third — the
          most audible difference, and a hallmark of the "sweet" classical third.
        </p>
      </div>

      {/* ============ 3. SAMVAD / CONSONANCE ============ */}
      <div className="math-section">
        <h3>3 · Samvad — why these notes? (consonance)</h3>
        <p>
          Consonance tracks ratio <em>simplicity</em>: Sa–Pa is 3/2, Sa–Ma is
          4/3 — the simplest ratios after the octave. A raga's{" "}
          <strong>vadi</strong> and <strong>samvadi</strong> (its two most
          important notes) are usually a <em>samvad</em>: a fourth or fifth
          apart.
        </p>
        <p className="samvad-readout">
          In <strong>{raga.name}</strong>, vadi <code>{vadiSym}</code> to samvadi{" "}
          <code>{samvadiSym}</code> is the interval{" "}
          <strong>
            {vadiInterval.num}/{vadiInterval.den}
          </strong>{" "}
          ({vadiInterval.cents.toFixed(0)}¢) —{" "}
          {samvad ? (
            <span className="dev-pos">a samvad (consonant 4th/5th). ✓</span>
          ) : (
            <span className="dev-neg">
              not a textbook 4th/5th, but still a structural pairing.
            </span>
          )}
        </p>

        <div className="consonance-list">
          {[0, 7, 5, 4, 9, 2, 11].map((semi) => {
            const iv = intervalBetween(0, semi);
            const sym = SWARA_RATIOS[semi].symbol;
            return (
              <div className="consonance-item" key={semi}>
                <span className="c-pair">
                  S–{sym}
                </span>
                <span className="c-ratio">
                  {iv.num}/{iv.den}
                </span>
                <span className="c-bar">
                  <span
                    className="c-fill"
                    // Simpler ratio (lower score) => longer, "more consonant" bar.
                    style={{ width: `${Math.max(6, 100 / iv.consonanceScore)}%` }}
                  />
                </span>
              </div>
            );
          })}
        </div>
        <p className="math-note">
          Bars are 1 / (numerator + denominator): the simpler the ratio, the more
          consonant the interval.
        </p>
      </div>
    </section>
  );
}
