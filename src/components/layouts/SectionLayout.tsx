import { BaseComponentProps } from "@/models";

interface SectionLayoutProps extends BaseComponentProps {
    title: string
    rightNode?: React.ReactNode
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({ title, children, className, rightNode, ...props }) => {
    return (
        <div
            className={
                [
                    'w-full h-full flex flex-col gap-1 mt-5',
                    className
                ].join(' ')
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