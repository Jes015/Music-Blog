import { defineCollection, reference, z, type ImageFunction } from "astro:content"

const postsSchema = (image: ImageFunction) => z.object({
    id: z.string().uuid(),
    title: z.string().min(2),
    content: z.string().min(3),
    publishDate: z.number(),
    likes: z.number(),
    publisher: reference('publishers'),
    images: z.array(image()).optional()
})

const publisherSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().min(2),
    imageURL: z.string().url()
})

const postsCollection = defineCollection({
    type: 'data',
    schema: ({ image }) => postsSchema(image)
})

const publisherCollection = defineCollection({
    type: 'data',
    schema: publisherSchema
})

export const collections = {
    posts: postsCollection,
    publishers: publisherCollection
}
