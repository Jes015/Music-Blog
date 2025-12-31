import type { BaseComponentProps, UUID } from "@/models"
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react"
import { useEffect, useRef, useState, type FC, type LegacyRef } from "react"

interface ParagraphProps extends BaseComponentProps {
    maxHeight?: string
    postId: UUID
    content: string
}

export const Paragraph: FC<ParagraphProps> = ({ postId, maxHeight, content, children, ...props }) => {
    const paragraphRef = useRef<HTMLDivElement>()

    const [displayLargeText, setDisplayLargeText] = useState(false)

    const handleOnClickToShowMore = () => {
        setDisplayLargeText((state) => {
            if (state) {
                const containerElement = document.getElementById(postId)
                containerElement?.scrollIntoView({ behavior: 'smooth' })
            }
            return !state
        })
    }

    // Improve accessibility for generated links
    useEffect(() => {
        if (!paragraphRef.current) return

        const links = paragraphRef.current.querySelectorAll('a')
        
        links.forEach((link) => {
            // Check for generic text
            const text = link.innerText.toLowerCase().trim()
            if (["click aquí", "click aqui", "aquí", "aqui", "click here", "web", "sitio"].some(t => text.includes(t)) || text.length < 3) {
                const href = link.getAttribute('href')
                // Try to get a meaningful name from the href
                const resourceName = href?.split('/').filter(Boolean).pop()?.split('.')[0]?.replace(/-/g, ' ') || 'recurso'
                
                // Add visible text for screen readers and SEO
                // We verify if we already added it to avoid duplication if effect runs twice
                if (!link.innerText.includes(resourceName)) {
                    const span = document.createElement('span');
                    span.className = "sr-only"; // Or visible if design permits, referencing user pref, but here we keep visual design clean? 
                    // Wait, the error says "Links do not have descriptive text". Screen readers read aria-label, but search engines read innerText.
                    // Let's modify innerText slightly or use a span that is visually hidden but distinct?
                    // "Links do not have descriptive text" usually checks visible text.
                    
                    // Let's append it visibly but subtle? No, user might not like it.
                    // Let's try appending it as a hidden span inside the anchor tag.
                     
                    link.innerHTML += ` <span class="sr-only"> ir a ${resourceName}</span>`
                }
                
                if (!link.hasAttribute('aria-label')) {
                    link.setAttribute('aria-label', `Ir a ${resourceName}`)
                    link.title = `Ir a ${resourceName}`
                }
            }
            
            // Ensure external links open in new tab securely
            if (link.getAttribute('target') === '_blank') {
                link.setAttribute('rel', 'noopener noreferrer')
            }
        })
    }, [content])

    return (
        <div
            className="relative overflow-hidden transition-transform [transition-duration:0.4s]"
            style={{
                maxHeight: displayLargeText ? '100%' : maxHeight ?? '100%'
            }}
            ref={paragraphRef as LegacyRef<HTMLDivElement>}
            {...props}
        >
            <div
                className="text-gray-300 mb-4 whitespace-break-spaces [&_a]:text-blue-300 [&_a]:underline [&_a]:hover:text-blue-200"
                dangerouslySetInnerHTML={{ __html: content }}
            />
            {
                maxHeight != null && content.length > 40 && (
                    <div
                        className="bottom-0 left-0 w-full flex justify-center items-center"
                        style={{
                            position: !displayLargeText ? 'absolute' : 'relative'
                        }}
                    >
                        {!displayLargeText && <div className="absolute w-full h-16 bottom-0 z-10 [background:linear-gradient(0deg,_#171717_0%,_rgba(255,255,255,0)_100%)]"></div>}
                        <button
                            className="select-none absolute [text-shadow:0px_0px_20px_black] bottom-0 pb-2 pt-2 flex items-center z-40 gap-[0.1rem] text-blue-300 font-bold hover:underline"
                            onClick={handleOnClickToShowMore}
                            style={{
                                position: !displayLargeText ? 'absolute' : 'relative'
                            }}
                        >
                            {!displayLargeText && (
                                <>
                                    Mostrar mas
                                    <IconArrowDown className="pb-[0.1rem]" width={20} height={20} />
                                </>
                            )
                            }
                            {displayLargeText && (
                                <>
                                    Mostrar menos
                                    <IconArrowUp className="pb-[0.1rem]" width={20} height={20} />
                                </>
                            )
                            }
                        </button>
                    </div>
                )
            }
        </div>
    )
}