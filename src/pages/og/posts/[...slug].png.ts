import { renderOgCard } from '@/utils/og.util'
import { pickOgImage } from '@/utils/seo.util'
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'

// Solo se genera tarjeta para los posts SIN foto utilizable (el resto usa su propia imagen como og:image).
export const getStaticPaths = (async () => {
  const posts = await getCollection('posts')
  return posts
    .filter((entry) => pickOgImage(entry.data.images, entry.id).generated)
    .map((entry) => ({
      params: { slug: entry.id },
      props: { title: entry.data.title, publishDate: entry.data.publishDate },
    }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props, site }) => {
  const { title, publishDate } = props as { title: string; publishDate: number }
  const date = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' }).format(new Date(publishDate))
  const png = await renderOgCard({
    kicker: 'Jesús Oyola · Blog',
    title,
    footerLeft: date,
    footerRight: site?.host ?? '',
  })
  return new Response(png, { headers: { 'Content-Type': 'image/png' } })
}
