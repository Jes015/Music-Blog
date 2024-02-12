import type { BaseComponentProps, IPost } from "@/models"
import { PostContent, PostFooter, PostHeader } from "./components"
import styles from './post.module.css'
import { PostProvider } from "./services/context/post.provider"

interface PostProps extends BaseComponentProps {
    data: IPost
}

export const Post: React.FC<PostProps> = ({ data }) => {
    return (
        <PostProvider {...{ data }}>
            <article
                className={
                    [
                        styles.post,
                        "w-full border border-neutral-800 rounded-md font-bold"
                    ].join(' ')
                }
            >
                <PostHeader />
                <PostContent />
                <PostFooter />
            </article>
        </PostProvider>
    )
}