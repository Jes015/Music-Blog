import type { BaseComponentType } from "@/models"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
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
                    className="border-[0.01rem] border-borderPrimary cursor-pointer"
                >
                    <AvatarImage src="https://avatars.githubusercontent.com/u/120581623?v=4" alt="user avatar" />
                    <AvatarFallback>{data.publisher.name.at(0)}</AvatarFallback>
                </Avatar>
                <h3>{data.title}</h3>
                <span
                    className="text-xs text-textTertiary font-normal"
                >
                    Hace 3 dias
                </span>
            </div>
            <div
                className="flex items-center gap-1"
            >
                <button
                >
                    Report
                </button>
                <button
                >
                    Share
                </button>
            </div>
        </header>
    )
}