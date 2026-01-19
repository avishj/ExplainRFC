import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

interface BootLine {
  text: string;
  typingSpeed: number;
  postDelay: number;
  isProgressBar?: boolean;
}

const BOOT_SEQUENCE: BootLine[] = [
  { text: "> INITIALIZING PROTOCOL MUSEUM v2.0", typingSpeed: 25, postDelay: 200 },
  { text: "> ESTABLISHING SECURE CHANNEL", typingSpeed: 22, postDelay: 150 },
  { text: "  SYN ────────────────────────►", typingSpeed: 10, postDelay: 250 },
  { text: "  ◄──────────────────── SYN-ACK", typingSpeed: 10, postDelay: 250 },
  { text: "  ACK ────────────────────────►", typingSpeed: 10, postDelay: 180 },
  { text: "> CONNECTION ESTABLISHED", typingSpeed: 18, postDelay: 200 },
  { text: "> LOADING RFC ARCHIVE...", typingSpeed: 28, postDelay: 80 },
  { text: "  [                    ] 0%", typingSpeed: 0, postDelay: 0, isProgressBar: true },
  { text: "> WELCOME TO THE ARCHIVE!", typingSpeed: 32, postDelay: 400 },
];

const RFC_FRAGMENTS = [
  "SYN", "ACK", "FIN", "TCP", "UDP", "HTTP",
  "RFC793", "RFC2616", "SEQ", "TTL",
  "GET", "POST", "200", "404",
  "port:443", "CONNECT", "LISTEN",
];

// Content variations for the document assembly animation loop
interface DocumentVariation {
  id: string;
  title: string;
  rfcNumber: string;
  fragments: { text: string; xOffset: number; yOffset: number; finalXOffset: number; finalYOffset: number }[];
  documentLines: string[];
  visualLabel: string;
  nodeLabels: [string, string];
  accentHue: "amber" | "cyan" | "emerald" | "violet";
}

const DOCUMENT_VARIATIONS: DocumentVariation[] = [
  {
    id: "tcp",
    title: "TCP Handshake",
    rfcNumber: "RFC 793",
    fragments: [
      { text: "SYN", xOffset: -0.15, yOffset: -0.12, finalXOffset: -0.03, finalYOffset: -0.08 },
      { text: "ACK", xOffset: 0.12, yOffset: -0.10, finalXOffset: 0.02, finalYOffset: -0.05 },
      { text: "seq=x", xOffset: -0.18, yOffset: 0.08, finalXOffset: -0.02, finalYOffset: 0.04 },
      { text: "ESTABLISHED", xOffset: 0.15, yOffset: 0.12, finalXOffset: 0, finalYOffset: -0.10 },
      { text: "window", xOffset: -0.20, yOffset: 0.02, finalXOffset: -0.03, finalYOffset: -0.01 },
      { text: "checksum", xOffset: 0.18, yOffset: -0.04, finalXOffset: 0.02, finalYOffset: 0.01 },
      { text: "§3.4", xOffset: -0.10, yOffset: -0.15, finalXOffset: 0.03, finalYOffset: -0.03 },
      { text: "FIN", xOffset: 0.10, yOffset: 0.10, finalXOffset: -0.02, finalYOffset: 0.06 },
    ],
    documentLines: [
      "The client MUST send SYN",
      "Server SHALL respond SYN-ACK",
      "Connection ESTABLISHED on ACK",
      "Sequence numbers track order",
      "Window controls flow rate",
      "Checksum ensures integrity",
    ],
    visualLabel: "TCP HANDSHAKE",
    nodeLabels: ["SYN", "ACK"],
    accentHue: "amber",
  },
  {
    id: "bgp",
    title: "BGP Routing",
    rfcNumber: "RFC 4271",
    fragments: [
      { text: "UPDATE", xOffset: -0.16, yOffset: -0.11, finalXOffset: -0.03, finalYOffset: -0.07 },
      { text: "AS_PATH", xOffset: 0.14, yOffset: -0.09, finalXOffset: 0.02, finalYOffset: -0.04 },
      { text: "OPEN", xOffset: -0.19, yOffset: 0.07, finalXOffset: -0.02, finalYOffset: 0.03 },
      { text: "KEEPALIVE", xOffset: 0.16, yOffset: 0.11, finalXOffset: 0, finalYOffset: -0.09 },
      { text: "prefix", xOffset: -0.21, yOffset: 0.01, finalXOffset: -0.03, finalYOffset: -0.02 },
      { text: "LOCAL_PREF", xOffset: 0.17, yOffset: -0.05, finalXOffset: 0.02, finalYOffset: 0.02 },
      { text: "§6.1", xOffset: -0.11, yOffset: -0.14, finalXOffset: 0.03, finalYOffset: -0.04 },
      { text: "WITHDRAW", xOffset: 0.11, yOffset: 0.09, finalXOffset: -0.02, finalYOffset: 0.05 },
    ],
    documentLines: [
      "Peers MUST exchange OPEN",
      "UPDATE carries route info",
      "AS_PATH prevents loops",
      "LOCAL_PREF sets priority",
      "KEEPALIVE maintains session",
      "WITHDRAW removes routes",
    ],
    visualLabel: "BGP PEERING",
    nodeLabels: ["AS1", "AS2"],
    accentHue: "emerald",
  },
  {
    id: "http",
    title: "HTTP Request",
    rfcNumber: "RFC 2616",
    fragments: [
      { text: "GET", xOffset: -0.17, yOffset: -0.10, finalXOffset: -0.03, finalYOffset: -0.06 },
      { text: "200 OK", xOffset: 0.13, yOffset: -0.08, finalXOffset: 0.02, finalYOffset: -0.03 },
      { text: "Host:", xOffset: -0.18, yOffset: 0.06, finalXOffset: -0.02, finalYOffset: 0.02 },
      { text: "Content-Type", xOffset: 0.15, yOffset: 0.10, finalXOffset: 0, finalYOffset: -0.08 },
      { text: "headers", xOffset: -0.22, yOffset: 0.00, finalXOffset: -0.03, finalYOffset: -0.03 },
      { text: "Cache-Control", xOffset: 0.16, yOffset: -0.06, finalXOffset: 0.02, finalYOffset: 0.00 },
      { text: "§5.1", xOffset: -0.12, yOffset: -0.13, finalXOffset: 0.03, finalYOffset: -0.05 },
      { text: "POST", xOffset: 0.12, yOffset: 0.08, finalXOffset: -0.02, finalYOffset: 0.04 },
    ],
    documentLines: [
      "Request MUST include method",
      "GET retrieves resource",
      "Headers define metadata",
      "Status codes signal result",
      "Body MAY contain payload",
      "Connection can be reused",
    ],
    visualLabel: "HTTP REQUEST",
    nodeLabels: ["REQ", "RES"],
    accentHue: "cyan",
  },
  {
    id: "dns",
    title: "DNS Resolution",
    rfcNumber: "RFC 1035",
    fragments: [
      { text: "QUERY", xOffset: -0.15, yOffset: -0.11, finalXOffset: -0.03, finalYOffset: -0.07 },
      { text: "ANSWER", xOffset: 0.14, yOffset: -0.09, finalXOffset: 0.02, finalYOffset: -0.04 },
      { text: "A record", xOffset: -0.19, yOffset: 0.07, finalXOffset: -0.02, finalYOffset: 0.03 },
      { text: "CNAME", xOffset: 0.16, yOffset: 0.11, finalXOffset: 0, finalYOffset: -0.09 },
      { text: "TTL", xOffset: -0.20, yOffset: 0.01, finalXOffset: -0.03, finalYOffset: -0.02 },
      { text: "recursive", xOffset: 0.17, yOffset: -0.05, finalXOffset: 0.02, finalYOffset: 0.02 },
      { text: "§4.1", xOffset: -0.11, yOffset: -0.14, finalXOffset: 0.03, finalYOffset: -0.04 },
      { text: "NS", xOffset: 0.11, yOffset: 0.09, finalXOffset: -0.02, finalYOffset: 0.05 },
    ],
    documentLines: [
      "Query MUST specify QNAME",
      "Resolver checks cache first",
      "A record maps to IPv4",
      "CNAME aliases domain",
      "TTL controls cache duration",
      "Recursive queries delegate",
    ],
    visualLabel: "DNS LOOKUP",
    nodeLabels: ["QRY", "ANS"],
    accentHue: "violet",
  },
];

const ACCENT_COLORS = {
  amber: {
    primary: "rgba(255, 170, 0, 0.8)",
    secondary: "rgba(255, 140, 0, 0.6)",
    glow: "rgba(255, 170, 0, 0.4)",
    text: "#ffaa00",
  },
  cyan: {
    primary: "rgba(0, 200, 255, 0.8)",
    secondary: "rgba(0, 150, 200, 0.6)",
    glow: "rgba(0, 200, 255, 0.4)",
    text: "#00c8ff",
  },
  emerald: {
    primary: "rgba(0, 200, 150, 0.8)",
    secondary: "rgba(0, 160, 120, 0.6)",
    glow: "rgba(0, 200, 150, 0.4)",
    text: "#00c896",
  },
  violet: {
    primary: "rgba(160, 100, 255, 0.8)",
    secondary: "rgba(130, 80, 200, 0.6)",
    glow: "rgba(160, 100, 255, 0.4)",
    text: "#a064ff",
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  alpha: number;
  targetAlpha: number;
  size: number;
  hue: number;
  lifetime: number;
  maxLife: number;
  pulse: number;
  pulseSpeed: number;
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  alpha: number;
  active: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface DataStream {
  angle: number;
  speed: number;
  length: number;
  progress: number;
  hue: number;
  width: number;
}

interface OrbitRing {
  radius: number;
  speed: number;
  dashOffset: number;
  alpha: number;
  width: number;
}

interface GlyphTrail {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  text: string;
  progress: number;
  delay: number;
  alpha: number;
}

interface ElectricArc {
  points: { x: number; y: number }[];
  alpha: number;
  life: number;
}

export function FoundryHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const dataStreamsRef = useRef<DataStream[]>([]);
  const orbitRingsRef = useRef<OrbitRing[]>([]);
  const glyphTrailsRef = useRef<GlyphTrail[]>([]);
  const electricArcsRef = useRef<ElectricArc[]>([]);
  const timeRef = useRef(0);
  const bootPhaseRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setTitleVisible] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [bootLines, setBootLines] = useState<{ text: string; complete: boolean }[]>([]);
  const [showBootOverlay, setShowBootOverlay] = useState(true);
  const [showInitialCursor, setShowInitialCursor] = useState(true);
  const [, setProgressPercent] = useState(0);
  const [showDocumentAssembly, setShowDocumentAssembly] = useState(false);
  const [hideCanvas, setHideCanvas] = useState(false);
  const bootStartedRef = useRef(false);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);
  const assemblyTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const loopActiveRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Boot sequence runs immediately on mount, separate from canvas
  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;

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
          if (state.elapsed >= 800) {
            setShowInitialCursor(false);
            state.elapsed = 0;
            state.phase = 'typing';
            const line = BOOT_SEQUENCE[state.lineIdx];
            if (line.isProgressBar) {
              setBootLines(prev => [...prev, { text: "  [                    ] 0%", complete: false }]);
              state.phase = 'progress-bar';
            } else {
              setBootLines(prev => [...prev, { text: "", complete: false }]);
              state.charTimings = generateCharTimings(line.text, line.typingSpeed);
              state.nextCharTime = state.charTimings[0] || 0;
            }
          }
          break;

        case 'typing': {
          const line = BOOT_SEQUENCE[state.lineIdx];
          while (state.elapsed >= state.nextCharTime && state.charIdx < line.text.length) {
            state.charIdx++;
            const visibleText = line.text.slice(0, state.charIdx);
            setBootLines(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { text: visibleText, complete: false };
              return updated;
            });
            if (state.charIdx < line.text.length) {
              state.nextCharTime += state.charTimings[state.charIdx];
            }
          }
          if (state.charIdx >= line.text.length) {
            setBootLines(prev => {
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
          const line = BOOT_SEQUENCE[state.lineIdx];
          if (state.elapsed >= line.postDelay) {
            state.lineIdx++;
            state.charIdx = 0;
            state.elapsed = 0;
            if (state.lineIdx >= BOOT_SEQUENCE.length) {
              state.phase = 'final-wait';
            } else {
              const nextLine = BOOT_SEQUENCE[state.lineIdx];
              if (nextLine.isProgressBar) {
                setBootLines(prev => [...prev, { text: "  [                    ] 0%", complete: false }]);
                state.progressStep = 0;
                state.phase = 'progress-bar';
              } else {
                setBootLines(prev => [...prev, { text: "", complete: false }]);
                state.charTimings = generateCharTimings(nextLine.text, nextLine.typingSpeed);
                state.nextCharTime = state.charTimings[0] || 0;
                state.phase = 'typing';
              }
            }
          }
          break;
        }

        case 'progress-bar': {
          const progressDuration = 800;
          const steps = 20;
          const stepDuration = progressDuration / steps;
          const targetStep = Math.min(steps, Math.floor(state.elapsed / stepDuration) + 1);
          
          while (state.progressStep < targetStep) {
            state.progressStep++;
            const filled = "█".repeat(state.progressStep);
            const empty = " ".repeat(steps - state.progressStep);
            const percent = Math.round((state.progressStep / steps) * 100);
            setBootLines(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { 
                text: `  [${filled}${empty}] ${percent}%`, 
                complete: state.progressStep === steps 
              };
              return updated;
            });
            setProgressPercent(percent);
          }
          
          if (state.progressStep >= steps && state.elapsed >= progressDuration + 200) {
            state.elapsed = 0;
            state.phase = 'post-delay';
          }
          break;
        }

        case 'final-wait':
          if (state.elapsed >= 400) {
            setBootComplete(true);
            state.phase = 'done';
          }
          break;

        case 'done':
          return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, []);

  const createParticle = useCallback(
    (width: number, height: number, _existingParticles: Particle[]): Particle => {
      const centerX = width / 2;
      const centerY = height / 2;
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * Math.max(width, height) * 0.6;
      
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        text: RFC_FRAGMENTS[Math.floor(Math.random() * RFC_FRAGMENTS.length)],
        alpha: 0,
        targetAlpha: 0.1 + Math.random() * 0.4,
        size: 10 + Math.random() * 6,
        hue: 25 + Math.random() * 20,
        lifetime: 0,
        maxLife: 8000 + Math.random() * 12000,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      };
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let width = container.clientWidth;
    let height = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();

    const particleCount = Math.min(80, Math.floor((width * height) / 15000));
    const particles = particlesRef.current;
    const connections = connectionsRef.current;
    const ripples = ripplesRef.current;

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(width, height, particles));
    }

    for (let i = 0; i < 15; i++) {
      connections.push({
        from: Math.floor(Math.random() * particleCount),
        to: Math.floor(Math.random() * particleCount),
        progress: 0,
        alpha: 0,
        active: false,
      });
    }

    const dataStreams = dataStreamsRef.current;
    for (let i = 0; i < 12; i++) {
      dataStreams.push({
        angle: (i / 12) * Math.PI * 2,
        speed: 0.0003 + Math.random() * 0.0002,
        length: 80 + Math.random() * 120,
        progress: Math.random(),
        hue: 25 + Math.random() * 20,
        width: 1 + Math.random() * 2,
      });
    }

    const orbitRings = orbitRingsRef.current;
    for (let i = 0; i < 4; i++) {
      orbitRings.push({
        radius: 120 + i * 70,
        speed: (0.0002 + i * 0.00005) * (i % 2 === 0 ? 1 : -1),
        dashOffset: 0,
        alpha: 0.15 - i * 0.03,
        width: 1.5 - i * 0.2,
      });
    }

    const glyphTrails = glyphTrailsRef.current;
    const electricArcs = electricArcsRef.current;

    const createArc = (x1: number, y1: number, x2: number, y2: number): ElectricArc => {
      const points: { x: number; y: number }[] = [];
      const segments = 8 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const baseX = x1 + (x2 - x1) * t;
        const baseY = y1 + (y2 - y1) * t;
        const perpX = -(y2 - y1);
        const perpY = x2 - x1;
        const len = Math.hypot(perpX, perpY);
        const offset = (Math.random() - 0.5) * 30 * Math.sin(t * Math.PI);
        
        points.push({
          x: baseX + (perpX / len) * offset,
          y: baseY + (perpY / len) * offset,
        });
      }
      
      return { points, alpha: 1, life: 300 + Math.random() * 200 };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      const speed = Math.hypot(
        mouseRef.current.x - mouseRef.current.prevX,
        mouseRef.current.y - mouseRef.current.prevY
      );

      if (speed > 5 && ripples.length < 8) {
        ripples.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          radius: 0,
          maxRadius: 150 + Math.random() * 100,
          alpha: 0.5,
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: 300,
        alpha: 0.8,
      });

      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const p = createParticle(width, height, particles);
        p.x = x + Math.cos(angle) * 20;
        p.y = y + Math.sin(angle) * 20;
        p.vx = Math.cos(angle) * 2;
        p.vy = Math.sin(angle) * 2;
        p.alpha = 0.8;
        particles.push(p);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);
    window.addEventListener("resize", resize);

    const hexToRgb = (hue: number, sat: number, light: number) => {
      const c = (1 - Math.abs(2 * light - 1)) * sat;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = light - c / 2;
      let r = 0, g = 0, b = 0;
      if (hue < 60) { r = c; g = x; }
      else if (hue < 120) { r = x; g = c; }
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      return { r, g, b };
    };

    const draw = (timestamp: number) => {
      const dt = Math.min(32, timestamp - timeRef.current);
      timeRef.current = timestamp;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(width, height) * 0.7
      );
      gradient.addColorStop(0, "rgba(30, 15, 5, 0.4)");
      gradient.addColorStop(0.5, "rgba(15, 8, 2, 0.2)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      bootPhaseRef.current = Math.min(1, bootPhaseRef.current + dt * 0.0003);
      const bootProgress = bootPhaseRef.current;

      for (const ring of orbitRings) {
        ring.dashOffset += ring.speed * dt;
        const ringAlpha = ring.alpha * bootProgress;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 170, 0, ${ringAlpha * 0.3})`;
        ctx.lineWidth = ring.width;
        ctx.setLineDash([4, 12]);
        ctx.lineDashOffset = ring.dashOffset * 1000;
        ctx.stroke();
        ctx.setLineDash([]);

        const nodeCount = Math.floor(ring.radius / 40);
        for (let i = 0; i < nodeCount; i++) {
          const nodeAngle = (i / nodeCount) * Math.PI * 2 + ring.dashOffset * 500;
          const nx = centerX + Math.cos(nodeAngle) * ring.radius;
          const ny = centerY + Math.sin(nodeAngle) * ring.radius;
          
          ctx.beginPath();
          ctx.arc(nx, ny, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 199, 31, ${ringAlpha * 0.6})`;
          ctx.fill();
        }
      }

      for (const stream of dataStreams) {
        stream.progress += stream.speed * dt;
        if (stream.progress > 1) stream.progress = 0;
        
        const maxDist = Math.max(width, height) * 0.6;
        const startDist = maxDist * (1 - stream.progress);
        const endDist = Math.max(0, startDist - stream.length);
        
        const startX = centerX + Math.cos(stream.angle) * startDist;
        const startY = centerY + Math.sin(stream.angle) * startDist;
        const endX = centerX + Math.cos(stream.angle) * endDist;
        const endY = centerY + Math.sin(stream.angle) * endDist;
        
        const streamGrad = ctx.createLinearGradient(startX, startY, endX, endY);
        const streamAlpha = 0.6 * bootProgress * Math.sin(stream.progress * Math.PI);
        streamGrad.addColorStop(0, `rgba(255, 140, 0, 0)`);
        streamGrad.addColorStop(0.3, `rgba(255, 170, 0, ${streamAlpha * 0.5})`);
        streamGrad.addColorStop(1, `rgba(255, 199, 31, ${streamAlpha})`);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = stream.width;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(endX, endY, 3 + Math.sin(timestamp * 0.01) * 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 199, 31, ${streamAlpha * 0.8})`;
        ctx.shadowColor = `rgba(255, 170, 0, ${streamAlpha})`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = glyphTrails.length - 1; i >= 0; i--) {
        const trail = glyphTrails[i];
        if (trail.delay > 0) {
          trail.delay -= dt;
          continue;
        }
        
        trail.progress += dt * 0.002;
        const t = Math.min(1, trail.progress);
        const eased = 1 - Math.pow(1 - t, 3);
        
        trail.x = trail.x + (trail.targetX - trail.x) * eased * 0.1;
        trail.y = trail.y + (trail.targetY - trail.y) * eased * 0.1;
        trail.alpha = (1 - t) * 0.8;
        
        if (t >= 1) {
          glyphTrails.splice(i, 1);
          continue;
        }
        
        ctx.font = "600 14px 'IBM Plex Mono', monospace";
        ctx.fillStyle = `rgba(255, 199, 31, ${trail.alpha})`;
        ctx.shadowColor = `rgba(255, 140, 0, ${trail.alpha})`;
        ctx.shadowBlur = 8;
        ctx.fillText(trail.text, trail.x, trail.y);
        ctx.shadowBlur = 0;
      }

      if (Math.random() < 0.02 * bootProgress && glyphTrails.length < 20) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 200 + Math.random() * 300;
        glyphTrails.push({
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist,
          targetX: centerX + (Math.random() - 0.5) * 100,
          targetY: centerY + (Math.random() - 0.5) * 100,
          text: RFC_FRAGMENTS[Math.floor(Math.random() * RFC_FRAGMENTS.length)],
          progress: 0,
          delay: Math.random() * 200,
          alpha: 0.8,
        });
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += dt * 0.3;
        ripple.alpha *= 0.97;

        if (ripple.alpha < 0.01 || ripple.radius > ripple.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 170, 0, ${ripple.alpha * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 199, 31, ${ripple.alpha * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.lineCap = "round";
      for (const conn of connections) {
        if (!conn.active && Math.random() < 0.002) {
          conn.active = true;
          conn.progress = 0;
          conn.from = Math.floor(Math.random() * particles.length);
          conn.to = Math.floor(Math.random() * particles.length);
        }

        if (conn.active) {
          conn.progress += dt * 0.002;
          conn.alpha = Math.sin(conn.progress * Math.PI) * 0.6;

          if (conn.progress >= 1) {
            conn.active = false;
          }

          const fromP = particles[conn.from];
          const toP = particles[conn.to];
          if (fromP && toP) {
            const dx = toP.x - fromP.x;
            const dy = toP.y - fromP.y;
            
            const startX = fromP.x + dx * Math.max(0, conn.progress - 0.2);
            const startY = fromP.y + dy * Math.max(0, conn.progress - 0.2);
            const endX = fromP.x + dx * conn.progress;
            const endY = fromP.y + dy * conn.progress;

            const connGrad = ctx.createLinearGradient(startX, startY, endX, endY);
            connGrad.addColorStop(0, `rgba(255, 140, 0, 0)`);
            connGrad.addColorStop(0.5, `rgba(255, 170, 0, ${conn.alpha})`);
            connGrad.addColorStop(1, `rgba(255, 199, 31, ${conn.alpha * 0.5})`);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = connGrad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(endX, endY, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 199, 31, ${conn.alpha})`;
            ctx.fill();
          }
        }
      }

      ctx.font = "600 12px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.lifetime += dt;

        const fadeIn = Math.min(1, p.lifetime / 1000);
        const fadeOut = Math.max(0, 1 - (p.lifetime - p.maxLife + 2000) / 2000);
        p.alpha = p.targetAlpha * fadeIn * (p.lifetime > p.maxLife - 2000 ? fadeOut : 1);

        if (p.lifetime > p.maxLife) {
          particles.splice(i, 1);
          if (particles.length < particleCount) {
            particles.push(createParticle(width, height, particles));
          }
          continue;
        }

        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const distToMouse = Math.hypot(dx, dy);
        
        if (distToMouse < 200 && distToMouse > 0) {
          const repelForce = (200 - distToMouse) / 200;
          p.vx -= (dx / distToMouse) * repelForce * 0.1;
          p.vy -= (dy / distToMouse) * repelForce * 0.1;
        }

        for (const ripple of ripples) {
          const rdx = p.x - ripple.x;
          const rdy = p.y - ripple.y;
          const rippleDist = Math.hypot(rdx, rdy);
          
          if (Math.abs(rippleDist - ripple.radius) < 30) {
            const pushForce = ripple.alpha * 0.5;
            p.vx += (rdx / rippleDist) * pushForce;
            p.vy += (rdy / rippleDist) * pushForce;
          }
        }

        const dxCenter = centerX - p.x;
        const dyCenter = centerY - p.y;
        const distToCenter = Math.hypot(dxCenter, dyCenter);
        const pullStrength = 0.00005 * distToCenter;
        p.vx += dxCenter * pullStrength;
        p.vy += dyCenter * pullStrength;

        p.vx *= 0.99;
        p.vy *= 0.99;

        if (!prefersReducedMotion) {
          p.x += p.vx * dt * 0.1;
          p.y += p.vy * dt * 0.1;
        }

        p.pulse += p.pulseSpeed * dt * 0.1;
        const pulseAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

        const { r, g, b } = hexToRgb(p.hue, 0.9, 0.55);
        
        ctx.shadowColor = `rgba(255, 140, 0, ${pulseAlpha * 0.8})`;
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseAlpha})`;
        ctx.font = `600 ${p.size}px 'IBM Plex Mono', monospace`;
        ctx.fillText(p.text, p.x, p.y);
        
        ctx.shadowBlur = 0;
      }

      if (Math.random() < 0.008 * bootProgress && electricArcs.length < 5 && particles.length >= 2) {
        const i1 = Math.floor(Math.random() * particles.length);
        let i2 = Math.floor(Math.random() * particles.length);
        while (i2 === i1) i2 = Math.floor(Math.random() * particles.length);
        
        const p1 = particles[i1];
        const p2 = particles[i2];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        
        if (dist < 250 && dist > 50) {
          electricArcs.push(createArc(p1.x, p1.y, p2.x, p2.y));
        }
      }

      for (let i = electricArcs.length - 1; i >= 0; i--) {
        const arc = electricArcs[i];
        arc.life -= dt;
        arc.alpha = arc.life / 300;
        
        if (arc.life <= 0) {
          electricArcs.splice(i, 1);
          continue;
        }
        
        ctx.beginPath();
        ctx.moveTo(arc.points[0].x, arc.points[0].y);
        for (let j = 1; j < arc.points.length; j++) {
          ctx.lineTo(arc.points[j].x, arc.points[j].y);
        }
        
        ctx.strokeStyle = `rgba(255, 220, 100, ${arc.alpha * 0.9})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = `rgba(255, 200, 50, ${arc.alpha})`;
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(255, 255, 200, ${arc.alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      }

      const coreGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 80
      );
      const corePulse = 0.3 + 0.2 * Math.sin(timestamp * 0.002);
      coreGlow.addColorStop(0, `rgba(255, 140, 0, ${corePulse * bootProgress})`);
      coreGlow.addColorStop(0.3, `rgba(255, 100, 0, ${corePulse * 0.5 * bootProgress})`);
      coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreGlow;
      ctx.fillRect(centerX - 100, centerY - 100, 200, 200);

      const hexSize = 60;
      const hexHeight = hexSize * Math.sqrt(3);
      ctx.strokeStyle = `rgba(255, 170, 0, ${0.02 * bootProgress})`;
      ctx.lineWidth = 0.5;
      
      for (let row = -Math.ceil(height / hexHeight) - 1; row <= Math.ceil(height / hexHeight) + 1; row++) {
        for (let col = -Math.ceil(width / (hexSize * 1.5)) - 1; col <= Math.ceil(width / (hexSize * 1.5)) + 1; col++) {
          const x = centerX + col * hexSize * 1.5;
          const y = centerY + row * hexHeight + (col % 2) * hexHeight / 2;
          
          const distFromCenter = Math.hypot(x - centerX, y - centerY);
          const fadeAlpha = Math.max(0, 1 - distFromCenter / (Math.max(width, height) * 0.6));
          
          if (fadeAlpha > 0.05) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3 - Math.PI / 6;
              const hx = x + Math.cos(angle) * hexSize * 0.5;
              const hy = y + Math.sin(angle) * hexSize * 0.5;
              if (i === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(255, 170, 0, ${fadeAlpha * 0.04 * bootProgress})`;
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = `rgba(255, 199, 31, ${0.015 * bootProgress})`;
      for (let i = 0; i < 3; i++) {
        const scanY = ((timestamp * 0.03 + i * height / 3) % height);
        ctx.fillRect(0, scanY, width, 1);
      }

      const cornerSize = 40;
      ctx.strokeStyle = `rgba(255, 170, 0, ${0.15 * bootProgress})`;
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(20, 20 + cornerSize);
      ctx.lineTo(20, 20);
      ctx.lineTo(20 + cornerSize, 20);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width - 20, 20 + cornerSize);
      ctx.lineTo(width - 20, 20);
      ctx.lineTo(width - 20 - cornerSize, 20);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(20, height - 20 - cornerSize);
      ctx.lineTo(20, height - 20);
      ctx.lineTo(20 + cornerSize, height - 20);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(width - 20, height - 20 - cornerSize);
      ctx.lineTo(width - 20, height - 20);
      ctx.lineTo(width - 20 - cornerSize, height - 20);
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resize);
      particles.length = 0;
      connections.length = 0;
      ripples.length = 0;
      dataStreams.length = 0;
      orbitRings.length = 0;
      glyphTrails.length = 0;
      electricArcs.length = 0;
    };
  }, [createParticle, prefersReducedMotion]);

  // Effect 1: When boot completes, fade out boot overlay and show document assembly
  useEffect(() => {
    if (!bootComplete) return;

    const tl = gsap.timeline();
    
    tl.call(() => setHideCanvas(true), []);
    
    tl.to(".boot-terminal-content", {
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    });

    tl.to(".boot-overlay", {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        setShowBootOverlay(false);
        setShowDocumentAssembly(true);
      },
    }, "-=0.2");

    return () => { tl.kill(); };
  }, [bootComplete]);

  // Effect 2: When document assembly layer mounts, run the fragment animation in a loop
  useEffect(() => {
    if (!showDocumentAssembly) return;
    if (prefersReducedMotion) {
      // Skip animation for reduced motion, just show hero
      setIsLoaded(true);
      setTitleVisible(true);
      return;
    }

    loopActiveRef.current = true;
    let isFirstRun = true;

    const runAnimationCycle = (variationIdx: number) => {
      if (!loopActiveRef.current) return;

      const variation = DOCUMENT_VARIATIONS[variationIdx];
      const colors = ACCENT_COLORS[variation.accentHue];

      // Query elements
      const fragments = document.querySelectorAll(".rfc-fragment");
      const magicParticles = document.querySelectorAll(".magic-particle");
      const visualizationPreview = document.querySelector(".visualization-preview");
      const documentPage = document.querySelector(".document-page");
      const docLines = document.querySelectorAll(".doc-line");
      const docHeader = document.querySelector(".doc-header-text");
      const docSubheader = document.querySelector(".doc-subheader-text");
      const visualLabel = document.querySelector(".visual-label");
      const nodeLeft = document.querySelector(".node-left-label");
      const nodeRight = document.querySelector(".node-right-label");

      if (fragments.length === 0) return;

      // Update content for this variation
      fragments.forEach((el, i) => {
        if (variation.fragments[i]) {
          el.textContent = variation.fragments[i].text;
        }
      });
      docLines.forEach((el, i) => {
        if (variation.documentLines[i]) {
          el.textContent = variation.documentLines[i];
        }
      });
      if (docHeader) docHeader.textContent = variation.rfcNumber;
      if (docSubheader) docSubheader.textContent = variation.title;
      if (visualLabel) visualLabel.textContent = variation.visualLabel;
      if (nodeLeft) nodeLeft.textContent = variation.nodeLabels[0];
      if (nodeRight) nodeRight.textContent = variation.nodeLabels[1];

      // Percentage-based offset for left/right balance (30% from center)
      const sideOffset = 0.30; // 30% of viewport width

      // Set initial positions - fragments start scattered on the left
      fragments.forEach((el, i) => {
        const frag = variation.fragments[i];
        if (!frag) return;
        gsap.set(el, { 
          visibility: "visible",
          x: 0, 
          y: 0, 
          left: `calc(50% + ${frag.xOffset * 100}vw - ${sideOffset * 100}vw)`,
          top: `calc(50% + ${frag.yOffset * 100}vh)`,
          opacity: 0, 
          scale: 0.4 
        });
      });

      // Set initial state for magic particles (around the document position on left)
      magicParticles.forEach((el, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const radius = 50 + (i % 3) * 25;
        gsap.set(el, { 
          visibility: "visible",
          opacity: 0, 
          scale: 0,
          left: `calc(50% - ${sideOffset * 100}vw + ${Math.cos(angle) * radius}px)`,
          top: `calc(50% + ${Math.sin(angle) * radius}px)`,
          x: 0,
          y: 0,
          rotation: 0,
        });
      });

      // Set initial state for document (left side)
      if (documentPage) {
        gsap.set(documentPage, { 
          visibility: "visible",
          opacity: 0, 
          scale: 0.7, 
          x: 0,
          rotation: 0,
          filter: "blur(0px)",
          left: `calc(50% - ${sideOffset * 100}vw)`,
          boxShadow: `0 0 25px ${colors.glow}`,
        });
      }

      // Set initial state for visualization preview (hidden, positioned on right)
      if (visualizationPreview) {
        gsap.set(visualizationPreview, { 
          visibility: "visible",
          opacity: 0, 
          scale: 0.3, 
          x: 0,
          y: 0,
          left: `calc(50% + ${sideOffset * 100}vw)`,
          boxShadow: `0 0 30px ${colors.glow}`,
        });
      }

      // Kill any previous timeline
      if (assemblyTimelineRef.current) {
        assemblyTimelineRef.current.kill();
      }

      const mainTl = gsap.timeline({
        onComplete: () => {
          if (isFirstRun) {
            setIsLoaded(true);
            setTitleVisible(true);
            // Fade the background after first run
            gsap.to(".document-assembly-layer", {
              backgroundColor: "transparent",
              duration: 0.6,
              ease: "power2.out",
            });
            isFirstRun = false;
          }
          
          // Schedule next variation
          if (loopActiveRef.current) {
            const nextIdx = (variationIdx + 1) % DOCUMENT_VARIATIONS.length;
            setCurrentVariationIndex(nextIdx);
            // Small delay before next cycle
            setTimeout(() => runAnimationCycle(nextIdx), 800);
          }
        }
      });

      assemblyTimelineRef.current = mainTl;

      // ===== PHASE 1: Fragments appear and converge to document =====
      
      // Fragments fade in at scattered positions
      mainTl.to(".rfc-fragment", {
        opacity: 1,
        scale: 0.8,
        duration: 0.6,
        stagger: { each: 0.05, from: "random" },
        ease: "power2.out",
      });

      // Fragments converge toward document
      fragments.forEach((el, i) => {
        const frag = variation.fragments[i];
        if (!frag) return;
        mainTl.to(el, {
          left: `calc(50% - ${sideOffset * 100}vw + ${frag.finalXOffset * 100}vw)`,
          top: `calc(50% + ${frag.finalYOffset * 100}vh)`,
          duration: 1.2,
          ease: "power3.inOut",
        }, i === 0 ? "-=0.1" : "<0.03");
      });

      // Document page fades in
      mainTl.to(".document-page", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      }, "-=0.8");

      // Document glows
      mainTl.to(".document-page", {
        boxShadow: `0 0 60px ${colors.primary}, 0 0 120px ${colors.secondary}`,
        duration: 0.3,
        ease: "power2.in",
      });

      // Brief pause
      mainTl.to({}, { duration: 0.15 });

      // ===== PHASE 2: Magic transformation =====
      
      // Fragments fade out
      mainTl.to(".rfc-fragment", {
        opacity: 0,
        scale: 0.2,
        duration: 0.3,
        stagger: 0.02,
        ease: "power2.in",
      });

      // Magic particles appear
      mainTl.to(".magic-particle", {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        stagger: { each: 0.015, from: "random" },
        ease: "back.out(1.7)",
      }, "-=0.25");

      // Document moves right with whoosh
      mainTl.to(".document-page", {
        left: `calc(50% + ${sideOffset * 100}vw)`,
        scale: 0.4,
        opacity: 0.6,
        rotation: 12,
        filter: "blur(2px)",
        duration: 0.8,
        ease: "power2.inOut",
      }, "-=0.2");

      // Magic particles trail behind document
      mainTl.to(".magic-particle", {
        left: `calc(50% + ${sideOffset * 100}vw)`,
        y: (i: number) => Math.sin(i * 0.5) * 50,
        rotation: 360,
        duration: 0.8,
        ease: "power2.inOut",
        stagger: { each: 0.02, from: "start" },
      }, "-=0.8");

      // Document fades out
      mainTl.to(".document-page", {
        opacity: 0,
        scale: 0.2,
        filter: "blur(6px)",
        duration: 0.3,
        ease: "power2.in",
      }, "-=0.2");

      // ===== PHASE 3: Visualization emerges =====
      
      // Visualization appears
      mainTl.to(".visualization-preview", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.5)",
      }, "-=0.25");

      // Magic particles converge into visualization
      mainTl.to(".magic-particle", {
        left: `calc(50% + ${sideOffset * 100}vw)`,
        y: 0,
        scale: 0.3,
        opacity: 0,
        duration: 0.4,
        stagger: 0.015,
        ease: "power3.in",
      }, "-=0.3");

      // Visualization pulses
      mainTl.to(".visualization-preview", {
        boxShadow: `0 0 50px ${colors.primary}, 0 0 100px ${colors.glow}`,
        duration: 0.3,
        ease: "power2.in",
      });

      mainTl.to(".visualization-preview", {
        boxShadow: `0 0 30px ${colors.glow}`,
        duration: 0.25,
        ease: "power2.out",
      });

      // Hold visualization
      mainTl.to({}, { duration: 1.2 });

      // ===== PHASE 4: Fade out for next cycle =====
      
      mainTl.to(".visualization-preview", {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: "power2.in",
      });
    };

    // Start first cycle after a small delay for DOM readiness
    const timeout = setTimeout(() => runAnimationCycle(currentVariationIndex), 50);

    return () => {
      loopActiveRef.current = false;
      clearTimeout(timeout);
      if (assemblyTimelineRef.current) {
        assemblyTimelineRef.current.kill();
      }
    };
  }, [showDocumentAssembly, prefersReducedMotion]);

  // Effect 3: When hero is loaded, animate in the content
  useEffect(() => {
    if (!isLoaded) return;

    const tl = gsap.timeline();

    tl.fromTo(
      ".hero-glow",
      { opacity: 0, scale: 0.2 },
      { opacity: 1, scale: 1, duration: 1.0, ease: "power2.out" },
    );

    tl.fromTo(
      ".hero-title-line",
      { opacity: 0, y: 30, filter: "blur(6px)" },
      { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)",
        duration: 1.0,
        stagger: 0.12,
        ease: "power2.out"
      },
      "-=0.7"
    );

    tl.fromTo(
      ".hero-subtitle",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      "-=0.5"
    );

    tl.fromTo(
      ".hero-cta",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );

    tl.fromTo(
      ".hero-status",
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    );

    return () => { tl.kill(); };
  }, [isLoaded]);

  return (
    <section className="relative min-h-screen flex overflow-hidden bg-obsidian">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full transition-opacity duration-500 ${hideCanvas ? "opacity-0" : "opacity-100"}`}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian pointer-events-none z-10" />

      <div
        className={`
          boot-overlay absolute inset-0 z-30 bg-obsidian flex items-center justify-center
          ${!showBootOverlay ? "pointer-events-none" : ""}
        `}
      >
        <div 
          className="boot-scanline absolute inset-x-0 top-0 h-full pointer-events-none origin-top"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(255, 170, 0, 0.03) 45%, rgba(255, 170, 0, 0.08) 50%, rgba(255, 170, 0, 0.03) 55%, transparent 100%)",
            transform: "scaleY(0)",
          }}
        />
        
        <div className="boot-terminal-content max-w-2xl w-full px-8 relative">
          <div className="font-mono text-sm text-amber space-y-1">
            {showInitialCursor && (
              <div style={{ textShadow: "0 0 10px rgba(255, 170, 0, 0.5)" }}>
                <span className="text-amber">&gt; </span>
                <span className="inline-block w-2 h-4 bg-amber animate-pulse align-middle" />
              </div>
            )}
            {bootLines.map((line, i) => {
              const isLastLine = i === bootLines.length - 1;
              const showCursor = isLastLine && !line.complete;
              return (
                <div
                  key={i}
                  className="boot-line"
                  style={{
                    textShadow: "0 0 10px rgba(255, 170, 0, 0.5)",
                  }}
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

      {/* Document Assembly Layer - RFC fragments converging into a document, then transforming to visualization */}
      {showDocumentAssembly && (
        <div className="document-assembly-layer absolute inset-0 z-25 flex items-center justify-center pointer-events-none bg-obsidian">
          {/* The document page - positioned with viewport-relative units */}
          <div 
            className="document-page absolute w-44 h-56 sm:w-48 sm:h-64 border-2 rounded -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: 0,
              visibility: "hidden",
              left: "calc(50% - 30vw)",
              top: "50%",
              borderColor: "rgba(255, 170, 0, 0.4)",
              backgroundColor: "#000000",
              boxShadow: "0 0 25px rgba(255, 170, 0, 0.3)",
            }}
          >
            {/* Document header with dynamic content */}
            <div className="p-2" style={{ borderBottom: "1px solid rgba(255, 170, 0, 0.2)" }}>
              <div className="doc-header-text text-[9px] font-mono font-bold text-amber/80">RFC 793</div>
              <div className="doc-subheader-text text-[7px] font-mono text-amber/50 mt-0.5">TCP Handshake</div>
            </div>
            {/* Document lines with dynamic content */}
            <div className="p-2 space-y-1.5">
              {DOCUMENT_VARIATIONS[0].documentLines.map((line, i) => (
                <div
                  key={i}
                  className="doc-line text-[6px] font-mono text-amber/40 leading-tight truncate"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Magic particles for the transformation effect */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const radius = 50 + (i % 3) * 25;
            return (
              <div
                key={`magic-${i}`}
                className="magic-particle absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  opacity: 0,
                  visibility: "hidden",
                  left: `calc(50% - 30vw + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  width: 4 + (i % 3) * 2,
                  height: 4 + (i % 3) * 2,
                  borderRadius: "50%",
                  background: i % 2 === 0 
                    ? "radial-gradient(circle, rgba(255, 200, 100, 1) 0%, rgba(255, 140, 0, 0.6) 50%, transparent 100%)"
                    : "radial-gradient(circle, rgba(100, 200, 255, 1) 0%, rgba(0, 150, 255, 0.6) 50%, transparent 100%)",
                  boxShadow: i % 2 === 0 
                    ? "0 0 10px rgba(255, 170, 0, 0.8), 0 0 20px rgba(255, 140, 0, 0.4)"
                    : "0 0 10px rgba(0, 200, 255, 0.8), 0 0 20px rgba(0, 150, 255, 0.4)",
                }}
              />
            );
          })}

          {/* Visualization preview - positioned on the right with viewport-relative units */}
          <div 
            className="visualization-preview absolute w-48 h-36 sm:w-56 sm:h-40 rounded-lg overflow-hidden -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: 0,
              visibility: "hidden",
              left: "calc(50% + 30vw)",
              top: "50%",
              background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
              border: "1px solid rgba(0, 200, 255, 0.3)",
              boxShadow: "0 0 30px rgba(0, 200, 255, 0.3), 0 0 60px rgba(255, 170, 0, 0.15)",
            }}
          >
            {/* Mini visualization scene representation */}
            <div className="relative w-full h-full">
              {/* Grid lines */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 200, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 200, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />
              
              {/* Animated connection lines */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255, 170, 0, 0)" />
                    <stop offset="50%" stopColor="rgba(255, 170, 0, 0.8)" />
                    <stop offset="100%" stopColor="rgba(0, 200, 255, 0.8)" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 40 70 Q 110 45 180 70" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="2" 
                  fill="none"
                  strokeDasharray="8 4"
                  className="animate-dash"
                />
                <path 
                  d="M 45 95 Q 110 115 175 95" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="2" 
                  fill="none"
                  strokeDasharray="8 4"
                  className="animate-dash-reverse"
                />
              </svg>

              {/* Node representations */}
              <div 
                className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                style={{
                  left: 15,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "linear-gradient(135deg, rgba(255, 170, 0, 0.3) 0%, rgba(255, 100, 0, 0.2) 100%)",
                  border: "1px solid rgba(255, 170, 0, 0.5)",
                  boxShadow: "0 0 15px rgba(255, 170, 0, 0.4)",
                }}
              >
                <span className="node-left-label text-[7px] sm:text-[8px] font-mono text-amber font-bold">SYN</span>
              </div>
              
              <div 
                className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                style={{
                  right: 15,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "linear-gradient(135deg, rgba(0, 200, 255, 0.3) 0%, rgba(0, 100, 200, 0.2) 100%)",
                  border: "1px solid rgba(0, 200, 255, 0.5)",
                  boxShadow: "0 0 15px rgba(0, 200, 255, 0.4)",
                }}
              >
                <span className="node-right-label text-[7px] sm:text-[8px] font-mono text-cyan-400 font-bold">ACK</span>
              </div>

              {/* Floating packet indicator */}
              <div 
                className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, rgba(255, 220, 100, 1) 0%, rgba(255, 170, 0, 0.5) 100%)",
                  boxShadow: "0 0 10px rgba(255, 200, 0, 0.8)",
                }}
              />

              {/* Label */}
              <div 
                className="visual-label absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 text-[7px] sm:text-[8px] font-mono tracking-wider"
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                TCP HANDSHAKE
              </div>
            </div>
          </div>

          {/* Floating RFC fragments - 8 fragments, dynamically positioned */}
          {DOCUMENT_VARIATIONS[0].fragments.map((frag, i) => (
            <span
              key={i}
              className="rfc-fragment absolute font-mono text-xs font-semibold -translate-x-1/2 -translate-y-1/2"
              style={{
                opacity: 0,
                visibility: "hidden",
                left: `calc(50% - 30vw + ${frag.xOffset * 100}vw)`,
                top: `calc(50% + ${frag.yOffset * 100}vh)`,
                color: "#ffaa00",
                textShadow: "0 0 10px rgba(255, 170, 0, 0.7), 0 0 20px rgba(255, 140, 0, 0.4)",
              }}
            >
              {frag.text}
            </span>
          ))}
        </div>
      )}

      <div className="relative z-20 flex flex-col items-center justify-center w-full min-h-screen px-6 py-12">
        <div
          className={`
            text-center perspective-1000
            transition-opacity duration-500
            ${isLoaded ? "opacity-100" : "opacity-0"}
          `}
        >
          <div className="relative inline-block mb-8">
            <div className="hero-glow absolute -inset-8 bg-gradient-radial from-amber/5 via-transparent to-transparent blur-xl opacity-0" />
            
            <p className="hero-title-line text-amber tracking-[0.25em] text-xs sm:text-sm mb-6 opacity-0 font-mono">
              FROM TEXT TO VISUALIZATION
            </p>

            <h1 className="font-display tracking-tight mb-2">
              <span 
                className="hero-title-line block text-6xl sm:text-8xl lg:text-9xl font-bold text-text-bright opacity-0"
                style={{
                  textShadow: `
                    0 0 60px rgba(255, 199, 31, 0.3),
                    0 2px 0 rgba(0, 0, 0, 0.8),
                    0 4px 8px rgba(0, 0, 0, 0.5)
                  `
                }}
              >
                EXPLAIN
              </span>
              <span 
                className="hero-title-line block text-7xl sm:text-9xl lg:text-[12rem] font-bold opacity-0"
                style={{
                  background: "linear-gradient(135deg, #ff8c00 0%, #ffc71f 40%, #ffaa00 60%, #ff6b00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 40px rgba(255, 140, 0, 0.5)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))",
                }}
              >
                RFC
              </span>
            </h1>

            <div className="hero-subtitle opacity-0 mt-8 space-y-4">
              <div className="incised w-48 mx-auto" />
              <p className="font-display text-xl md:text-2xl text-text-secondary max-w-lg mx-auto">
                Dense protocols transformed into
                <span className="text-brass font-semibold"> interactive visualizations</span>
              </p>
            </div>
          </div>

          <div className="hero-cta mt-12 opacity-0">
            <a
              href="#vault"
              className="group inline-flex items-center gap-4 px-8 py-4 border border-patina/50 rounded-full hover:border-gold/80 hover:bg-gold/5 transition-all duration-300"
            >
              <span className="font-mono text-sm tracking-wider text-text-secondary group-hover:text-gold transition-colors">
                START EXPLORING
              </span>
              <svg 
                className="w-5 h-5 text-amber group-hover:text-gold group-hover:translate-y-1 transition-all duration-300"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
            
            <p className="mt-6 font-mono text-xs text-text-muted tracking-wide">
              CLICK ANYWHERE TO SEND PACKETS
            </p>
          </div>
        </div>
      </div>

      <div className="hero-status absolute bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-0">
        <div className="flex items-center gap-2 text-text-muted font-mono text-xs">
          <span className="inline-block w-2 h-2 bg-green-500/60 rounded-full animate-pulse" />
          <span>TRANSMISSION ACTIVE</span>
        </div>
      </div>
    </section>
  );
}
