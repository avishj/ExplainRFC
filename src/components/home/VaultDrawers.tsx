import { useState } from "react";

interface RFC {
  id: number;
  name: string;
  title: string;
  year: number;
  layer: string;
  status: string;
  available: boolean;
}

interface VaultDrawersProps {
  onSelectRFC: (rfcId: number) => void;
}

const rfcs: RFC[] = [
  { id: 793, name: "TCP", title: "Transmission Control Protocol", year: 1981, layer: "Transport", status: "Standard", available: true },
  { id: 791, name: "IP", title: "Internet Protocol", year: 1981, layer: "Network", status: "Standard", available: false },
  { id: 1035, name: "DNS", title: "Domain Name System", year: 1987, layer: "Application", status: "Standard", available: false },
  { id: 8446, name: "TLS 1.3", title: "Transport Layer Security", year: 2018, layer: "Security", status: "Standard", available: false },
  { id: 7540, name: "HTTP/2", title: "Hypertext Transfer Protocol 2", year: 2015, layer: "Application", status: "Standard", available: false },
  { id: 9000, name: "QUIC", title: "QUIC: UDP-Based Transport", year: 2021, layer: "Transport", status: "Standard", available: false },
];

export function VaultDrawers({ onSelectRFC }: VaultDrawersProps) {
  const [openDrawer, setOpenDrawer] = useState<number | null>(null);
  const [hoveredDrawer, setHoveredDrawer] = useState<number | null>(null);
  
  return (
    <section className="py-32 px-6 relative">
      {/* Section header */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex items-center gap-6 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-patina" />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-bright">
            The <span className="text-gold">Vault</span>
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-patina" />
        </div>
        <p className="text-center text-text-secondary max-w-2xl mx-auto">
          Each drawer contains a forged artifact — a protocol specification brought to life 
          through interactive visualization. Select a drawer to inspect its contents.
        </p>
      </div>
      
      {/* Drawer grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfcs.map((rfc, index) => (
            <div
              key={rfc.id}
              className="relative perspective-1000"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Drawer front */}
              <button
                onClick={() => setOpenDrawer(openDrawer === rfc.id ? null : rfc.id)}
                onMouseEnter={() => setHoveredDrawer(rfc.id)}
                onMouseLeave={() => setHoveredDrawer(null)}
                disabled={!rfc.available}
                className={`
                  relative w-full p-6 text-left
                  transition-all duration-500 ease-out
                  ${rfc.available 
                    ? "cursor-pointer" 
                    : "cursor-not-allowed opacity-40"
                  }
                  ${openDrawer === rfc.id 
                    ? "translate-y-2" 
                    : hoveredDrawer === rfc.id && rfc.available
                      ? "-translate-y-1"
                      : ""
                  }
                `}
              >
                {/* Drawer body */}
                <div 
                  className={`
                    metal-plate rounded-lg overflow-hidden
                    transition-all duration-300
                    ${hoveredDrawer === rfc.id && rfc.available ? "glow-ember" : ""}
                  `}
                >
                  {/* Handle */}
                  <div className="flex justify-center py-2">
                    <div 
                      className={`
                        w-16 h-2 rounded-full
                        bg-gradient-to-b from-brass to-patina
                        shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]
                        transition-all duration-300
                        ${hoveredDrawer === rfc.id && rfc.available ? "w-20 bg-gradient-to-b from-gold to-brass" : ""}
                      `}
                    />
                  </div>
                  
                  {/* Label plate */}
                  <div className="px-4 pb-4">
                    <div 
                      className="
                        p-4 rounded
                        bg-gradient-to-br from-stone to-void
                        border border-carbon
                        shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]
                      "
                    >
                      {/* RFC number stamp */}
                      <div className="flex items-start justify-between mb-3">
                        <span 
                          className={`
                            font-mono text-2xl font-bold stamped
                            ${rfc.available ? "text-gold" : "text-text-muted"}
                          `}
                        >
                          {rfc.id}
                        </span>
                        <span className="museum-label text-patina">
                          {rfc.year}
                        </span>
                      </div>
                      
                      {/* Protocol name */}
                      <h3 
                        className={`
                          font-display text-xl font-semibold mb-1
                          ${rfc.available ? "text-text-bright" : "text-text-muted"}
                        `}
                      >
                        {rfc.name}
                      </h3>
                      
                      {/* Full title */}
                      <p className="text-sm text-text-secondary mb-3 line-clamp-1">
                        {rfc.title}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-carbon text-patina">
                          {rfc.layer}
                        </span>
                        {!rfc.available && (
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-void text-text-muted border border-carbon">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Drawer shadow (3D effect) */}
                <div 
                  className={`
                    absolute -bottom-2 left-2 right-2 h-4
                    bg-gradient-to-b from-black/50 to-transparent
                    rounded-b-lg blur-sm
                    transition-all duration-300
                    ${openDrawer === rfc.id ? "opacity-0" : "opacity-100"}
                  `}
                />
              </button>
              
              {/* Expanded drawer content (specimen tray) */}
              {openDrawer === rfc.id && rfc.available && (
                <div 
                  className="
                    mt-2 p-6 rounded-lg
                    bg-gradient-to-br from-stone to-void
                    border border-patina/30
                    shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]
                    animate-settle
                  "
                >
                  {/* Specimen tray content */}
                  <div className="flex items-center gap-6">
                    {/* Mini visualization preview */}
                    <div 
                      className="
                        w-24 h-24 rounded-lg flex-shrink-0
                        bg-void border border-carbon
                        flex items-center justify-center
                        overflow-hidden
                      "
                    >
                      {/* Animated mini diagram */}
                      <div className="relative w-16 h-16">
                        <div className="absolute left-0 top-1/2 w-3 h-3 rounded-full bg-amber animate-pulse" />
                        <div className="absolute right-0 top-1/2 w-3 h-3 rounded-full bg-amber animate-pulse" style={{ animationDelay: "0.5s" }} />
                        <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-gradient-to-r from-ember via-gold to-ember" />
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary mb-4">
                        Explore the foundational protocol that ensures reliable, ordered delivery across the internet.
                      </p>
                      
                      <button
                        onClick={() => onSelectRFC(rfc.id)}
                        className="
                          group flex items-center gap-2
                          px-4 py-2 rounded
                          bg-gradient-to-r from-amber/20 to-ember/20
                          border border-amber/30
                          text-gold font-mono text-sm uppercase tracking-wider
                          hover:from-amber/30 hover:to-ember/30 hover:border-amber/50
                          transition-all duration-300
                        "
                      >
                        <span>View in Chamber</span>
                        <svg 
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative floor line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-carbon to-transparent" />
    </section>
  );
}
