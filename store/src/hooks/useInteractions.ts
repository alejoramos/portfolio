import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { usePrefersReducedMotion, useHasFinePointer } from './useEnvironment';

/**
 * Pulls an element toward the pointer while it is nearby.
 *
 * Disabled entirely on coarse pointers and under reduced motion, where the
 * element behaves as an ordinary button.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.35, radius = 90) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !fine) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.hypot(dx, dy);
      if (distance > Math.max(rect.width, rect.height) / 2 + radius) {
        xTo(0);
        yTo(0);
        return;
      }
      xTo(dx * strength);
      yTo(dy * strength);
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, radius, reduced, fine]);

  return ref;
}

/** Perspective tilt driven by pointer position within the element. */
export function useTilt<T extends HTMLElement>(max = 10, scale = 1.02) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !fine) return;

    const quickRotX = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const quickRotY = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const quickScale = gsap.quickTo(el, 'scale', { duration: 0.6, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      quickRotY(px * max * 2);
      quickRotX(-py * max * 2);
      quickScale(scale);
    };

    const onLeave = () => {
      quickRotX(0);
      quickRotY(0);
      quickScale(1);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [max, scale, reduced, fine]);

  return ref;
}

/** True once the element has entered the viewport. Stays true. */
export function useInView<T extends HTMLElement>(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
}

/** Tracks whether an element is currently on screen, both directions. */
export function useIsVisible<T extends HTMLElement>(rootMargin = '200px') {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, visible] as const;
}

/** Locks body scroll while `locked` is true, preserving scroll position. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

/** Calls `onClose` on Escape. */
export function useEscape(active: boolean, onClose: () => void) {
  const cb = useRef(onClose);
  cb.current = onClose;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cb.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
}

/** Keeps Tab focus inside a container while it is open. */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const previous = document.activeElement as HTMLElement | null;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>(selector));
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [active]);

  return ref;
}

/** Signed scroll velocity, normalised roughly to [-1, 1]. */
export function useScrollVelocity() {
  const velocity = useRef(0);

  const read = useCallback(() => velocity.current, []);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const tick = () => {
      const current = window.scrollY;
      const delta = current - last;
      last = current;
      // Ease back toward rest so the value decays when scrolling stops.
      velocity.current += (Math.max(-1, Math.min(1, delta / 40)) - velocity.current) * 0.2;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return read;
}
