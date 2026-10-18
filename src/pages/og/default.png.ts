import { renderOgCard } from '@/utils/og.util'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ site }) => {
  const png = await renderOgCard({
    kicker: 'Música, beats y blog personal',
    title: 'Jesús Oyola',
    footerLeft: 'Bogotá, Colombia',
    footerRight: site?.host ?? '',
  })
  return new Response(png, { headers: { 'Content-Type': 'image/png' } })
}
