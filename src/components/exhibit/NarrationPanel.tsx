import { cn } from "@/lib/utils";
import type { RFC, StoryboardStep } from "@/types/rfc";
import { Icon } from "@/components/ui/Icon";

interface NarrationPanelProps {
  step: StoryboardStep;
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (index: number) => void;
  progress: number;
  rfc: RFC;
}

export function NarrationPanel({
  step,
  currentStep,
  totalSteps,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  progress,
  rfc,
}: NarrationPanelProps) {
  return (
    <aside className="w-80 lg:w-96 border-r border-border bg-deep/50 flex flex-col">
      {/* RFC Header */}
      <div className="p-6 border-b border-border">
        <a 
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-cyan transition-colors text-sm mb-4"
        >
          <Icon name="chevronLeft" size={16} />
          Back to Museum
        </a>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg"
            style={{ 
              background: `linear-gradient(135deg, ${rfc.accentColors[0]}, ${rfc.accentColors[1]})` 
            }}
          >
            {rfc.id}
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg text-text-primary">
              {rfc.shortTitle}
            </h1>
            <p className="text-sm text-text-secondary">{rfc.title}</p>
          </div>
        </div>
      </div>
      
      {/* Current Step */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4">
          <span className="font-mono text-xs text-text-muted">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <h2 className="font-display font-semibold text-xl text-text-primary mt-1">
            {step.title}
          </h2>
        </div>
        
        <p className="text-text-secondary leading-relaxed">
          {step.narration}
        </p>
        
        {/* Concepts/tips could go here */}
        {step.instruments?.glossary && (
          <div className="mt-6 p-4 rounded-lg bg-violet/10 border border-violet/20">
            <span className="text-xs font-mono text-violet mb-2 block">KEY TERMS</span>
            <ul className="space-y-1">
              {step.instruments.glossary.terms.map(term => (
                <li key={term} className="text-sm text-text-secondary">
                  {term}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-4 border-t border-border">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan to-violet transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => onSeek(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentStep 
                    ? "bg-cyan scale-125" 
                    : i < currentStep 
                      ? "bg-cyan/50" 
                      : "bg-surface hover:bg-border"
                )}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className={cn(
              "p-3 rounded-lg transition-colors",
              "text-text-secondary hover:text-text-primary hover:bg-white/5",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Previous step"
          >
            <Icon name="skipBack" size={20} />
          </button>
          
          <button
            onClick={onTogglePlay}
            className={cn(
              "p-4 rounded-full transition-all",
              "bg-cyan text-void hover:bg-cyan/90",
              "glow-cyan"
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <Icon name={isPlaying ? "pause" : "play"} size={24} />
          </button>
          
          <button
            onClick={onNext}
            disabled={currentStep === totalSteps - 1}
            className={cn(
              "p-3 rounded-lg transition-colors",
              "text-text-secondary hover:text-text-primary hover:bg-white/5",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Next step"
          >
            <Icon name="skipForward" size={20} />
          </button>
        </div>
        
        <p className="text-center text-xs text-text-muted mt-3">
          Press <kbd className="px-1.5 py-0.5 rounded bg-surface font-mono">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-surface font-mono">Space</kbd> to advance
        </p>
      </div>
    </aside>
  );
}
