import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Solo se usa en build (endpoints estáticos). Fuentes: las mismas Geist del sitio (@fontsource), sin red.
const fontFile = (weight: 400 | 700) =>
  join(process.cwd(), 'node_modules/@fontsource/geist-sans/files', `geist-sans-latin-${weight}-normal.woff`)

let fontCache: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | undefined
const loadFonts = () =>
  (fontCache ??= [
    { name: 'Geist', data: readFileSync(fontFile(400)), weight: 400, style: 'normal' },
    { name: 'Geist', data: readFileSync(fontFile(700)), weight: 700, style: 'normal' },
  ])

// Quita emojis y glifos fuera de latin (la fuente no los tiene) y recorta.
const clean = (text: string, max: number): string => {
  const t = text.replace(/[^\u0020-\u007E\u00A0-\u024F\u2010-\u2027\u2030-\u203A]/g, '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

type SatoriNode = { type: string; props: { style: Record<string, unknown>; children?: unknown } }
const h = (style: Record<string, unknown>, children?: unknown): SatoriNode => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
})

export interface OgCardOptions {
  kicker: string
  title: string
  footerLeft?: string
  footerRight?: string
}

/** Tarjeta Open Graph 1200x630 (PNG). */
export async function renderOgCard(opts: OgCardOptions): Promise<Buffer> {
  const title = clean(opts.title, 140) || 'Jesús Oyola'
  const fontSize = title.length <= 40 ? 88 : title.length <= 80 ? 68 : title.length <= 120 ? 56 : 48

  const tree = h(
    {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      background: '#171717',
      color: '#ffffff',
      fontFamily: 'Geist',
    },
    [
      h({ alignItems: 'center', gap: 16 }, [
        h({ width: 16, height: 16, borderRadius: 8, background: '#ffed6b' }),
        h({ fontSize: 34, fontWeight: 700, color: '#ffed6b' }, clean(opts.kicker, 60) || ' '),
      ]),
      h({ fontSize, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }, title),
      h({ justifyContent: 'space-between', fontSize: 30, color: '#a3a3a3' }, [
        h({}, clean(opts.footerLeft ?? '', 60) || ' '),
        h({}, clean(opts.footerRight ?? '', 60) || ' '),
      ]),
    ],
  )

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: loadFonts(),
  })
  return new Resvg(svg).render().asPng()
}

/** PNG cuadrado a partir de public/favicon.svg (única fuente del logo). */
export function renderIconPng(size: number): Buffer {
  const svg = readFileSync(join(process.cwd(), 'public/favicon.svg'))
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
}
