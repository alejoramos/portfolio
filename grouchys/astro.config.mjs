// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/*
  Canonical origin, used for canonical URLs, Open Graph, robots.txt and the
  sitemap. Resolved in this order:

    1. SITE_URL          — set this once the real domain is confirmed
    2. URL               — Netlify sets this to the site's own URL, so a fresh
                           deploy is already correct with no configuration
    3. the placeholder   — local development only

  Nothing here needs editing to deploy; set SITE_URL in Netlify only when the
  custom domain is attached.
*/
const SITE =
  process.env.SITE_URL || process.env.URL || 'https://grouchyspublichouse.example';

export default defineConfig({
  site: SITE,
  /*
   * The site is published inside the portfolio rather than at a domain root.
   * Astro prefixes what it generates itself with this; anything written by
   * hand goes through `url()` in src/lib/url.ts, which reads the same value.
   */
  base: '/grouchys/',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  image: {
    // Local temp photography is re-encoded to AVIF/WebP at build time.
    responsiveStyles: false,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // three.js is the only large chunk; keep it isolated so pages that never
      // reach the reservation section never download it.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three';
            if (id.includes('node_modules/gsap')) return 'gsap';
            return undefined;
          },
        },
      },
    },
  },
});
