import { useState } from "react";

interface CuratorDialProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function CuratorDial({ activeSection, onSectionChange }: CuratorDialProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sections = [
    { id: "exhibits", label: "Exhibits", angle: -60 },
    { id: "about", label: "About", angle: -20 },
    { id: "glossary", label: "Glossary", angle: 20 },
    { id: "submit", label: "Submit", angle: 60 },
  ];
  
  const activeIndex = sections.findIndex(s => s.id === activeSection);
  const rotationAngle = activeIndex >= 0 ? -sections[activeIndex].angle : 0;
  
  return (
    <div 
      className="fixed bottom-8 left-8 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main dial */}
      <div 
        className={`
          relative w-32 h-32 rounded-full
          bg-gradient-to-br from-carbon to-void
          border-2 border-patina
          shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)]
          transition-all duration-500 ease-out
          ${isHovered ? "scale-110 border-brass" : ""}
        `}
      >
        {/* Inner ring */}
        <div className="absolute inset-3 rounded-full border border-stone" />
        
        {/* Dial notches */}
        {sections.map((section, i) => {
          const isActive = section.id === activeSection;
          const angle = (section.angle * Math.PI) / 180;
          const radius = 52;
          const x = Math.cos(angle - Math.PI / 2) * radius + 64;
          const y = Math.sin(angle - Math.PI / 2) * radius + 64;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`
                absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2
                rounded-full transition-all duration-300
                ${isActive 
                  ? "bg-amber glow-ember scale-125" 
                  : "bg-patina hover:bg-brass hover:scale-110"
                }
              `}
              style={{ left: x, top: y }}
              aria-label={section.label}
            />
          );
        })}
        
        {/* Center knob */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, #3a3a3a 0%, #1a1a1a 50%, #0a0a0a 100%)",
            boxShadow: "inset 0 2px 4px rgba(255,199,31,0.1), 0 4px 8px rgba(0,0,0,0.5)",
          }}
        >
          {/* Indicator line */}
          <div 
            className="absolute top-1 left-1/2 w-0.5 h-4 bg-gradient-to-b from-amber to-transparent -translate-x-1/2 rounded-full transition-transform duration-500"
            style={{ transform: `translateX(-50%) rotate(${rotationAngle}deg)`, transformOrigin: "bottom center" }}
          />
        </div>
        
        {/* Active section label */}
        <div 
          className={`
            absolute -right-24 top-1/2 -translate-y-1/2
            font-mono text-xs uppercase tracking-widest
            transition-all duration-300
            ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
          `}
        >
          <span className="text-text-muted">Active:</span>
          <span className="block text-amber mt-1">{sections[activeIndex]?.label || "—"}</span>
        </div>
      </div>
      
      {/* Section labels (appear on hover) */}
      <div 
        className={`
          absolute -top-4 left-0 right-0 flex justify-center gap-8
          transition-all duration-500
          ${isHovered ? "opacity-100 -translate-y-4" : "opacity-0 translate-y-0 pointer-events-none"}
        `}
      >
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`
              font-mono text-xs uppercase tracking-wider
              transition-colors duration-200
              ${section.id === activeSection ? "text-gold" : "text-text-muted hover:text-text-secondary"}
            `}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
