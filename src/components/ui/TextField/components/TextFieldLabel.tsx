import { type BaseComponentType } from "@/models"
import clsx from "clsx"

export const TextFieldLabel: BaseComponentType = ({ children, className, ...props }) => {
    return (
        <span
            className={
                clsx(
                    'text-sm',
                    className
                )
            }
            {...props}
        >
            {children}
        </span>
    )
}