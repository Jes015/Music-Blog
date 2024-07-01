import { Avatar, Button } from "@/components/ui"
import type { BaseComponentType } from "@/models"
import { copyClipboardPost, getTimeAgo } from "@/utils"
import clsx from "clsx"
import { usePostContext } from "../services/context"

export const PostHeader: BaseComponentType = () => {
    const { data } = usePostContext()

    const handleOnClickToCopyLink = () => {
        copyClipboardPost(data.id)
    }

    return (
        <header
            className="sticky z-50 top-0 bg-[#191919] flex items-center gap-1 justify-between border-b border-borderPrimary p-1"
        >
            <div
                className="flex items-center gap-1"
            >
                <Avatar
                    avatarImageProps={{
                        src: data.publisher.imageURL,
                    }}
                    avatarFallback={{
                        children: data.publisher.name.at(-1)
                    }}
                />
                <h3
                    className={
                        clsx(
                            "font-semibold",
                            data.title.length > 50 ? 'text-xs text-balance' : 'text-base text-pretty'
                        )
                    }
                >
                    {data.title}
                </h3>
                <span
                    className="text-[0.7rem] text-textTertiary font-normal flex-shrink-0 pt-[0.18rem]"
                >
                    {getTimeAgo(data.publishDate)}
                </span>
            </div>
            <div
                className="flex items-center gap-1 text-xs font-light flex-shrink-0"
            >
                <Button onClick={handleOnClickToCopyLink}>
                    Copy Link
                </Button>
            </div>
        </header>
    )
}