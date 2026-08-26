/**
 * Resolves an in-site path against wherever the site is deployed.
 *
 * Astro's `base` option prefixes the assets it generates itself, but not paths
 * you write by hand in an href, so those need this. It is a no-op in
 * development, where the base is "/".
 *
 * There is one source of truth: `base` in astro.config.mjs feeds
 * import.meta.env.BASE_URL, which feeds this.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string): string => (path.startsWith('/') ? BASE + path : path);
