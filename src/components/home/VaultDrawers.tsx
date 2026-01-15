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

export function VaultDrawers({ onSelectRFC }: VaultDrawersProps) {
  const [openBook, setOpenBook] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  return (
    <section id="vault" className="py-24 px-6 relative">
      {/* Section header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center">
          <p className="museum-label text-amber mb-3">Popular Specifications</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-bright mb-4">
            Featured <span className="text-gold">RFCs</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Each RFC defines a piece of how the internet works. Select one to explore its inner workings through interactive visualizations.
          </p>
        </div>
      </div>
      
      {/* RFC Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {rfcs.map((rfc, index) => (
            <div
              key={rfc.id}
              className="relative"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Book card */}
              <div
                onMouseEnter={() => setHoveredCard(rfc.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => rfc.available && setOpenBook(openBook === rfc.id ? null : rfc.id)}
                className={`
                  relative cursor-pointer transition-all duration-500 ease-out
                  ${!rfc.available ? "opacity-50 cursor-not-allowed" : ""}
                  ${openBook === rfc.id ? "z-20" : "z-10"}
                `}
              >
                {/* Book cover */}
                <div 
                  className={`
                    relative p-5 rounded-lg transition-all duration-500
                    ${openBook === rfc.id 
                      ? "bg-gradient-to-br from-stone to-carbon border-gold glow-ember" 
                      : hoveredCard === rfc.id && rfc.available
                        ? "bg-gradient-to-br from-carbon to-stone border-brass"
                        : "bg-gradient-to-br from-void to-carbon border-carbon"
                    }
                    border
                  `}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: openBook === rfc.id 
                      ? "perspective(1000px) rotateY(-5deg)" 
                      : hoveredCard === rfc.id && rfc.available
                        ? "perspective(1000px) rotateY(-2deg) translateY(-4px)"
                        : "none",
                    boxShadow: openBook === rfc.id 
                      ? "8px 8px 20px rgba(0,0,0,0.5), inset -2px 0 4px rgba(255,170,0,0.1)"
                      : hoveredCard === rfc.id && rfc.available
                        ? "4px 4px 15px rgba(0,0,0,0.4)"
                        : "2px 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Spine effect */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{
                      background: openBook === rfc.id || (hoveredCard === rfc.id && rfc.available)
                        ? "linear-gradient(to right, #d4a44c, #8b7355)"
                        : "linear-gradient(to right, #1a1a1a, #0a0a0a)",
                    }}
                  />
                  
                  {/* RFC Number */}
                  <div className="flex items-start justify-between mb-3">
                    <span 
                      className={`
                        font-mono text-2xl font-bold
                        ${rfc.available ? "text-gold" : "text-text-muted"}
                      `}
                    >
                      {rfc.id}
                    </span>
                    <span className="museum-label text-patina">{rfc.year}</span>
                  </div>
                  
                  {/* Protocol name */}
                  <h3 className={`font-display text-lg font-semibold mb-1 ${rfc.available ? "text-text-bright" : "text-text-muted"}`}>
                    {rfc.name}
                  </h3>
                  
                  {/* Layer tag */}
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-carbon text-patina">
                    {rfc.layer}
                  </span>
                  
                  {!rfc.available && (
                    <span className="block mt-2 text-xs text-text-muted">Coming Soon</span>
                  )}
                </div>
                
                {/* Open book page (description) */}
                {openBook === rfc.id && rfc.available && (
                  <div 
                    className="
                      absolute top-0 left-full ml-1 w-64 p-5 rounded-r-lg
                      bg-gradient-to-r from-stone to-carbon
                      border border-l-0 border-patina/30
                      shadow-[4px_4px_20px_rgba(0,0,0,0.5)]
                      animate-settle
                    "
                    style={{
                      transformOrigin: "left center",
                    }}
                  >
                    {/* Page texture lines */}
                    <div className="absolute inset-4 opacity-5">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-px bg-brass mb-3" />
                      ))}
                    </div>
                    
                    <div className="relative">
                      <h4 className="font-display text-sm text-brass mb-2">{rfc.title}</h4>
                      <p className="text-sm text-text-secondary leading-relaxed mb-4">
                        {rfc.description}
                      </p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRFC(rfc.id);
                        }}
                        className="
                          w-full flex items-center justify-center gap-2
                          px-4 py-2.5 rounded
                          bg-gradient-to-r from-amber/20 to-ember/20
                          border border-amber/40
                          text-gold font-mono text-xs uppercase tracking-wider
                          hover:from-amber/30 hover:to-ember/30 hover:border-amber/60
                          transition-all duration-300
                        "
                      >
                        <span>View Visualization</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Click outside to close */}
      {openBook && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setOpenBook(null)}
        />
      )}
    </section>
  );
}
