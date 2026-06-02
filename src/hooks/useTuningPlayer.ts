/**
 * useTuningPlayer — React glue around TuningPlayer (Math tab).
 */

import { useCallback, useEffect, useRef } from "react";
import { TuningPlayer } from "../audio/tuningPlayer";
import { startAudio } from "../audio/audioContext";

export function useTuningPlayer() {
  const ref = useRef<TuningPlayer | null>(null);

  useEffect(() => {
    const player = new TuningPlayer();
    ref.current = player;
    return () => {
      player.dispose();
      ref.current = null;
    };
  }, []);

  const play = useCallback(async (frequencies: number[], seconds?: number) => {
    await startAudio();
    ref.current?.play(frequencies, seconds);
  }, []);

  return { play };
}
