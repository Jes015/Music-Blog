import type { ImageMetadata } from 'astro'
import { PERSON, SITE_NAME, DEFAULT_DESCRIPTION } from '@/consts'

export type JsonLd = Record<string, unknown>
export interface BreadcrumbItem {
  name: string
  path: string
}
export interface RouteSeo {
  title: string
  description: string
  noindex?: boolean
  breadcrumbs?: BreadcrumbItem[]
}

type SiteLike = URL | string

// ---------- URLs (todo deriva de Astro.site) ----------
export const toAbsolute = (path: string, site: SiteLike): string => new URL(path, site).toString()

export const withTrailingSlash = (pathname: string): string =>
  pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname) ? pathname : `${pathname}/`

export const canonicalFrom = (pathname: string, site: SiteLike): string =>
  toAbsolute(withTrailingSlash(pathname), site)

export const personId = (site: SiteLike): string => `${toAbsolute('/', site)}#person`
export const websiteId = (site: SiteLike): string => `${toAbsolute('/', site)}#website`

// ---------- Texto ----------
const NAMED_ENTITIES: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

export function htmlToPlain(html: string | undefined | null): string {
  return String(html ?? '')
    .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === '#') {
        const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10)
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match
      }
      return NAMED_ENTITIES[entity.toLowerCase()] ?? match
    })
    .replace(/\s+/g, ' ')
    .trim()
}

/** Recorta a `max` caracteres (incluida la elipsis) en límite de palabra. */
export function clamp(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1).replace(/[\uD800-\uDBFF]$/, '')
  const lastSpace = cut.lastIndexOf(' ')
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut
  return `${base.replace(/[\s.,;:—-]+$/, '')}…`
}

/** Título <=60 caracteres con la marca exacta al final. */
export function buildTitle(base: string, suffix = ` — ${SITE_NAME}`, max = 60): string {
  const clean = base.replace(/\s+/g, ' ').trim()
  if (clean.length + suffix.length <= max) return `${clean}${suffix}`
  return `${clamp(clean, max - suffix.length)}${suffix}`
}

/** Description 120–155 cuando el contenido da para ello; completa posts cortos con contexto real (fecha). */
export function buildPostDescription(plain: string, dateLabel: string, title: string): string {
  let text = plain
  if (!text) {
    text = `${title}. Post del blog de ${SITE_NAME} del ${dateLabel}.`
  } else if (text.length < 120) {
    text = `${text.replace(/[\s.…]+$/, '')} — Post de ${SITE_NAME} del ${dateLabel}.`
  }
  return clamp(text, 155)
}

/** h1→h3, h2→h4… (by=2) para que el HTML guardado en los posts no genere h1 extra. */
export function demoteHeadings(html: string, by = 1): string {
  if (!html) return html
  return html.replace(/<(\/?)h([1-6])(?=[\s>/])/gi, (_m, slash: string, level: string) => `<${slash}h${Math.min(6, Number(level) + by)}`)
}

export const isTestEntry = (id: string): boolean => /-test(\/|$)/i.test(id)

// ---------- Imagen OG ----------
export interface OgPick {
  src: string
  width: number
  height: number
  generated: boolean
}

/** Foto real del post si mide >=600px de ancho; si no, tarjeta 1200x630 generada en build (/og/posts/<id>.png). */
export function pickOgImage(images: ImageMetadata[] | undefined, entryId: string): OgPick {
  const first = images?.[0]
  if (first && first.width >= 600) return { src: first.src, width: first.width, height: first.height, generated: false }
  return { src: `/og/posts/${entryId}.png`, width: 1200, height: 630, generated: true }
}

// ---------- JSON-LD ----------
export function personNode(site: SiteLike): JsonLd {
  return {
    '@type': 'Person',
    '@id': personId(site),
    name: PERSON.name,
    alternateName: [...PERSON.alternateName],
    url: toAbsolute('/', site),
    // TODO: reemplazar por un retrato cuadrado real cuando exista (ayuda al Knowledge Graph).
    image: toAbsolute('/og/default.png', site),
    jobTitle: PERSON.jobTitle,
    description: PERSON.description,
    address: { '@type': 'PostalAddress', addressLocality: PERSON.city, addressCountry: PERSON.country },
    sameAs: [...PERSON.sameAs],
  }
}

export function websiteNode(site: SiteLike): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': websiteId(site),
    url: toAbsolute('/', site),
    name: SITE_NAME,
    alternateName: ['J Oyola'],
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'es',
    publisher: { '@id': personId(site) },
  }
}

export function breadcrumbNode(items: BreadcrumbItem[], site: SiteLike): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalFrom(item.path, site),
    })),
  }
}

// ---------- Metadatos por ruta (fallback para páginas que no pasan props) ----------
const HOME_CRUMB: BreadcrumbItem = { name: 'Inicio', path: '/' }

export function routeSeoDefaults(pathname: string): RouteSeo | undefined {
  const path = pathname.replace(/\/+$/, '') || '/'

  const featured = path.match(/^\/destacados(?:\/(\d+))?$/)
  if (featured) {
    const n = featured[1] ? Number(featured[1]) : 1
    if (n > 1) {
      return {
        title: `Posts destacados (página ${n}) — ${SITE_NAME}`,
        description: `Página ${n} de los posts destacados del blog de ${SITE_NAME}, con más textos y momentos de la selección que quiso resaltar entre todos sus posts.`,
        noindex: true,
      }
    }
    return {
      title: `Posts destacados — ${SITE_NAME}`,
      description: `Los posts destacados del blog de ${SITE_NAME}, la selección de textos y momentos que más quiso resaltar, reunidos en un solo lugar.`,
      breadcrumbs: [HOME_CRUMB, { name: 'Destacados', path: '/destacados/' }],
    }
  }

  if (path === '/canciones-favoritas') {
    return {
      title: `Canciones favoritas — ${SITE_NAME}`,
      description: `Las canciones favoritas de ${SITE_NAME}, con reproductor de Spotify y las notas que escribió sobre cada una en su blog de música.`,
      // Página vacía ("no hay canciones aún"): noindex hasta que tenga contenido.
      // Al agregar canciones: quitar este noindex y el filtro EMPTY_FAVORITES de astro.config.mjs.
      noindex: true,
      breadcrumbs: [HOME_CRUMB, { name: 'Canciones favoritas', path: '/canciones-favoritas/' }],
    }
  }

  if (path === '/metas') {
    return {
      title: `Metas y sueños — ${SITE_NAME}`,
      description: `Las metas de ${SITE_NAME} año por año: cuáles ya cumplió, cuáles siguen pendientes y cuáles no logró, con su avance a la vista.`,
      breadcrumbs: [HOME_CRUMB, { name: 'Metas', path: '/metas/' }],
    }
  }

  return undefined
}
