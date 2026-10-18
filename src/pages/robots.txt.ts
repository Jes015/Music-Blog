import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site)
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /api/', '', `Sitemap: ${sitemap.href}`, ''].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
