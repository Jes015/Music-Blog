import { Avatar, Button } from "@/components/ui"
import type { BaseComponentType } from "@/models"
import { getTimeAgo } from "@/utils"
import { usePostContext } from "../services/context"

export const PostHeader: BaseComponentType = () => {
    const { data } = usePostContext()

    const handleOnClickToCopyLink = () => {
        const postURL = location.origin + '/#' + data.id
        navigator.clipboard.writeText(postURL)
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
                <h3 className="text-pretty text-base font-semibold">{data.title}</h3>
                <span
                    className="text-[0.7rem] text-textTertiary font-normal flex-shrink-0"
                >
                    {getTimeAgo(data.publishDate)}
                </span>
            </div>
            <div
                className="flex items-center gap-1 text-xs font-light"
            >
                <Button onClick={handleOnClickToCopyLink}>
                    Copy Link
                </Button>
            </div>
        </header>
    )
}