import type { BaseComponentType } from "@/models"
import { usePostContext } from "../services/context/"

export const PostContent: BaseComponentType = () => {
    const { data } = usePostContext()
    return (
        <div
            className="flex flex-col gap-2 p-1 min-h-[5rem]"
        >
            {
                Math.floor(Math.random() * 2) + 1 === 1 &&
                <div
                    className="w-full h-72 bg-neutral-500 opacity-50 rounded-md"
                >
                </div>
            }
            <div>
                {data.content}
            </div>
        </div>
    );
};