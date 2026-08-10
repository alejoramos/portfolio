import { cn } from '../../lib/utils';
import { usePrefersReducedMotion } from '../../hooks/useEnvironment';

interface MarqueeProps {
  items: string[];
  className?: string;
  /** Seconds for one full pass. Larger is slower. */
  speed?: number;
  reverse?: boolean;
  separator?: string;
}

/**
 * CSS-only marquee. Duplicating the track and translating by exactly -50% gives
 * a seamless loop without measuring anything at runtime.
 */
export function Marquee({
  items,
  className,
  speed = 32,
  reverse = false,
  separator = '✦',
}: MarqueeProps) {
  const reduced = usePrefersReducedMotion();
  const track = [...items, ...items];

  if (reduced) {
    return (
      <div className={cn('overflow-hidden whitespace-nowrap', className)}>
        <div className="flex gap-10 px-6">
          {items.map((item, i) => (
            <span key={i} className="shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('group relative overflow-hidden', className)} aria-hidden>
      <div
        className="flex w-max gap-10 will-change-transform"
        style={{
          animation: `kineta-marquee ${speed}s linear infinite${reverse ? ' reverse' : ''}`,
        }}
      >
        {track.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            {item}
            <span aria-hidden className="opacity-40">
              {separator}
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes kineta-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
