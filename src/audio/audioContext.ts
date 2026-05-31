/**
 * audioContext.ts — a single place to "unlock" the Web Audio context.
 *
 * Browsers refuse to start audio until the user interacts with the page, so
 * `Tone.start()` MUST be called from inside a click/tap handler. We wrap it so
 * every engine can await the same promise and we only start once.
 */

import * as Tone from "tone";

let started = false;

/** Resume the audio context. Safe to call repeatedly. */
export async function startAudio(): Promise<void> {
  if (started) return;
  await Tone.start();
  started = true;
}
