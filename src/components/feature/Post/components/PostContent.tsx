import { Image } from "@/components/ui"
import { Carousel } from "@/components/ui/Carousel/Carousel"
import { Paragraph } from "@/components/ui/Paragraph"
import type { BaseComponentType } from "@/models"
import { clsx } from "clsx"
import { usePostContext } from "../services/context/"

export const PostContent: BaseComponentType = () => {
    const { data, priority } = usePostContext()

    return (
        <div
            className="bg-neutral-900 flex flex-col gap-1 min-h-[5rem] px-1"
        >

            {
                data.images?.[0] != null &&
                <Carousel
                    length={data.images?.length ?? 0}
                    className="h-[288px] w-full mt-2"
                >
                    {
                        data.images.map((image, index) => (
                            <Carousel.Item key={image.src + index}>
                                <Image 
                                    src={image.src} 
                                    alt={`${data.title} image ${index}`} 
                                    height="288px" 
                                    width="100%" 
                                    lazy={!(priority && index === 0)} 
                                />
                            </Carousel.Item>
                        ))
                    }
                    <Carousel.Controls>
                        <Carousel.ControlsSides />
                        <Carousel.ControlsBottom />
                    </Carousel.Controls>
                </Carousel>
            }
            {data.spotifyUrl && (
                <div className="w-full px-1 mt-3 mb-1"> 
                    <iframe 
                        style={{ borderRadius: '12px' }} 
                        src={data.spotifyUrl} 
                        width="100%" 
                        height="80" 
                        title="Spotify Player"
                        allowFullScreen 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading={priority ? "eager" : "lazy"}
                    />
                </div>
            )}
            <div
                className={
                    clsx(
                        "overflow-hidden relative px-1 pt-2",
                        data.content.length < 800 ? 'pb-2' : ''
                    )
                }
            >
                <Paragraph
                    className="font-normal leading-5 text-sm"
                    content={data.content}
                    postId={data.id}
                    maxHeight={data.content.length > 800 ? "20rem" : undefined}
                />
            </div>
        </div>
    )
}