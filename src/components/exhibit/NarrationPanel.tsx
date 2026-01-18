import { cn } from "@/lib/utils";
import type { RFC, StoryboardStep } from "@/types";

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
  baseUrl?: string;
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
  baseUrl = '',
}: NarrationPanelProps) {
  return (
    <aside className="w-80 lg:w-96 border-r border-carbon bg-void/80 backdrop-blur-sm flex flex-col">
      {/* RFC Header */}
      <div className="p-6 border-b border-carbon">
        <a 
          href={baseUrl || './'}
          className="inline-flex items-center gap-2 text-text-muted hover:text-gold transition-colors text-sm mb-4 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Exit to Museum
        </a>
        
        <div className="flex items-center gap-4">
          {/* RFC badge */}
          <div 
            className="
              w-14 h-14 rounded-lg flex items-center justify-center
              font-mono font-bold text-xl text-obsidian
              bg-gradient-to-br from-gold via-amber to-ember
              shadow-lg
            "
          >
            {rfc.id}
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-text-bright">
              {rfc.shortTitle}
            </h1>
            <p className="text-sm text-text-secondary">{rfc.title}</p>
          </div>
        </div>
      </div>
      
      {/* Current Step */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <span className="museum-label text-amber">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <h2 className="font-display font-semibold text-2xl text-text-bright mt-2">
            {step.title}
          </h2>
        </div>
        
        <div className="prose prose-invert prose-sm">
          <p className="text-text-secondary leading-relaxed text-base">
            {step.narration}
          </p>
        </div>
        
        {/* Key terms callout */}
        {step.instruments?.glossary && (
          <div className="mt-8 p-4 rounded-lg engraved">
            <span className="museum-label text-brass block mb-3">Key Terms</span>
            <ul className="space-y-2">
              {step.instruments.glossary.terms.map(term => (
                <li key={term} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                  <span className="text-text-primary font-medium">{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-6 border-t border-carbon">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1 bg-carbon rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-ember via-amber to-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step dots */}
          <div className="flex justify-between mt-3 px-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => onSeek(i)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  i === currentStep 
                    ? "bg-gold scale-125 glow-ember" 
                    : i < currentStep 
                      ? "bg-amber/60" 
                      : "bg-carbon hover:bg-patina"
                )}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className={cn(
              "p-3 rounded-lg transition-all",
              "text-text-secondary hover:text-gold hover:bg-carbon/50",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Previous step"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6v12M8 12l10 6V6z" />
            </svg>
          </button>
          
          <button
            onClick={onTogglePlay}
            className={cn(
              "p-4 rounded-full transition-all",
              "bg-gradient-to-br from-amber to-ember text-obsidian",
              "hover:from-gold hover:to-amber",
              "glow-molten"
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.5 5.5v13l11-6.5z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={onNext}
            disabled={currentStep === totalSteps - 1}
            className={cn(
              "p-3 rounded-lg transition-all",
              "text-text-secondary hover:text-gold hover:bg-carbon/50",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Next step"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 6v12M6 6l10 6-10 6z" />
            </svg>
          </button>
        </div>
        
        <p className="text-center text-xs text-text-muted mt-4">
          <kbd className="px-1.5 py-0.5 rounded bg-carbon font-mono text-patina">←</kbd> back · 
          <kbd className="px-1.5 py-0.5 rounded bg-carbon font-mono text-patina ml-1">→</kbd> or 
          <kbd className="px-1.5 py-0.5 rounded bg-carbon font-mono text-patina ml-1">Space</kbd> advance
        </p>
      </div>
    </aside>
  );
}
