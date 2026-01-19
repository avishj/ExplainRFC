import { useEffect, useState, useRef } from "react";

export interface TransitionLine {
  text: string;
  typingSpeed: number;
  postDelay: number;
  isProgressBar?: boolean;
}

interface TransitionCLIProps {
  sequence: TransitionLine[];
  onComplete: () => void;
  initialDelay?: number;
}

export function TransitionCLI({ 
  sequence, 
  onComplete, 
  initialDelay = 200 
}: TransitionCLIProps) {
  const [lines, setLines] = useState<{ text: string; complete: boolean }[]>([]);
  const [showInitialCursor, setShowInitialCursor] = useState(true);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    interface BootState {
      phase: 'initial-wait' | 'typing' | 'post-delay' | 'progress-bar' | 'final-wait' | 'done';
      lineIdx: number;
      charIdx: number;
      progressStep: number;
      elapsed: number;
      nextCharTime: number;
      charTimings: number[];
    }

    const generateCharTimings = (text: string, baseSpeed: number): number[] => {
      return text.split("").map((char, i) => {
        let delay = baseSpeed;
        if (char === ' ') delay *= 0.3;
        else if (char === '>' || char === '[' || char === ']') delay *= 0.5;
        else if (char === '─' || char === '►' || char === '◄') delay *= 0.15;
        else delay += (Math.random() - 0.5) * baseSpeed * 1.2;
        if (i > 0 && i % (5 + Math.floor(Math.random() * 4)) === 0) {
          delay += 30 + Math.random() * 50;
        }
        return Math.max(5, delay);
      });
    };

    const state: BootState = {
      phase: 'initial-wait',
      lineIdx: 0,
      charIdx: 0,
      progressStep: 0,
      elapsed: 0,
      nextCharTime: 0,
      charTimings: [],
    };

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      state.elapsed += dt;

      switch (state.phase) {
        case 'initial-wait':
          if (state.elapsed >= initialDelay) {
            setShowInitialCursor(false);
            state.elapsed = 0;
            state.phase = 'typing';
            const line = sequence[state.lineIdx];
            if (line.isProgressBar) {
              setLines(prev => [...prev, { text: "  [                    ] 0%", complete: false }]);
              state.phase = 'progress-bar';
            } else {
              setLines(prev => [...prev, { text: "", complete: false }]);
              state.charTimings = generateCharTimings(line.text, line.typingSpeed);
              state.nextCharTime = state.charTimings[0] || 0;
            }
          }
          break;

        case 'typing': {
          const line = sequence[state.lineIdx];
          while (state.elapsed >= state.nextCharTime && state.charIdx < line.text.length) {
            state.charIdx++;
            const visibleText = line.text.slice(0, state.charIdx);
            setLines(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { text: visibleText, complete: false };
              return updated;
            });
            if (state.charIdx < line.text.length) {
              state.nextCharTime += state.charTimings[state.charIdx];
            }
          }
          if (state.charIdx >= line.text.length) {
            setLines(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], complete: true };
              return updated;
            });
            state.elapsed = 0;
            state.phase = 'post-delay';
          }
          break;
        }

        case 'post-delay': {
          const line = sequence[state.lineIdx];
          if (state.elapsed >= line.postDelay) {
            state.lineIdx++;
            state.charIdx = 0;
            state.elapsed = 0;
            if (state.lineIdx >= sequence.length) {
              state.phase = 'final-wait';
            } else {
              const nextLine = sequence[state.lineIdx];
              if (nextLine.isProgressBar) {
                setLines(prev => [...prev, { text: "  [                    ] 0%", complete: false }]);
                state.progressStep = 0;
                state.phase = 'progress-bar';
              } else {
                setLines(prev => [...prev, { text: "", complete: false }]);
                state.charTimings = generateCharTimings(nextLine.text, nextLine.typingSpeed);
                state.nextCharTime = state.charTimings[0] || 0;
                state.phase = 'typing';
              }
            }
          }
          break;
        }

        case 'progress-bar': {
          const progressDuration = 500;
          const steps = 20;
          const stepDuration = progressDuration / steps;
          const targetStep = Math.min(steps, Math.floor(state.elapsed / stepDuration) + 1);
          
          while (state.progressStep < targetStep) {
            state.progressStep++;
            const filled = "█".repeat(state.progressStep);
            const empty = " ".repeat(steps - state.progressStep);
            const percent = Math.round((state.progressStep / steps) * 100);
            setLines(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { 
                text: `  [${filled}${empty}] ${percent}%`, 
                complete: state.progressStep === steps 
              };
              return updated;
            });
          }
          
          if (state.progressStep >= steps && state.elapsed >= progressDuration + 100) {
            state.elapsed = 0;
            state.phase = 'post-delay';
          }
          break;
        }

        case 'final-wait':
          if (state.elapsed >= 200) {
            onComplete();
            state.phase = 'done';
          }
          break;

        case 'done':
          return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [sequence, onComplete, initialDelay]);

  return (
    <div className="fixed inset-0 z-[9999] bg-obsidian flex items-center justify-center">
      <div className="max-w-2xl w-full px-8 relative">
        <div className="font-mono text-sm text-amber space-y-1">
          {showInitialCursor && (
            <div style={{ textShadow: "0 0 10px rgba(255, 170, 0, 0.5)" }}>
              <span className="text-amber">&gt; </span>
              <span className="inline-block w-2 h-4 bg-amber animate-pulse align-middle" />
            </div>
          )}
          {lines.map((line, i) => {
            const isLastLine = i === lines.length - 1;
            const showCursor = isLastLine && !line.complete;
            return (
              <div
                key={i}
                style={{ textShadow: "0 0 10px rgba(255, 170, 0, 0.5)" }}
              >
                {line.text}
                {showCursor && (
                  <span className="inline-block w-2 h-4 bg-amber animate-pulse ml-0.5 align-middle" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const TRANSITION_SEQUENCES = {
  toRfc: (rfcId: number, rfcName: string): TransitionLine[] => [
    { text: `> ACCESSING RFC ${rfcId}...`, typingSpeed: 18, postDelay: 100 },
    { text: `> LOADING ${rfcName.toUpperCase()} EXHIBIT`, typingSpeed: 15, postDelay: 80 },
    { text: "  [                    ] 0%", typingSpeed: 0, postDelay: 0, isProgressBar: true },
    { text: "> ENTERING EXHIBIT", typingSpeed: 22, postDelay: 150 },
  ],
  
  toHome: (): TransitionLine[] => [
    { text: "> CLOSING EXHIBIT...", typingSpeed: 20, postDelay: 80 },
    { text: "> RETURNING TO ARCHIVE", typingSpeed: 18, postDelay: 100 },
    { text: "  [                    ] 0%", typingSpeed: 0, postDelay: 0, isProgressBar: true },
    { text: "> WELCOME BACK", typingSpeed: 22, postDelay: 100 },
  ],
};
