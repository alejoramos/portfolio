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

/**
 * The gate every animation in the app checks.
 *
 * Returns true when the user has asked for reduced motion. Callers must fall
 * back to an instant or opacity-only presentation rather than simply skipping
 * the animation, or content set to `opacity: 0` by a timeline never appears.
 */
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)', false);

export const useIsMobile = () => useMediaQuery('(max-width: 767px)', false);
export const useIsTablet = () => useMediaQuery('(max-width: 1023px)', false);

/** Coarse pointers get no hover-dependent affordances and no custom cursor. */
export const useHasFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)', false);

/**
 * True when the device is likely to struggle with WebGL. Used to decide whether
 * to mount the Three.js scene or fall back to the static presentation.
 */
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
