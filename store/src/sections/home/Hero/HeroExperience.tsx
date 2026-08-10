import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import { gsap, useGSAP, ScrollTrigger } from '../../../lib/gsap';
import { BRAND, HERO_SLIDES } from '../../../data/site';
import { asset, cn, pad2 } from '../../../lib/utils';
import { usePrefersReducedMotion, useIsMobile } from '../../../hooks/useEnvironment';
import { useSmoothScroll } from '../../../app/providers/SmoothScrollProvider';
import { HeroCarousel } from './HeroCarousel';

const SLIDE_MS = 900;
const AUTOPLAY_MS = 5600;

/**
 * Full-viewport hero that converts into the store.
 *
 * The section is a tall scroll runway with a `position: sticky` stage inside it.
 * Sticky is used rather than ScrollTrigger's own pinning because it needs no
 * pin-spacer, survives Lenis and resize without a refresh, and leaves the
 * document flow intact — the New Drop section that follows simply scrolls up
 * underneath, so the handoff has no seam to hide.
 *
 * Scroll then scrubs a single timeline in three acts: the chrome clears, the
 * figures scatter past the camera, and the wordmark rushes forward and turns to
 * ink, swallowing the frame. The reveal that fades up behind it shares the same
 * background as the next section, so passing through the type lands directly in
 * the store.
 */
export function HeroExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drainRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const figuresRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const revealInnerRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [transforming, setTransforming] = useState(false);
  const transformingRef = useRef(false);
  const lock = useRef(false);
  const paused = useRef(false);

  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const { scrollTo } = useSmoothScroll();

  const slide = HERO_SLIDES[active];

  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (lock.current) return;
    lock.current = true;
    setActive((prev) =>
      direction === 'next'
        ? (prev + 1) % HERO_SLIDES.length
        : (prev + HERO_SLIDES.length - 1) % HERO_SLIDES.length
    );
    window.setTimeout(() => {
      lock.current = false;
    }, SLIDE_MS);
  }, []);

  /* Preload every figure so role changes never show an empty frame. */
  useEffect(() => {
    HERO_SLIDES.forEach(({ image }) => {
      const img = new Image();
      img.src = image;
    });
  }, []);

  /* Autoplay, suspended once the transformation begins or on hover/blur. */
  useEffect(() => {
    if (reduced || transforming) return;
    const id = window.setInterval(() => {
      if (!paused.current && document.visibilityState === 'visible') navigate('next');
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduced, transforming, navigate]);

  /* Arrow keys drive the carousel while the hero owns the viewport. */
  useEffect(() => {
    if (transforming) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, transforming]);

  useGSAP(
    () => {
      if (reduced) return;
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const figures = gsap.utils.toArray<HTMLElement>('[data-hero-figure]');

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.55,
          // Only touch state on the crossing. onUpdate runs on every scroll
          // tick, and calling a setter that often during a fast scroll is
          // exactly when the extra render pressure is least affordable.
          onUpdate: (self) => {
            const next = self.progress > 0.04;
            if (next === transformingRef.current) return;
            transformingRef.current = next;
            setTransforming(next);
          },
        },
      });

      /* Act I — the chrome clears and the colour field drains to ink.
         The drain is its own ink panel fading in rather than a tween on the
         stage's own backgroundColor. React owns that property (it carries the
         slide colour) and the stage also has a 900ms CSS transition on it, so
         scrubbing it meant three writers fighting over one value every frame:
         GSAP set it, the transition started easing toward it, and the next
         React render put the slide colour back. Fading a panel is also a pure
         compositor job, where a per-frame colour change is not. */
      tl.to(chromeRef.current, { opacity: 0, y: -50, duration: 0.14 }, 0)
        .to(drainRef.current, { opacity: 1, duration: 0.55 }, 0.04);

      /* Act II — figures accelerate past the camera. */
      figures.forEach((figure, i) => {
        const role = figure.dataset.role;
        // Push each figure toward the nearest edge so the camera reads as moving
        // between them rather than the figures simply shrinking away.
        const direction = i % 2 === 0 ? -1 : 1;
        const lateral = role === 'center' ? direction * 26 : direction * 78;
        tl.to(
          figure,
          {
            xPercent: -50 + lateral,
            yPercent: 16,
            scale: role === 'center' ? 2.5 : 3.4,
            opacity: 0,
            filter: 'blur(14px)',
            duration: 0.42,
          },
          0.1 + i * 0.012
        );
      });

      /* Act III — the wordmark rushes forward, turns to ink and takes the frame.
         The scale is deliberately modest. The wordmark is already about 1280px
         wide, so 6x covers five viewports and swallows the frame with room to
         spare; the old 24x asked the compositor for a layer around 34,000px
         across, past the 8,192px texture limit, which is what made the type
         drop out and the whole screen flicker on the way back up. It reads the
         same because the type turns the same ink as the panel behind it. */
      tl.to(
        typeRef.current,
        { scale: mobile ? 5 : 6, color: '#0a0a0b', duration: 0.6, ease: 'power2.in' },
        0.16
      )
        .to(revealRef.current, { opacity: 1, duration: 0.16 }, 0.6)
        .fromTo(
          revealInnerRef.current,
          { opacity: 0, scale: 1.18, filter: 'blur(10px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.28 },
          0.64
        );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [reduced, mobile] }
  );

  /* Keep measurements honest when fonts or images settle late. */
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  const skipIntro = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    scrollTo(section.offsetTop + section.offsetHeight, { duration: 1.2 });
  }, [scrollTo]);

  /* Escape is the escape hatch out of the pinned intro. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skipIntro();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [skipIntro]);

  return (
    <section
      ref={sectionRef}
      aria-label="KINETA introduction"
      /* Under reduced motion the runway collapses to a single screen and the
         hero behaves as an ordinary, fully static banner. */
      style={{ height: reduced ? '100svh' : '320svh' }}
      className="relative"
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{
          backgroundColor: slide.bg,
          transition: `background-color ${SLIDE_MS}ms var(--ease-brand)`,
        }}
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => (paused.current = false)}
      >
        {/* The colour field drains to ink through this panel rather than
            through the stage's own background. See the timeline for why. */}
        <div
          ref={drainRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-ink opacity-0"
          style={{ zIndex: 1 }}
        />

        {/* Giant display wordmark, behind the figures. Only the text box is
            scaled, not the full width positioning wrapper, so the layer the
            compositor has to hold stays a fraction of the size. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 flex select-none items-center justify-center"
          style={{ zIndex: 2, top: '17%' }}
        >
          <div ref={typeRef} className="will-change-transform" style={{ color: '#ffffff' }}>
            <span
              className="font-display block leading-none"
              style={{ fontSize: 'clamp(88px, 27vw, 400px)', letterSpacing: '-0.03em' }}
            >
              {BRAND.name}
            </span>
          </div>
        </div>

        <HeroCarousel ref={figuresRef} active={active} mobile={mobile} reduced={reduced} />

        {/* Scrim between the figures and the interface. Guarantees the copy
            stays legible whichever figure and colour field is showing. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{
            zIndex: 30,
            background: 'linear-gradient(to top, rgba(0,0,0,0.42), transparent)',
          }}
        />

        {/* Interface layer — everything that clears in Act I. */}
        <div ref={chromeRef} className="absolute inset-0" style={{ zIndex: 40 }}>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 pt-24 sm:p-8 sm:pt-28 lg:p-14 lg:pt-32">
            {/* Slide meta, top right */}
            <div className="pointer-events-auto flex justify-end">
              <div className="text-right">
                <p className="font-display text-2xl leading-none sm:text-4xl">{slide.label}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] opacity-70">
                  {slide.meta}
                </p>
              </div>
            </div>

            <div className="pointer-events-auto flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              {/* Copy + carousel controls */}
              <div className="max-w-[330px]">
                <p className="font-display text-3xl leading-[0.95] sm:text-5xl">
                  Built at speed.
                </p>
                <p className="mt-4 hidden text-sm leading-relaxed opacity-80 sm:block">
                  Performance kit engineered with athletes and finished for the street. The{' '}
                  {BRAND.season} range lands now.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('prev')}
                    aria-label="Previous look"
                    className="grid h-12 w-12 place-items-center rounded-full border-2 border-current transition-[transform,background-color] duration-150 hover:scale-105 hover:bg-white/15 sm:h-14 sm:w-14"
                  >
                    <ArrowLeft size={22} strokeWidth={2.25} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('next')}
                    aria-label="Next look"
                    className="grid h-12 w-12 place-items-center rounded-full border-2 border-current transition-[transform,background-color] duration-150 hover:scale-105 hover:bg-white/15 sm:h-14 sm:w-14"
                  >
                    <ArrowRight size={22} strokeWidth={2.25} />
                  </button>

                  <span className="ml-2 font-display text-xl tabular-nums opacity-80">
                    {pad2(active + 1)}
                    <span className="opacity-50"> / {pad2(HERO_SLIDES.length)}</span>
                  </span>
                </div>
              </div>

              {/* Primary calls to action */}
              <div className="flex flex-col items-start gap-4 sm:items-end">
                <button
                  type="button"
                  onClick={skipIntro}
                  className="group inline-flex items-center gap-3 no-underline"
                >
                  <span
                    className="font-display leading-none"
                    style={{ fontSize: 'clamp(30px, 5vw, 68px)' }}
                  >
                    Enter Store
                  </span>
                  <ArrowDown
                    className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-1 sm:h-9 sm:w-9"
                    strokeWidth={2.25}
                  />
                </button>
                <Link
                  to="/shop"
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] underline underline-offset-4 opacity-75 transition-opacity hover:opacity-100"
                >
                  Skip to catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* The store the wordmark opens into. Shares the next section's ink. */}
        <div
          ref={revealRef}
          className="pointer-events-none absolute inset-0 bg-ink opacity-0"
          style={{ zIndex: 45 }}
          aria-hidden
        >
          <div
            ref={revealInnerRef}
            className="relative flex h-full w-full flex-col items-center justify-center"
          >
            <div
              className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
              style={{ background: 'radial-gradient(circle, #2b5cff55 0%, transparent 70%)' }}
            />
            <img
              src={asset('/assets/footwear/flux-runner-ember.webp')}
              alt=""
              width={856}
              height={754}
              className="relative w-[62vw] max-w-[620px] drop-shadow-[0_50px_80px_rgba(0,0,0,0.7)]"
            />
            <p className="relative mt-4 text-[10px] font-semibold uppercase tracking-[0.32em] opacity-70">
              {BRAND.season} — New Drop
            </p>
          </div>
        </div>

        <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-40" style={{ zIndex: 50 }} />

        {/* Brand mark, above everything. */}
        <div
          className="absolute left-4 top-6 text-[11px] font-semibold uppercase tracking-[0.3em] sm:left-8 lg:left-14"
          style={{ zIndex: 60 }}
        >
          {BRAND.name}
        </div>

        {/* Scroll affordance, only while the hero is at rest. */}
        <div
          className={cn(
            /* Hidden on small screens, where it would collide with the stacked
               calls to action. */
            'absolute bottom-5 left-1/2 hidden -translate-x-1/2 transition-opacity duration-500 sm:block',
            transforming ? 'opacity-0' : 'opacity-60'
          )}
          style={{ zIndex: 60 }}
          aria-hidden
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
        </div>
      </div>
    </section>
  );
}
