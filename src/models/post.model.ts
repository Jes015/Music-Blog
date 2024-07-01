import type { IPublisher } from "@/models/publisher.model"
import type { UUID } from "@/models/uuid.model"
import type { ImageMetadata } from "astro"

export interface Unlock {
    unlockInYears: number
    message: string
}

export interface IPost {
    id: UUID
    title: string
    content: string
    publishDate: number
    likes: number
    publisher: IPublisher
    images?: ImageMetadata[] | null
    unlock?: Unlock
}

export type TPostPartial = Partial<IPost>

export type TPostArray = IPost[]
export type TPostArrayPartial = TPostPartial[]