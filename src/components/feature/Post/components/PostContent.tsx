import { BaseComponentType } from "@/models";
import { ScrollArea } from "@radix-ui/themes";
import { usePostContext } from "../services/context/";

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
            <ScrollArea
                type="auto" scrollbars="vertical" className="font-normal text-sm max-h-[120px] px-1"
            >
                {data.content}
            </ScrollArea>
        </div>
    );
};