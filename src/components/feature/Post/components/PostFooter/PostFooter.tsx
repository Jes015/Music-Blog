import { IconLike, IconNoLike } from "@/assets/Icons"
import { Button } from "@/components/ui"
import type { BaseComponentType } from "@/models"
import { Suspense, lazy } from "react"
import { usePostContext } from "../../services/context"
import { usePostFooter } from "./hooks"

const Comments = lazy(() => import('@/components/ui').then(module => ({ default: module.Comments })))

export const PostFooter: BaseComponentType = () => {
    const { data } = usePostContext()
    const { displayComments, isLiked, toggleDisplayComments, toggleIsLiked } = usePostFooter()

    const handleOnClickToDisplayComments = () => {
        toggleDisplayComments()
    }

    const handleOnClickToToggleLike = () => {
        toggleIsLiked()
    }

    return (
        <footer
            className="flex bg-neutral-900 flex-col border-t border-borderPrimary font-normal"
        >
            <div
                className={
                    [
                        "flex",
                        displayComments ? 'border-b border-borderPrimary' : ''
                    ].join(' ')
                }
            >
                <Button
                    onClick={handleOnClickToDisplayComments}
                    className="!border-none"
                >
                    {
                        `${displayComments ? 'Hide comments' : 'Comments'} `
                    }
                </Button>
                <Button
                    onClick={handleOnClickToToggleLike}
                    className="!border-l !border-y-0 !border-r-0 border-l-neutral-800 flex justify-center items-center gap-1"
                    aria-label={isLiked ? 'Dislike post' : 'Like post'}
                >
                    <span className={'text-xs text-textTertiary'}>
                        1
                    </span>
                    <span
                        className='text-2xl text-textSecondary'
                    >
                        {isLiked ? <IconLike className="text-red-400" /> : <IconNoLike />}
                    </span>
                </Button>
            </div>

            {displayComments && (
                <Suspense>
                    <Comments />
                </Suspense>
            )
            }
        </footer>
    )
}