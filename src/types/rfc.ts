export interface RFC {
  id: number;
  title: string;
  shortTitle: string;
  year: number;
  status: "Internet Standard" | "Proposed Standard" | "Informational" | "Experimental" | "Historic";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  concepts: string[];
  prereqs: number[];
  accentColors: [string, string];
  description: string;
}

export interface StoryboardStep {
  id: string;
  title: string;
  narration: string;
  scene?: {
    focus?: string[];
    camera?: { x: number; y: number; z: number };
    highlight?: string[];
    action?: string;
    from?: string;
    to?: string;
    packet?: PacketData;
  };
  instruments?: {
    packetInspector?: { show: boolean; packet?: PacketData };
    stateMachine?: { state: string };
    glossary?: { terms: string[] };
  };
}

export interface PacketData {
  flags?: string[];
  seq?: number;
  ack?: number;
  data?: string;
  headers?: Record<string, string | number>;
}

export interface Storyboard {
  rfcId: number;
  steps: StoryboardStep[];
}

export interface SceneController {
  apply(step: StoryboardStep): void;
  setProgress(progress: number): void;
  dispose(): void;
}

export type SceneInitFn = (
  canvas: HTMLCanvasElement,
  accentColors: [string, string]
) => Promise<SceneController>;
