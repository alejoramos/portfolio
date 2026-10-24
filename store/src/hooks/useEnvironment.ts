import { useEffect, useState } from 'react';

/** Subscribes to a media query and re-renders on change. */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? defaultValue : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** The motion gate: true under reduced motion. Callers must render the final
    state, not just skip the tween, or anything set to opacity 0 stays hidden. */
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)', false);

export const useIsMobile = () => useMediaQuery('(max-width: 767px)', false);
export const useIsTablet = () => useMediaQuery('(max-width: 1023px)', false);

/** Coarse pointers get no hover-dependent affordances and no custom cursor. */
export const useHasFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)', false);

/** True on devices likely to struggle with WebGL; they get the static stage. */
export function useIsLowPower(): boolean {
  const isTablet = useIsTablet();
  const [constrained, setConstrained] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
    const fewCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    setConstrained(lowMemory || fewCores);
  }, []);

  return isTablet || constrained;
}
