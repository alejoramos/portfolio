import { forwardRef } from 'react';
import { HERO_SLIDES } from '../../../data/site';
import { cn } from '../../../lib/utils';

export type SlideRole = 'center' | 'left' | 'right' | 'back';

export function roleFor(index: number, active: number, total: number): SlideRole {
  if (index === active) return 'center';
  if (index === (active + total - 1) % total) return 'left';
  if (index === (active + 1) % total) return 'right';
  return 'back';
}

interface RoleStyle {
  left: string;
  bottom: string;
  height: string;
  scale: number;
  blur: number;
  opacity: number;
  zIndex: number;
}

/**
 * Layered depth positions. The centre figure is oversized and grounded at the
 * bottom edge so it overlaps the display type behind it; the flanking figures
 * sit smaller and blurred to read as depth rather than as a row of thumbnails.
 */
export function roleStyle(role: SlideRole, mobile: boolean): RoleStyle {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        // Lifted on small screens so the figure's feet clear the controls.
        bottom: mobile ? '20%' : '0%',
        height: mobile ? '50%' : '84%',
        scale: 1,
        blur: 0,
        opacity: 1,
        zIndex: 20,
      };
    case 'left':
      return {
        left: mobile ? '17%' : '24%',
        bottom: mobile ? '26%' : '9%',
        height: mobile ? '20%' : '34%',
        scale: 1,
        blur: 2.5,
        opacity: 0.8,
        zIndex: 10,
      };
    case 'right':
      return {
        left: mobile ? '83%' : '76%',
        bottom: mobile ? '26%' : '9%',
        height: mobile ? '20%' : '34%',
        scale: 1,
        blur: 2.5,
        opacity: 0.8,
        zIndex: 10,
      };
    case 'back':
      return {
        left: '50%',
        bottom: mobile ? '28%' : '11%',
        height: mobile ? '15%' : '25%',
        scale: 1,
        blur: 5,
        opacity: 0.55,
        zIndex: 5,
      };
  }
}

interface HeroCarouselProps {
  active: number;
  mobile: boolean;
  reduced: boolean;
}

/**
 * The figure layer. Each slide keeps a stable DOM node so the transformation
 * timeline can address them directly by index, and role changes are pure CSS
 * transitions rather than remounts.
 */
export const HeroCarousel = forwardRef<HTMLDivElement, HeroCarouselProps>(function HeroCarousel(
  { active, mobile, reduced },
  ref
) {
  const transition = reduced
    ? 'none'
    : [
        'left 900ms var(--ease-out-expo)',
        'bottom 900ms var(--ease-out-expo)',
        'height 900ms var(--ease-out-expo)',
        'opacity 700ms var(--ease-brand)',
        'filter 700ms var(--ease-brand)',
      ].join(', ');

  return (
    <div ref={ref} className="absolute inset-0" style={{ zIndex: 3 }} aria-hidden>
      {HERO_SLIDES.map((slide, i) => {
        const role = roleFor(i, active, HERO_SLIDES.length);
        const s = roleStyle(role, mobile);

        return (
          <div
            key={slide.id}
            data-hero-figure
            data-role={role}
            className="absolute will-change-transform"
            style={{
              left: s.left,
              bottom: s.bottom,
              height: s.height,
              aspectRatio: `${slide.width} / ${slide.height}`,
              transform: 'translateX(-50%)',
              filter: `blur(${s.blur}px)`,
              opacity: s.opacity,
              zIndex: s.zIndex,
              transition,
            }}
          >
            <img
              src={slide.image}
              alt=""
              width={slide.width}
              height={slide.height}
              draggable={false}
              loading={i === 0 ? 'eager' : 'lazy'}
              {...{ fetchpriority: i === 0 ? 'high' : 'auto' }}
              className={cn(
                'h-full w-full object-contain object-bottom',
                role === 'center' && 'drop-shadow-[0_40px_70px_rgba(0,0,0,0.45)]'
              )}
            />
          </div>
        );
      })}
    </div>
  );
});
