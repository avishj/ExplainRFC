import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface HeaderProps {
  currentRFC?: string;
}

export function Header({ currentRFC }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <a 
            href="/" 
            className="flex items-center gap-3 text-text-primary hover:text-cyan transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-violet flex items-center justify-center">
              <span className="font-mono font-bold text-void text-sm">RF</span>
            </div>
            <span className="font-display font-semibold text-lg hidden sm:block">
              Explain RFC
            </span>
          </a>
          
          {/* Current RFC indicator */}
          {currentRFC && (
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
              <span className="font-mono text-sm text-text-secondary">
                {currentRFC}
              </span>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "p-2 rounded-lg text-text-secondary hover:text-text-primary",
                "hover:bg-white/5 transition-colors"
              )}
              aria-label="Search"
            >
              <Icon name="search" size={20} />
            </button>
            <button
              className={cn(
                "p-2 rounded-lg text-text-secondary hover:text-text-primary",
                "hover:bg-white/5 transition-colors"
              )}
              aria-label="Toggle theme"
            >
              <Icon name="moon" size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
