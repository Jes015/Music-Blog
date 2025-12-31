import { IconFilter, IconMusic, IconStar } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

export const PostFilter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "valor" | "favorite">("all");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // synchronizing state with URL
        if (window.location.pathname.includes('/destacados')) {
            setFilter('valor');
        } else if (window.location.pathname.includes('/canciones-favoritas')) {
            setFilter('favorite');
        } else {
            setFilter('all');
        }
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    return (
        <div className="relative z-10" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors
                    ${isOpen || filter !== 'all' 
                        ? 'bg-neutral-800 border-neutral-600 text-white' 
                        : 'bg-transparent border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
            >
                <IconFilter className="w-4 h-4" />
                <span>Filter</span>
                {filter !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-neutral-900 border border-neutral-800 shadow-xl z-50 ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="py-1">
                        <a
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors
                                ${filter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'}`}
                        >
                            All Posts
                        </a>
                        <a
                            href="/destacados"
                            onClick={() => setIsOpen(false)}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors
                                ${filter === 'valor' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-2">
                                <IconStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                Mis pensamientos
                            </span>
                        </a>
                        <a
                            href="/canciones-favoritas"
                            onClick={() => setIsOpen(false)}
                            className={`block w-full text-left px-4 py-2 text-sm transition-colors
                                ${filter === 'favorite' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-2">
                                <IconMusic className="w-4 h-4 text-pink-400" />
                                Canción Favorita
                            </span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};
