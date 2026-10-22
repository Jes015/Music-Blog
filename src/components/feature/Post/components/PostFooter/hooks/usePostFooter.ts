import { getLikesMap, isPostLikedLocal, sendLike, subscribeToLikes } from "@/services/likes.service"
import { useEffect, useState } from "react"

export const usePostFooter = (postId?: string, initialLikes: number = 1) => {
    const [displayComments, setDisplayComments] = useState(false)
    const [isLiked, setIsLiked] = useState(() => (postId ? isPostLikedLocal(postId) : false))
    const [likesCount, setLikesCount] = useState<number>(initialLikes)
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Sincronizar estado inicial de liked y likes remotos
    useEffect(() => {
        if (!postId) return

        // 1. Verificar si el usuario ya le dio like en este navegador
        if (isPostLikedLocal(postId)) {
            setIsLiked(true)
        }

        // 2. Suscribirse a actualizaciones del caché de likes
        const unsubscribe = subscribeToLikes((likesMap) => {
            const remoteLikes = likesMap[postId]
            if (typeof remoteLikes === 'number') {
                setLikesCount(initialLikes + remoteLikes)
            }
        })

        // 3. Disparar consulta agrupada si aún no se ha hecho
        getLikesMap().then((likesMap) => {
            const remoteLikes = likesMap[postId]
            if (typeof remoteLikes === 'number') {
                setLikesCount(initialLikes + remoteLikes)
            }
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

    const handleLike = async () => {
        if (!postId) return

        // Si ya le dio like, no se puede quitar (regla estricta)
        if (isLiked) {
            setNotificationMessage("Ya le diste like a este post ❤️")
            return
        }

        if (isSubmitting) return

        // Actualización optimista inmediata en la UI
        setIsSubmitting(true)
        setIsLiked(true)
        setLikesCount(prev => prev + 1)

        const result = await sendLike(postId)

        if (!result.success) {
            // Revertir optimismo si falló
            setIsLiked(false)
            setLikesCount(prev => Math.max(initialLikes, prev - 1))
            setNotificationMessage(result.error || 'No se pudo registrar el like')
        } else if (typeof result.likes === 'number') {
            setLikesCount(initialLikes + result.likes)
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