import { createContext } from "react"
import { defaultCarouselValues, type CarouselContext } from "../models/carousel.model"

export const carouselContext = createContext<CarouselContext>(defaultCarouselValues)
