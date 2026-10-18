import { PAGE_SIZE } from "@/consts"
import { getPostsEntries } from "@/utils"
import type { APIRoute } from "astro"

// Mapa id → página del home (mismo orden y tamaño que [...page].astro). Se pide solo en enlaces profundos.
export const GET: APIRoute = async () => {
    const posts = (await getPostsEntries('posts')).sort((a, b) => b.publishDate - a.publishDate)
    const map: Record<string, number> = {}
    posts.forEach((post, index) => {
        map[post.id] = Math.floor(index / PAGE_SIZE) + 1
    })
    return new Response(JSON.stringify(map), { headers: { "Content-Type": "application/json" } })
}
