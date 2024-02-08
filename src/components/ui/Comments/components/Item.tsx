import { Avatar } from "@/components/ui"
import type { BaseComponentType } from "@/models"
import { useState } from "react"

export const Item: BaseComponentType = ({ children, ...props }) => {
    const [showComments, setShowComments] = useState(false)

    const handleOnClickToShowComments = () => {
        setShowComments((prev) => !prev)
    }

    return (
        <article
            className="pl-4 flex flex-col"
            {...props}
        >
            <header
                className="flex"
            >
                <div
                    className="flex items-center gap-1"
                >
                    <Avatar
                        avatarImageProps={{
                            src: "https://avatars.githubusercontent.com/u/120581623?v=4",
                            alt: "user avatar"
                        }}
                        avatarFallback={{
                            children: 'J'
                        }}
                    >
                    </Avatar>
                    <span className="text-sm font-bold">Jes015</span>
                </div>
            </header>
            <p
                className="text-xs"
            >
                {children}
            </p>
            <details>
                <summary
                    className="list-none cursor-pointer font-bold text-sm"
                    onClick={handleOnClickToShowComments}
                >
                    {
                        `${showComments ? 'Hide' : 'Show'} comments`
                    }
                </summary>
                {
                    showComments &&
                    <div>
                        {
                            Math.floor(Math.random() * 2) + 1 === 1 && (
                                Array(Math.floor(Math.random() * 10) + 1).fill(null).map(() => (<Item>{children}</Item>))
                            )
                        }
                    </div>
                }

            </details>
        </article>
    )
}