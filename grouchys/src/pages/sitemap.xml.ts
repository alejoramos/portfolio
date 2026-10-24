import type { APIRoute } from 'astro';

/** For six URLs a short sitemap beats a dependency. Add a route here whenever
    a page is added to src/pages. */
const ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/menu', priority: '0.9' },
  { path: '/reserve', priority: '0.9' },
  { path: '/visit', priority: '0.8' },
  { path: '/about', priority: '0.7' },
  { path: '/gallery', priority: '0.7' },
] as const;

export const GET: APIRoute = ({ site }) => {
  const origin = site ? site.href.replace(/\/$/, '') : '';
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = ROUTES.map(
    ({ path, priority }) =>
      `  <url>\n` +
      `    <loc>${origin}${path}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <priority>${priority}</priority>\n` +
      `  </url>`,
  ).join('\n');

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
