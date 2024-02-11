import type { BaseComponentType } from "@/models"
import { usePostContext } from "../services/context/"

export const PostContent: BaseComponentType = () => {
    const { data } = usePostContext()
    return (
        <div
            className="flex flex-col gap-1 p-1 min-h-[5rem] "
        >
            {/* <div
                className="w-full h-72 bg-neutral-500 opacity-50 rounded-md"
            >
            </div> */}
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