import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { cn } from '../../lib/utils';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  /** Distance travelled during the reveal, in px. */
  y?: number;
  /** Stagger applied to direct children instead of the container itself. */
  stagger?: number;
  start?: string;
}

/**
 * Scroll-triggered entrance used across quieter sections.
 *
 * Under reduced motion the element renders in its final state and no timeline is
 * created, so nothing can be left stuck at zero opacity.
 */
export function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  y = 28,
  stagger,
  start = 'top 85%',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;

      const targets = stagger ? Array.from(el.children) : el;

      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        stagger: stagger ?? 0,
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

interface SplitHeadingProps {
  text: string;
  className?: string;
  as?: ElementType;
  /** Per-line delay. */
  stagger?: number;
  start?: string;
}

/**
 * Masked per-word heading reveal.
 *
 * Splitting by word rather than using SplitText keeps the DOM predictable and
 * avoids re-splitting on every resize, which matters because these headings are
 * fluid-sized and reflow constantly.
 */
export function SplitHeading({
  text,
  className,
  as: Tag = 'h2',
  stagger = 0.06,
  start = 'top 82%',
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const words = ref.current?.querySelectorAll('[data-word]');
      if (!words?.length) return;

      gsap.from(words, {
        yPercent: 115,
        duration: 1,
        ease: 'expo.out',
        stagger,
        scrollTrigger: { trigger: ref.current, start, once: true },
      });
    },
    { scope: ref, dependencies: [reduced, text] }
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <span data-word className="inline-block will-change-transform">
            {word}
            {i < text.split(' ').length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Small uppercase section label with a leading rule. */
export function SectionKicker({
  children,
  className,
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em]',
        className
      )}
    >
      <span
        aria-hidden
        className="inline-block h-px w-8"
        style={{ backgroundColor: accent ?? 'currentColor' }}
      />
      {children}
    </p>
  );
}
