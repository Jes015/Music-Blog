import { IconLoader2, IconMusic, IconSearch, IconStar } from "@tabler/icons-react";
import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";

type SearchResult = {
    id: string;
    title: string;
    plainTextContent: string;
    valor: boolean;
    favoriteSong: boolean;
    publishDate: number;
    pageNumber: number;
}

export const PostSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState<SearchResult[]>([]);
    const fuseRef = useRef<Fuse<SearchResult> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial check for context (SSR safe)
    const [isHighlightView, setIsHighlightView] = useState(false);
    const [isFavoriteView, setIsFavoriteView] = useState(false);

    useEffect(() => {
        setIsHighlightView(window.location.pathname.includes('/destacados'));
        setIsFavoriteView(window.location.pathname.includes('/canciones-favoritas'));
    }, []);

    const loadIndex = async () => {
        if (index.length > 0 || isLoading) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/posts.json');
            const data = await res.json();
            setIndex(data);
            
            fuseRef.current = new Fuse(data, {
                keys: [
                    { name: 'title', weight: 0.8 },
                    { name: 'plainTextContent', weight: 0.2 }
                ],
                threshold: 0.2, // Stricter matching (lower is stricter)
                minMatchCharLength: 3, // Prevent matching short, irrelevant noise
                ignoreLocation: true
            });
        } catch (e) {
            console.error("Failed to load search index", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!query || !fuseRef.current) {
            setResults([]);
            return;
        }

        let searchResults = fuseRef.current.search(query).map(result => result.item);

        if (isHighlightView) {
            searchResults = searchResults.filter(post => post.valor === true);
        } else if (isFavoriteView) {
            searchResults = searchResults.filter(post => post.favoriteSong === true);
        }

        setResults(searchResults.slice(0, 20)); 
    }, [query, isHighlightView, isFavoriteView, index]); 

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [])

    return (
        <div ref={containerRef} className="relative z-50">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-300
                ${isFocused 
                    ? 'w-64 bg-neutral-900 border-neutral-600 ring-1 ring-neutral-700' 
                    : 'w-32 bg-transparent border-neutral-800 hover:border-neutral-700'
                }`}
            >
                {isLoading ? (
                    <IconLoader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                ) : (
                    <IconSearch className="w-4 h-4 text-neutral-400" />
                )}
                
                <input 
                    ref={inputRef}
                    type="text" 
                    placeholder={isHighlightView ? "Search thoughts..." : isFavoriteView ? "Search songs..." : "Search posts..."}
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-neutral-500 w-full"
                    value={query}
                    onFocus={() => {
                        setIsFocused(true);
                        loadIndex();
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Results Dropdown */}
            {isFocused && query.length > 0 && (
                <div className="absolute top-full mt-2 left-0 w-72 bg-neutral-900 border border-neutral-800 rounded-md shadow-2xl max-h-[60vh] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                    {results.length > 0 ? (
                        <div className="py-1">
                            {results.map(post => (
                                <a 
                                    key={post.id}
                                    href={post.pageNumber === 1 ? `/#${post.id}` : `/${post.pageNumber}#${post.id}`}
                                    className="block px-4 py-3 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800/50 last:border-0"
                                    onClick={() => {
                                        setQuery("");
                                        setIsFocused(false);
                                    }}
                                >
                                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                        {post.valor && <IconStar className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                                        {post.favoriteSong && <IconMusic className="w-3 h-3 text-pink-400 shrink-0" />}
                                        {post.title}
                                    </h4>
                                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                                        {post.plainTextContent}
                                    </p>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                            {isLoading ? "Searching..." : "No results found."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
