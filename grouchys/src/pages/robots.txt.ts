import type { APIRoute } from 'astro';

/**
 * Generated rather than static, so the sitemap line always points at whatever
 * origin the site was actually built for (see SITE in astro.config.mjs).
 */
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
