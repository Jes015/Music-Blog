import { useState } from "react"

export const usePostFooter = () => {
    const [displayComments, setDisplayComments] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    const toggleDisplayComments = () => {
        setDisplayComments(prev => !prev)
    }

    const toggleIsLiked = () => {
        setIsLiked(prev => !prev)
    }

    return { displayComments, toggleDisplayComments, isLiked, toggleIsLiked }
}