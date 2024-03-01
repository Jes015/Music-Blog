import type { BaseComponentType } from "@/models"
import { useCarouselContext } from "../hooks/useCarouselContext"

export const CarouselItem: BaseComponentType = ({ className, ...props }) => {
    const { currentItem } = useCarouselContext()

    return (
        <div
            role="tabpanel"
            className={
                [
                    "[flex-basis:100%] flex-shrink-0 flex-grow-0 transition-transform",
                    className
                ].join(' ')
            }
            style={{
                transform: `translateX(${-100 * currentItem }%)`
            }}
            {...props}
        />
    )
}