import type { UUID } from "./uuid.model"

// I'm not using this but maybe one day, so that's why i keep theses types here

export interface IGoal {
    id: UUID
    name: string
    completed: 'completed' | 'pending' | 'not-completed'
}

export type TGoalArray = IGoal[]