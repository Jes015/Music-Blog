import { IconPinned } from "@/assets/Icons"
import { Button } from "@/components/ui"
import type { BaseComponentProps, IPost } from "@/models"
import { copyClipboardPost, getUnlockFormattedDays, shouldUnlockPost } from "@/utils"
import { clsx } from "clsx"
import { useEffect, useState } from "react"
import { PostContent, PostFooter, PostHeader } from "./components"
import styles from './post.module.css'
import { PostProvider } from "./services/context/post.provider"

interface PostProps extends BaseComponentProps {
    data: IPost
    isPinned?: boolean
}

export const Post: React.FC<PostProps> = ({ data, isPinned }) => {
    // i would use this logic with out react methods but astro makes SSG and don't let me do it because of the location var
    const [isFocus, setIsFocus] = useState(false)

    // isFocus effect
    useEffect(() => {
        const isTheSameHash = '#' + data.id === location.hash
        setIsFocus(isTheSameHash)
    }, [])

    const showUnlockMessage = (data?.unlock != null && shouldUnlockPost(data.publishDate, data?.unlock.unlockInYears))

    const unlockFormattedTime = data?.unlock != null && getUnlockFormattedDays(data.publishDate, data?.unlock.unlockInYears)

    console.log(unlockFormattedTime)
    console.log(data?.unlock)
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
                    (isFocus || isPinned) && (
                        <>
                            {
                                isFocus && <div className="absolute top-0 w-[500vw] left-[-50dvw] z-[-200] h-full bg-[#8da4ed08]" />
                            }
                            <div className=" self-end inline-flex gap-2">
                                {
                                    isFocus && <span className="text-xs p-1 bg-[#5174c1d4] rounded-md inline-flex">Shared with u</span>
                                }
                                {
                                    isPinned && (
                                        <span className="flex items-center text-xs gap-1 p-1 bg-yellow-100 text-yellow-800 rounded-md font-medium">
                                            <IconPinned aria-hidden='true' width={14} height={14} /> Pinned
                                        </span>
                                    )
                                }
                            </div>
                        </>
                    )
                }
                {
                    showUnlockMessage
                        ? (
                            <>
                                <article className="w-full p-2 rounded-md bg-zinc-800/5 border border-neutral-400/10">
                                    <header className="flex items-center justify-between">
                                        <div className="flex gap-1 items-center">
                                            <h3 className="text-base font-semibold">
                                                {data.title}
                                            </h3>
                                            <span className="text-[0.6rem] leading-[0.6rem] pt-[0.2rem]">Hace 1 dia</span>
                                        </div>
                                        <div>
                                            <Button onClick={() => { copyClipboardPost(data.id) }} className="text-[0.6rem]">Copy link</Button>
                                        </div>
                                    </header>
                                    <div className="flex flex-col">
                                        <p className="text-xs text-zinc-100">El contenido de este post se desbloqueará {unlockFormattedTime}. Vuelve en {unlockFormattedTime} ;P.</p>
                                        <p className="text-xs text-zinc-100">{data?.unlock?.message}</p>
                                    </div>
                                </article>
                            </>
                        )
                        : (
                            <article
                                className={
                                    clsx(
                                        styles.post, "border rounded-md font-bold h-full",
                                        isPinned ? 'border-yellow-200/5' : 'border-neutral-800'
                                    )
                                }
                            >
                                <PostHeader />
                                <PostContent />
                                <PostFooter />
                            </article>
                        )
                }
            </div>
        </PostProvider>
    )
}