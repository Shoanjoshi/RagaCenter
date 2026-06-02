/**
 * tuningPlayer.ts — sound the JI-vs-ET comparison for the Math tab.
 *
 * Two uses:
 *   - playTone(freq): sound a single sustained swara (to hear one tuning).
 *   - playBeating(f1, f2): sound two frequencies AT ONCE, so you hear the
 *     acoustic "beats" at rate |f1 − f2| — the audible signature of the small
 *     difference between just intonation and equal temperament.
 *
 * Transport-independent, like the other engines.
 */

import * as Tone from "tone";

export class TuningPlayer {
  private synth: Tone.PolySynth<Tone.Synth>;
  private reverb: Tone.Reverb;

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.9, release: 0.6 },
      volume: -10,
    });
    this.reverb = new Tone.Reverb({ decay: 3, wet: 0.25 });
    this.synth.chain(this.reverb, Tone.getDestination());
  }

  /** Sound one or more frequencies for `seconds`. Two close ones => beats. */
  play(frequencies: number[], seconds = 2.5): void {
    const now = Tone.now();
    this.synth.triggerAttackRelease(frequencies, seconds, now + 0.02);
  }

  dispose(): void {
    this.synth.dispose();
    this.reverb.dispose();
  }
}
