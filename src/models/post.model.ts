import type { IPublisher } from "@/models/publisher.model"
import type { UUID } from "@/models/uuid.model"

export interface IPost {
    id: UUID
    title: string
    content: string
    publishDate: number
    likes: number
    publisher: IPublisher
}

export type TPostPartial = Partial<IPost>

export type TPostArray = IPost[]
export type TPostArrayPartial = TPostPartial[]