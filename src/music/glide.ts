/**
 * glide.ts — the CALCULUS of continuous pitch (Meend & Andolan).
 *
 * A Western keyboard can only play discrete pitches. Hindustani music, by
 * contrast, treats a swara as something you can TRAVERSE continuously — the
 * sitar's meend (glide) or the slow andolan (oscillation) around a komal note.
 * That means pitch is a continuous function of time, f(t), and the expressive
 * character lives in HOW it moves — i.e. in its derivative f'(t).
 *
 * We work in CENTS as the pitch coordinate (a logarithmic unit: every +1200
 * cents doubles frequency). Working in cents makes the calculus clean and the
 * audio conversion is a single exponential at the end:
 *
 *     frequency(t) = saFreq · 2^(cents(t) / 1200)
 *
 * Everything below produces a `PitchCurve`: the value cents(t) and its exact
 * analytic derivative d(cents)/dt, sampled so the UI can plot both and the
 * audio engine can ramp a real oscillator along it.
 */

/** A continuous pitch gesture sampled over its duration. */
export interface PitchCurve {
  /** Total duration in seconds. */
  duration: number;
  /** Sample times (seconds). */
  t: number[];
  /** Pitch at each time, in cents above Sa. */
  cents: number[];
  /** Exact derivative d(cents)/dt at each time, in cents/second. */
  velocity: number[];
}

/** Shape of a meend glide between two pitches. */
export type GlideShape = "linear" | "smoothstep" | "ease";

/**
 * A MEEND: a glide from `fromCents` to `toCents` over `duration` seconds.
 *
 * The `shape` chooses the easing curve s(τ) on a normalised time τ∈[0,1]:
 *   - linear:     s(τ) = τ                       → constant velocity
 *   - smoothstep: s(τ) = 3τ² − 2τ³               → zero velocity at both ends
 *   - ease:       s(τ) = ½(1 − cos(πτ))          → sinusoidal ease in/out
 *
 * cents(t) = from + (to − from)·s(τ),   τ = t/duration.
 * Because cents = from + Δ·s(τ) and τ = t/D, the chain rule gives the exact
 * velocity  d(cents)/dt = Δ · s'(τ) · (1/D)  — no numerical differencing.
 */
export function meend(
  fromCents: number,
  toCents: number,
  duration: number,
  shape: GlideShape,
  samples = 200,
): PitchCurve {
  const delta = toCents - fromCents;
  const t: number[] = [];
  const cents: number[] = [];
  const velocity: number[] = [];

  // s(τ) and its derivative s'(τ) for each shape.
  const s = (tau: number): number => {
    switch (shape) {
      case "linear":
        return tau;
      case "smoothstep":
        return 3 * tau * tau - 2 * tau * tau * tau;
      case "ease":
        return 0.5 * (1 - Math.cos(Math.PI * tau));
    }
  };
  const sPrime = (tau: number): number => {
    switch (shape) {
      case "linear":
        return 1;
      case "smoothstep":
        return 6 * tau - 6 * tau * tau; // d/dτ (3τ²−2τ³)
      case "ease":
        return 0.5 * Math.PI * Math.sin(Math.PI * tau);
    }
  };

  for (let i = 0; i <= samples; i++) {
    const tau = i / samples;
    const time = tau * duration;
    t.push(time);
    cents.push(fromCents + delta * s(tau));
    // Chain rule: d/dt = Δ · s'(τ) · dτ/dt, and dτ/dt = 1/duration.
    velocity.push((delta * sPrime(tau)) / duration);
  }

  return { duration, t, cents, velocity };
}

/**
 * An ANDOLAN: a slow, gentle oscillation of `amplitude` cents around a centre
 * pitch, at `freqHz` oscillations per second, for `duration` seconds.
 *
 * cents(t) = centre + A·sin(2π f t)
 * Its derivative is exact and sinusoidal, 90° out of phase:
 * d(cents)/dt = A·2π f·cos(2π f t)
 * — the pitch moves FASTEST as it crosses the centre and is momentarily still
 * at the extremes, which is exactly how a good andolan "leans" on the note.
 */
export function andolan(
  centreCents: number,
  amplitude: number,
  freqHz: number,
  duration: number,
  samples = 400,
): PitchCurve {
  const t: number[] = [];
  const cents: number[] = [];
  const velocity: number[] = [];
  const omega = 2 * Math.PI * freqHz;

  for (let i = 0; i <= samples; i++) {
    const time = (i / samples) * duration;
    t.push(time);
    cents.push(centreCents + amplitude * Math.sin(omega * time));
    velocity.push(amplitude * omega * Math.cos(omega * time));
  }

  return { duration, t, cents, velocity };
}

/** Convert a pitch in cents (above Sa) to a frequency in Hz. */
export function centsToFrequency(saFreq: number, cents: number): number {
  return saFreq * Math.pow(2, cents / 1200);
}
