import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  /* Served under /store/ in the portfolio, so every URL needs this prefix. The
     router and `asset()` read it from BASE_URL, so it is set only here. */
  base: '/store/',
  build: {
    rollupOptions: {
      output: {
        /* Long-lived dependencies get their own chunks, so they stay cached across
           deploys. three/drei stay out: they load lazily from FootwearChamber. */
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
