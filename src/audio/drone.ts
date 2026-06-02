/**
 * drone.ts — Phase 1: a tanpura-style drone (improved synthesis).
 *
 * WHY THE REWRITE: the first version held all the notes down at once like an
 * organ chord, which is what made it sound like a Western keyboard. A real
 * tanpura is the opposite — its four strings are PLUCKED one after another in a
 * slow, continuous rolling cycle, and each pluck rings for a long time with a
 * shimmering cascade of overtones (the famous "jivari" buzz produced by the
 * curved bridge). The overlapping, decaying plucks are the whole character.
 *
 * HOW WE MODEL IT:
 *   - Four voices using Karplus–Strong plucked-string synthesis
 *     (Tone.PluckSynth), tuned (in plucking order) Pa · Sa · Sa · mandra-Sa:
 *         Pa a fifth below Sa        (-5 semitones)
 *         Sa                          ( 0)
 *         Sa                          ( 0)
 *         Sa one octave below        (-12) — the deep string that rings under
 *                                            everything and carries into the
 *                                            next cycle.
 *   - High `resonance` + a high `dampening` frequency give each string a long,
 *     bright, buzzing decay — our approximation of jivari.
 *   - The strings are plucked sequentially on an independent timer (NOT Tone's
 *     Transport — the melodic sequencer cancels the Transport, which would
 *     otherwise stop the drone). Timing and loudness are slightly randomised so
 *     the cycle breathes instead of sounding mechanical.
 *   - A little chorus + reverb adds the "two tanpuras in a room" shimmer.
 *
 * The engine is a small stateful class so the audio graph survives re-renders.
 */

import * as Tone from "tone";
import { swaraToFrequency } from "../music/theory";

/**
 * Semitone offsets (from Sa) of the four strings, IN PLUCKING ORDER.
 * Pa, Sa, Sa, then the deep octave-below Sa that anchors the sound.
 */
const STRING_OFFSETS = [-5, 0, 0, -12] as const;

/** Base seconds between successive plucks. The full cycle is ~4× this. */
const PLUCK_INTERVAL = 0.9;

export class DroneEngine {
  private voices: Tone.PluckSynth[];
  /** A gain per voice, used to humanise each pluck's loudness. */
  private voiceGains: Tone.Gain[];
  private chorus: Tone.Chorus;
  private filter: Tone.Filter;
  private reverb: Tone.Reverb;
  private gain: Tone.Gain;

  private playing = false;
  private saFreq: number;
  /** Which string is plucked next (cycles 0..3). */
  private stringIndex = 0;
  /** Handle for the self-scheduling pluck timer. */
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(initialSaFreq: number) {
    this.saFreq = initialSaFreq;

    // One plucked-string voice per string, so their long decays overlap
    // naturally (a monophonic synth would cut the previous string off).
    // High resonance = long ring; high dampening = bright, buzzy jivari-like
    // overtones rather than a dull thud.
    this.voices = STRING_OFFSETS.map(
      () =>
        new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.97,
          release: 1.5,
        }),
    );

    // Chorus thickens the tone into the shimmering "more than one string"
    // quality; kept subtle so it doesn't sound like an effects pedal.
    this.chorus = new Tone.Chorus({
      frequency: 0.6,
      delayTime: 3.5,
      depth: 0.5,
      wet: 0.3,
    }).start();
    // Gentle lowpass tames the harshest top end while keeping the buzz.
    this.filter = new Tone.Filter({ frequency: 3500, type: "lowpass" });
    // A long, soft reverb gives the resonant "room" of a tanpura.
    this.reverb = new Tone.Reverb({ decay: 7, wet: 0.4 });
    // Master trim so the drone sits comfortably under any melody.
    this.gain = new Tone.Gain(0.5);

    // Each voice → its own gain (for per-pluck loudness) → shared chorus.
    this.voiceGains = STRING_OFFSETS.map(() => new Tone.Gain(0.9));
    this.voices.forEach((v, i) => v.connect(this.voiceGains[i]));
    this.voiceGains.forEach((g) => g.connect(this.chorus));
    this.chorus.chain(this.filter, this.reverb, this.gain, Tone.getDestination());
  }

  /** Pluck the next string in the cycle, then schedule the one after it. */
  private pluckNext = (): void => {
    if (!this.playing) return;

    const offset = STRING_OFFSETS[this.stringIndex];
    const freq = swaraToFrequency(this.saFreq, offset);
    const voice = this.voices[this.stringIndex];

    // Schedule a hair into the future for clean timing. PluckSynth has no
    // velocity argument, so we humanise loudness via the per-voice gain below.
    const now = Tone.now();
    this.voiceGains[this.stringIndex].gain.setValueAtTime(
      0.8 + Math.random() * 0.2,
      now,
    );
    voice.triggerAttack(freq, now + 0.02);

    this.stringIndex = (this.stringIndex + 1) % STRING_OFFSETS.length;

    // Humanise the gap slightly (±8%) so the cycle breathes.
    const jitter = 1 + (Math.random() - 0.5) * 0.16;
    this.timer = setTimeout(this.pluckNext, PLUCK_INTERVAL * jitter * 1000);
  };

  /** Begin the plucking cycle (no-op if already playing). */
  start(): void {
    if (this.playing) return;
    this.playing = true;
    this.stringIndex = 0;
    this.pluckNext();
  }

  /** Stop plucking. Strings already ringing fade out via their release. */
  stop(): void {
    if (!this.playing) return;
    this.playing = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Change the tonic. The next plucks simply use the new pitch, so the change
   * is heard within a fraction of the cycle — no need to restart.
   */
  setSa(newSaFreq: number): void {
    this.saFreq = newSaFreq;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /** Release Web Audio resources. Call when the engine is discarded. */
  dispose(): void {
    this.stop();
    this.voices.forEach((v) => v.dispose());
    this.voiceGains.forEach((g) => g.dispose());
    this.chorus.dispose();
    this.filter.dispose();
    this.reverb.dispose();
    this.gain.dispose();
  }
}
