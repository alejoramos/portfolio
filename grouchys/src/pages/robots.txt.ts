import type { APIRoute } from 'astro';

/** Generated, not static, so the sitemap line uses the origin the site was
    built for (SITE in astro.config.mjs). */
export const GET: APIRoute = ({ site }) => {
  const origin = site ? site.href.replace(/\/$/, '') : '';

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    origin ? `Sitemap: ${origin}/sitemap.xml` : '',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
