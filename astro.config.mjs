import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// lastmod real por post: se lee publishDate de los JSON de src/content/posts (recursivo).
function loadPostDates() {
  const dates = new Map()
  try {
    const root = fileURLToPath(new URL('./src/content/posts/', import.meta.url))
    for (const rel of readdirSync(root, { recursive: true })) {
      const file = String(rel).replace(/\\/g, '/')
      if (!file.endsWith('.json')) continue
      const { publishDate } = JSON.parse(readFileSync(root + file, 'utf8'))
      if (typeof publishDate !== 'number') continue
      dates.set(`/posts/${file.replace(/\.json$/, '').toLowerCase()}/`, new Date(publishDate))
    }
  } catch (error) {
    console.warn('[sitemap] no se pudo calcular lastmod:', error)
  }
  return dates
}

const postDates = loadPostDates()
const newest = new Date(Math.max(0, ...[...postDates.values()].map((d) => d.getTime())))

// Mantener en sync con INDEX_PAGINATED_PAGES (src/consts.ts): páginas noindex = fuera del sitemap.
const PAGINATED_HOME = /^\/\d+\/?$/
const PAGINATED_FEATURED = /^\/destacados\/\d+\/?$/
const TEST_ENTRY = /-test(\/|$)/i

// https://astro.build/config
export default defineConfig({
  // ⬇️ ÚNICA línea a cambiar al migrar a https://jesusoyola.com
  site: 'https://j-oyola-blog.vercel.app',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page)
        return !PAGINATED_HOME.test(pathname) && !PAGINATED_FEATURED.test(pathname) && !TEST_ENTRY.test(pathname)
      },
      serialize(item) {
        const { pathname } = new URL(item.url)
        const key = (pathname.endsWith('/') ? pathname : `${pathname}/`).toLowerCase()
        const lastmod = postDates.get(key) ?? (key === '/' || key === '/posts/' ? newest : undefined)
        if (lastmod && lastmod.getTime() > 0) item.lastmod = lastmod.toISOString()
        return item
      },
    }),
    react(),
    tailwind(),
  ],
  vite: {
    // resvg es un módulo nativo: que no lo empaquete Vite.
    optimizeDeps: { exclude: ['@resvg/resvg-js'] },
    ssr: { external: ['@resvg/resvg-js'] },
  },
})
