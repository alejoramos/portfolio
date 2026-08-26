/**
 * Motion layer.
 *
 * One rule governs this file: **every animation is additive**. Reveals are
 * authored as `gsap.from()`, so the resting state in the DOM is already the
 * final, visible state. Nothing is set to `opacity: 0` in CSS, nothing waits
 * for a trigger to become readable. If GSAP fails to load, throws, or is
 * blocked, the page is simply the page — complete, styled and usable.
 *
 * The motion language, from the handoff: slow, warm, weighted. Reveals ease on
 * cubic-bezier(.22,1,.36,1); masks and doors on (.76,0,.24,1). Everything
 * emerges *out of darkness* — opacity paired with a short rise and a blur
 * burn-off. Nothing slides in from the side. One moving thing per viewport.
 */

const root = document.documentElement;
const reduced = () => root.hasAttribute('data-reduced-motion');

const EASE = 'power3.out';
const MASK_EASE = 'power4.inOut';

/* ==========================================================================
   Effects that do not need GSAP at all
   ========================================================================== */

/** Warm light sweeps once across "Crafted over fire" on entry. */
function fireSweep() {
  const title = document.querySelector<HTMLElement>('[data-fire-sweep]');
  if (!title) return;

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      title.setAttribute('data-swept', '');
      io.disconnect();
    },
    { threshold: 0.4 },
  );
  io.observe(title);
}

/** Buttons are magnetic within 40px — up to 6px toward the cursor. */
function magneticButtons() {
  if (reduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'));
  if (targets.length === 0) return;

  targets.forEach((el) => {
    let raf = 0;

    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy);
        const reach = Math.max(r.width, r.height) / 2 + 40;
        if (dist > reach) {
          el.style.transform = '';
          return;
        }
        const pull = 6 * (1 - dist / reach);
        el.style.transform = `translate(${(dx / dist || 0) * pull}px, ${(dy / dist || 0) * pull}px)`;
      });
    };

    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.transition = 'transform 400ms cubic-bezier(.22,1,.36,1)';
      el.style.transform = '';
      window.setTimeout(() => {
        el.style.transition = '';
      }, 400);
    };

    el.addEventListener('pointerenter', () => {
      el.style.transition = '';
    });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });
}

/* ==========================================================================
   GSAP
   ========================================================================== */

async function initGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE, duration: 0.9 });

  const ctx = gsap.context(() => {
    // Each effect is isolated: one throwing must not strand the others with
    // their start state applied and no tween left to play them out.
    [hero, reveals, maskedPhotographs, sketchParallax, goldRules, galleryDepth].forEach((fn) => {
      try {
        fn(gsap);
      } catch {
        /* keep going — a missing section is not a reason to freeze the page */
      }
    });
    try {
      dishSequence(gsap, ScrollTrigger);
    } catch {
      /* the dish list still works by click */
    }
  });

  watchdog(gsap);

  // A late-loading webfont or image changes every trigger position.
  const refresh = () => ScrollTrigger.refresh();
  if ('fonts' in document) document.fonts.ready.then(refresh).catch(() => {});
  window.addEventListener('load', refresh, { once: true });

  window.addEventListener(
    'pagehide',
    () => {
      ctx.revert();
      ScrollTrigger.killAll();
    },
    { once: true },
  );
}

type GsapLib = (typeof import('gsap'))['gsap'];

/**
 * The guarantee.
 *
 * `gsap.from()` writes an inline `opacity: 0` the moment a tween is created and
 * relies on the ticker to play it out. The ticker rides requestAnimationFrame,
 * and rAF does not run in a background tab or an uncomposited view — so there
 * is a real window in which an element can sit at zero with nothing coming to
 * rescue it (a stalled ticker, a throwing plugin, a ScrollTrigger that never
 * resolves its start position).
 *
 * This watches every element the motion layer touches. If one is on screen,
 * the page is being looked at, and it is *still* invisible a couple of seconds
 * later, the inline state is thrown away and the element snaps to its natural,
 * styled, visible self. In normal operation this never fires.
 */
function watchdog(gsap: GsapLib) {
  const GRACE = 2500;
  const pending = new WeakMap<Element, number>();

  const rescue = (el: HTMLElement) => {
    if (Number(getComputedStyle(el).opacity) > 0.02) return;
    gsap.set(el, { clearProps: 'opacity,filter,transform,translate,rotate,scale,clipPath' });
    el.style.removeProperty('opacity');
    el.style.removeProperty('filter');
    el.style.removeProperty('clip-path');
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target as HTMLElement;

      if (!entry.isIntersecting) {
        const id = pending.get(el);
        if (id) {
          clearTimeout(id);
          pending.delete(el);
        }
        return;
      }

      if (pending.has(el)) return;
      pending.set(
        el,
        window.setTimeout(() => {
          pending.delete(el);
          // A hidden tab is not a fault — give it its grace once it is looked at.
          if (document.hidden) return;
          rescue(el);
        }, GRACE),
      );
    });
  });

  document
    .querySelectorAll<HTMLElement>('[data-reveal], [data-hero-line], [data-hero-tags], .frame-mask')
    .forEach((el) => io.observe(el));

  // Coming back to a tab that was loaded in the background: re-check what is
  // on screen once the ticker has had a moment to catch up.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal], [data-hero-line], [data-hero-tags]')
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) rescue(el);
        });
    }, GRACE);
  });
}

/** Hero: headline lines stagger; the photo settles behind a clip-path wipe. */
function hero(gsap: GsapLib) {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  if (!section) return;

  const lines = section.querySelectorAll<HTMLElement>('[data-hero-line]');
  const photo = section.querySelector<HTMLElement>('[data-hero-photo] img');
  const copy = section.querySelector<HTMLElement>('[data-hero-copy]');
  const tags = section.querySelector<HTMLElement>('[data-hero-tags]');

  /*
    When the intro curtain is running, hold the hero back so its lines stagger
    in exactly as the doors part (they begin at 72% of the 4.6s sequence).
    Otherwise the hero finishes while it is still hidden behind black panels
    and the curtain opens onto something already static.
  */
  const introEndsAt = (window as Window & { __gphIntroEndsAt?: number }).__gphIntroEndsAt;
  const startDelay = introEndsAt
    ? Math.max(0.1, (introEndsAt - 1600 - Date.now()) / 1000)
    : 0.1;

  const tl = gsap.timeline({ delay: startDelay });

  if (photo) {
    tl.from(
      photo,
      {
        scale: 1.06,
        clipPath: 'inset(14% 0% 0% 0%)',
        duration: 1.4,
        ease: MASK_EASE,
      },
      0,
    );
  }

  tl.from(
    lines,
    {
      yPercent: 26,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 1.1,
      stagger: 0.09,
    },
    0.15,
  );

  if (tags) {
    tl.from(tags, { opacity: 0, y: 14, duration: 0.8 }, 0.7);
  }

  // On scroll the photograph drifts down and the type lifts — depth, not motion.
  if (photo) {
    gsap.to(photo, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
  if (copy) {
    gsap.to(copy, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/** The house reveal: out of darkness, a short rise, a blur burn-off. */
function reveals(gsap: GsapLib) {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  items.forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      filter: 'blur(6px)',
      duration: 0.9,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/** Photographs wipe up out of the dark and settle from a 1.08 scale. */
function maskedPhotographs(gsap: GsapLib) {
  const frames = gsap.utils.toArray<HTMLElement>('.frame-mask');
  frames.forEach((frame) => {
    const img = frame.querySelector('img');
    if (!img) return;

    gsap.from(frame, {
      clipPath: 'inset(100% 0% 0% 0%)',
      duration: 1.1,
      ease: MASK_EASE,
      scrollTrigger: { trigger: frame, start: 'top 90%', once: true },
    });

    gsap.from(img, {
      scale: 1.08,
      duration: 1.4,
      ease: MASK_EASE,
      scrollTrigger: { trigger: frame, start: 'top 90%', once: true },
    });
  });
}

/** The Main Street drawing drifts slower than the column beside it. */
function sketchParallax(gsap: GsapLib) {
  const sketches = gsap.utils.toArray<HTMLElement>('[data-parallax="sketch"]');
  const mobile = window.matchMedia('(max-width: 767px)').matches;

  sketches.forEach((el) => {
    const parent = el.parentElement ?? el;
    // Restrained on desktop, barely there on mobile — it must never crowd type.
    const travel = mobile ? 24 : 64;

    gsap.fromTo(
      el,
      { y: travel * 0.5 },
      {
        y: -travel * 0.5,
        ease: 'none',
        scrollTrigger: { trigger: parent, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );

    if (el.hasAttribute('data-parallax-fade')) {
      gsap.fromTo(
        el,
        { opacity: 0.02 },
        {
          opacity: 0.07,
          ease: 'none',
          scrollTrigger: { trigger: parent, start: 'top bottom', end: 'center center', scrub: true },
        },
      );
    }
  });
}

/** The hairline beside each eyebrow draws in from the left. */
function goldRules(gsap: GsapLib) {
  const rules = gsap.utils.toArray<HTMLElement>('.eyebrow');
  rules.forEach((el) => {
    if (el.classList.contains('eyebrow-center')) return;
    gsap.fromTo(
      el,
      { '--rule-scale': 0 },
      {
        '--rule-scale': 1,
        duration: 0.9,
        ease: MASK_EASE,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onComplete: () => el.style.removeProperty('--rule-scale'),
      },
    );
  });
}

/** Three parallax depths across the gallery — -6%, 0, +6%. */
function galleryDepth(gsap: GsapLib) {
  if (window.matchMedia('(max-width: 767px)').matches) return;

  const cells = gsap.utils.toArray<HTMLElement>('.gallery__grid--desktop .gallery__cell');
  cells.forEach((cell) => {
    const depth = Number(cell.dataset.depth ?? 0);
    if (depth === 0) return;
    const img = cell.querySelector('img');
    if (!img) return;

    gsap.fromTo(
      img,
      { yPercent: -3 * depth },
      {
        yPercent: 3 * depth,
        ease: 'none',
        scrollTrigger: { trigger: cell, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

/**
 * The dish list pins while the plate changes.
 *
 * Desktop only, and it never takes the wheel: ScrollTrigger scrubs a pin, the
 * page keeps scrolling at its own speed. Clicking a row still works throughout.
 */
function dishSequence(gsap: GsapLib, ScrollTrigger: typeof import('gsap/ScrollTrigger')['ScrollTrigger']) {
  const stage = document.querySelector<HTMLElement>('[data-dishes-stage]');
  const section = document.querySelector<HTMLElement>('[data-dishes]');
  if (!stage || !section) return;
  if (!window.matchMedia('(min-width: 1024px)').matches) return;

  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-dish-btn]'));
  if (buttons.length === 0) return;

  let last = -1;
  const step = (i: number) => {
    const next = Math.max(0, Math.min(buttons.length - 1, i));
    if (next === last) return;
    last = next;
    buttons[next]!.click();
  };

  ScrollTrigger.create({
    trigger: stage,
    start: 'center center',
    end: `+=${buttons.length * 55}%`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      step(Math.round(self.progress * (buttons.length - 1)));
    },
  });

  // Selecting a row by hand should not fight the scrub afterwards.
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      last = i;
    });
  });

  void gsap;
}

/* ==========================================================================
   Boot
   ========================================================================== */

fireSweep();
magneticButtons();

if (!reduced()) {
  const start = () => {
    initGsap().catch(() => {
      /* GSAP unavailable — every section is already visible and styled */
    });
  };

  /*
    Two gates before any start state is written to the DOM:
      1. `load`, so motion never competes with first paint;
      2. visibility, so a page opened in a background tab is not left holding
         `opacity: 0` on a ticker that will not run until someone looks at it.
    Until both are satisfied the page is simply its plain, complete self.
  */
  const whenVisible = () => {
    if (!document.hidden) {
      start();
      return;
    }
    const onShow = () => {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', onShow);
      start();
    };
    document.addEventListener('visibilitychange', onShow);
  };

  if (document.readyState === 'complete') whenVisible();
  else window.addEventListener('load', whenVisible, { once: true });
}
