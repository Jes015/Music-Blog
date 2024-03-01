import type { useCarousel } from "../hooks"

export type CarouselContext = ReturnType<typeof useCarousel>

export const defaultCarouselValues: CarouselContext = {
    currentItem: 0,
    nextItem: () => {},
    previousItem: () => {},
    length: 0,
    setItemIndex: () => {}
}