import { BaseComponentProps } from "@/models";
import { PostContext } from "../../models";
import { postContext } from "./post.context";

interface PostProviderProps extends BaseComponentProps, PostContext {
}

export const PostProvider: React.FC<PostProviderProps> = ({ children, data }) => {
    return (
        <postContext.Provider value={{ data }}>
            {children}
        </postContext.Provider>
    );
};