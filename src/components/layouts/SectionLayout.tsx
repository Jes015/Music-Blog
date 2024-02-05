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
                    'w-full h-full flex flex-col gap-1 mt-5',
                    className
                )
            }
            {...props}
        >
            <header
                className="flex items-center justify-between"
            >
                <h1 className='font-bold text-xl'>{title}</h1>
                {rightNode}
            </header>
            {children}
        </div>
    )
}