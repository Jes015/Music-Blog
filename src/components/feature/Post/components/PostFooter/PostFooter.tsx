import { IconLike, IconNoLike } from "@/assets/Icons"
import { BaseComponentType } from "@/models"
import { Suspense, lazy } from "react"
import { usePostFooter } from "./hooks"

const Comments = lazy(() => import('@/components/ui').then(module => ({ default: module.Comments })))

export const PostFooter: BaseComponentType = () => {

    const { displayComments, isLiked, toggleDisplayComments, toggleIsLiked} = usePostFooter()

    const handleOnClickToDisplayComments = () => {
        toggleDisplayComments()
    }

    const handleOnClickToToggleLike = () => {
        toggleIsLiked()
    }

    return (
        <footer
            className="flex flex-col border-t border-borderPrimary font-normal"
        >
            <div
                className={
                    [
                        "flex",
                        displayComments ? 'border-b border-borderPrimary' : ''
                    ].join(' ')
                }
            >
                <button
                    onClick={handleOnClickToDisplayComments}
                    className="flex-grow [flex-basis:0] hover:bg-backgroundHoverPrimary py-1 [transition-duration:0.3s]"
                >
                    {
                        `${displayComments ? 'Hide comments' : 'Comments'} `
                    }
                </button>
                <button
                    onClick={handleOnClickToToggleLike}
                    className="flex items-center justify-center gap-1 flex-grow [flex-basis:0] border-l border-l-neutral-800 hover:bg-backgroundHoverPrimary py-1 [transition-duration:0.3s]"
                    aria-label={isLiked ? 'Dislike post': 'Like post'}
                >
                    <span className={'text-xs text-textTertiary'}>
                        1
                    </span>
                    <span
                        className={'text-2xl text-textSecondary'}
                    >
                        {isLiked ? <IconLike className="text-red-400" /> : <IconNoLike />}
                    </span>
                </button>
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