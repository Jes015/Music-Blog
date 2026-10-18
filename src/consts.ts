export const PAGE_SIZE = 8
export const SITE_NAME = 'Jesús Oyola'
export const SITE_LOCALE = 'es_CO'
export const THEME_COLOR = '#171717'

export const DEFAULT_TITLE = 'Jesús Oyola — Música, beats y blog personal'
export const DEFAULT_DESCRIPTION =
  'Sitio oficial de Jesús Oyola, músico y beatmaker de Bogotá: blog personal con historias, pensamientos, canciones favoritas y proyectos.'

// false = páginas /2…/N y /destacados/N≥2 con noindex,follow (recuerda sincronizar el filter del sitemap).
export const INDEX_PAGINATED_PAGES = false
// Bloque "Más reciente / Anterior" al final de cada post (único cambio visible en posts).
export const SHOW_ADJACENT_POSTS = false

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/jesus.oyola.15',
  youtube: 'https://www.youtube.com/@jesus.oyola.15',
} as const

// Entidad única: se usa tal cual en TODAS las fichas JSON-LD.
export const PERSON = {
  name: 'Jesús Oyola',
  alternateName: ['J Oyola', 'JOyola', 'Jesus Oyola'],
  jobTitle: 'Músico y beatmaker',
  description: 'Músico y beatmaker de Bogotá, Colombia.',
  city: 'Bogotá',
  country: 'CO',
  sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.youtube],
} as const

export const FEED = {
  title: 'Jesús Oyola — Blog',
  description: 'Últimos posts del blog de Jesús Oyola: historias, pensamientos y canciones.',
} as const
