/**
 * useGlidePlayer — React glue around the GlidePlayer engine (Math tab).
 *
 * Owns a single GlidePlayer for the lifetime of the component and exposes a
 * play(curve) that also reports a 0–1 playhead fraction for the plot.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { GlidePlayer } from "../audio/glidePlayer";
import { startAudio } from "../audio/audioContext";
import type { PitchCurve } from "../music/glide";

export function useGlidePlayer() {
  const ref = useRef<GlidePlayer | null>(null);
  const [playhead, setPlayhead] = useState<number | null>(null);

  useEffect(() => {
    const player = new GlidePlayer();
    ref.current = player;
    return () => {
      player.dispose();
      ref.current = null;
    };
  }, []);

  const play = useCallback(async (curve: PitchCurve, saFreq: number) => {
    await startAudio();
    ref.current?.play(
      curve,
      saFreq,
      (frac) => setPlayhead(frac),
      () => setPlayhead(null),
    );
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    setPlayhead(null);
  }, []);

  return { playhead, play, stop };
}
