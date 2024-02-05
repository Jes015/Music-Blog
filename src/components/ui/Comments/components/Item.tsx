import { BaseComponentType } from "@/models"
import { Avatar } from "@radix-ui/themes"
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
                        src="https://avatars.githubusercontent.com/u/120581623?v=4"
                        alt="User image"
                        fallback='e'
                        size='1'
                        radius="full"
                        className="border-[0.01rem] border-borderPrimary cursor-pointer"
                    />
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