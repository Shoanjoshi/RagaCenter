/**
 * drone.ts — Phase 1: a tanpura-style drone.
 *
 * A real tanpura sounds four open strings in a continuous cycle, most commonly
 * tuned (low to high) Pa · Sa · Sa · Ṡa — i.e. the fifth below Sa, two Sas, and
 * the upper Sa. We approximate that with three sustained, soft synth voices:
 *
 *     - Pa, a fifth below Sa   (semitone offset -5 from Sa)
 *     - Sa                      (the chosen tonic)
 *     - Ṡa, one octave above Sa (semitone offset +12)
 *
 * The voice is intentionally soft and sustained (slow attack, gentle lowpass,
 * a wash of reverb) so it sits UNDER any melody played on top of it.
 *
 * The engine is a small stateful class rather than a React component so the
 * audio graph survives re-renders and later phases can reuse it.
 */

import * as Tone from "tone";
import { swaraToFrequency } from "../music/theory";

/** Semitone offsets (from Sa) of the three drone voices. */
const DRONE_OFFSETS = [-5, 0, 12] as const;

export class DroneEngine {
  private synth: Tone.PolySynth<Tone.Synth>;
  private filter: Tone.Filter;
  private reverb: Tone.Reverb;
  private playing = false;
  private saFreq: number;

  constructor(initialSaFreq: number) {
    this.saFreq = initialSaFreq;

    // A soft, sustained voice: a triangle wave (mellow, few harmonics) with a
    // slow attack and a long release so notes bloom in and fade out gently.
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 1.2,
        decay: 0.3,
        sustain: 1.0,
        release: 2.5,
      },
      volume: -14, // leave plenty of headroom under the melody
    });

    // Roll off the highs so the drone is warm rather than buzzy.
    this.filter = new Tone.Filter({ frequency: 1200, type: "lowpass" });
    // A long, soft reverb gives the "room" of a tanpura.
    this.reverb = new Tone.Reverb({ decay: 6, wet: 0.35 });

    this.synth.chain(this.filter, this.reverb, Tone.getDestination());
  }

  /** Frequencies (Hz) of the three drone voices for the current Sa. */
  private droneFrequencies(): number[] {
    return DRONE_OFFSETS.map((offset) =>
      swaraToFrequency(this.saFreq, offset),
    );
  }

  /** Begin sounding the drone (no-op if already playing). */
  start(): void {
    if (this.playing) return;
    this.playing = true;
    // triggerAttack with no release time = sustain until we release.
    this.synth.triggerAttack(this.droneFrequencies());
  }

  /** Stop the drone, letting the release envelope fade it out. */
  stop(): void {
    if (!this.playing) return;
    this.playing = false;
    this.synth.releaseAll();
  }

  /**
   * Change the tonic while running. If the drone is sounding we re-trigger it
   * at the new pitch so the change is heard immediately.
   */
  setSa(newSaFreq: number): void {
    this.saFreq = newSaFreq;
    if (this.playing) {
      this.synth.releaseAll();
      this.synth.triggerAttack(this.droneFrequencies());
    }
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /** Release Web Audio resources. Call when the engine is discarded. */
  dispose(): void {
    this.synth.dispose();
    this.filter.dispose();
    this.reverb.dispose();
  }
}
