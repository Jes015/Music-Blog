import { useContext } from 'react'
import { carouselContext } from '../context'

export const useCarouselContext = () => useContext(carouselContext)