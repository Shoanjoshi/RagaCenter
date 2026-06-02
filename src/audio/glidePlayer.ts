/**
 * glidePlayer.ts — play a continuous PitchCurve on a real oscillator.
 *
 * This is what makes the calculus AUDIBLE: rather than triggering discrete
 * notes, we hold one oscillator and ramp its frequency along cents(t), so you
 * hear an unbroken meend or andolan — the thing a keyboard cannot do.
 *
 * We schedule the ramp with Web Audio's `setValueAtTime` at each sample, using
 * Tone's oscillator. Like the drone, this avoids Tone.Transport so it never
 * collides with the melodic sequencer.
 */

import * as Tone from "tone";
import { centsToFrequency, type PitchCurve } from "../music/glide";

export class GlidePlayer {
  private osc: Tone.Oscillator;
  private env: Tone.AmplitudeEnvelope;
  private filter: Tone.Filter;
  private reverb: Tone.Reverb;
  private playing = false;

  constructor() {
    // A sine-ish voice with a soft envelope so the gesture sings rather than
    // clicks. The oscillator runs continuously; the envelope gates it.
    this.osc = new Tone.Oscillator({ type: "triangle", frequency: 220 });
    this.env = new Tone.AmplitudeEnvelope({
      attack: 0.08,
      decay: 0.1,
      sustain: 0.9,
      release: 0.3,
    });
    this.filter = new Tone.Filter({ frequency: 2500, type: "lowpass" });
    this.reverb = new Tone.Reverb({ decay: 2, wet: 0.2 });
    this.osc.chain(this.env, this.filter, this.reverb, Tone.getDestination());
    this.osc.start();
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Play the given curve once, starting from `saFreq`'s Sa. `onProgress` is
   * called with a 0–1 fraction so the UI can sweep a playhead across the plot.
   */
  play(curve: PitchCurve, saFreq: number, onProgress?: (frac: number) => void, onDone?: () => void): void {
    this.stop();
    this.playing = true;

    const now = Tone.now();
    const freqParam = this.osc.frequency;

    // Set the starting frequency, then schedule each sampled frequency.
    freqParam.cancelScheduledValues(now);
    freqParam.setValueAtTime(centsToFrequency(saFreq, curve.cents[0]), now);
    for (let i = 1; i < curve.t.length; i++) {
      const f = centsToFrequency(saFreq, curve.cents[i]);
      // Linear ramps between samples keep the glide smooth and continuous.
      freqParam.linearRampToValueAtTime(f, now + curve.t[i]);
    }

    this.env.triggerAttack(now);
    this.env.triggerRelease(now + curve.duration);

    // Drive the visual playhead with Tone.Draw, synced to the audio clock.
    const draw = Tone.getDraw();
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      draw.schedule(() => onProgress?.(frac), now + frac * curve.duration);
    }
    draw.schedule(() => {
      this.playing = false;
      onDone?.();
    }, now + curve.duration + 0.05);
  }

  stop(): void {
    if (!this.playing) return;
    this.playing = false;
    const now = Tone.now();
    this.osc.frequency.cancelScheduledValues(now);
    this.env.triggerRelease(now);
    Tone.getDraw().cancel();
  }

  dispose(): void {
    this.stop();
    this.osc.dispose();
    this.env.dispose();
    this.filter.dispose();
    this.reverb.dispose();
  }
}
