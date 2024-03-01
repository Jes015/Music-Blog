import { IconPlay } from "@/assets/Icons"
import type { BaseComponentType } from "@/models"
import { useCarouselContext } from "../hooks/useCarouselContext"

export const CarouselControls: BaseComponentType = ({ className, ...props }) => {
    return (
        <div
            className={
                [
                    "absolute top-0 left-0 w-full flex flex-col h-full p-1",
                    className
                ].join(' ')
            }
            {...props}
        />
    )
}

export const CarouselControlsSides: BaseComponentType = ({ className, ...props }) => {
    const { nextItem, previousItem, currentItem, length } = useCarouselContext()

    const isPreviousActive = currentItem !== 0
    const isNextActive = currentItem !== length - 1

    return (
        <div
            className={
                [
                    "flex-grow flex",
                    !isPreviousActive ? 'justify-end' : 'justify-between',
                    className
                ].join(' ')
            }
            {...props}
        >
            {
                isPreviousActive
                && <button onClick={() => { previousItem() }}>
                    <IconPlay className="w-6 h-6 rotate-180" />
                </button>
            }

            {
                isNextActive
                && <button onClick={() => { nextItem() }}>
                    <IconPlay className="w-6 h-6" />
                </button>
            }
        </div>
    )
}

export const CarouselControlsBottom: BaseComponentType = ({ className, ...props }) => {
    const { length, setItemIndex, currentItem } = useCarouselContext()

    const handleOnClick = (index: number) => () => {
        setItemIndex(index)
    }

    return (
        <div
            className={
                [
                    "flex gap-1 items-center justify-center",
                    className
                ].join(' ')
            }
            {...props}
        >
            {
                Array(length).fill(null).map((_, index) => (
                    <button
                        className={
                            [
                                "w-3 aspect-square bg-white rounded-full opacity-50",
                                currentItem === index ? '!opacity-100' : ''
                            ].join(' ')
                        }
                        key={index}
                        onClick={handleOnClick(index)}
                    />
                ))
            }
        </div>
    )
}