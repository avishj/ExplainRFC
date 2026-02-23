import { useEffect, useState } from "react";

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

type Phase = "initial-wait" | "typing" | "post-delay" | "progress-bar" | "final-wait" | "done";

interface AnimState {
  phase: Phase;
  lineIdx: number;
  charIdx: number;
  progressStep: number;
  elapsed: number;
  nextCharTime: number;
  charTimings: number[];
}

const PROGRESS_STEPS = 20;
const PROGRESS_DURATION = 350;
const FINAL_WAIT = 120;

function generateCharTimings(text: string, baseSpeed: number): number[] {
  return text.split("").map((char, i) => {
    let delay = baseSpeed;
    if (char === " ") delay *= 0.3;
    else if (/[>\[\]]/.test(char)) delay *= 0.5;
    else if (/[─►◄]/.test(char)) delay *= 0.15;
    else delay += (Math.random() - 0.5) * baseSpeed * 1.2;
    if (i > 0 && i % (5 + Math.floor(Math.random() * 4)) === 0) {
      delay += 20 + Math.random() * 30;
    }
    return Math.max(5, delay);
  });
}

function formatProgress(step: number): string {
  const filled = "█".repeat(step);
  const empty = " ".repeat(PROGRESS_STEPS - step);
  const percent = Math.round((step / PROGRESS_STEPS) * 100);
  return `  [${filled}${empty}] ${percent}%`;
}

export function TransitionCLI({
  sequence,
  onComplete,
  initialDelay = 150,
}: TransitionCLIProps) {
  const [lines, setLines] = useState<{ text: string; complete: boolean }[]>([]);
  const [showInitialCursor, setShowInitialCursor] = useState(true);

  useEffect(() => {
    const state: AnimState = {
      phase: "initial-wait",
      lineIdx: 0,
      charIdx: 0,
      progressStep: 0,
      elapsed: 0,
      nextCharTime: 0,
      charTimings: [],
    };

    let lastTime = performance.now();
    let rafId: number;

    function beginLine(line: TransitionLine) {
      if (line.isProgressBar) {
        setLines(prev => [...prev, { text: formatProgress(0), complete: false }]);
        state.progressStep = 0;
        state.phase = "progress-bar";
      } else {
        setLines(prev => [...prev, { text: "", complete: false }]);
        state.charTimings = generateCharTimings(line.text, line.typingSpeed);
        state.nextCharTime = state.charTimings[0] || 0;
        state.phase = "typing";
      }
    }

    function advanceLine() {
      state.lineIdx++;
      state.charIdx = 0;
      state.elapsed = 0;
      if (state.lineIdx >= sequence.length) {
        state.phase = "final-wait";
      } else {
        beginLine(sequence[state.lineIdx]);
      }
    }

    function updateLastLine(text: string, complete: boolean) {
      setLines(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { text, complete };
        return updated;
      });
    }

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      state.elapsed += dt;

      switch (state.phase) {
        case "initial-wait":
          if (state.elapsed >= initialDelay) {
            setShowInitialCursor(false);
            state.elapsed = 0;
            beginLine(sequence[0]);
          }
          break;

        case "typing": {
          const line = sequence[state.lineIdx];
          while (state.elapsed >= state.nextCharTime && state.charIdx < line.text.length) {
            state.charIdx++;
            updateLastLine(line.text.slice(0, state.charIdx), false);
            if (state.charIdx < line.text.length) {
              state.nextCharTime += state.charTimings[state.charIdx];
            }
          }
          if (state.charIdx >= line.text.length) {
            updateLastLine(line.text, true);
            state.elapsed = 0;
            state.phase = "post-delay";
          }
          break;
        }

        case "post-delay":
          if (state.elapsed >= sequence[state.lineIdx].postDelay) {
            advanceLine();
          }
          break;

        case "progress-bar": {
          const stepDuration = PROGRESS_DURATION / PROGRESS_STEPS;
          const target = Math.min(PROGRESS_STEPS, Math.floor(state.elapsed / stepDuration) + 1);
          while (state.progressStep < target) {
            state.progressStep++;
            updateLastLine(
              formatProgress(state.progressStep),
              state.progressStep === PROGRESS_STEPS,
            );
          }
          if (state.progressStep >= PROGRESS_STEPS && state.elapsed >= PROGRESS_DURATION + 50) {
            state.elapsed = 0;
            state.phase = "post-delay";
          }
          break;
        }

        case "final-wait":
          if (state.elapsed >= FINAL_WAIT) {
            onComplete();
            state.phase = "done";
          }
          break;

        case "done":
          return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
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
          {lines.map((line, i) => (
            <div key={i} style={{ textShadow: "0 0 10px rgba(255, 170, 0, 0.5)" }}>
              {line.text}
              {i === lines.length - 1 && !line.complete && (
                <span className="inline-block w-2 h-4 bg-amber animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const TRANSITION_SEQUENCES = {
  toRfc: (rfcId: number, rfcName: string): TransitionLine[] => [
    { text: `> ACCESSING RFC ${rfcId}...`, typingSpeed: 10, postDelay: 40 },
    { text: `> LOADING ${rfcName.toUpperCase()} EXHIBIT...`, typingSpeed: 12, postDelay: 30 },
    { text: "", typingSpeed: 0, postDelay: 0, isProgressBar: true },
    { text: "> ENTERING EXHIBIT!", typingSpeed: 30, postDelay: 60 },
  ],

  toHome: (): TransitionLine[] => [
    { text: "> CLOSING EXHIBIT...", typingSpeed: 10, postDelay: 30 },
    { text: "> RETURNING TO ARCHIVE!", typingSpeed: 28, postDelay: 50 },
  ],
};
