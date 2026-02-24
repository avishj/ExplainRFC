import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

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
  progressDuration?: number;
  finalWait?: number;
  exitDuration?: number;
}

type Phase = "initial-wait" | "typing" | "post-delay" | "progress-bar" | "final-wait" | "exiting" | "done";

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
  progressDuration = 350,
  finalWait = 120,
  exitDuration = 0.5,
}: TransitionCLIProps) {
  const [lines, setLines] = useState<{ text: string; complete: boolean }[]>([]);
  const [showInitialCursor, setShowInitialCursor] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLines([]);
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
    let exitTl: gsap.core.Timeline | null = null;

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

    function startExit() {
      state.phase = "exiting";
      exitTl = gsap.timeline({
        onComplete: () => {
          state.phase = "done";
          onComplete();
        },
      });
      exitTl.to(contentRef.current, {
        opacity: 0,
        duration: exitDuration * 0.6,
        ease: "power2.in",
      });
      exitTl.to(overlayRef.current, {
        opacity: 0,
        duration: exitDuration * 0.5,
        ease: "power2.out",
      }, `-=${exitDuration * 0.15}`);
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
          const stepDuration = progressDuration / PROGRESS_STEPS;
          const target = Math.min(PROGRESS_STEPS, Math.floor(state.elapsed / stepDuration) + 1);
          while (state.progressStep < target) {
            state.progressStep++;
            updateLastLine(
              formatProgress(state.progressStep),
              state.progressStep === PROGRESS_STEPS,
            );
          }
          if (state.progressStep >= PROGRESS_STEPS && state.elapsed >= progressDuration + 50) {
            state.elapsed = 0;
            state.phase = "post-delay";
          }
          break;
        }

        case "final-wait":
          if (state.elapsed >= finalWait) {
            startExit();
          }
          break;

        case "exiting":
        case "done":
          return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      exitTl?.kill();
    };
  }, [sequence, onComplete, initialDelay, progressDuration, finalWait, exitDuration]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] bg-obsidian flex items-center justify-center">
      <div ref={contentRef} className="max-w-2xl w-full px-8 relative">
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
  boot: (): TransitionLine[] => [
    { text: "> INITIALIZING PROTOCOL MUSEUM v2.0", typingSpeed: 18, postDelay: 100 },
    { text: "> ESTABLISHING SECURE CHANNEL...", typingSpeed: 15, postDelay: 80 },
    { text: "  SYN ────────────────────────►", typingSpeed: 8, postDelay: 120 },
    { text: "  ◄──────────────────── SYN-ACK", typingSpeed: 8, postDelay: 120 },
    { text: "  ACK ────────────────────────►", typingSpeed: 8, postDelay: 80 },
    { text: "> CONNECTION ESTABLISHED", typingSpeed: 12, postDelay: 100 },
    { text: "> LOADING RFC ARCHIVE...", typingSpeed: 20, postDelay: 40 },
    { text: "", typingSpeed: 0, postDelay: 0, isProgressBar: true },
    { text: "> WELCOME TO THE ARCHIVE!", typingSpeed: 28, postDelay: 100 },
  ],

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
