/**
 * useSequencer — React glue around the Sequencer engine.
 *
 * Tracks which phrase is currently playing and which note index within it is
 * sounding right now, so the UI can both disable the right buttons and light up
 * the scale strip in real time.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Sequencer } from "../audio/sequencer";
import { startAudio } from "../audio/audioContext";
import type { RagaNote } from "../music/ragas";

/** Which characteristic phrase of a raga is being played. */
export type PhraseKind = "aroha" | "avaroha" | "pakad";

export function useSequencer() {
  const seqRef = useRef<Sequencer | null>(null);
  /** Index into the currently-playing phrase, or null when idle. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  /** Which phrase is playing, or null when idle. */
  const [playingPhrase, setPlayingPhrase] = useState<PhraseKind | null>(null);

  useEffect(() => {
    const seq = new Sequencer();
    seqRef.current = seq;
    return () => {
      seq.dispose();
      seqRef.current = null;
    };
  }, []);

  const play = useCallback(
    async (phrase: PhraseKind, notes: RagaNote[], saFreq: number, bpm: number) => {
      await startAudio(); // must run inside the user gesture
      const seq = seqRef.current;
      if (!seq) return;
      setPlayingPhrase(phrase);
      seq.play({
        notes,
        saFreq,
        bpm,
        onNoteStart: (index) => setActiveIndex(index),
        onComplete: () => {
          setActiveIndex(null);
          setPlayingPhrase(null);
        },
      });
    },
    [],
  );

  const stop = useCallback(() => {
    seqRef.current?.stop();
    setActiveIndex(null);
    setPlayingPhrase(null);
  }, []);

  return { activeIndex, playingPhrase, play, stop };
}
