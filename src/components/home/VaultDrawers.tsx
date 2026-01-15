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
  { leather: "#6b2c2c", spine: "#4a1c1c", foil: "#d4a44c" },
  { leather: "#2d4a2d", spine: "#1a2f1a", foil: "#c9b037" },
  { leather: "#3d3d6d", spine: "#1a1a3a", foil: "#b4a7d6" },
  { leather: "#5a3030", spine: "#3a1a1a", foil: "#e6c87a" },
  { leather: "#5a4520", spine: "#2a1a0a", foil: "#d4af37" },
  { leather: "#2a4a5a", spine: "#0a1a2a", foil: "#87ceeb" },
  { leather: "#4a2a4a", spine: "#2a0a2a", foil: "#dda0dd" },
  { leather: "#3a3a3a", spine: "#1a1a1a", foil: "#c0c0c0" },
  { leather: "#5a4a3a", spine: "#3a2a1a", foil: "#ffd700" },
  { leather: "#3a5a5a", spine: "#1a2a2a", foil: "#40e0d0" },
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
        {/* Books container */}
        <div className="flex justify-center gap-2 md:gap-3 flex-wrap pb-8 px-4">
          {rfcs.map((rfc, index) => {
            const colors = bookColors[index % bookColors.length];
            const isOpen = openBook === rfc.id;
            const isHovered = hoveredBook === rfc.id;
            
            return (
              <div
                key={rfc.id}
                className="relative"
                style={{ 
                  perspective: "1000px",
                  zIndex: isOpen ? 200 : hoveredBook === rfc.id ? 50 : 10,
                }}
                onMouseEnter={() => !isOpen && setHoveredBook(rfc.id)}
                onMouseLeave={() => setHoveredBook(null)}
              >
                {/* Closed book on shelf */}
                <div
                  onClick={() => handleBookClick(rfc)}
                  className={`
                    relative cursor-pointer transition-all duration-500 ease-out
                    ${!rfc.available ? "opacity-50 cursor-not-allowed" : ""}
                    ${isOpen ? "opacity-0 pointer-events-none" : ""}
                  `}
                  style={{
                    width: "65px",
                    height: "200px",
                    transformStyle: "preserve-3d",
                    transform: isHovered && rfc.available && !isOpen
                      ? "translateY(-12px) rotateY(-8deg)"
                      : "translateY(0) rotateY(0deg)",
                  }}
                >
                  {/* Book spine (front face) */}
                  <div
                    className="absolute inset-0 rounded-sm overflow-hidden"
                    style={{
                      background: `linear-gradient(90deg, ${colors.spine} 0%, ${colors.leather} 30%, ${colors.leather} 70%, ${colors.spine} 100%)`,
                      boxShadow: isHovered && rfc.available
                        ? `3px 3px 15px rgba(0,0,0,0.5), 0 0 20px ${colors.foil}30`
                        : "2px 2px 10px rgba(0,0,0,0.4)",
                    }}
                  >
                    {/* Leather grain texture */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                      }}
                    />
                    
                    {/* Binding ridges */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{ background: `linear-gradient(90deg, #000 0%, ${colors.spine} 100%)` }}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-0.5"
                      style={{ background: `linear-gradient(90deg, ${colors.leather} 0%, ${colors.spine}80 100%)` }}
                    />
                    
                    {/* Horizontal bands */}
                    {[15, 85].map((pos) => (
                      <div
                        key={pos}
                        className="absolute left-1 right-1"
                        style={{
                          top: `${pos}%`,
                          height: "6px",
                          background: `linear-gradient(180deg, ${colors.foil}40 0%, ${colors.foil} 50%, ${colors.foil}40 100%)`,
                          borderRadius: "1px",
                        }}
                      />
                    ))}
                    
                    {/* RFC number - vertical */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 top-1/4"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        color: colors.foil,
                        fontFamily: "var(--font-display)",
                        fontSize: "1.4rem",
                        fontWeight: "bold",
                        letterSpacing: "0.05em",
                        textShadow: `0 0 8px ${colors.foil}60, 0 1px 1px rgba(0,0,0,0.5)`,
                      }}
                    >
                      {rfc.id}
                    </div>
                    
                    {/* Protocol name - vertical */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 bottom-8"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        color: colors.foil,
                        fontFamily: "var(--font-display)",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        letterSpacing: "0.1em",
                        textShadow: `0 0 6px ${colors.foil}40`,
                      }}
                    >
                      {rfc.name}
                    </div>
                  </div>
                  
                  {/* Page edges (right side) */}
                  <div
                    className="absolute top-1 bottom-1 overflow-hidden rounded-r-sm"
                    style={{
                      width: "12px",
                      right: "-12px",
                      background: "linear-gradient(90deg, #d4c4a8 0%, #e8dcc8 30%, #f0e6d2 70%, #e0d4bc 100%)",
                      transform: "rotateY(90deg)",
                      transformOrigin: "left center",
                    }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full"
                        style={{
                          height: "1px",
                          top: `${15 + i * 13}%`,
                          background: "rgba(139,107,84,0.15)",
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* "Coming Soon" badge */}
                {!rfc.available && !isOpen && (
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.45rem",
                      letterSpacing: "0.08em",
                      color: "#8b7355",
                      background: "#0a0a0a",
                      padding: "2px 6px",
                      borderRadius: "2px",
                      border: "1px solid #1a1a1a",
                    }}
                  >
                    SOON
                  </div>
                )}
                
                {/* Open book overlay - positioned absolutely on screen */}
                {isOpen && rfc.available && (
                  <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ zIndex: 200 }}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setOpenBook(null);
                    }}
                  >
                    {/* Open book container */}
                    <div
                      className="relative"
                      style={{
                        perspective: "1500px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="flex"
                        style={{
                          transformStyle: "preserve-3d",
                          transform: "rotateX(8deg)",
                        }}
                      >
                        {/* Left page (angled up) */}
                        <div
                          className="relative overflow-hidden"
                          style={{
                            width: "280px",
                            height: "360px",
                            background: "linear-gradient(135deg, #e8dcc8 0%, #f5ebe0 50%, #e0d4bc 100%)",
                            borderRadius: "4px 0 0 4px",
                            boxShadow: "-8px 8px 30px rgba(0,0,0,0.4), inset 2px 0 8px rgba(139,107,84,0.1)",
                            transform: "rotateY(25deg)",
                            transformOrigin: "right center",
                          }}
                        >
                          {/* Page aging effect */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: "radial-gradient(ellipse at 10% 10%, rgba(139,107,84,0.15) 0%, transparent 50%)",
                            }}
                          />
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: "radial-gradient(ellipse at 90% 90%, rgba(139,107,84,0.1) 0%, transparent 40%)",
                            }}
                          />
                          
                          {/* Binding shadow */}
                          <div 
                            className="absolute right-0 top-0 bottom-0 w-8"
                            style={{
                              background: "linear-gradient(to left, rgba(0,0,0,0.15), transparent)",
                            }}
                          />
                          
                          {/* Content */}
                          <div className="relative p-8 h-full flex flex-col items-center justify-center text-center">
                            {/* Decorative header */}
                            <div 
                              className="mb-2"
                              style={{ 
                                fontFamily: "var(--font-mono)", 
                                fontSize: "0.55rem",
                                color: "#8b6b54",
                                letterSpacing: "0.25em",
                              }}
                            >
                              REQUEST FOR COMMENTS
                            </div>
                            
                            {/* RFC Number */}
                            <div 
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "4.5rem",
                                fontWeight: "bold",
                                color: "#3d2817",
                                lineHeight: 1,
                                textShadow: "2px 2px 0 rgba(139,107,84,0.1)",
                              }}
                            >
                              {rfc.id}
                            </div>
                            
                            {/* Decorative line */}
                            <div 
                              className="my-4"
                              style={{
                                width: "100px",
                                height: "2px",
                                background: "linear-gradient(90deg, transparent, #8b6b54, transparent)",
                              }}
                            />
                            
                            {/* Protocol name */}
                            <div 
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1.5rem",
                                fontWeight: "600",
                                color: "#4a3525",
                                letterSpacing: "0.1em",
                              }}
                            >
                              {rfc.name}
                            </div>
                            
                            {/* Year */}
                            <div 
                              className="mt-6"
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.7rem",
                                color: "#8b6b54",
                                letterSpacing: "0.15em",
                              }}
                            >
                              ESTABLISHED {rfc.year}
                            </div>
                            
                            {/* Decorative ornament */}
                            <div className="mt-6 flex items-center gap-2">
                              <div style={{ width: "20px", height: "1px", background: "#8b6b54" }} />
                              <div style={{ 
                                width: "8px", 
                                height: "8px", 
                                border: "1px solid #8b6b54",
                                transform: "rotate(45deg)",
                              }} />
                              <div style={{ width: "20px", height: "1px", background: "#8b6b54" }} />
                            </div>
                          </div>
                        </div>
                        
                        {/* Book spine/binding center */}
                        <div
                          style={{
                            width: "20px",
                            height: "360px",
                            background: `linear-gradient(90deg, ${colors.spine} 0%, ${colors.leather} 50%, ${colors.spine} 100%)`,
                            boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
                          }}
                        />
                        
                        {/* Right page (flat/angled down) */}
                        <div
                          className="relative overflow-hidden"
                          style={{
                            width: "280px",
                            height: "360px",
                            background: "linear-gradient(225deg, #f5ebe0 0%, #e8dcc8 50%, #ddd0b8 100%)",
                            borderRadius: "0 4px 4px 0",
                            boxShadow: "8px 8px 30px rgba(0,0,0,0.35), inset -2px 0 8px rgba(139,107,84,0.08)",
                            transform: "rotateY(-15deg) rotateX(-3deg)",
                            transformOrigin: "left center",
                          }}
                        >
                          {/* Binding shadow */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-6"
                            style={{
                              background: "linear-gradient(to right, rgba(0,0,0,0.12), transparent)",
                            }}
                          />
                          
                          {/* Content */}
                          <div className="relative p-8 h-full flex flex-col">
                            {/* Layer badge */}
                            <div 
                              className="self-end mb-4 px-3 py-1 rounded"
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.55rem",
                                letterSpacing: "0.15em",
                                color: "#6b5040",
                                background: "rgba(139,107,84,0.1)",
                                border: "1px solid rgba(139,107,84,0.2)",
                              }}
                            >
                              {rfc.layer.toUpperCase()} LAYER
                            </div>
                            
                            {/* Title */}
                            <h3 
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1.4rem",
                                fontWeight: "bold",
                                color: "#2d1810",
                                lineHeight: 1.3,
                                marginBottom: "0.5rem",
                              }}
                            >
                              {rfc.title}
                            </h3>
                            
                            {/* Divider */}
                            <div 
                              className="my-4"
                              style={{
                                width: "60px",
                                height: "1px",
                                background: "#8b6b54",
                              }}
                            />
                            
                            {/* Description */}
                            <p 
                              className="flex-1"
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "0.95rem",
                                color: "#4a3828",
                                lineHeight: 1.7,
                              }}
                            >
                              {rfc.description}
                            </p>
                            
                            {/* Footer */}
                            <div className="mt-auto pt-4">
                              {/* Decorative line */}
                              <div 
                                className="mb-4 mx-auto"
                                style={{
                                  width: "40px",
                                  height: "1px",
                                  background: "linear-gradient(90deg, transparent, #8b6b54, transparent)",
                                }}
                              />
                              
                              {/* Link to RFC page */}
                              <a
                                href={`/rfc/${rfc.id}`}
                                className="
                                  block w-full text-center py-3 rounded
                                  transition-all duration-300
                                  hover:scale-[1.02] hover:shadow-lg
                                "
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.7rem",
                                  letterSpacing: "0.12em",
                                  color: "#f5e6d3",
                                  background: `linear-gradient(135deg, ${colors.leather} 0%, ${colors.spine} 100%)`,
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                                  border: `1px solid ${colors.foil}60`,
                                }}
                              >
                                OPEN EXHIBIT →
                              </a>
                            </div>
                          </div>
                          
                          {/* Page curl hint */}
                          <div 
                            className="absolute bottom-0 right-0 w-12 h-12"
                            style={{
                              background: "linear-gradient(135deg, transparent 50%, rgba(139,107,84,0.08) 50%)",
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Close hint */}
                      <div 
                        className="text-center mt-6"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          color: "#8b7355",
                          letterSpacing: "0.1em",
                        }}
                      >
                        CLICK OUTSIDE TO CLOSE
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Wooden shelf */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-3 rounded-b"
          style={{
            background: "linear-gradient(to bottom, #4a3020 0%, #2a1a10 50%, #1a0f08 100%)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,100,0.05)",
          }}
        />
        
        {/* Shelf front edge */}
        <div 
          className="absolute -bottom-2 left-0 right-0 h-2"
          style={{
            background: "linear-gradient(to bottom, #3a2515 0%, #2a1a0f 100%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      
      {/* Background overlay when book is open */}
      {openBook && (
        <div 
          className="fixed inset-0" 
          onClick={() => setOpenBook(null)}
          style={{ 
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 150,
          }}
        />
      )}
    </section>
  );
}
