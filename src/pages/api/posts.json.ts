import { getPostsEntries } from "@/utils"
import type { APIRoute } from "astro"

// This generates a static JSON file at build time
export const GET: APIRoute = async () => {
    const allPosts = await getPostsEntries('posts')
    
    // Sort posts to ensure page calculation matches the pagination logic
    const sortedPosts = allPosts.sort((a, b) => b.publishDate - a.publishDate)
    const pageSize = 8

    const searchIndex = sortedPosts.map((post, index) => {
        const pageNumber = Math.floor(index / pageSize) + 1
        
        // Simple HTML strip for content
        // Regex to remove tags
        const plainTextContent = post.content ? post.content.replace(/<[^>]*>/g, ' ') : ''
        
        return {
            id: post.id,
            title: post.title,
            // description: post.description, // Removed because it doesn't exist on IPost
            publishDate: post.publishDate,
            valor: post.valor,
            favoriteSong: post.favoriteSong,
            pageNumber: pageNumber, // Pre-calculated page number for instant navigation
            plainTextContent: plainTextContent.substring(0, 5000), 
        }
    })

    return new Response(JSON.stringify(searchIndex), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}
