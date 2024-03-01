import { useState } from "react"

export interface CarouselParams {
    defaultItemIndex?: number
    length: number
}

export const useCarousel = ({ length, defaultItemIndex = 0 }: CarouselParams) => {
    const [currentItem, setItem] = useState(defaultItemIndex)

    const nextItem = () => {
        setItem(prevState => {
            if (prevState < length - 1) {
                return prevState + 1
            }

            return prevState
        })
    }

    const previousItem = () => {
        setItem(prevState => {
            if (prevState > 0) {
                return prevState - 1
            }

            return prevState
        })
    }

    const setItemIndex = (index: number) => {
        setItem(index)
    }
    
    return { currentItem, nextItem, previousItem, length, setItemIndex } as const
}