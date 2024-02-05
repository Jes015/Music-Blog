import type { BaseComponentProps, IPost } from "@/models"
import { PostContent, PostFooter, PostHeader } from "./components"
import { PostProvider } from "./services/context/post.provider"

interface PostProps extends BaseComponentProps {
    data: IPost;
}

export const Post: React.FC<PostProps> = ({ data }) => {
    return (
        <PostProvider {...{ data }}>
            <article
                className="w-full border border-borderPrimary rounded-md font-bold"
            >
                <PostHeader />
                <PostContent />
                <PostFooter />
            </article>
        </PostProvider>
    );
};