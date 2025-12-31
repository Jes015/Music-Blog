export const copyClipboardPost = (id: string) => {
    // Generate a full link (e.g., domain.com/2#post-id) for efficiency.
    // If the post moves to another page later, the Client-Side Post Locator handles the redirect.
    const postURL = location.origin + location.pathname + '#' + id
    navigator.clipboard.writeText(postURL)
}