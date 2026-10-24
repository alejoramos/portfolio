// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/* Canonical origin for canonical URLs, Open Graph, robots.txt and the sitemap:
   SITE_URL once a real domain exists, else Netlify's URL, else a placeholder. */
const SITE =
  process.env.SITE_URL || process.env.URL || 'https://grouchyspublichouse.example';

export default defineConfig({
  site: SITE,
  /* Served inside the portfolio. Astro prefixes its own output with this, and
     hand-written paths go through `url()` in src/lib/url.ts, which reads it too. */
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
