export const copyClipboardPost = (id: string) => {
    const postURL = location.origin + location.pathname + '#' + id
    navigator.clipboard.writeText(postURL)
}