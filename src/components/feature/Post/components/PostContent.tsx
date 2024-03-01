import { Image } from "@/components/ui"
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
                (
                    <Image src={data.images?.[0].src}  alt={`${data.title} image`} height="288px" width="100%" />
                )
            }
            <div>
                <p
                    className="font-normal leading-5 text-sm p-1"
                >
                    {data.content}
                </p>
            </div>
        </div>
    )
}