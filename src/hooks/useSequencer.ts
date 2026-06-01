/**
 * useSequencer — React glue around the Sequencer engine.
 *
 * Generalised in Phase 4: instead of only knowing about a single raga's three
 * phrases, the hook plays any labelled "track" identified by an arbitrary
 * string id. In the Explore view a track id is just the phrase kind
 * ("aroha"); in the Compare view it is namespaced per raga ("A:aroha"), so the
 * UI can tell which of two ragas is currently sounding.
 *
 * It also exposes the note sounding RIGHT NOW (`activeNote`) so any view can
 * light up a scale strip without re-deriving the note from its own state.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Sequencer } from "../audio/sequencer";
import { startAudio } from "../audio/audioContext";
import type { RagaNote } from "../music/ragas";

/** Which characteristic phrase of a raga is being played. */
export type PhraseKind = "aroha" | "avaroha" | "pakad";

export function useSequencer() {
  const seqRef = useRef<Sequencer | null>(null);
  /** The notes of the track currently playing, so we can resolve the live note. */
  const notesRef = useRef<RagaNote[]>([]);

  /** Id of the track playing, or null when idle. */
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  /** Index into the playing track, or null when idle. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const seq = new Sequencer();
    seqRef.current = seq;
    return () => {
      seq.dispose();
      seqRef.current = null;
    };
  }, []);

  const play = useCallback(
    async (
      trackId: string,
      notes: RagaNote[],
      saFreq: number,
      bpm: number,
    ) => {
      await startAudio(); // must run inside the user gesture
      const seq = seqRef.current;
      if (!seq) return;
      notesRef.current = notes;
      setActiveTrack(trackId);
      seq.play({
        notes,
        saFreq,
        bpm,
        onNoteStart: (index) => setActiveIndex(index),
        onComplete: () => {
          setActiveIndex(null);
          setActiveTrack(null);
        },
      });
    },
    [],
  );

  const stop = useCallback(() => {
    seqRef.current?.stop();
    setActiveIndex(null);
    setActiveTrack(null);
  }, []);

  // The note sounding right now. Derived each render from the live index and
  // the notes handed to `play`, so it always matches what the ear hears.
  const activeNote: RagaNote | null =
    activeIndex !== null ? (notesRef.current[activeIndex] ?? null) : null;

  return { activeTrack, activeIndex, activeNote, play, stop };
}
