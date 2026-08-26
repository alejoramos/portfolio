# Grouchy's Public House — website

Front-end for **Grouchy's Public House**, 305 W Main St, Greenville, Illinois.
Built from the Claude design handoff in `handoff/design_handoff_grouchys_public_house/`,
which remains the visual source of truth and is left untouched.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # type-check + static build to dist/
npm run preview  # serve the built site
```

## Stack

| | |
| --- | --- |
| Framework | Astro 5 (static, zero client framework) |
| Styling | Tailwind CSS 4 (`@theme` tokens) + custom CSS for the editorial work |
| Language | TypeScript (strict) |
| Motion | GSAP + ScrollTrigger, dynamically imported |
| 3D | Three.js, dynamically imported, reservation section only |

Astro was chosen because the site is static, image-heavy and animation-heavy:
content ships as HTML with no hydration, `astro:assets` generates the AVIF/WebP
responsive sets, and the two heavy libraries stay out of the initial payload.
Neither `three` nor `gsap` is referenced by any page's HTML — both load on
demand, and only where they are used.

## Structure

```
src/
├── assets/
│   ├── brand/           logo, the Main Street line drawing, the character mark
│   └── photography/     18 TEMPORARY presentation images
├── components/
│   ├── Frame.astro          every photograph goes through here
│   ├── Header.astro         sticky nav + full-screen mobile nav
│   ├── Footer.astro
│   ├── IntroCurtain.astro   once per session, homepage only
│   ├── Lightbox.astro
│   ├── WhiskeyGlass.astro   static CSS glass + the WebGL mount
│   └── sections/            Hero, Story, Dishes, FireBand, MenuBoard,
│                            Bar, Gallery, Reservation, Visit
├── data/                site.ts · menu.ts · dishes.ts · gallery.ts
│                        reservation.ts · images.ts
├── layouts/BaseLayout.astro
├── pages/               index · menu · about · gallery · visit · reserve · 404
├── scripts/             motion · nav · board · dishes · lightbox
│                        reservation · whiskey-glass · lib/
└── styles/global.css    design tokens + the responsive scale
```

## Design fidelity

Tokens, type sizes, spacing, section order and copy are transcribed from the
handoff rather than reinterpreted. At 1440px the measured output matches the
spec exactly — hero 96px, story h2 55px, section h2 72px, fire display 104px,
bar 82px, reservation 76px, visit 66px, 72px gutter, 120px nav — as do the
photograph heights (story 520/400/340, plate 660, whiskey 720, feature 440,
map 480).

Three responsive bands, following the handoff's own strategy:

- **< 768px** — the 430px mobile composition: dish carousel, 2-column gallery,
  stacked reservation, single story photograph, no whiskey glass.
- **768–1279px** — same order, collapsed grids, headlines scaled down.
- **≥ 1280px** — the 1440px frame, content capped and centred.

### Copy

All visible copy is the approved text from the handoff. Nothing about the
restaurant's history, the building, the origin of the name, prices, policies or
hours has been invented. Two prototype annotations were dropped because they
described the prototype rather than the restaurant (the "sticky section · the
list pins…" note beside the dish header).

## Motion — and why nothing can be left invisible

Every reveal is authored as `gsap.from()`, so the resting state in the DOM is
already the final, visible state. **No stylesheet sets `opacity: 0`.** On top of
that:

- motion waits for `load` *and* for the document to be visible, so a page opened
  in a background tab is never left holding a start state on a ticker that
  will not run;
- each effect is isolated, so one throwing cannot strand the others;
- a watchdog observes every animated element — if one is on screen, the page is
  being looked at, and it is still invisible ~2.5s later, the inline state is
  discarded and the element snaps to its natural styled self.

If GSAP is blocked, fails or throws, the page is simply the page.

`prefers-reduced-motion` skips the intro curtain, the parallax, the pin and the
WebGL glass, and turns reveals into their end states.

## The whiskey glass

Ported from the handoff's `whiskey-glass.js`: a lathed rocks glass (12-point
profile, 96 segments), amber liquid painted with a vertical gradient, two ice
cubes, warm key from camera-left, amber bounce behind, cool rim right, and a
256×128 canvas equirect environment through PMREM.

It lives in the **reservation section only** — never the hero. The block is
`pointer-events: none` and `aria-hidden`, and sits in the left column where it
cannot overlap the card. It loads only when scrolled near, on screens ≥1024px,
with motion allowed and WebGL present; it renders only while visible and while
the tab is in the foreground; and it disposes geometries, materials, textures
and the renderer on teardown. DPR is capped at 1.75.

What ships in the HTML is the *fallback* — a static CSS glass with the same
silhouette and glow. WebGL fades in over it, or never does. There is no state in
which this produces a black rectangle.

## Reservations

A front-end demonstration. **No data leaves the browser**: the form has no
`action`, no endpoint and no provider, and confirming performs zero network
requests (verified). Guests, date and time are native radio inputs, so selection,
keyboard support and focus states work with JavaScript disabled.

Steps: table → details → review → confirmation, with default, hover, selected,
focus, disabled (closed day / fully-booked slot), error and confirmed states.

Dates are rendered at build time and recomputed on load, so a site that has been
live for a month still offers the right seven days. Closed days come from the
confirmed opening hours; the fully-booked slots are hard-coded demonstration
data, as in the prototype.

`submitReservation()` in `src/scripts/reservation.ts` is the single seam where a
real provider would be connected. Nothing else in the UI would need to change.

## Replacing the temporary photography

Every JPEG in `src/assets/photography/` is a placeholder. All of them are
imported once, in `src/data/images.ts` — drop the new file in, change the import,
and nothing else in the codebase references a filename. Crop briefs per slot are
in `handoff/…/NOTES-temporary-images.md`.

Dishes 05 (Garlic Shrimp) and 06 (Premium Beef Burger) have no photograph yet.
They render an empty frame carrying the shot brief rather than borrowing another
dish's picture.

## Still needed from the owner

Placeholders are centralised in `src/data/site.ts` and marked `TODO`. Nothing
below has been invented:

- **Prices** — every price renders `$ ——`
- **Business email**, **social handles** (footer renders the label unlinked)
- **Parking & accessibility** copy — currently literal placeholder text
- **Booking provider**, if any, and the real party-size cap and service windows
- **Domain** — also set `site` in `astro.config.mjs` and in `public/robots.txt`
- **Final logo files** (vector), favicon and a real Open Graph share image
- Whether the character mark (`grouch-*.png`) is approved for use

See `handoff/…/NOTES-open-questions.md` for the full list.

## Scope

No backend, no database, no CMS, no auth, no payments, no analytics and no real
reservation integration — per the client instruction in the handoff.
