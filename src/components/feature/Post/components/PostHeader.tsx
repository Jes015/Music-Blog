import { Avatar, Button } from "@/components/ui"
import type { BaseComponentType } from "@/models"
import { usePostContext } from "../services/context"

export const PostHeader: BaseComponentType = () => {
    const { data } = usePostContext()
    return (
        <header
            className="flex items-center justify-between border-b border-borderPrimary p-1"
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
                <h3>{data.title}</h3>
                <span
                    className="text-xs text-textTertiary font-normal"
                >
                    Hace 3 dias
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