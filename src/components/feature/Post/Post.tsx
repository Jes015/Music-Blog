import type { BaseComponentProps, IPost } from "@/models"
import { useEffect, useState } from "react"
import { PostContent, PostFooter, PostHeader } from "./components"
import styles from './post.module.css'
import { PostProvider } from "./services/context/post.provider"

interface PostProps extends BaseComponentProps {
    data: IPost
}

export const Post: React.FC<PostProps> = ({ data }) => {
    // i would use this logic with out react methods but astro makes SSG and don't let me do it because of the location var
    const [isFocus, setIsFocus] = useState(false)

    useEffect(() => {
        const isTheSameHash = '#' + data.id === location.hash
        setIsFocus(isTheSameHash)
    }, [])

    return (
        <PostProvider {...{ data }}>
            <div
                id={data.id}
                className={
                    [
                        "relative w-full flex flex-col gap-2 pt-2",
                    ].join(' ')
                }
            >
                {
                    isFocus && (
                        <>
                            <div className="absolute top-0 w-[500vw] left-[-50dvw] z-[-200] bg-[#8da4ed08] h-full" />
                            <div className=" inline-block self-end"><span className="text-xs p-1 bg-[#5174c1d4] rounded-md inline-flex">Shared with u</span></div>
                        </>
                    )
                }
                <article className={[styles.post, "border border-neutral-800 rounded-md font-bold h-full"].join(' ')}>
                    <PostHeader />
                    <PostContent />
                    <PostFooter />
                </article>
            </div>
        </PostProvider>
    )
}