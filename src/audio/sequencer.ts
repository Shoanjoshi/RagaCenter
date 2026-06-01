/**
 * sequencer.ts — Phase 3: play a melodic phrase (aroha / avaroha / pakad).
 *
 * Given a list of raga notes, a Sa frequency, and a tempo, this plays each note
 * in turn on a soft plucked voice and fires a callback EXACTLY when each note
 * sounds, so the UI can light up the matching cell on the scale strip in sync
 * with the audio.
 *
 * Audio/visual sync: we schedule the notes on Tone's Transport, and use
 * `Tone.getDraw()` to run the visual callbacks on the animation frame that
 * lines up with each scheduled audio time. This keeps the lights tight to the
 * sound even if React re-renders are busy.
 */

import * as Tone from "tone";
import { ragaNoteToFrequency, type RagaNote } from "../music/ragas";

export interface PlayOptions {
  notes: RagaNote[];
  saFreq: number;
  /** Tempo in beats per minute; one note is played per beat. */
  bpm: number;
  /** Fired as each note sounds, with its index in `notes`. */
  onNoteStart: (index: number) => void;
  /** Fired once the phrase finishes (or is stopped). */
  onComplete: () => void;
}

export class Sequencer {
  private synth: Tone.Synth;
  private filter: Tone.Filter;
  private reverb: Tone.Reverb;
  private playing = false;

  constructor() {
    // A more articulate voice than the drone: a clear sine with a short pluck
    // envelope, so individual swaras are distinct as they pass.
    this.synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.4 },
      volume: -6,
    });
    this.filter = new Tone.Filter({ frequency: 2500, type: "lowpass" });
    this.reverb = new Tone.Reverb({ decay: 2, wet: 0.2 });
    this.synth.chain(this.filter, this.reverb, Tone.getDestination());
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /** Start playing a phrase. Any phrase already playing is stopped first. */
  play({ notes, saFreq, bpm, onNoteStart, onComplete }: PlayOptions): void {
    this.stop();
    if (notes.length === 0) {
      onComplete();
      return;
    }

    this.playing = true;
    const transport = Tone.getTransport();
    const draw = Tone.getDraw();

    transport.cancel(); // clear anything previously scheduled
    transport.bpm.value = bpm;
    const beat = 60 / bpm; // seconds per note

    notes.forEach((note, index) => {
      const time = index * beat;
      transport.scheduleOnce((audioTime) => {
        const freq = ragaNoteToFrequency(saFreq, note);
        // Play slightly detached (90% of the beat) so repeated notes re-strike.
        this.synth.triggerAttackRelease(freq, beat * 0.9, audioTime);
        // Sync the visual highlight to this exact audio moment.
        draw.schedule(() => onNoteStart(index), audioTime);
      }, time);
    });

    // After the final note, reset state and notify the UI.
    transport.scheduleOnce((audioTime) => {
      draw.schedule(() => {
        this.playing = false;
        onComplete();
      }, audioTime);
    }, notes.length * beat);

    transport.position = 0;
    transport.start();
  }

  /** Stop playback immediately and silence the voice. */
  stop(): void {
    if (!this.playing) return;
    this.playing = false;
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    Tone.getDraw().cancel();
    this.synth.triggerRelease();
  }

  /** Release Web Audio resources. */
  dispose(): void {
    this.stop();
    this.synth.dispose();
    this.filter.dispose();
    this.reverb.dispose();
  }
}
