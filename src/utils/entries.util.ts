import type { IPost, TPostArray, UUID } from "@/models"
import { getCollection, getEntry } from "astro:content"
import { demoteHeadings } from "./seo.util"

export const getPostsEntries = async (collectionName: 'posts' | 'heart') => {
    const posts = await getCollection(collectionName)

    const data: TPostArray = []

    await Promise.allSettled(
        posts.map(async (postCollection) => {
            let post: IPost | null = null

            const publisherEntry = await getEntry(postCollection.data.publisher)

            post = {
                ...postCollection.data,
                id: postCollection.data.id as UUID,
                // El HTML guardado en `content` puede traer <h1>/<h2>: se bajan 2 niveles
                // para que la jerarquía sea h1 (marca) > h2 (sección) > h3 (post) > h4+ (contenido).
                content: demoteHeadings(postCollection.data.content, 2),
                publisher: {
                    ...publisherEntry.data,
                    id: publisherEntry.data.id as UUID,
                },
            }

            data.push(post)
        }),
    )

    return data
}
