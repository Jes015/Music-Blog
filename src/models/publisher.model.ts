import type { UUID } from "@/models/uuid.model"

export interface IPublisher {
    id: UUID
    name: string
    description: string,
    imageURL: string
}