export const copyClipboardPost = (id: string) => {
    const postURL = location.origin + '/#' + id
    navigator.clipboard.writeText(postURL)
}