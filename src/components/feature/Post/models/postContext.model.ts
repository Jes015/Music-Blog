import { IPost } from "apptypes";

export interface PostContext {
    data: IPost
}

export const defaultPostContextValues: PostContext = {
    data: {
        title: '',
        content: '',
        id: '9ec90306-6b6e-4dcf-bd55-f56beb9f5daa',
        likes: 30048434,
        publishDate: 23424,
        publisher: {
            name: 'Jes015',
            description: 'HOla',
            id: '9ec90306-6b6e-4dcf-bd55-f56beb9f5daa'
        },
    }
}