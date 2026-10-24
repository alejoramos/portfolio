/** Resolves an in-site path against the deploy base. Astro's `base` covers its
    own output but not hand-written hrefs. In dev the base is "/" (a no-op). */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string): string => (path.startsWith('/') ? BASE + path : path);
