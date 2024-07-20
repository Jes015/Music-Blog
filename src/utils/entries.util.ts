import type { IPost, TPostArray, UUID } from "@/models"
import { getCollection, getEntry } from "astro:content"

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