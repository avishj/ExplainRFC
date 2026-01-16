import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { RFC, StoryboardStep, SceneController } from "@/types";
import { NarrationPanel } from "./NarrationPanel";
import { InstrumentsPanel } from "./InstrumentsPanel";
import { SceneCanvas } from "./SceneCanvas";
import { Header } from "@/components/ui";

interface ExhibitPlayerProps {
  rfc: RFC;
  storyboard: StoryboardStep[];
}

export function ExhibitPlayer({ rfc, storyboard }: ExhibitPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstruments, setShowInstruments] = useState(true);
  const [sceneController, setSceneController] = useState<SceneController | null>(null);
  
  const step = storyboard[currentStep];
  const totalSteps = storyboard.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  const goToStep = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, totalSteps - 1));
    setCurrentStep(clampedIndex);
    setIsPlaying(false);
  }, [totalSteps]);
  
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, totalSteps, goToStep]);
  
  const prevStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);
  
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      nextStep();
    }, 4000); // 4 seconds per step
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, nextStep]);
  
  // Apply step to scene controller
  useEffect(() => {
    if (sceneController && step) {
      sceneController.apply(step);
    }
  }, [sceneController, step]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      } else if (e.key === "Escape") {
        setIsPlaying(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, prevStep]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentRFC={`RFC ${rfc.id} — ${rfc.shortTitle}`} />
      
      {/* Main content */}
      <main className="flex-1 pt-16 flex">
        {/* Narration Panel - Left */}
        <NarrationPanel
          step={step}
          currentStep={currentStep}
          totalSteps={totalSteps}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onPrev={prevStep}
          onNext={nextStep}
          onSeek={goToStep}
          progress={progress}
          rfc={rfc}
        />
        
        {/* Scene Canvas - Center */}
        <div className="flex-1 relative">
          <SceneCanvas
            rfcId={rfc.id}
            accentColors={rfc.accentColors}
            onControllerReady={setSceneController}
          />
          
          {/* Scene overlay with step title */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="metal-plate px-5 py-2.5 rounded-lg">
              <span className="font-mono text-sm text-brass">
                {step?.title}
              </span>
            </div>
          </div>
          
          {/* Toggle instruments button */}
          <button
            onClick={() => setShowInstruments(prev => !prev)}
            className={cn(
              "absolute top-4 right-4 p-2.5 rounded-lg",
              "metal-plate text-text-muted hover:text-gold transition-colors"
            )}
            aria-label={showInstruments ? "Hide instruments" : "Show instruments"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d={showInstruments ? "M15 3v18" : "M9 3v18"} />
            </svg>
          </button>
        </div>
        
        {/* Instruments Panel - Right */}
        {showInstruments && (
          <InstrumentsPanel
            step={step}
            accentColors={rfc.accentColors}
          />
        )}
      </main>
    </div>
  );
}
