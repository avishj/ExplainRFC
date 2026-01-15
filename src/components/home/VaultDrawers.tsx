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
  { id: 4271, name: "BGP", title: "Border Gateway Protocol", year: 2006, layer: "Routing", description: "The routing protocol that holds the internet together.", available: false },
];

const bookColors = [
  { leather: "#4a1c1c", accent: "#8b4513", foil: "#d4a44c" },
  { leather: "#1a2f1a", accent: "#2d4a2d", foil: "#c9b037" },
  { leather: "#1a1a3a", accent: "#2d2d5a", foil: "#b4a7d6" },
  { leather: "#3a1a1a", accent: "#5a2d2d", foil: "#e6c87a" },
  { leather: "#2a1a0a", accent: "#4a3520", foil: "#d4af37" },
  { leather: "#0a1a2a", accent: "#1a3a5a", foil: "#87ceeb" },
  { leather: "#2a0a2a", accent: "#4a1a4a", foil: "#dda0dd" },
  { leather: "#1a1a1a", accent: "#2a2a2a", foil: "#c0c0c0" },
  { leather: "#3a2a1a", accent: "#5a4a3a", foil: "#ffd700" },
  { leather: "#1a2a2a", accent: "#2a4a4a", foil: "#40e0d0" },
];

export function VaultDrawers({ onSelectRFC }: VaultDrawersProps) {
  const [openBook, setOpenBook] = useState<number | null>(null);
  const [hoveredBook, setHoveredBook] = useState<number | null>(null);
  
  const handleBookClick = (rfc: RFC) => {
    if (!rfc.available) return;
    setOpenBook(openBook === rfc.id ? null : rfc.id);
  };
  
  return (
    <section id="popular-specs" className="py-24 px-6 relative overflow-hidden">
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
      
      {/* Bookshelf */}
      <div className="max-w-7xl mx-auto relative">
        {/* Shelf shadow behind books */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-8 rounded-b-lg"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))",
          }}
        />
        
        {/* Books container */}
        <div className="flex justify-center gap-3 flex-wrap pb-8">
          {rfcs.map((rfc, index) => {
            const colors = bookColors[index % bookColors.length];
            const isOpen = openBook === rfc.id;
            const isHovered = hoveredBook === rfc.id;
            
            return (
              <div
                key={rfc.id}
                className="relative"
                style={{ 
                  perspective: "1200px",
                  zIndex: isOpen ? 100 : 10 - index,
                }}
                onMouseEnter={() => setHoveredBook(rfc.id)}
                onMouseLeave={() => setHoveredBook(null)}
              >
                {/* Book container */}
                <div
                  onClick={() => handleBookClick(rfc)}
                  className={`
                    relative cursor-pointer transition-all duration-700
                    ${!rfc.available ? "opacity-60 cursor-not-allowed grayscale" : ""}
                  `}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isOpen 
                      ? "rotateY(-30deg) rotateX(10deg) translateZ(60px) translateY(-20px)" 
                      : isHovered && rfc.available
                        ? "translateY(-8px) rotateY(-5deg)"
                        : "translateY(0)",
                  }}
                >
                  {/* Book spine (visible when closed) */}
                  <div 
                    className="relative transition-all duration-700"
                    style={{
                      width: isOpen ? "180px" : "70px",
                      height: "220px",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Front cover / Spine face */}
                    <div
                      className="absolute inset-0 rounded-sm overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${colors.leather} 0%, ${colors.accent} 50%, ${colors.leather} 100%)`,
                        boxShadow: isHovered && rfc.available
                          ? `4px 4px 20px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.3), 0 0 15px ${colors.foil}40`
                          : "4px 4px 15px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)",
                        transform: isOpen ? "rotateY(0deg)" : "rotateY(0deg)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {/* Leather texture */}
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                      />
                      
                      {/* Spine decorations when closed */}
                      {!isOpen && (
                        <>
                          {/* Top ornament */}
                          <div 
                            className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-px"
                            style={{ background: colors.foil }}
                          />
                          <div 
                            className="absolute top-5 left-1/2 -translate-x-1/2 w-8 h-px"
                            style={{ background: colors.foil }}
                          />
                          
                          {/* RFC number - vertical */}
                          <div 
                            className="absolute top-12 left-1/2 -translate-x-1/2"
                            style={{
                              writingMode: "vertical-rl",
                              textOrientation: "mixed",
                              color: colors.foil,
                              fontFamily: "var(--font-display)",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                              letterSpacing: "0.1em",
                              textShadow: `0 0 10px ${colors.foil}60`,
                            }}
                          >
                            {rfc.id}
                          </div>
                          
                          {/* Protocol name - vertical */}
                          <div 
                            className="absolute bottom-16 left-1/2 -translate-x-1/2"
                            style={{
                              writingMode: "vertical-rl",
                              textOrientation: "mixed",
                              color: colors.foil,
                              fontFamily: "var(--font-display)",
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              letterSpacing: "0.15em",
                              opacity: 0.9,
                            }}
                          >
                            {rfc.name}
                          </div>
                          
                          {/* Bottom ornament */}
                          <div 
                            className="absolute bottom-5 left-1/2 -translate-x-1/2 w-8 h-px"
                            style={{ background: colors.foil }}
                          />
                          <div 
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-px"
                            style={{ background: colors.foil }}
                          />
                          
                          {/* Binding ridges */}
                          {[20, 40, 60, 80].map((pos) => (
                            <div
                              key={pos}
                              className="absolute left-0 right-0 h-1"
                              style={{
                                top: `${pos}%`,
                                background: `linear-gradient(to bottom, transparent, ${colors.accent}80, transparent)`,
                              }}
                            />
                          ))}
                        </>
                      )}
                      
                      {/* Open book: Left page (angled) */}
                      {isOpen && (
                        <div 
                          className="absolute inset-2 rounded-sm overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 50%, #dcc9a3 100%)",
                            boxShadow: "inset 2px 2px 8px rgba(139,69,19,0.2), inset -1px -1px 4px rgba(255,255,255,0.3)",
                            transform: "rotateY(-15deg) rotateZ(-2deg)",
                            transformOrigin: "right center",
                          }}
                        >
                          {/* Page lines */}
                          <div className="absolute inset-4 opacity-20">
                            {[...Array(12)].map((_, i) => (
                              <div 
                                key={i} 
                                className="h-px mb-3"
                                style={{ background: "#8b4513" }}
                              />
                            ))}
                          </div>
                          
                          {/* Decorative content on left page */}
                          <div className="relative p-4 h-full flex flex-col justify-between">
                            <div>
                              <div 
                                className="text-center mb-2"
                                style={{ 
                                  fontFamily: "var(--font-display)", 
                                  fontSize: "0.65rem",
                                  color: "#5a3d2b",
                                  letterSpacing: "0.2em",
                                }}
                              >
                                RFC SPECIFICATION
                              </div>
                              <div 
                                className="text-center"
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontSize: "2rem",
                                  fontWeight: "bold",
                                  color: "#3d2817",
                                }}
                              >
                                {rfc.id}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div 
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontSize: "0.7rem",
                                  color: "#6b4423",
                                  fontStyle: "italic",
                                }}
                              >
                                Est. {rfc.year}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right page (face down with content) - only when open */}
                    {isOpen && (
                      <div
                        className="absolute rounded-sm overflow-hidden"
                        style={{
                          width: "200px",
                          height: "220px",
                          left: "100%",
                          top: "0",
                          background: "linear-gradient(180deg, #faf6ed 0%, #f5e6d3 30%, #e8d5b7 100%)",
                          boxShadow: "4px 4px 20px rgba(0,0,0,0.3), inset -2px 0 8px rgba(139,69,19,0.1)",
                          transform: "rotateY(15deg) rotateX(-5deg)",
                          transformOrigin: "left center",
                          marginLeft: "-10px",
                        }}
                      >
                        {/* Page edge shadow */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-3"
                          style={{
                            background: "linear-gradient(to right, rgba(139,69,19,0.15), transparent)",
                          }}
                        />
                        
                        {/* Page content */}
                        <div className="relative p-5 h-full flex flex-col">
                          {/* Header */}
                          <div className="mb-3">
                            <div 
                              className="text-center mb-1"
                              style={{ 
                                fontFamily: "var(--font-mono)", 
                                fontSize: "0.6rem",
                                color: "#8b7355",
                                letterSpacing: "0.15em",
                              }}
                            >
                              {rfc.layer.toUpperCase()} LAYER
                            </div>
                            <h3 
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                color: "#2d1810",
                                textAlign: "center",
                                lineHeight: 1.2,
                              }}
                            >
                              {rfc.name}
                            </h3>
                            <div 
                              className="text-center mt-1"
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.7rem",
                                color: "#5a4030",
                                fontStyle: "italic",
                              }}
                            >
                              {rfc.title}
                            </div>
                          </div>
                          
                          {/* Divider */}
                          <div 
                            className="mx-auto mb-3"
                            style={{
                              width: "60px",
                              height: "1px",
                              background: "linear-gradient(90deg, transparent, #8b4513, transparent)",
                            }}
                          />
                          
                          {/* Description */}
                          <p 
                            className="flex-1"
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.75rem",
                              color: "#4a3828",
                              lineHeight: 1.6,
                              textAlign: "justify",
                            }}
                          >
                            {rfc.description}
                          </p>
                          
                          {/* Footer with link */}
                          <div className="mt-auto pt-3">
                            <div 
                              className="mx-auto mb-2"
                              style={{
                                width: "40px",
                                height: "1px",
                                background: "linear-gradient(90deg, transparent, #8b4513, transparent)",
                              }}
                            />
                            <a
                              href={`/rfc/${rfc.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="
                                block w-full text-center py-2 rounded
                                transition-all duration-300
                                hover:scale-105
                              "
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.65rem",
                                letterSpacing: "0.1em",
                                color: "#f5e6d3",
                                background: "linear-gradient(135deg, #4a1c1c 0%, #2d1810 100%)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                                border: "1px solid #8b4513",
                              }}
                            >
                              OPEN EXHIBIT →
                            </a>
                          </div>
                        </div>
                        
                        {/* Page curl effect */}
                        <div 
                          className="absolute bottom-0 right-0 w-8 h-8"
                          style={{
                            background: "linear-gradient(135deg, transparent 50%, rgba(139,69,19,0.1) 50%)",
                            borderRadius: "0 0 4px 0",
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Book spine edge (3D effect) */}
                    <div
                      className="absolute top-0 h-full"
                      style={{
                        width: "20px",
                        left: "-20px",
                        background: `linear-gradient(to right, ${colors.leather}cc, ${colors.accent})`,
                        transform: "rotateY(-90deg)",
                        transformOrigin: "right center",
                        boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
                      }}
                    />
                    
                    {/* Book pages edge (3D effect) */}
                    <div
                      className="absolute left-0 h-full overflow-hidden"
                      style={{
                        width: isOpen ? "40px" : "15px",
                        right: isOpen ? "-40px" : "-15px",
                        left: "auto",
                        background: "linear-gradient(to right, #e8d5b7 0%, #f5e6d3 50%, #dcc9a3 100%)",
                        transform: "rotateY(90deg)",
                        transformOrigin: "left center",
                        transition: "width 0.7s ease",
                      }}
                    >
                      {/* Page lines */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full"
                          style={{
                            height: "1px",
                            top: `${12 + i * 10}%`,
                            background: "rgba(139,69,19,0.1)",
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Book bottom */}
                    <div
                      className="absolute left-0 w-full"
                      style={{
                        height: "20px",
                        bottom: "-20px",
                        background: `linear-gradient(to bottom, ${colors.accent}, ${colors.leather})`,
                        transform: "rotateX(90deg)",
                        transformOrigin: "top center",
                      }}
                    />
                  </div>
                </div>
                
                {/* "Coming Soon" badge */}
                {!rfc.available && (
                  <div 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.5rem",
                      letterSpacing: "0.1em",
                      color: "#8b7355",
                      background: "#0a0a0a",
                      padding: "2px 8px",
                      borderRadius: "2px",
                      border: "1px solid #1a1a1a",
                    }}
                  >
                    COMING SOON
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Wooden shelf */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-4 rounded-b"
          style={{
            background: "linear-gradient(to bottom, #3d2817 0%, #2a1a0f 50%, #1a0f08 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,199,31,0.05)",
          }}
        />
      </div>
      
      {/* Click outside to close */}
      {openBook && (
        <div 
          className="fixed inset-0 z-50" 
          onClick={() => setOpenBook(null)}
          style={{ background: "rgba(0,0,0,0.3)" }}
        />
      )}
    </section>
  );
}
