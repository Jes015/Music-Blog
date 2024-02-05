import { SectionLayout } from "@/components/layouts"
import type { BaseComponentType } from "@/models"

export const PostsSection: BaseComponentType = (props) => {
    return (
        <SectionLayout
            title='Posts'
            {...props}
        >
           {/*  {
                data != null && data.map((postData) => (<Post key={postData.id} data={postData} />))
            } */}
        </SectionLayout>
    )
}