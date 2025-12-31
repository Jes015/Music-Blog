import type { BaseComponentProps } from "@/models"
import clsx from "clsx"

interface SectionLayoutProps extends BaseComponentProps {
    title: string
    rightNode?: React.ReactNode
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({ title, children, className, rightNode, ...props }) => {
    return (
        <div
            className={
                clsx(
                    'w-full h-full flex flex-col gap-3 mt-5 relative',
                    className
                )
            }
            {...props}
        >
            <div id="posts-top" className="absolute -top-24 visibility-hidden"></div>
            <header
                className="flex items-center justify-between relative z-50"
            >
                <h1 className='font-bold text-xl underline decoration-wavy decoration-zinc-50'>{title}</h1>
                {rightNode}
            </header>
            <div className="w-full flex-1 flex flex-col gap-3 relative z-0">
                {children}
            </div>
        </div>
    )
}