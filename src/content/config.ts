import { defineCollection, reference, z, type ImageFunction } from "astro:content"

const postsSchema = (image: ImageFunction) => z.object({
    id: z.string().uuid(),
    title: z.string().min(2),
    content: z.string().min(3),
    publishDate: z.number(),
    likes: z.number(),
    publisher: reference('publishers'),
    images: z.array(image()).optional(),
    unlock: z.object({
        unlockInYears: z.number(),
        message: z.string().optional()
    }).optional()
})

const publisherSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().min(2),
    imageURL: z.string()
})

const goalSchema = z.object(
    {
        year: z.string(),
        yearNumeric: z.number(),
        goals: z.array(
            z.object({
                id: z.string(),
                name: z.string().min(1),
                status: z.enum(['completed', 'pending', 'not-completed'])
            })
        )
    }
)

const postsCollection = defineCollection({
    type: 'data',
    schema: ({ image }) => postsSchema(image)
})

const publisherCollection = defineCollection({
    type: 'data',
    schema: publisherSchema
})

const goalsCollection = defineCollection({
    type: 'data',
    schema: goalSchema
})

export const collections = {
    posts: postsCollection,
    heart: postsCollection,
    publishers: publisherCollection,
    goals: goalsCollection
}
