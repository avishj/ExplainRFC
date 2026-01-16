import { useState } from "react";

interface RFC {
  id: number;
  name: string;
  title: string;
  year: number;
  layer: string;
  description: string;
  available: boolean;
}

interface VaultDrawersProps {
  onSelectRFC: (rfcId: number) => void;
}

const rfcs: RFC[] = [
  { id: 793, name: "TCP", title: "Transmission Control Protocol", year: 1981, layer: "Transport", description: "The foundation of reliable data delivery on the internet, ensuring packets arrive complete and in order.", available: true },
  { id: 791, name: "IP", title: "Internet Protocol", year: 1981, layer: "Network", description: "The addressing system that routes packets across networks to their destination.", available: false },
  { id: 1035, name: "DNS", title: "Domain Name System", year: 1987, layer: "Application", description: "Translates human-readable domain names into IP addresses.", available: false },
  { id: 8446, name: "TLS 1.3", title: "Transport Layer Security", year: 2018, layer: "Security", description: "Encrypts communications to keep your data private and authenticated.", available: false },
  { id: 7540, name: "HTTP/2", title: "Hypertext Transfer Protocol 2", year: 2015, layer: "Application", description: "Faster web loading through multiplexing and header compression.", available: false },
  { id: 9000, name: "QUIC", title: "UDP-Based Multiplexed Transport", year: 2021, layer: "Transport", description: "Next-gen transport combining the best of TCP and UDP with built-in encryption.", available: false },
  { id: 768, name: "UDP", title: "User Datagram Protocol", year: 1980, layer: "Transport", description: "Fast, connectionless messaging for real-time applications like gaming and video.", available: false },
  { id: 2616, name: "HTTP/1.1", title: "Hypertext Transfer Protocol", year: 1999, layer: "Application", description: "The protocol that powers the World Wide Web.", available: false },
  { id: 5321, name: "SMTP", title: "Simple Mail Transfer Protocol", year: 2008, layer: "Application", description: "How email gets delivered across the internet.", available: false },
];

type BookImage = "book_straight1.png" | "book_straight2.png" | "book_left1.png";

interface SpineConfig {
  x: number;
  y: number;
  rotation: number;
  fontSize: string;
  subFontSize: string;
}

interface BookPlacement {
  rfcIndex: number;
  image: BookImage;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  rotation: number;
  spine: SpineConfig;
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

export function VaultDrawers({ onSelectRFC }: VaultDrawersProps) {
  const [openBook, setOpenBook] = useState<number | null>(null);
  const [closingBook, setClosingBook] = useState<number | null>(null);
  const [hoveredBook, setHoveredBook] = useState<number | null>(null);
  
  const handleBookClick = (rfc: RFC) => {
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
    <section id="popular-specs" className="py-12 px-2 relative overflow-hidden">
      <div className="max-w-6xl mx-auto mb-16">
        <div className="text-center">
          <p className="museum-label text-amber mb-3">The Library</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-bright mb-4">
            Popular <span className="text-gold">Specifications</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Ancient tomes of protocol wisdom. Click a book to reveal its secrets.
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
            src="/table.png" 
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
              const rfc = rfcs[placement.rfcIndex];
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
                    transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
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
                      transform: isHovered ? `scale(${placement.scale * 1.03}) translateY(-5px)` : `scale(${placement.scale})`,
                      transition: "transform 0.3s ease-out",
                    }}
                  >
                    <img
                      src={`/${placement.image}`}
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
        const rfc = rfcs.find(r => r.id === (openBook || closingBook));
        if (!rfc) return null;
        
        return (
          <>
            {/* Backdrop */}
            <div 
              className={`fixed inset-0 ${closingBook ? 'animate-fadeOut' : 'animate-fadeIn'}`}
              onClick={() => !closingBook && handleCloseBook()}
              style={{ 
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(8px)",
                zIndex: 150,
              }}
            />
            
            {/* Book content */}
            <div
              className={`fixed inset-0 flex items-center justify-center p-4 ${closingBook ? 'animate-fadeOut' : 'animate-fadeIn'}`}
              style={{ 
                zIndex: 200,
                pointerEvents: closingBook ? "none" : "auto",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !closingBook) handleCloseBook();
              }}
            >
              <div
                className={`relative ${closingBook ? 'animate-bookClose' : 'animate-bookOpen'}`}
                style={{ perspective: "2000px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="flex"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateX(5deg)",
                  }}
                >
                  {/* Left page */}
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: "280px",
                      height: "360px",
                      background: "linear-gradient(135deg, #e8dcc8 0%, #f5ebe0 50%, #e0d4bc 100%)",
                      borderRadius: "4px 0 0 4px",
                      boxShadow: "-8px 8px 30px rgba(0,0,0,0.4), inset 2px 0 8px rgba(139,107,84,0.1)",
                      transform: "rotateY(20deg)",
                      transformOrigin: "right center",
                    }}
                  >
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-8"
                      style={{ background: "linear-gradient(to left, rgba(0,0,0,0.15), transparent)" }}
                    />
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
                  
                  {/* Spine */}
                  <div style={{ width: "20px", height: "360px", background: "linear-gradient(90deg, #5C1616 0%, #8B2323 50%, #5C1616 100%)", boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)" }} />
                  
                  {/* Right page */}
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: "280px",
                      height: "360px",
                      background: "linear-gradient(225deg, #f5ebe0 0%, #e8dcc8 50%, #ddd0b8 100%)",
                      borderRadius: "0 4px 4px 0",
                      boxShadow: "8px 8px 30px rgba(0,0,0,0.35), inset -2px 0 8px rgba(139,107,84,0.08)",
                      transform: "rotateY(-12deg)",
                      transformOrigin: "left center",
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-6" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.12), transparent)" }} />
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
                        <a
                          href={`/rfc/${rfc.id}`}
                          className="block w-full text-center py-3 rounded transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
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
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-6" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "#8b7355", letterSpacing: "0.1em" }}>
                  CLICK OUTSIDE TO CLOSE
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </section>
  );
}
