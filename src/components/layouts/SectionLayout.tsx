import type { BaseComponentProps } from "@/models"
import clsx from "clsx"

interface SectionLayoutProps extends BaseComponentProps {
    title: string
    rightNode?: React.ReactNode
    /** 'h1' si la sección es el título principal de la página (por defecto); 'h2' si la página ya tiene otro h1. */
    headingLevel?: 'h1' | 'h2'
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({ title, children, className, rightNode, headingLevel = 'h1', ...props }) => {
    const Heading = headingLevel
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
                <Heading className='font-bold text-xl underline decoration-wavy decoration-zinc-50'>{title}</Heading>
                {rightNode}
            </header>
            <div className="w-full flex-1 flex flex-col gap-3 relative z-0">
                {children}
            </div>
        </div>
    )
}
