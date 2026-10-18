import { FEED, SITE_NAME } from '@/consts'
import { buildPostDescription, htmlToPlain, isTestEntry } from '@/utils/seo.util'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'

export async function GET(context: APIContext) {
  const site = context.site ?? new URL(context.url.origin)
  const dateFmt = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' })

  const posts = (await getCollection('posts'))
    .filter((post) => !isTestEntry(post.id))
    .sort((a, b) => b.data.publishDate - a.data.publishDate)
    .slice(0, 50)

  return rss({
    title: FEED.title,
    description: FEED.description,
    site,
    trailingSlash: true,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/', atom: 'http://www.w3.org/2005/Atom' },
    customData: `<language>es-co</language><atom:link href="${new URL('rss.xml', site).href}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((post) => {
      const published = new Date(post.data.publishDate)
      return {
        title: post.data.title,
        pubDate: published,
        description: buildPostDescription(htmlToPlain(post.data.content), dateFmt.format(published), post.data.title),
        link: `/posts/${post.id}/`,
        customData: `<dc:creator>${SITE_NAME}</dc:creator>`,
      }
    }),
  })
}
