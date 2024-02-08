import type { BaseComponentType } from "@/models"
import clsx from "clsx"

export const Button: BaseComponentType = ({ className, children, ...props }) => {
    return (
        <button
            className={
                clsx(
                    className,
                    "flex-grow [flex-basis:0] hover:bg-neutral-800 p-1 rounded-sm border border-neutral-800 [transition-duration:0.3s]"
                )
            }
            {...props}
        >
            {children}
        </button>
    )
}