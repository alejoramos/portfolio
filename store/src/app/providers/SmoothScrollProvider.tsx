import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';

interface SmoothScrollValue {
  lenis: Lenis | null;
  /** Scrolls to a target; falls back to native behaviour when Lenis is off. */
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollValue>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [, forceRender] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      // Deliberately short. Long durations read as floaty and make a store feel
      // unresponsive; this keeps the weight without the lag.
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      // Native touch scrolling stays; smoothing it fights the OS and feels worse.
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    lenisRef.current = lenis;
    forceRender((n) => n + 1);

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger measures against the document; Lenis is the source of truth.
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  const value: SmoothScrollValue = {
    lenis: lenisRef.current,
    scrollTo: (target, options) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset: options?.offset ?? 0, duration: options?.duration ?? 1.1 });
        return;
      }
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'auto' });
        return;
      }
      const el =
        typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0);
        window.scrollTo({ top, behavior: 'auto' });
      }
    },
    stop: () => lenisRef.current?.stop(),
    start: () => lenisRef.current?.start(),
  };

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}
