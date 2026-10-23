import { getLikesMap, isPostLikedLocal, sendLike, subscribeToLikes } from "@/services/likes.service"
import { useEffect, useState } from "react"

const TURNSTILE_SITE_KEY = '0x4AAAAAAFiadduDOEJdcZiw'

async function obtainTurnstileToken(container: HTMLElement | null): Promise<string> {
    if (typeof window === 'undefined' || !window.turnstile || !container) {
        return ''
    }
    const turnstile = window.turnstile
    return new Promise((resolve) => {
        container.innerHTML = ''
        try {
            const widgetId = turnstile.render(container, {
                sitekey: TURNSTILE_SITE_KEY,
                theme: 'dark',
                size: 'flexible',
                callback: (token: string) => {
                    resolve(token)
                    setTimeout(() => {
                        try {
                            if (widgetId) {
                                turnstile.remove(widgetId)
                            }
                        } catch {}
                        if (container) {
                            container.innerHTML = ''
                        }
                    }, 1200)
                },
                'error-callback': () => {
                    resolve('')
                },
                'expired-callback': () => {
                    resolve('')
                },
            })
        } catch (e) {
            console.warn('[turnstile render error]', e)
            resolve('')
        }
    })
}

export const usePostFooter = (postId?: string, initialLikes: number = 1) => {
    const [displayComments, setDisplayComments] = useState(false)
    const isLocalLiked = Boolean(postId && isPostLikedLocal(postId))

    const [isLiked, setIsLiked] = useState<boolean>(() => isLocalLiked)
    // Si ya le dio like en este navegador, garantizamos que el contador muestre como mínimo initialLikes + 1
    const [likesCount, setLikesCount] = useState<number>(() => (isLocalLiked ? initialLikes + 1 : initialLikes))
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Sincronizar estado inicial de liked y likes remotos
    useEffect(() => {
        if (!postId) return

        const locallyLiked = isPostLikedLocal(postId)
        if (locallyLiked) {
            setIsLiked(true)
        }

        const updateCountWithRemote = (remote?: number) => {
            const hasLiked = locallyLiked || isPostLikedLocal(postId)
            const minimum = hasLiked ? initialLikes + 1 : initialLikes

            if (typeof remote === 'number') {
                const total = initialLikes + remote
                setLikesCount(Math.max(minimum, total))
            } else {
                setLikesCount(prev => Math.max(minimum, prev))
            }
        }

        // 1. Suscribirse a actualizaciones del caché de likes
        const unsubscribe = subscribeToLikes((likesMap) => {
            updateCountWithRemote(likesMap[postId])
        })

        // 2. Disparar consulta agrupada si aún no se ha hecho
        getLikesMap().then((likesMap) => {
            updateCountWithRemote(likesMap[postId])
        })

        return () => {
            unsubscribe()
        }
    }, [postId, initialLikes])

    // Limpiar mensaje de notificación después de 4.5 segundos
    useEffect(() => {
        if (!notificationMessage) return
        const timer = setTimeout(() => {
            setNotificationMessage(null)
        }, 4500)
        return () => clearTimeout(timer)
    }, [notificationMessage])

    const toggleDisplayComments = () => {
        setDisplayComments(prev => !prev)
    }

    const handleLike = async (turnstileContainer?: HTMLElement | null) => {
        if (!postId) return

        // Si ya le dio like, no se puede quitar (regla estricta)
        if (isLiked) {
            setNotificationMessage("Ya le diste like a este post ❤️")
            return
        }

        if (isSubmitting) return

        setIsSubmitting(true)

        // Obtener token de Turnstile de forma no intrusiva
        let turnstileToken = ''
        if (turnstileContainer && typeof window !== 'undefined' && window.turnstile) {
            turnstileToken = await obtainTurnstileToken(turnstileContainer)
        }

        // Actualización optimista inmediata en la UI
        setIsLiked(true)
        setLikesCount(prev => prev + 1)

        const result = await sendLike(postId, turnstileToken)

        if (result.alreadyLiked) {
            // Ya estaba registrado en el servidor: se queda en rojo
            setIsLiked(true)
            setLikesCount(prev => Math.max(initialLikes + 1, prev - 1))
        } else if (!result.success) {
            // Revertir optimismo si falló en el servidor
            setIsLiked(false)
            setLikesCount(prev => Math.max(initialLikes, prev - 1))
            setNotificationMessage(result.error || 'No se pudo registrar el like')
        } else if (typeof result.likes === 'number') {
            setLikesCount(Math.max(initialLikes + 1, initialLikes + result.likes))
        }

        setIsSubmitting(false)
    }

    return {
        displayComments,
        toggleDisplayComments,
        isLiked,
        likesCount,
        handleLike,
        notificationMessage,
        isSubmitting,
    }
}