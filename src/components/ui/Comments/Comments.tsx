import { BaseComponentType } from "@/models"
import { Item } from "./components"

export const Comments: BaseComponentType = () => {
    return (
        <div
            className="p-1 flex flex-col gap-3"
        >
            <Item>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequatur, non ullam facilis laborum fugit iusto quasi debitis asperiores odio, ipsum reiciendis consequuntur tempora ad et minima cupiditate exercitationem explicabo necessitatibus!</Item>
        </div>
    )
}