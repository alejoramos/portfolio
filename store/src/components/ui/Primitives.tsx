import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { usePrefersReducedMotion, useHasFinePointer } from '../../hooks/useEnvironment';

/* ------------------------------------------------------------------ Image */

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  /** Eager only for above-the-fold art; everything else defers. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Product image with reserved space and a fade-in once decoded.
 *
 * The wrapper holds the aspect ratio so nothing reflows as images arrive, which
 * matters on grids where dozens load at once.
 */
export function SmartImage({
  src,
  alt,
  width,
  height,
  className,
  imgClassName,
  priority = false,
  sizes,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // A cached image can finish before React attaches onLoad.
    if (ref.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
    >
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        /* React 18 does not map the camelCase prop; the lowercase attribute is
           what the browser reads. */
        {...{ fetchpriority: priority ? 'high' : 'auto' }}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-contain transition-opacity duration-700 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName
        )}
      />
    </div>
  );
}

/* --------------------------------------------------------------- Quantity */

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  compact = false,
  label = 'Quantity',
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
  label?: string;
}) {
  const btn =
    'grid place-items-center transition-colors hover:bg-bone/10 disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-bone/25',
        compact ? 'h-9' : 'h-12'
      )}
    >
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(btn, compact ? 'h-9 w-9 rounded-l-full' : 'h-12 w-12 rounded-l-full')}
      >
        <Minus size={compact ? 13 : 15} strokeWidth={2} />
      </button>
      <span
        aria-live="polite"
        className={cn(
          'grid place-items-center tabular-nums',
          compact ? 'w-8 text-xs' : 'w-10 text-sm'
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(btn, compact ? 'h-9 w-9 rounded-r-full' : 'h-12 w-12 rounded-r-full')}
      >
        <Plus size={compact ? 13 : 15} strokeWidth={2} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- Accordion */

export function Accordion({
  items,
  className,
}: {
  items: { title: string; content: ReactNode }[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = usePrefersReducedMotion();

  return (
    <div className={cn('divide-y divide-current/15 border-y border-current/15', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.title}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-xs font-semibold uppercase tracking-[0.14em]"
              >
                {item.title}
                <ChevronDown
                  size={16}
                  className={cn('shrink-0 transition-transform duration-300', isOpen && 'rotate-180')}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 text-sm leading-relaxed opacity-70">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------- Cursor */

/**
 * Blend-mode cursor dot. Desktop with a fine pointer only — on touch it would
 * lag behind taps and add nothing.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const fine = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!fine || reduced) return;
    const el = dot.current;
    if (!el) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const target = e.target as HTMLElement;
      setActive(Boolean(target.closest('a, button, [data-cursor="hover"]')));
    };

    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden rounded-full bg-bone mix-blend-difference transition-[width,height] duration-300 ease-out lg:block"
      style={{ width: active ? 46 : 12, height: active ? 46 : 12 }}
    />
  );
}

/* ---------------------------------------------------------------- Loaders */

export function ProductSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="aspect-square w-full rounded-2xl bg-bone/[0.06]" />
      <div className="mt-4 h-3 w-2/3 rounded bg-bone/[0.06]" />
      <div className="mt-2 h-3 w-1/3 rounded bg-bone/[0.06]" />
    </div>
  );
}

export function Badge({
  children,
  accent,
  className,
}: {
  children: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]',
        className
      )}
      style={accent ? { backgroundColor: accent, color: '#0a0a0b' } : undefined}
    >
      {children}
    </span>
  );
}
