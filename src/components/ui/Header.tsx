import { cn } from "@/lib/utils";

interface HeaderProps {
  currentRFC?: string;
}

export function Header({ currentRFC }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="
          bg-obsidian/90 backdrop-blur-md
          border-b border-carbon
        "
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a 
            href="/" 
            className="flex items-center gap-3 text-text-primary hover:text-gold transition-colors group"
          >
            <div 
              className="
                w-9 h-9 rounded border border-brass
                flex items-center justify-center
                group-hover:border-gold group-hover:glow-ember
                transition-all duration-300
              "
            >
              <span className="font-mono font-bold text-gold text-sm">RF</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-semibold text-lg text-text-bright">
                Explain RFC
              </span>
            </div>
          </a>
          
          {/* Current RFC indicator */}
          {currentRFC && (
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
              <div 
                className="
                  px-4 py-1.5 rounded
                  bg-carbon/50 border border-patina/30
                "
              >
                <span className="font-mono text-sm text-brass">
                  {currentRFC}
                </span>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              className={cn(
                "font-mono text-xs uppercase tracking-wider",
                "text-text-muted hover:text-gold transition-colors"
              )}
            >
              ← Exit Exhibit
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
