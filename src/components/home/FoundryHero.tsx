import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

const RFC_FRAGMENTS = [
  "SYN", "ACK", "FIN", "RST", "PSH", "URG",
  "RFC793", "RFC2616", "RFC7231", "RFC8446",
  "TCP", "UDP", "HTTP", "TLS", "DNS", "QUIC",
  "0x00", "0xFF", "0x1A", "0xBE", "0xEF",
  "SEQ", "WIN", "LEN", "TTL", "MSS",
  "GET", "POST", "HEAD", "PUT", "DELETE",
  "200", "404", "500", "301", "418",
  "HELO", "EHLO", "MAIL", "RCPT", "DATA",
  "::1", "0.0.0.0", "127.0.0.1",
  "port:80", "port:443", "port:22",
  "▓▓▓", "░░░", "███", "▒▒▒",
  ">>>", "<<<", "===", "---", "+++",
  "CONNECT", "CLOSE", "LISTEN", "ESTABLISHED",
  "src→dst", "req→res", "syn→ack",
  "[OK]", "[ERR]", "[???]", "[...]",
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

export function FoundryHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const timeRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);

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

      const gridOpacity = 0.03 + 0.01 * Math.sin(timestamp * 0.001);
      ctx.strokeStyle = `rgba(255, 170, 0, ${gridOpacity})`;
      ctx.lineWidth = 0.5;
      
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(255, 199, 31, 0.02)`;
      for (let i = 0; i < 3; i++) {
        const scanY = ((timestamp * 0.05 + i * height / 3) % height);
        ctx.fillRect(0, scanY, width, 2);
      }

      animationId = requestAnimationFrame(draw);
    };

    setTimeout(() => setIsLoaded(true), 500);
    setTimeout(() => setTitleVisible(true), 1000);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resize);
      particles.length = 0;
      connections.length = 0;
      ripples.length = 0;
    };
  }, [createParticle, prefersReducedMotion]);

  useEffect(() => {
    if (!titleVisible) return;

    const tl = gsap.timeline();
    
    tl.fromTo(
      ".hero-title-line",
      { opacity: 0, y: 40, rotateX: -15 },
      { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        duration: 1.2, 
        stagger: 0.15,
        ease: "power3.out"
      }
    );

    tl.fromTo(
      ".hero-subtitle",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );

    tl.fromTo(
      ".hero-cta",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    return () => {
      tl.kill();
    };
  }, [titleVisible]);

  return (
    <section className="relative min-h-screen flex overflow-hidden bg-obsidian">
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian pointer-events-none z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center w-full min-h-screen px-6 py-12">
        <div
          className={`
            text-center perspective-1000
            transition-opacity duration-500
            ${isLoaded ? "opacity-100" : "opacity-0"}
          `}
        >
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-8 bg-gradient-radial from-amber/5 via-transparent to-transparent blur-xl" />
            
            <p className="hero-title-line museum-label text-amber tracking-[0.3em] mb-6 opacity-0">
              THE PROTOCOL VISUALIZATION MUSEUM
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
                Where dense specifications become
                <span className="text-brass font-semibold"> living exhibits</span>
              </p>
            </div>
          </div>

          <div className="hero-cta mt-12 opacity-0">
            <a
              href="#vault"
              className="group inline-flex items-center gap-4 px-8 py-4 border border-patina/50 rounded-full hover:border-gold/80 hover:bg-gold/5 transition-all duration-300"
            >
              <span className="font-mono text-sm tracking-wider text-text-secondary group-hover:text-gold transition-colors">
                EXPLORE THE ARCHIVE
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

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 text-text-muted font-mono text-xs">
          <span className="inline-block w-2 h-2 bg-green-500/60 rounded-full animate-pulse" />
          <span>TRANSMISSION ACTIVE</span>
        </div>
      </div>
    </section>
  );
}
