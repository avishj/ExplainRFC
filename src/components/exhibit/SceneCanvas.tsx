import { useEffect, useRef, useState } from "react";
import type { SceneController } from "@/types";

interface SceneCanvasProps {
  rfcId: number;
  accentColors: [string, string];
  onControllerReady: (controller: SceneController) => void;
}

export function SceneCanvas({ rfcId, accentColors, onControllerReady }: SceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let controller: SceneController | null = null;
    
    async function initScene() {
      try {
        setLoading(true);
        setError(null);
        
        // Dynamically import the scene module based on RFC ID
        const scenePaths: Record<number, () => Promise<{ init: typeof import("@scenes/793-tcp/index.ts").init }>> = {
          793: () => import("@scenes/793-tcp/index.ts"),
          4271: () => import("@scenes/4271-bgp/index.ts"),
        };
        
        const loadScene = scenePaths[rfcId] || scenePaths[793];
        const sceneModule = await loadScene();
        
        if (!canvas) return;
        controller = await sceneModule.init(canvas, accentColors);
        if (controller) {
          onControllerReady(controller);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize scene:", err);
        setError("Failed to load visualization");
        setLoading(false);
      }
    }
    
    initScene();
    
    return () => {
      if (controller) {
        controller.dispose();
      }
    };
  }, [rfcId, accentColors, onControllerReady]);
  
  return (
    <div className="absolute inset-0 blueprint-grid">
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/90">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            <span className="text-text-secondary text-sm font-mono">Forging visualization...</span>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/90">
          <div className="text-center">
            <p className="text-ember mb-2">{error}</p>
            <p className="text-text-muted text-sm">The visualization will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}
