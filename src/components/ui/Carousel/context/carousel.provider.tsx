import type { BaseComponentProps } from "@/models"
import type { FC } from "react"
import { useCarousel, type CarouselParams } from "../hooks"
import { carouselContext } from "./carousel.context"

interface CarouselProviderProps extends BaseComponentProps, CarouselParams {
}

export const CarouselProvider: FC<CarouselProviderProps> = ({ children, defaultItemIndex, length }) => {
    const values = useCarousel({ defaultItemIndex, length })

    return (
        <carouselContext.Provider value={values}>
            {children}
        </carouselContext.Provider>
    )
}