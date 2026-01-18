import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

interface BootLine {
  text: string;
  typingSpeed: number;
  postDelay: number;
  isProgressBar?: boolean;
}

const BOOT_SEQUENCE: BootLine[] = [
  { text: "> INITIALIZING PROTOCOL MUSEUM v2.0", typingSpeed: 35, postDelay: 300 },
  { text: "> ESTABLISHING SECURE CHANNEL", typingSpeed: 30, postDelay: 200 },
  { text: "  SYN ────────────────────────►", typingSpeed: 15, postDelay: 350 },
  { text: "  ◄──────────────────── SYN-ACK", typingSpeed: 15, postDelay: 350 },
  { text: "  ACK ────────────────────────►", typingSpeed: 15, postDelay: 250 },
  { text: "> CONNECTION ESTABLISHED", typingSpeed: 25, postDelay: 300 },
  { text: "> LOADING RFC ARCHIVE...", typingSpeed: 40, postDelay: 100 },
  { text: "  [                    ] 0%", typingSpeed: 0, postDelay: 0, isProgressBar: true },
  { text: "> WELCOME TO THE ARCHIVE", typingSpeed: 45, postDelay: 500 },
];

const RFC_FRAGMENTS = [
  "SYN", "ACK", "FIN", "TCP", "UDP", "HTTP",
  "RFC793", "RFC2616", "SEQ", "TTL",
  "GET", "POST", "200", "404",
  "port:443", "CONNECT", "LISTEN",
];

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
  const [titleVisible, setTitleVisible] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [bootLines, setBootLines] = useState<{ text: string; complete: boolean }[]>([]);
  const [showBootOverlay, setShowBootOverlay] = useState(true);
  const [showInitialCursor, setShowInitialCursor] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showDocumentAssembly, setShowDocumentAssembly] = useState(false);
  const [hideCanvas, setHideCanvas] = useState(false);
  const bootStartedRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const createParticle = useCallback(
    (width: number, height: number, existingParticles: Particle[]): Particle => {
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

    const runBootSequence = async () => {
      if (bootStartedRef.current) return;
      bootStartedRef.current = true;

      await new Promise(r => setTimeout(r, 800));
      setShowInitialCursor(false);

      for (let lineIdx = 0; lineIdx < BOOT_SEQUENCE.length; lineIdx++) {
        const line = BOOT_SEQUENCE[lineIdx];
        
        if (line.isProgressBar) {
          setBootLines(prev => [...prev, { text: "  [                    ] 0%", complete: false }]);
          
          const progressDuration = 1200;
          const steps = 20;
          const stepDuration = progressDuration / steps;
          
          for (let i = 1; i <= steps; i++) {
            await new Promise(r => setTimeout(r, stepDuration));
            const filled = "█".repeat(i);
            const empty = " ".repeat(steps - i);
            const percent = Math.round((i / steps) * 100);
            setBootLines(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { 
                text: `  [${filled}${empty}] ${percent}%`, 
                complete: i === steps 
              };
              return updated;
            });
            setProgressPercent(Math.round((i / steps) * 100));
          }
          await new Promise(r => setTimeout(r, 200));
        } else {
          setBootLines(prev => [...prev, { text: "", complete: false }]);
          
          const chars = line.text.split("");
          for (let charIdx = 0; charIdx < chars.length; charIdx++) {
            await new Promise(r => setTimeout(r, line.typingSpeed + (Math.random() - 0.5) * 20));
            setBootLines(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { 
                text: line.text.slice(0, charIdx + 1), 
                complete: false 
              };
              return updated;
            });
          }
          
          setBootLines(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], complete: true };
            return updated;
          });
          
          await new Promise(r => setTimeout(r, line.postDelay));
        }
      }

      await new Promise(r => setTimeout(r, 400));
      setBootComplete(true);
    };

    runBootSequence();

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

  // Effect 2: When document assembly layer mounts, run the fragment animation
  useEffect(() => {
    if (!showDocumentAssembly) return;

    // Small delay to ensure DOM is rendered
    const timeout = setTimeout(() => {
      const fragments = document.querySelectorAll(".rfc-fragment");
      if (fragments.length === 0) return;

      // Set initial positions from data attributes
      fragments.forEach((el) => {
        const x = parseFloat(el.getAttribute("data-x") || "0");
        const y = parseFloat(el.getAttribute("data-y") || "0");
        gsap.set(el, { x, y, opacity: 0, scale: 0.5 });
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setShowDocumentAssembly(false);
          setIsLoaded(true);
          setTitleVisible(true);
        }
      });

      // Fragments fade in at their starting positions
      tl.to(".rfc-fragment", {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        stagger: {
          each: 0.08,
          from: "random",
        },
        ease: "power2.out",
      });

      // Fragments converge toward their final positions within the document
      fragments.forEach((el, i) => {
        const finalX = parseFloat(el.getAttribute("data-final-x") || "0");
        const finalY = parseFloat(el.getAttribute("data-final-y") || "0");
        tl.to(el, {
          x: finalX,
          y: finalY,
          duration: 1.8,
          ease: "power3.inOut",
        }, i === 0 ? "-=0.3" : "<0.05");
      });

      // Document page fades in as fragments arrive
      tl.to(".document-page", {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
      }, "-=1.2");

      // Document glows intensely
      tl.to(".document-page", {
        boxShadow: "0 0 80px rgba(255, 170, 0, 0.8), 0 0 150px rgba(255, 140, 0, 0.5)",
        duration: 0.5,
        ease: "power2.in",
      });

      // Small pause
      tl.to({}, { duration: 0.3 });

      // Everything dissolves
      tl.to(".rfc-fragment", {
        opacity: 0,
        scale: 0.3,
        duration: 0.5,
        stagger: 0.02,
        ease: "power2.in",
      });

      tl.to(".document-page", {
        opacity: 0,
        scale: 1.2,
        filter: "blur(15px)",
        duration: 0.5,
        ease: "power2.in",
      }, "-=0.4");
    }, 50);

    return () => clearTimeout(timeout);
  }, [showDocumentAssembly]);

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
                <span className="inline-block w-2 h-4 bg-amber animate-pulse" />
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

      {/* Document Assembly Layer - RFC fragments converging into a document */}
      {showDocumentAssembly && (
        <div className="document-assembly-layer absolute inset-0 z-25 flex items-center justify-center pointer-events-none bg-[#0a0a0a]">
          {/* The document page that fragments converge into */}
          <div 
            className="document-page absolute w-72 h-96 border-2 rounded"
            style={{
              opacity: 0,
              transform: "scale(0.8)",
              borderColor: "rgba(255, 170, 0, 0.4)",
              backgroundColor: "#0a0a0a",
              boxShadow: "0 0 30px rgba(255, 170, 0, 0.3)",
            }}
          >
            {/* Document header */}
            <div className="p-3" style={{ borderBottom: "1px solid rgba(255, 170, 0, 0.2)" }}>
              <div className="h-2 w-20 rounded-full" style={{ backgroundColor: "rgba(255, 170, 0, 0.3)" }} />
              <div className="h-1.5 w-32 rounded-full mt-2" style={{ backgroundColor: "rgba(255, 170, 0, 0.15)" }} />
            </div>
            {/* Document lines */}
            <div className="p-4 space-y-3">
              {[85, 70, 90, 60, 80, 75, 65, 85].map((width, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full"
                  style={{ width: `${width}%`, backgroundColor: "rgba(255, 170, 0, 0.2)" }}
                />
              ))}
            </div>
          </div>

          {/* Floating RFC fragments - GSAP will set x/y from data attributes */}
          {/* Each fragment has start position (x,y) and final position (finalX, finalY) within the document */}
          {[
            { text: "MUST", x: -280, y: -180, finalX: -60, finalY: -140 },
            { text: "SHALL", x: 260, y: -150, finalX: 40, finalY: -100 },
            { text: "sequence number", x: -220, y: 120, finalX: -30, finalY: 60 },
            { text: "RFC 793", x: 200, y: 180, finalX: 0, finalY: -160 },
            { text: "header", x: -300, y: 30, finalX: -50, finalY: -20 },
            { text: "protocol", x: 280, y: -60, finalX: 30, finalY: 20 },
            { text: "§3.1", x: -120, y: -220, finalX: 60, finalY: -60 },
            { text: "ACK", x: 160, y: 140, finalX: -40, finalY: 100 },
            { text: "SYN", x: -180, y: -80, finalX: 50, finalY: 140 },
            { text: "FIN", x: 220, y: 60, finalX: -20, finalY: -80 },
            { text: "TTL", x: -250, y: 180, finalX: 20, finalY: 40 },
            { text: "port:443", x: 140, y: -200, finalX: -10, finalY: 80 },
          ].map((frag, i) => (
            <span
              key={i}
              className="rfc-fragment absolute font-mono text-sm font-semibold"
              data-x={frag.x}
              data-y={frag.y}
              data-final-x={frag.finalX}
              data-final-y={frag.finalY}
              style={{
                opacity: 0,
                color: "#ffaa00",
                textShadow: "0 0 12px rgba(255, 170, 0, 0.7), 0 0 24px rgba(255, 140, 0, 0.4)",
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
