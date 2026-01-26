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
    image: "book_straight1.webp", 
    x: 25, y: 32, 
    scale: 0.50, 
    zIndex: 3, 
    rotation: -2,
    spine: { x: 50, y: 72, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
  { 
    rfcIndex: 1, 
    image: "book_straight2.webp", 
    x: 26, y: 44, 
    scale: 0.48, 
    zIndex: 2, 
    rotation: 1,
    spine: { x: 50, y: 70, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
  { 
    rfcIndex: 2, 
    image: "book_left1.webp", 
    x: 26, y: 60, 
    scale: 0.46, 
    zIndex: 1, 
    rotation: 0,
    spine: { x: 68, y: 58, rotation: -11, fontSize: "1.75rem", subFontSize: "0.75rem" }
  },
  
  // Center stack - 3 books  
  { 
    rfcIndex: 3, 
    image: "book_left1.webp", 
    x: 49, y: 34, 
    scale: 0.52, 
    zIndex: 3, 
    rotation: 3,
    spine: { x: 64, y: 58, rotation: -11, fontSize: "1.75rem", subFontSize: "0.75rem" }
  },
  { 
    rfcIndex: 4, 
    image: "book_straight1.webp", 
    x: 51, y: 42, 
    scale: 0.48, 
    zIndex: 2, 
    rotation: -2,
    spine: { x: 50, y: 72, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
  { 
    rfcIndex: 5, 
    image: "book_straight2.webp", 
    x: 48, y: 56, 
    scale: 0.46, 
    zIndex: 1, 
    rotation: -1,
    spine: { x: 50, y: 70, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
  
  // Right stack - 3 books
  { 
    rfcIndex: 6, 
    image: "book_straight2.webp", 
    x: 75, y: 28, 
    scale: 0.50, 
    zIndex: 3, 
    rotation: 3,
    spine: { x: 56, y: 69, rotation: 0, fontSize: "2rem", subFontSize: "0.75rem" }
  },
  { 
    rfcIndex: 7, 
    image: "book_left1.webp", 
    x: 73, y: 44, 
    scale: 0.49, 
    zIndex: 2, 
    rotation: 4,
    spine: { x: 65, y: 55, rotation: -11.5, fontSize: "1.5rem", subFontSize: "0.75rem" }
  },
  { 
    rfcIndex: 8, 
    image: "book_straight1.webp", 
    x: 74, y: 54, 
    scale: 0.46, 
    zIndex: 1, 
    rotation: -2,
    spine: { x: 50, y: 72, rotation: 0, fontSize: "2rem", subFontSize: "1rem" }
  },
];

const bookColors: Record<BookImage, { text: string; shadow: string }> = {
  "book_straight1.webp": { text: "#d4af37", shadow: "rgba(0,0,0,0.9)" },
  "book_straight2.webp": { text: "#c9a227", shadow: "rgba(0,0,0,0.9)" },
  "book_left1.webp": { text: "#d4a44c", shadow: "rgba(0,0,0,0.9)" },
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
            src={`${baseUrl}table.webp`} 
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
        
        const pageWidth = 260;
        const pageHeight = 340;
        const spineWidth = 30;
        
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
                perspective: "1800px",
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
                {/* Book structure - centered spine with covers opening outward */}
                <div
                  className="relative"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateX(5deg)",
                  }}
                >
                  {/* Center spine */}
                  <div
                    style={{
                      position: "absolute",
                      width: `${spineWidth}px`,
                      height: `${pageHeight}px`,
                      left: "50%",
                      top: "0",
                      transform: "translateX(-50%) translateZ(-5px)",
                      background: "linear-gradient(90deg, #5C1616 0%, #8B2323 50%, #5C1616 100%)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    }}
                  />
                  
                  {/* Left cover - opens outward to the left */}
                  <div
                    className={isClosing ? 'cover-close-left' : 'cover-open-left'}
                    style={{
                      position: "absolute",
                      width: `${pageWidth}px`,
                      height: `${pageHeight}px`,
                      right: "50%",
                      top: "0",
                      transformOrigin: "right center",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Cover outer face */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(135deg, #8B2323 0%, #a52a2a 30%, #8B2323 70%, #5C1616 100%)",
                        boxShadow: "-2px 0 15px rgba(0,0,0,0.3)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <div className="absolute inset-3 border border-amber-600/30" />
                      <div className="absolute inset-6 border border-amber-600/20" />
                    </div>
                    {/* Cover inner face */}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        background: "linear-gradient(135deg, #e8dcc8 0%, #f5ebe0 100%)",
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }} 
                    />
                  </div>
                  
                  {/* Right cover - opens outward to the right */}
                  <div
                    className={isClosing ? 'cover-close-right' : 'cover-open-right'}
                    style={{
                      position: "absolute",
                      width: `${pageWidth}px`,
                      height: `${pageHeight}px`,
                      left: "50%",
                      top: "0",
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Cover outer face */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(225deg, #8B2323 0%, #a52a2a 30%, #8B2323 70%, #5C1616 100%)",
                        boxShadow: "2px 0 15px rgba(0,0,0,0.3)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <div className="absolute inset-3 border border-amber-600/30" />
                      <div className="absolute inset-6 border border-amber-600/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.6rem", fontWeight: "700", color: "#d4af37", textShadow: "2px 2px 4px rgba(0,0,0,0.5)", letterSpacing: "0.1em" }}>
                            RFC {rfc.id}
                          </div>
                          <div className="mt-2" style={{ width: "70px", height: "2px", background: "linear-gradient(90deg, transparent, #d4af37, transparent)", margin: "0 auto" }} />
                          <div className="mt-2" style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", color: "#c9a227", letterSpacing: "0.15em" }}>
                            {rfc.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Cover inner face */}
                    <div 
                      className="absolute inset-0"
                      style={{ 
                        background: "linear-gradient(225deg, #e8dcc8 0%, #f5ebe0 100%)",
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }} 
                    />
                  </div>
                  
                  {/* Interior page flipping left - page 1 */}
                  <div
                    className={isClosing ? 'page-unflip-left-1' : 'page-flip-left-1'}
                    style={{
                      position: "absolute",
                      width: `${pageWidth - 10}px`,
                      height: `${pageHeight - 10}px`,
                      right: "50%",
                      top: "5px",
                      transformOrigin: "right center",
                      transformStyle: "preserve-3d",
                      background: "linear-gradient(90deg, #f5ebe0 0%, #e8dcc8 100%)",
                      boxShadow: "-1px 0 3px rgba(0,0,0,0.1)",
                    }}
                  />
                  
                  {/* Interior page flipping left - page 2 */}
                  <div
                    className={isClosing ? 'page-unflip-left-2' : 'page-flip-left-2'}
                    style={{
                      position: "absolute",
                      width: `${pageWidth - 15}px`,
                      height: `${pageHeight - 10}px`,
                      right: "50%",
                      top: "5px",
                      transformOrigin: "right center",
                      transformStyle: "preserve-3d",
                      background: "linear-gradient(90deg, #f0e6d5 0%, #e5d9c5 100%)",
                      boxShadow: "-1px 0 3px rgba(0,0,0,0.1)",
                    }}
                  />
                  
                  {/* Interior page flipping right - page 1 */}
                  <div
                    className={isClosing ? 'page-unflip-right-1' : 'page-flip-right-1'}
                    style={{
                      position: "absolute",
                      width: `${pageWidth - 10}px`,
                      height: `${pageHeight - 10}px`,
                      left: "50%",
                      top: "5px",
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                      background: "linear-gradient(270deg, #f5ebe0 0%, #e8dcc8 100%)",
                      boxShadow: "1px 0 3px rgba(0,0,0,0.1)",
                    }}
                  />
                  
                  {/* Interior page flipping right - page 2 */}
                  <div
                    className={isClosing ? 'page-unflip-right-2' : 'page-flip-right-2'}
                    style={{
                      position: "absolute",
                      width: `${pageWidth - 15}px`,
                      height: `${pageHeight - 10}px`,
                      left: "50%",
                      top: "5px",
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                      background: "linear-gradient(270deg, #f0e6d5 0%, #e5d9c5 100%)",
                      boxShadow: "1px 0 3px rgba(0,0,0,0.1)",
                    }}
                  />
                  
                  {/* Left content page (final resting position with content) */}
                  <div
                    className={isClosing ? 'content-page-close-left' : 'content-page-left'}
                    style={{
                      position: "absolute",
                      width: `${pageWidth - 20}px`,
                      height: `${pageHeight - 20}px`,
                      right: `calc(50% + 5px)`,
                      top: "10px",
                      transformOrigin: "right center",
                      transformStyle: "preserve-3d",
                      background: "linear-gradient(135deg, #f5ebe0 0%, #e8dcc8 100%)",
                      boxShadow: "-2px 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div className="relative p-6 h-full flex flex-col items-center justify-center text-center">
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "#8b6b54", letterSpacing: "0.25em" }}>
                        REQUEST FOR COMMENTS
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", fontWeight: "bold", color: "#3d2817", lineHeight: 1, textShadow: "2px 2px 0 rgba(139,107,84,0.1)" }}>
                        {rfc.id}
                      </div>
                      <div className="my-3" style={{ width: "80px", height: "2px", background: "linear-gradient(90deg, transparent, #8b6b54, transparent)" }} />
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: "600", color: "#4a3525", letterSpacing: "0.1em" }}>
                        {rfc.name}
                      </div>
                      <div className="mt-4" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#8b6b54", letterSpacing: "0.15em" }}>
                        ESTABLISHED {rfc.year}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right content page (final resting position with content) */}
                  <div
                    className={isClosing ? 'content-page-close-right' : 'content-page-right'}
                    style={{
                      position: "absolute",
                      width: `${pageWidth - 20}px`,
                      height: `${pageHeight - 20}px`,
                      left: `calc(50% + 5px)`,
                      top: "10px",
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                      background: "linear-gradient(225deg, #f5ebe0 0%, #e8dcc8 100%)",
                      boxShadow: "2px 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div className="relative p-5 h-full flex flex-col">
                      <div className="self-end mb-3 px-2 py-1 rounded" style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.15em", color: "#6b5040", background: "rgba(139,107,84,0.1)", border: "1px solid rgba(139,107,84,0.2)" }}>
                        {rfc.layer.toUpperCase()} LAYER
                      </div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: "bold", color: "#2d1810", lineHeight: 1.3, marginBottom: "0.4rem" }}>
                        {rfc.title}
                      </h3>
                      <div className="my-3" style={{ width: "50px", height: "1px", background: "#8b6b54" }} />
                      <p className="flex-1" style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#4a3828", lineHeight: 1.6 }}>
                        {rfc.description}
                      </p>
                      <div className="mt-auto pt-3">
                        <button
                          onClick={() => handleNavigateToRfc(rfc)}
                          className="block w-full text-center py-2.5 rounded transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6rem",
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
