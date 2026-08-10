# KINETA

A concept storefront for a fictional premium sportswear brand. React + TypeScript + Vite +
Tailwind v4, with GSAP/ScrollTrigger for scroll-driven work, Framer Motion for component
interaction, and a single Three.js scene where it earns its place.

```bash
npm install
npm run dev
```

---

## Structure

```
src/
├─ app/            App shell, routes, SmoothScrollProvider (Lenis ⇄ ScrollTrigger)
├─ pages/          Home, Shop (shared by every category), Product, Cart, Checkout, Wishlist
├─ sections/home/  One folder/file per home section — each owns its own visual language
├─ components/
│  ├─ ui/          Button, Reveal, Marquee, Primitives (image, stepper, accordion, cursor)
│  ├─ product/     ProductCard, ProductGrid, Selectors
│  ├─ commerce/    CartDrawer
│  ├─ three/       ShoeStage — the only WebGL in the app, lazily imported
│  └─ layout/      PageHeader
├─ layout/         RootLayout, Header, Footer
├─ hooks/          useProducts, useEnvironment, useInteractions
├─ store/          cart.store, ui.store (Zustand, persisted to localStorage)
├─ lib/            repository, gsap (single registration point), utils
├─ data/           products.mock.ts, site.ts, asset-manifest.json
└─ types/          product.ts, cart.ts
```

## Swapping in real product data

`src/lib/repository.ts` is the only module that touches the data source. Every page reads
through it via the hooks in `src/hooks/useProducts.ts`, which already handle loading and error
states. To go live, rewrite the function bodies in `repository.ts` to call your API or CMS and
return the same `Product` shape from `src/types/product.ts`. No component changes.

```ts
export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const res = await fetch(`/api/products?${new URLSearchParams(/* … */)}`);
  return res.json();
}
```

Products carry a `presentation` field (`suspended` | `dimensional` | `editorial`) that drives
how `ProductCard` frames them, so a new category is a variant rather than a new component.

## Assets

Source renders live in `/images`. `scripts/process-assets.mjs` trims each one to its subject,
resizes it and writes WebP into `public/assets/{characters,tops,footwear,bottoms}` plus a
manifest with intrinsic dimensions. Re-run after adding or replacing renders:

```bash
node scripts/process-assets.mjs
```

The trim finds the largest connected mass of opaque pixels rather than a plain bounding box —
several source renders carry a faint stripe against the canvas edge that would otherwise
inflate the crop.

## Motion

Every animation is gated on `usePrefersReducedMotion()`. Nothing starts hidden in the markup,
so when a timeline does not run the content is simply already in place. Reduced motion also
collapses the hero runway to one screen, disables Lenis, drops the Runway pin, and falls back
from WebGL to a static render.

- **GSAP + ScrollTrigger** — hero transformation, Runway pin, rail sway, parallax, wipes
- **GSAP Flip** — catalogue re-layout when filters or sort change
- **Framer Motion** — cart drawer, mobile menu, checkout steps, hover springs, list exits
- **Three.js** — `FootwearChamber` and the footwear PDP viewer only, code-split and mounted
  on visibility

GSAP owns scroll-driven work and Framer Motion owns state-driven work. They are never applied
to the same element.

## Notes

- 28 products: 10 tops, 10 footwear, 8 bottoms (matching the 8 available denim renders).
- No payment is processed anywhere. Checkout fields exist to complete the concept.
- `window.__gsap` is exposed in dev builds for inspecting triggers from the console.
