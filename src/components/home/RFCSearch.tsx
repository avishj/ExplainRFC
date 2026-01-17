import { useState, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import type { CatalogRFC } from "@/types";
import { rfcCatalog } from "@/data";

const fuse = new Fuse(rfcCatalog, {
  keys: ["id", "name", "title", "layer"],
  threshold: 0.3,
  includeScore: true,
});

interface RFCSearchProps {
  onSelectRFC: (rfcId: number) => void;
}

export function RFCSearch({ onSelectRFC }: RFCSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogRFC[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (query.trim()) {
      const searchResults = fuse.search(query).map(r => r.item);
      setResults(searchResults.slice(0, 6));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTypingContext =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        !!target?.isContentEditable;

      if (isTypingContext) return;

      e.preventDefault();
      setIsOpen(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    };

    document.addEventListener("keydown", onGlobalKeyDown);
    return () => document.removeEventListener("keydown", onGlobalKeyDown);
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      const rfc = results[selectedIndex];
      if (rfc.available) {
        onSelectRFC(rfc.id);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };
  
  return (
    <div ref={containerRef} className="relative max-w-md mx-auto mb-8">
      {/* Search input */}
      <div 
        className={`
          relative flex items-center gap-3 px-4 py-3
          bg-gradient-to-r from-carbon to-stone
          border rounded-lg transition-all duration-300
          ${isOpen && query ? "border-amber glow-ember" : "border-patina/50 hover:border-brass"}
        `}
      >
        {/* Search icon */}
        <svg 
          className="w-5 h-5 text-patina" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search RFCs by number, name, or topic..."
          className="
            flex-1 bg-transparent text-text-primary placeholder-text-muted
            font-mono text-sm focus:outline-none
          "
        />
        
        {/* Keyboard hint */}
        {!isOpen && (
          <kbd className="hidden sm:block px-2 py-0.5 rounded bg-void text-text-muted text-xs font-mono border border-carbon">
            /
          </kbd>
        )}
        
        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-1 text-text-muted hover:text-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          className="
            absolute top-full left-0 right-0 mt-2 py-2
            bg-gradient-to-b from-carbon to-stone
            border border-patina/30 rounded-lg
            shadow-[0_10px_40px_rgba(0,0,0,0.5)]
            animate-settle z-50
          "
        >
          {results.map((rfc, index) => (
            <button
              key={rfc.id}
              onClick={() => rfc.available && onSelectRFC(rfc.id)}
              onMouseEnter={() => setSelectedIndex(index)}
              disabled={!rfc.available}
              className={`
                w-full flex items-center gap-4 px-4 py-3 text-left transition-all
                ${index === selectedIndex ? "bg-amber/10" : ""}
                ${!rfc.available ? "opacity-50 cursor-not-allowed" : "hover:bg-amber/10"}
              `}
            >
              {/* RFC number badge */}
              <span 
                className={`
                  w-12 text-center font-mono font-bold
                  ${index === selectedIndex && rfc.available ? "text-gold" : "text-brass"}
                `}
              >
                {rfc.id}
              </span>
              
              {/* Name and title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${rfc.available ? "text-text-bright" : "text-text-muted"}`}>
                    {rfc.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-void text-patina">
                    {rfc.layer}
                  </span>
                  {!rfc.available && (
                    <span className="text-xs text-text-muted">Soon</span>
                  )}
                </div>
                <span className="text-sm text-text-secondary truncate block">{rfc.title}</span>
              </div>
              
              {/* Arrow */}
              {rfc.available && index === selectedIndex && (
                <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* No results */}
      {isOpen && query && results.length === 0 && (
        <div 
          className="
            absolute top-full left-0 right-0 mt-2 p-6
            bg-gradient-to-b from-carbon to-stone
            border border-patina/30 rounded-lg text-center
            shadow-[0_10px_40px_rgba(0,0,0,0.5)]
          "
        >
          <p className="text-text-muted text-sm">No RFCs found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
