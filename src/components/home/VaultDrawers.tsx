import { useState } from "react";
import type { CatalogRFC, BookImage, BookPlacement } from "@/types";
import { rfcCatalog } from "@/data";
import { TransitionCLI, TRANSITION_SEQUENCES } from "@/components/ui";

const featuredRFCIds = [793, 791, 1035, 8446, 7540, 9000, 768, 2616, 5321];
const featuredRFCs: CatalogRFC[] = featuredRFCIds
  .map(id => rfcCatalog.find(rfc => rfc.id === id))
  .filter((rfc): rfc is CatalogRFC => rfc !== undefined);

interface VaultDrawersProps {
  baseUrl?: string;
}

const bookPlacements: BookPlacement[] = [
  // Left stack - 3 books
  { 
    rfcIndex: 0, 
    image: "book_straight1.png", 
    x: 25, y: 32, 
    scale: 0.50, 
    zIndex: 3, 
    rotation: -2,
    spine: { x: 50, y: 72, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
  { 
    rfcIndex: 1, 
    image: "book_straight2.png", 
    x: 26, y: 44, 
    scale: 0.48, 
    zIndex: 2, 
    rotation: 1,
    spine: { x: 50, y: 70, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
  { 
    rfcIndex: 2, 
    image: "book_left1.png", 
    x: 26, y: 60, 
    scale: 0.46, 
    zIndex: 1, 
    rotation: 0,
    spine: { x: 68, y: 58, rotation: -11, fontSize: "1.75rem", subFontSize: "0.75rem" }
  },
  
  // Center stack - 3 books  
  { 
    rfcIndex: 3, 
    image: "book_left1.png", 
    x: 49, y: 34, 
    scale: 0.52, 
    zIndex: 3, 
    rotation: 3,
    spine: { x: 64, y: 58, rotation: -11, fontSize: "1.75rem", subFontSize: "0.75rem" }
  },
  { 
    rfcIndex: 4, 
    image: "book_straight1.png", 
    x: 51, y: 42, 
    scale: 0.48, 
    zIndex: 2, 
    rotation: -2,
    spine: { x: 50, y: 72, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
  { 
    rfcIndex: 5, 
    image: "book_straight2.png", 
    x: 48, y: 56, 
    scale: 0.46, 
    zIndex: 1, 
    rotation: -1,
    spine: { x: 50, y: 70, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
  
  // Right stack - 3 books
  { 
    rfcIndex: 6, 
    image: "book_straight2.png", 
    x: 75, y: 28, 
    scale: 0.50, 
    zIndex: 3, 
    rotation: 3,
    spine: { x: 56, y: 69, rotation: 0, fontSize: "2rem", subFontSize: "0.75rem" }
  },
  { 
    rfcIndex: 7, 
    image: "book_left1.png", 
    x: 73, y: 44, 
    scale: 0.49, 
    zIndex: 2, 
    rotation: 4,
    spine: { x: 65, y: 55, rotation: -11.5, fontSize: "1.5rem", subFontSize: "0.75rem" }
  },
  { 
    rfcIndex: 8, 
    image: "book_straight1.png", 
    x: 74, y: 54, 
    scale: 0.46, 
    zIndex: 1, 
    rotation: -2,
    spine: { x: 50, y: 72, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
];

const bookColors: Record<BookImage, { text: string; shadow: string }> = {
  "book_straight1.png": { text: "#d4af37", shadow: "rgba(0,0,0,0.9)" },
  "book_straight2.png": { text: "#c9a227", shadow: "rgba(0,0,0,0.9)" },
  "book_left1.png": { text: "#d4a44c", shadow: "rgba(0,0,0,0.9)" },
};

export function VaultDrawers({ baseUrl = '' }: VaultDrawersProps) {
  const [openBook, setOpenBook] = useState<number | null>(null);
  const [closingBook, setClosingBook] = useState<number | null>(null);
  const [hoveredBook, setHoveredBook] = useState<number | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<CatalogRFC | null>(null);
  
  const handleNavigateToRfc = (rfc: CatalogRFC) => {
    setNavigatingTo(rfc);
  };
  
  const handleTransitionComplete = () => {
    if (navigatingTo) {
      window.location.href = `${baseUrl}rfc/${navigatingTo.id}`;
    }
  };
  
  const handleBookClick = (rfc: CatalogRFC) => {
    if (openBook === rfc.id) {
      handleCloseBook();
    } else {
      setOpenBook(rfc.id);
    }
  };
  
  const handleCloseBook = () => {
    if (openBook) {
      setClosingBook(openBook);
      setOpenBook(null);
      setTimeout(() => setClosingBook(null), 600);
    }
  };
  
  return (
    <section id="popular-specs" className="py-8 px-2 relative overflow-hidden">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center">
          <p className="museum-label text-amber mb-3">The Library</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-bright mb-4">
            Popular <span className="text-gold">Specifications</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Curated protocol references, ready for study. Select a volume to open the exhibit.
          </p>
        </div>
      </div>
      
      {/* Table Scene */}
      <div className="max-w-6xl mx-auto relative">
        <div
          className="relative mx-auto"
          style={{
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          {/* Table image */}
          <img 
            src={`${baseUrl}table.jpg`} 
            alt="Antique wooden table"
            className="w-full h-auto"
            style={{ display: "block" }}
          />
          
          {/* Books container - positioned over table surface */}
          <div
            className="absolute inset-0"
            style={{
              top: "0%",
              left: "3%",
              right: "3%",
              bottom: "25%",
            }}
          >
            {bookPlacements.map((placement) => {
              const rfc = featuredRFCs[placement.rfcIndex];
              if (!rfc) return null;
              
              const colors = bookColors[placement.image];
              const isOpen = openBook === rfc.id;
              const isClosing = closingBook === rfc.id;
              const isHovered = hoveredBook === rfc.id;
              
              return (
                <div
                  key={rfc.id}
                  className="absolute"
                  style={{
                    left: `${placement.x}%`,
                    top: `${placement.y}%`,
                    zIndex: isHovered ? 100 : placement.zIndex,
                    transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scale(${placement.scale})`,
                    transition: "transform 0.3s ease-out, filter 0.3s ease-out",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => !isOpen && !isClosing && setHoveredBook(rfc.id)}
                  onMouseLeave={() => setHoveredBook(null)}
                  onClick={() => handleBookClick(rfc)}
                >
                  {/* Book image */}
                  <div
                    className="relative"
                    style={{
                      transform: isHovered ? `scale(1.03) translateY(-5px)` : undefined,
                      transition: "transform 0.3s ease-out",
                    }}
                  >
                    <img
                      src={`${baseUrl}${placement.image}`}
                      alt={`${rfc.name} - RFC ${rfc.id}`}
                      className="w-auto h-auto max-w-none"
                      style={{
                        width: "500px",
                        opacity: 1,
                      }}
                      draggable={false}
                    />
                    
                    {/* Text overlay on spine */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: `${placement.spine.x}%`,
                        top: `${placement.spine.y}%`,
                        transform: `translate(-50%, -50%) rotate(${placement.spine.rotation}deg)`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Cinzel', 'Trajan Pro', 'Palatino Linotype', 'Book Antiqua', Palatino, serif",
                          fontSize: placement.spine.fontSize,
                          fontWeight: 700,
                          color: colors.text,
                          textShadow: `1px 1px 2px ${colors.shadow}, 0 0 8px rgba(0,0,0,0.6)`,
                          letterSpacing: "0.15em",
                          lineHeight: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {rfc.name} <span style={{ opacity: 0.7 }}>|</span> RFC {rfc.id}
                      </div>
                    </div>
                    

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Open book overlay */}
      {(openBook || closingBook) && (() => {
        const rfc = featuredRFCs.find(r => r.id === (openBook || closingBook));
        if (!rfc) return null;
        const isClosing = !!closingBook;
        
        return (
          <>
            {/* Backdrop */}
            <div 
              className={`fixed inset-0 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
              onClick={() => !isClosing && handleCloseBook()}
              style={{ 
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(8px)",
                zIndex: 150,
              }}
            />
            
            {/* 3D Book Container */}
            <div
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ 
                zIndex: 200,
                perspective: "2000px",
                pointerEvents: isClosing ? "none" : "auto",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !isClosing) handleCloseBook();
              }}
            >
              {/* Book wrapper - handles the rise up animation */}
              <div
                className={isClosing ? 'book-rise-down' : 'book-rise-up'}
                style={{ transformStyle: "preserve-3d" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Book structure */}
                <div
                  className="relative"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateX(8deg)",
                  }}
                >
                  {/* Back cover (red, visible when book is closed) */}
                  <div
                    className="absolute"
                    style={{
                      width: "300px",
                      height: "380px",
                      background: "linear-gradient(135deg, #5C1616 0%, #8B2323 50%, #6a1a1a 100%)",
                      borderRadius: "4px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                      transform: "translateZ(-15px)",
                    }}
                  />
                  
                  {/* Pages block (cream colored, between covers) */}
                  <div
                    className="absolute"
                    style={{
                      width: "290px",
                      height: "370px",
                      left: "5px",
                      top: "5px",
                      background: "linear-gradient(90deg, #d4c4a8 0%, #e8dcc8 10%, #f5ebe0 50%, #e8dcc8 90%, #d4c4a8 100%)",
                      borderRadius: "2px 4px 4px 2px",
                      transform: "translateZ(-7px)",
                      boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Page lines */}
                    <div className="absolute right-0 top-2 bottom-2 w-1" style={{ 
                      background: "repeating-linear-gradient(to bottom, #c9b896 0px, #c9b896 1px, transparent 1px, transparent 3px)" 
                    }} />
                  </div>
                  
                  {/* Left page (revealed when book opens) */}
                  <div
                    className={`absolute ${isClosing ? 'page-close-left' : 'page-open-left'}`}
                    style={{
                      width: "280px",
                      height: "360px",
                      left: "10px",
                      top: "10px",
                      background: "linear-gradient(135deg, #f5ebe0 0%, #e8dcc8 100%)",
                      borderRadius: "2px",
                      transformOrigin: "right center",
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div className="relative p-8 h-full flex flex-col items-center justify-center text-center">
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "#8b6b54", letterSpacing: "0.25em" }}>
                        REQUEST FOR COMMENTS
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "4.5rem", fontWeight: "bold", color: "#3d2817", lineHeight: 1, textShadow: "2px 2px 0 rgba(139,107,84,0.1)" }}>
                        {rfc.id}
                      </div>
                      <div className="my-4" style={{ width: "100px", height: "2px", background: "linear-gradient(90deg, transparent, #8b6b54, transparent)" }} />
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: "600", color: "#4a3525", letterSpacing: "0.1em" }}>
                        {rfc.name}
                      </div>
                      <div className="mt-6" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#8b6b54", letterSpacing: "0.15em" }}>
                        ESTABLISHED {rfc.year}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right page (revealed when book opens) */}
                  <div
                    className={`absolute ${isClosing ? 'page-close-right' : 'page-open-right'}`}
                    style={{
                      width: "280px",
                      height: "360px",
                      right: "10px",
                      top: "10px",
                      background: "linear-gradient(225deg, #f5ebe0 0%, #e8dcc8 100%)",
                      borderRadius: "2px",
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <div className="relative p-8 h-full flex flex-col">
                      <div className="self-end mb-4 px-3 py-1 rounded" style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.15em", color: "#6b5040", background: "rgba(139,107,84,0.1)", border: "1px solid rgba(139,107,84,0.2)" }}>
                        {rfc.layer.toUpperCase()} LAYER
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: "bold", color: "#2d1810", lineHeight: 1.3, marginBottom: "0.5rem" }}>
                        {rfc.title}
                      </h3>
                      <div className="my-4" style={{ width: "60px", height: "1px", background: "#8b6b54" }} />
                      <p className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "#4a3828", lineHeight: 1.7 }}>
                        {rfc.description}
                      </p>
                      <div className="mt-auto pt-4">
                        <button
                          onClick={() => handleNavigateToRfc(rfc)}
                          className="block w-full text-center py-3 rounded transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.12em",
                            color: "#f5e6d3",
                            background: "linear-gradient(135deg, #8B2323 0%, #5C1616 100%)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                            border: "1px solid rgba(212,175,55,0.4)",
                          }}
                        >
                          OPEN EXHIBIT →
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Front cover - flips open */}
                  <div
                    className={`absolute ${isClosing ? 'cover-close' : 'cover-open'}`}
                    style={{
                      width: "300px",
                      height: "380px",
                      background: "linear-gradient(135deg, #8B2323 0%, #a52a2a 30%, #8B2323 70%, #5C1616 100%)",
                      borderRadius: "4px",
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                      boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Cover decoration */}
                    <div className="absolute inset-4 border border-amber-600/30 rounded" />
                    <div className="absolute inset-8 border border-amber-600/20 rounded" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.8rem", fontWeight: "700", color: "#d4af37", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", letterSpacing: "0.1em" }}>
                          RFC {rfc.id}
                        </div>
                        <div className="mt-2" style={{ width: "80px", height: "2px", background: "linear-gradient(90deg, transparent, #d4af37, transparent)", margin: "0 auto" }} />
                        <div className="mt-2" style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "#c9a227", letterSpacing: "0.15em" }}>
                          {rfc.name}
                        </div>
                      </div>
                    </div>
                    {/* Cover back side (visible when flipping) */}
                    <div 
                      className="absolute inset-0 rounded"
                      style={{ 
                        background: "linear-gradient(135deg, #e8dcc8 0%, #f5ebe0 100%)",
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }} 
                    />
                  </div>
                </div>
                
                <div className="text-center mt-8" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#8b7355", letterSpacing: "0.1em" }}>
                  CLICK OUTSIDE TO CLOSE
                </div>
              </div>
            </div>
          </>
        );
      })()}
      
      {navigatingTo && (
        <TransitionCLI
          sequence={TRANSITION_SEQUENCES.toRfc(navigatingTo.id, navigatingTo.name)}
          onComplete={handleTransitionComplete}
        />
      )}
    </section>
  );
}
