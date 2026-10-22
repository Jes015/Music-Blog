import { IconLike, IconNoLike } from "@/assets/Icons"
import { Button } from "@/components/ui"
import type { BaseComponentType } from "@/models"
import { Suspense, lazy } from "react"
import { usePostContext } from "../../services/context"
import { usePostFooter } from "./hooks"

const Comments = lazy(() => import('@/components/ui').then(module => ({ default: module.Comments })))

export const PostFooter: BaseComponentType = () => {
    const { data } = usePostContext()
    const {
        displayComments,
        isLiked,
        likesCount,
        handleLike,
        toggleDisplayComments,
        notificationMessage,
        isSubmitting,
    } = usePostFooter(data?.id, data?.likes ?? 1)

    const handleOnClickToDisplayComments = () => {
        toggleDisplayComments()
    }

    const handleOnClickToToggleLike = () => {
        handleLike()
    }

    return (
        <footer
            className="flex bg-neutral-900 flex-col border-t border-borderPrimary font-normal"
        >
            {notificationMessage && (
                <div
                    role="alert"
                    className="text-xs text-amber-300 bg-amber-950/40 border-b border-amber-500/20 px-3 py-1.5 flex items-center justify-between"
                >
                    <span>{notificationMessage}</span>
                </div>
            )}

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
                    disabled={isSubmitting}
                    className="!border-l !border-y-0 !border-r-0 border-l-neutral-800 flex justify-center items-center gap-1 transition-opacity active:scale-95"
                    aria-label={isLiked ? 'Has dado like a este post' : 'Dar like al post'}
                    title={isLiked ? 'Ya le diste like a este post' : 'Dar like'}
                >
                    <span className={'text-xs text-textTertiary font-medium'}>
                        {likesCount}
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