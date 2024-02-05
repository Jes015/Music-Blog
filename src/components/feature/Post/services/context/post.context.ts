import { createContext, useContext } from "react";
import { PostContext, defaultPostContextValues } from "../../models";

export const postContext = createContext<PostContext>(defaultPostContextValues)

export const usePostContext = () => useContext(postContext)