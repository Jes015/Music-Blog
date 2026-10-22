import clsx from "clsx"
import React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
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