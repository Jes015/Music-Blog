import { createContext, useContext } from "react"
import { defaultPostContextValues, type PostContext } from "../../models"

export const postContext = createContext<PostContext>(defaultPostContextValues)

export const usePostContext = () => useContext(postContext)