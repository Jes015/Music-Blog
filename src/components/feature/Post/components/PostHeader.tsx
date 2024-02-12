import { Avatar, Button } from "@/components/ui"
import type { BaseComponentType } from "@/models"
import { getTimeAgo } from "@/utils"
import { usePostContext } from "../services/context"

export const PostHeader: BaseComponentType = () => {
    const { data } = usePostContext()
    return (
        <header
            className="sticky top-0 bg-[#191919] flex items-center gap-1 justify-between border-b border-borderPrimary p-1"
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
                <h3 className="text-pretty">{data.title}</h3>
                <span
                    className="text-xs text-textTertiary font-normal flex-shrink-0"
                >
                    {getTimeAgo(data.publishDate)}
                </span>
            </div>
            <div
                className="flex items-center gap-1 text-xs font-normal"
            >
                <Button>
                    Share
                </Button>
            </div>
        </header>
    )
}