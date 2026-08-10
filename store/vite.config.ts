import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*
   * The store is published inside the portfolio rather than at a domain root,
   * so every emitted URL needs this prefix. The router reads the same value
   * through import.meta.env.BASE_URL, as does `asset()` in src/lib/utils.ts,
   * which keeps one source of truth for where the app lives.
   */
  base: '/store/',
  build: {
    rollupOptions: {
      output: {
        /*
         * Split the long-lived dependencies out of the app chunk. They change
         * far less often than product code, so returning visitors keep them
         * cached across deploys, and the browser can fetch them in parallel.
         *
         * three/drei are deliberately absent — they are reached only through the
         * dynamic import in FootwearChamber and must stay in their own lazy
         * chunk rather than being pulled into the initial load.
         */
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-gsap': ['gsap', '@gsap/react'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
    // The WebGL chunk is large by nature and already lazy; the default warning
    // only adds noise to every build.
    chunkSizeWarningLimit: 900,
  },
});
