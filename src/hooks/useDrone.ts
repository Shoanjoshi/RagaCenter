/**
 * useDrone — React glue around the DroneEngine.
 *
 * The engine owns the Web Audio graph and must outlive re-renders, so it lives
 * in a ref and is created exactly once. The hook exposes a simple play/stop
 * toggle and keeps a piece of React state in sync for the button label.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { DroneEngine } from "../audio/drone";
import { startAudio } from "../audio/audioContext";

export function useDrone(saFreq: number) {
  const engineRef = useRef<DroneEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create the engine once on mount; tear it down on unmount.
  useEffect(() => {
    const engine = new DroneEngine(saFreq);
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // Intentionally empty deps: we want a single, stable engine. Sa changes are
    // handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push tonic changes into the running engine.
  useEffect(() => {
    engineRef.current?.setSa(saFreq);
  }, [saFreq]);

  const toggle = useCallback(async () => {
    await startAudio(); // must run inside the user gesture
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.isPlaying) {
      engine.stop();
      setIsPlaying(false);
    } else {
      engine.start();
      setIsPlaying(true);
    }
  }, []);

  return { isPlaying, toggle };
}
