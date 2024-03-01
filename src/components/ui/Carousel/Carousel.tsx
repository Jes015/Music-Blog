import type { BaseComponentProps } from "@/models"
import { CarouselControls, CarouselControlsBottom, CarouselControlsSides, CarouselItem } from "./components"
import { CarouselProvider } from "./context"
import type { CarouselParams } from "./hooks"

interface CarouselProps extends BaseComponentProps, CarouselParams { }

export const Carousel = ({ className, length, defaultItemIndex, ...props }: CarouselProps) => {
    return (
        <CarouselProvider {...{ length, defaultItemIndex }}>
            <div
                className={
                    [
                        "relative flex flex-nowrap overflow-hidden",
                        className
                    ].join(' ')
                }
                role="slider"
                {...props}
            />
        </CarouselProvider>
    )
}

Carousel.Item = CarouselItem
Carousel.Controls = CarouselControls
Carousel.ControlsSides = CarouselControlsSides
Carousel.ControlsBottom = CarouselControlsBottom