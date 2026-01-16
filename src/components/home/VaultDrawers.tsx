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

const bookPositions = [
  { x: -320, y: -80, rotation: -12, stackOrder: 3 },
  { x: -180, y: -60, rotation: 8, stackOrder: 2 },
  { x: -40, y: -90, rotation: -5, stackOrder: 4 },
  { x: 100, y: -70, rotation: 15, stackOrder: 1 },
  { x: 240, y: -85, rotation: -8, stackOrder: 5 },
  { x: -280, y: 40, rotation: 6, stackOrder: 7 },
  { x: -120, y: 50, rotation: -10, stackOrder: 6 },
  { x: 30, y: 35, rotation: 12, stackOrder: 8 },
  { x: 180, y: 55, rotation: -6, stackOrder: 9 },
  { x: 300, y: 30, rotation: 4, stackOrder: 10 },
];

export function VaultDrawers({ onSelectRFC }: VaultDrawersProps) {
  const [openBook, setOpenBook] = useState<number | null>(null);
  const [closingBook, setClosingBook] = useState<number | null>(null);
  const [hoveredBook, setHoveredBook] = useState<number | null>(null);
  
  const handleBookClick = (rfc: RFC) => {
    if (!rfc.available) return;
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
      
      {/* 3D Table Scene */}
      <div 
        className="max-w-5xl mx-auto relative"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 30%",
        }}
      >
        {/* Table surface with 3D tilt */}
        <div
          style={{
            transform: "rotateX(55deg)",
            transformStyle: "preserve-3d",
            position: "relative",
          }}
        >
          {/* Antique wooden table top */}
          <div
            style={{
              width: "100%",
              height: "400px",
              background: `
                linear-gradient(180deg, 
                  #3d2817 0%, 
                  #4a3020 15%,
                  #5a3d2a 50%,
                  #4a3020 85%,
                  #3d2817 100%
                )
              `,
              borderRadius: "8px",
              boxShadow: `
                inset 0 2px 20px rgba(0,0,0,0.3),
                inset 0 -5px 30px rgba(0,0,0,0.4),
                0 30px 60px rgba(0,0,0,0.5)
              `,
              position: "relative",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Wood grain texture */}
            <div 
              className="absolute inset-0 opacity-30 rounded-lg"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    rgba(0,0,0,0.03) 1px,
                    transparent 2px,
                    transparent 20px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    rgba(255,200,150,0.02) 2px,
                    transparent 4px,
                    transparent 40px
                  )
                `,
              }}
            />
            
            {/* Leather desk pad / blotter */}
            <div
              className="absolute rounded"
              style={{
                left: "10%",
                right: "10%",
                top: "15%",
                bottom: "15%",
                background: "linear-gradient(135deg, #1a1512 0%, #2a2018 50%, #1a1512 100%)",
                border: "2px solid #3a2a1a",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {/* Gold corner accents on blotter */}
              {[
                { top: "8px", left: "8px" },
                { top: "8px", right: "8px" },
                { bottom: "8px", left: "8px" },
                { bottom: "8px", right: "8px" },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    ...pos,
                    width: "30px",
                    height: "30px",
                    borderLeft: i % 2 === 0 ? "2px solid #8b7355" : "none",
                    borderRight: i % 2 === 1 ? "2px solid #8b7355" : "none",
                    borderTop: i < 2 ? "2px solid #8b7355" : "none",
                    borderBottom: i >= 2 ? "2px solid #8b7355" : "none",
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>

            {/* Books scattered on table */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              {rfcs.map((rfc, index) => {
                const colors = bookColors[index % bookColors.length];
                const pos = bookPositions[index];
                const isOpen = openBook === rfc.id;
                const isClosing = closingBook === rfc.id;
                const isHovered = hoveredBook === rfc.id;
                
                const bookWidth = 140;
                const bookHeight = 180;
                const bookDepth = 25;
                
                return (
                  <div
                    key={rfc.id}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      marginLeft: `${pos.x}px`,
                      marginTop: `${pos.y}px`,
                      zIndex: isOpen || isClosing ? 200 : isHovered ? 100 : pos.stackOrder,
                      transformStyle: "preserve-3d",
                    }}
                    onMouseEnter={() => !isOpen && !isClosing && setHoveredBook(rfc.id)}
                    onMouseLeave={() => setHoveredBook(null)}
                  >
                    {/* 3D Book lying flat on table */}
                    <div
                      onClick={() => handleBookClick(rfc)}
                      className="cursor-pointer"
                      style={{
                        width: `${bookWidth}px`,
                        height: `${bookHeight}px`,
                        transformStyle: "preserve-3d",
                        transform: `
                          rotateZ(${pos.rotation}deg)
                          translateZ(${bookDepth / 2}px)
                          ${isHovered && rfc.available ? "translateZ(20px) scale(1.05)" : ""}
                        `,
                        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        opacity: !rfc.available ? 0.6 : 1,
                        pointerEvents: isOpen || isClosing ? "none" : "auto",
                      }}
                    >
                      {/* Book cover (top face) */}
                      <div
                        className="absolute rounded-sm"
                        style={{
                          width: `${bookWidth}px`,
                          height: `${bookHeight}px`,
                          background: `linear-gradient(145deg, ${colors.leather} 0%, ${colors.spine} 100%)`,
                          transform: `translateZ(${bookDepth / 2}px)`,
                          boxShadow: isHovered && rfc.available
                            ? `0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${colors.foil}30`
                            : "0 4px 15px rgba(0,0,0,0.5)",
                          transition: "box-shadow 0.4s ease",
                        }}
                      >
                        {/* Leather texture */}
                        <div 
                          className="absolute inset-0 opacity-20 rounded-sm"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                          }}
                        />
                        
                        {/* Embossed border */}
                        <div 
                          className="absolute rounded-sm"
                          style={{
                            inset: "8px",
                            border: `1px solid ${colors.foil}40`,
                            borderRadius: "2px",
                          }}
                        />
                        
                        {/* Title area */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <div 
                            style={{
                              color: colors.foil,
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.6rem",
                              letterSpacing: "0.15em",
                              marginBottom: "8px",
                              textShadow: `0 0 10px ${colors.foil}50`,
                            }}
                          >
                            RFC
                          </div>
                          <div 
                            style={{
                              color: colors.foil,
                              fontFamily: "var(--font-display)",
                              fontSize: "2rem",
                              fontWeight: "bold",
                              lineHeight: 1,
                              textShadow: `0 2px 4px rgba(0,0,0,0.5), 0 0 15px ${colors.foil}40`,
                            }}
                          >
                            {rfc.id}
                          </div>
                          <div 
                            className="mt-3"
                            style={{
                              width: "50px",
                              height: "1px",
                              background: `linear-gradient(90deg, transparent, ${colors.foil}, transparent)`,
                            }}
                          />
                          <div 
                            className="mt-3"
                            style={{
                              color: colors.foil,
                              fontFamily: "var(--font-display)",
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              letterSpacing: "0.1em",
                              textShadow: `0 0 8px ${colors.foil}30`,
                            }}
                          >
                            {rfc.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Book spine (front edge when lying flat) */}
                      <div
                        className="absolute"
                        style={{
                          width: `${bookWidth}px`,
                          height: `${bookDepth}px`,
                          background: `linear-gradient(180deg, ${colors.spine} 0%, ${colors.leather} 50%, ${colors.spine} 100%)`,
                          transform: `rotateX(-90deg) translateZ(${bookHeight / 2}px) translateY(${bookDepth / 2}px)`,
                          boxShadow: "inset 0 2px 5px rgba(0,0,0,0.3)",
                        }}
                      >
                        {/* Spine ridges */}
                        {[20, 40, 60, 80].map(pct => (
                          <div 
                            key={pct}
                            className="absolute top-0 bottom-0"
                            style={{
                              left: `${pct}%`,
                              width: "1px",
                              background: "rgba(0,0,0,0.2)",
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Page edges (right side) */}
                      <div
                        className="absolute"
                        style={{
                          width: `${bookDepth}px`,
                          height: `${bookHeight - 8}px`,
                          top: "4px",
                          background: "linear-gradient(90deg, #d4c4a8 0%, #f0e6d2 50%, #e0d4bc 100%)",
                          transform: `rotateY(90deg) translateZ(${bookWidth / 2 - bookDepth / 2}px) translateX(${bookDepth / 2}px)`,
                        }}
                      >
                        {/* Page lines */}
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-full"
                            style={{
                              height: "1px",
                              top: `${12 + i * 11}%`,
                              background: "rgba(139,107,84,0.15)",
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Bottom cover (resting on table) */}
                      <div
                        className="absolute rounded-sm"
                        style={{
                          width: `${bookWidth}px`,
                          height: `${bookHeight}px`,
                          background: colors.spine,
                          transform: `translateZ(-${bookDepth / 2}px)`,
                        }}
                      />
                    </div>
                    
                    {/* "Coming Soon" badge */}
                    {!rfc.available && !isOpen && !isClosing && (
                      <div 
                        className="absolute whitespace-nowrap"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: `translateX(-50%) translateY(-50%) translateZ(40px) rotateZ(${-pos.rotation}deg)`,
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.5rem",
                          letterSpacing: "0.1em",
                          color: "#d4a44c",
                          background: "rgba(0,0,0,0.85)",
                          padding: "4px 10px",
                          borderRadius: "3px",
                          border: "1px solid #8b7355",
                        }}
                      >
                        COMING SOON
                      </div>
                    )}
                    
                    {/* Open book overlay */}
                    {(isOpen || isClosing) && rfc.available && (
                      <div
                        className={`fixed inset-0 flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
                        style={{ 
                          zIndex: 200,
                          pointerEvents: isClosing ? "none" : "auto",
                        }}
                        onClick={(e) => {
                          if (e.target === e.currentTarget && !isClosing) handleCloseBook();
                        }}
                      >
                        <div
                          className={`relative ${isClosing ? 'animate-bookClose' : 'animate-bookOpen'}`}
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
                            <div style={{ width: "20px", height: "360px", background: `linear-gradient(90deg, ${colors.spine} 0%, ${colors.leather} 50%, ${colors.spine} 100%)`, boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)" }} />
                            
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
                                      background: `linear-gradient(135deg, ${colors.leather} 0%, ${colors.spine} 100%)`,
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                                      border: `1px solid ${colors.foil}60`,
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Table front edge (visible due to perspective) */}
          <div
            style={{
              width: "100%",
              height: "40px",
              background: "linear-gradient(180deg, #2a1a10 0%, #1a0f08 100%)",
              transform: "rotateX(-90deg) translateZ(0px) translateY(20px)",
              transformOrigin: "top center",
              borderRadius: "0 0 4px 4px",
            }}
          />
        </div>
      </div>
      
      {/* Background overlay when book is open */}
      {(openBook || closingBook) && (
        <div 
          className={`fixed inset-0 ${closingBook ? 'animate-fadeOut' : 'animate-fadeIn'}`}
          onClick={() => !closingBook && handleCloseBook()}
          style={{ 
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 150,
          }}
        />
      )}
    </section>
  );
}
