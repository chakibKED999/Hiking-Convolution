import { useRef, useCallback, useEffect, useState } from 'react';

/** Map a pixel altitude [0-255] to an audible frequency [220-880] Hz. */
function altitudeToFrequency(altitude: number): number {
  const MIN_FREQ = 220;
  const MAX_FREQ = 880;
  return MIN_FREQ + (Math.max(0, Math.min(255, altitude)) / 255) * (MAX_FREQ - MIN_FREQ);
}

/**
 * Web Audio sound feedback hook.
 * Sound is disabled by default to respect user experience and accessibility.
 */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        void ctxRef.current.close();
      }
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  /** Play a short audible sine tone whose pitch reflects terrain altitude. */
  const playAltitude = useCallback(
    (altitude: number) => {
      if (!enabled) return;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      if (!ctxRef.current) {
        ctxRef.current = new AudioCtx();
      }

      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(altitudeToFrequency(altitude), ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    },
    [enabled],
  );

  return { enabled, toggle, playAltitude };
}
