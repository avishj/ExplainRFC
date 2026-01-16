export type RFCStatus = "Internet Standard" | "Proposed Standard" | "Informational" | "Experimental" | "Historic" | "Best Current Practice" | "Draft Standard";

export type RFCDifficulty = "beginner" | "intermediate" | "advanced";

export type RFCLayer = "Transport" | "Network" | "Application" | "Security" | "Routing" | "Link" | "Infrastructure" | "Mail" | "Web" | "Telephony" | "Management";

export interface RFC {
  id: number;
  title: string;
  shortTitle: string;
  year: number;
  status: RFCStatus;
  difficulty: RFCDifficulty;
  estimatedMinutes: number;
  concepts: string[];
  prereqs: number[];
  accentColors: [string, string];
  description: string;
}

export interface CatalogRFC {
  id: number;
  name: string;
  title: string;
  year: number;
  layer: RFCLayer;
  description: string;
  available: boolean;
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface PacketData {
  flags?: string[];
  seq?: number;
  ack?: number;
  data?: string;
  headers?: Record<string, string | number>;
}

export interface SceneState {
  focus?: string[];
  camera?: CameraPosition;
  highlight?: string[];
  action?: string;
  from?: string;
  to?: string;
  packet?: PacketData;
}

export interface InstrumentState {
  packetInspector?: { show: boolean; packet?: PacketData };
  stateMachine?: { state: string };
  glossary?: { terms: string[] };
}

export interface StoryboardStep {
  id: string;
  title: string;
  narration: string;
  scene?: SceneState;
  instruments?: InstrumentState;
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

export type BookImage = "book_straight1.png" | "book_straight2.png" | "book_left1.png";

export interface SpineConfig {
  x: number;
  y: number;
  rotation: number;
  fontSize: string;
  subFontSize: string;
}

export interface BookPlacement {
  rfcIndex: number;
  image: BookImage;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  rotation: number;
  spine: SpineConfig;
}
