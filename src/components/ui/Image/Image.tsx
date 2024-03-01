import { useEffect, useRef, useState, type LegacyRef } from "react"
import styles from './image.module.css'

interface IProps {
    src: string
    alt: string
    height: string
    width: string
    lazy?: boolean
}

export const Image: React.FC<IProps> = ({ height, width, src, alt, lazy = false }) => {
    const [isLoading, setIsLoading] = useState(true)
    const imageRef = useRef<HTMLImageElement>()

    useEffect(() => {
        if (imageRef.current?.complete) {
            setIsLoading(false)
        }

        const handleOnLoad = () => {
            setIsLoading(false)
        }

        imageRef.current?.addEventListener('load', handleOnLoad)

        return () => {
            imageRef.current?.removeEventListener('load', handleOnLoad)
        }
    }, [])

    return (
        <div
            style={{
                width,
                height
            }}
            className={
                [
                    styles.image__container,
                    isLoading ? styles['image__container--loading'] : styles['image__container--load']
                ].join(' ')
            }
        >
            <img
                style={{
                    width,
                    height
                }}
                className={
                    [
                        styles.image,
                        isLoading ? styles['image--loading'] : styles['image--load']
                    ].join(' ')
                }
                ref={imageRef as LegacyRef<HTMLImageElement>}
                loading={lazy ? 'lazy' : 'eager'}
                {...{ src, alt }}
            // onLoad={} use onLoad only with client:only="react" otherwise onLoad will not work if it's the first time that astro load the astro islands
            />
        </div>
    )
}