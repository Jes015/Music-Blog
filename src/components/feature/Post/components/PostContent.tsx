import { Image } from "@/components/ui"
import { Carousel } from "@/components/ui/Carousel/Carousel"
import type { BaseComponentType } from "@/models"
import { usePostContext } from "../services/context/"

export const PostContent: BaseComponentType = () => {
    const { data } = usePostContext()

    return (
        <div
            className="bg-neutral-900 flex flex-col gap-1 p-1 min-h-[5rem] "
        >

            {
                data.images?.[0] != null &&
                <Carousel
                    length={data.images?.length ?? 0}
                    className="h-[288px] w-full"
                >
                    {
                        data.images.map((image, index) => (
                            <Carousel.Item key={image.src + index}>
                                <Image src={image.src} alt={`${data.title} image ${index}`} height="288px" width="100%" />
                            </Carousel.Item>
                        ))
                    }
                    <Carousel.Controls>
                        <Carousel.ControlsSides />
                        <Carousel.ControlsBottom />
                    </Carousel.Controls>
                </Carousel>
            }
            <div>
                <div
                    className="font-normal leading-5 text-sm p-1"
                    dangerouslySetInnerHTML={{ __html: data.content}}
                />
            </div>
        </div>
    )
}