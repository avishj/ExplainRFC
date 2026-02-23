import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { TransitionCLI, TRANSITION_SEQUENCES } from "@components/ui/TransitionCLI";

// RFC variation data for the document → diagram morph animation
interface RFCVariation {
  id: string;
  rfcNumber: string;
  title: string;
  section: string;
  accentHue: "amber" | "cyan" | "emerald" | "violet";
  prose: { heading: string; paragraphs: string[] };
  terms: { text: string; x: number; y: number }[];
  connections: [number, number][];
  diagramLabel: string;
}

const RFC_VARIATIONS: RFCVariation[] = [
  {
    id: "tcp",
    rfcNumber: "RFC 793",
    title: "Transmission Control Protocol",
    section: "§3.4",
    accentHue: "amber",
    prose: {
      heading: "3.4. Establishing a Connection",
      paragraphs: [
        "The three-way handshake is the procedure used to establish a connection. The client sends a SYN segment to the server. The server responds with SYN-ACK. Finally the client sends ACK to complete the handshake sequence.",
        "Each segment carries a sequence number for reliable, ordered delivery of data.",
      ],
    },
    terms: [
      { text: "SYN", x: 15, y: 25 },
      { text: "SYN-ACK", x: 50, y: 18 },
      { text: "ACK", x: 85, y: 25 },
      { text: "SEQ", x: 25, y: 65 },
      { text: "ESTABLISHED", x: 50, y: 80 },
      { text: "FIN", x: 75, y: 65 },
    ],
    connections: [[0, 1], [1, 2], [0, 3], [2, 5], [3, 4], [4, 5]],
    diagramLabel: "TCP HANDSHAKE",
  },
  {
    id: "bgp",
    rfcNumber: "RFC 4271",
    title: "Border Gateway Protocol 4",
    section: "§6.1",
    accentHue: "emerald",
    prose: {
      heading: "6.1. UPDATE Message Handling",
      paragraphs: [
        "An UPDATE message is used to advertise feasible routes to a peer, or to withdraw unfeasible routes. An UPDATE includes the AS_PATH attribute listing traversed autonomous systems.",
        "LOCAL_PREF indicates the degree of preference for an external route. KEEPALIVE messages are exchanged to confirm peer connectivity.",
      ],
    },
    terms: [
      { text: "OPEN", x: 15, y: 22 },
      { text: "UPDATE", x: 50, y: 15 },
      { text: "AS_PATH", x: 85, y: 22 },
      { text: "LOCAL_PREF", x: 20, y: 68 },
      { text: "KEEPALIVE", x: 50, y: 82 },
      { text: "WITHDRAW", x: 80, y: 68 },
    ],
    connections: [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4]],
    diagramLabel: "BGP PEERING",
  },
  {
    id: "http",
    rfcNumber: "RFC 2616",
    title: "Hypertext Transfer Protocol",
    section: "§5.1",
    accentHue: "cyan",
    prose: {
      heading: "5.1. Request-Line",
      paragraphs: [
        "The Request-Line begins with a method token such as GET or POST, followed by the URI and the protocol version. The Host header field MUST be included in all requests.",
        "The server responds with a status code such as 200 OK and includes Content-Type and Cache-Control headers in the response.",
      ],
    },
    terms: [
      { text: "GET", x: 12, y: 22 },
      { text: "POST", x: 12, y: 55 },
      { text: "Host", x: 40, y: 15 },
      { text: "200 OK", x: 88, y: 38 },
      { text: "Content-Type", x: 55, y: 75 },
      { text: "Cache-Control", x: 55, y: 45 },
    ],
    connections: [[0, 2], [0, 3], [1, 3], [2, 5], [3, 4], [3, 5]],
    diagramLabel: "HTTP REQUEST",
  },
  {
    id: "dns",
    rfcNumber: "RFC 1035",
    title: "Domain Name System",
    section: "§4.1",
    accentHue: "violet",
    prose: {
      heading: "4.1. Format",
      paragraphs: [
        "A QUERY message specifies the QNAME of the domain to resolve. The resolver first checks its local cache. An A record maps a domain to an IPv4 address. CNAME records alias one domain name to another canonical name.",
        "The TTL field controls how long a record may be cached. NS records delegate subdomains.",
      ],
    },
    terms: [
      { text: "QUERY", x: 15, y: 20 },
      { text: "A", x: 50, y: 15 },
      { text: "CNAME", x: 85, y: 20 },
      { text: "TTL", x: 25, y: 70 },
      { text: "NS", x: 75, y: 70 },
      { text: "ANSWER", x: 50, y: 82 },
    ],
    connections: [[0, 1], [0, 2], [1, 5], [2, 5], [3, 5], [4, 5]],
    diagramLabel: "DNS LOOKUP",
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

export function FoundryHero() {
  // Check skip condition once to set correct initial states (avoids flash)
  const skipIntroRef = useRef(
    typeof window !== "undefined" && !!sessionStorage.getItem('rfcVisitedAt')
  );
  const skipIntro = skipIntroRef.current;
  
  const [isLoaded, setIsLoaded] = useState(skipIntro);
  const [showBootOverlay, setShowBootOverlay] = useState(!skipIntro);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);
  const assemblyTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const loopActiveRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Skip intro if returning from RFC visit
  useEffect(() => {
    if (!skipIntro) return;
    sessionStorage.removeItem('rfcVisitedAt');
  }, []);

  // Effect 1: Morph animation loop — RFC document → diagram
  useEffect(() => {
    if (showBootOverlay) return;
    if (prefersReducedMotion) return;

    loopActiveRef.current = true;

    const runAnimationCycle = (variationIdx: number) => {
      if (!loopActiveRef.current) return;

      const variation = RFC_VARIATIONS[variationIdx];
      const colors = ACCENT_COLORS[variation.accentHue];

      const stage = document.querySelector(".morph-stage");
      if (!stage) return;

      const rfcDoc = stage.querySelector(".rfc-document");
      const diagram = stage.querySelector(".rfc-diagram");
      const proseHeading = stage.querySelector(".rfc-prose-heading");
      const proseParagraphs = stage.querySelectorAll(".rfc-prose-para");
      const termNodes = stage.querySelectorAll(".diagram-node");
      const connLines = stage.querySelectorAll(".diagram-line");
      const diagramLabel = stage.querySelector(".diagram-label");
      const rfcHeader = stage.querySelector(".rfc-doc-number");
      const rfcTitle = stage.querySelector(".rfc-doc-title");
      const rfcSection = stage.querySelector(".rfc-doc-section");

      if (!rfcDoc || !diagram) return;

      // Update text content for this variation
      rfcHeader?.replaceChildren(variation.rfcNumber);
      rfcTitle?.replaceChildren(variation.title);
      rfcSection?.replaceChildren(variation.section);
      diagramLabel?.replaceChildren(variation.diagramLabel);
      if (proseHeading) proseHeading.textContent = variation.prose.heading;
      proseParagraphs.forEach((el, i) => {
        el.textContent = variation.prose.paragraphs[i] ?? "";
      });
      termNodes.forEach((el, i) => {
        const term = variation.terms[i];
        if (!term) return;
        el.textContent = term.text;
        (el as HTMLElement).style.left = `${term.x}%`;
        (el as HTMLElement).style.top = `${term.y}%`;
      });

      // Build SVG connection paths
      connLines.forEach((el, i) => {
        const conn = variation.connections[i];
        if (!conn) { gsap.set(el, { opacity: 0 }); return; }
        const from = variation.terms[conn[0]];
        const to = variation.terms[conn[1]];
        if (!from || !to) return;
        el.setAttribute("x1", `${from.x}%`);
        el.setAttribute("y1", `${from.y}%`);
        el.setAttribute("x2", `${to.x}%`);
        el.setAttribute("y2", `${to.y}%`);
      });

      const streamParticles = stage.querySelectorAll(".stream-particle");

      // Reset initial states
      gsap.set(rfcDoc, { opacity: 0, scale: 0.92, filter: "blur(4px)", visibility: "visible" });
      gsap.set(diagram, { opacity: 0, scale: 0.9, visibility: "visible" });
      gsap.set(".diagram-node", { opacity: 0, scale: 0.3 });
      gsap.set(".diagram-line", { opacity: 0, strokeDashoffset: 200 });
      gsap.set(".stream-particle", { opacity: 0, left: "calc(50% - 28vw)", top: "50%" });

      if (assemblyTimelineRef.current) assemblyTimelineRef.current.kill();

      const tl = gsap.timeline({
        onComplete: () => {
          if (!loopActiveRef.current) return;
          const nextIdx = (variationIdx + 1) % RFC_VARIATIONS.length;
          setCurrentVariationIndex(nextIdx);
          setTimeout(() => runAnimationCycle(nextIdx), 600);
        },
      });
      assemblyTimelineRef.current = tl;

      // === Phase 1: RFC document fades in on left ===
      tl.to(rfcDoc, {
        opacity: 1, scale: 1, filter: "blur(0px)",
        duration: 1.0, ease: "power2.out",
      });

      // Prose heading + paragraphs stagger in
      tl.fromTo(".rfc-prose-heading",
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
        "-=0.6"
      );
      tl.fromTo(".rfc-prose-para",
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.2"
      );

      // Hold document
      tl.to({}, { duration: 0.8 });

      // === Phase 2: Streaming particles bridge from left to right ===
      // Document glows brighter as particles emit
      tl.to(rfcDoc, {
        boxShadow: `0 0 60px ${colors.primary}, 0 0 100px ${colors.secondary}`,
        duration: 0.4, ease: "power2.in",
      });

      // Particles stream across
      streamParticles.forEach((el, i) => {
        const yWave = (Math.random() - 0.5) * 60;
        const delay = i === 0 ? "-=0.1" : "-=0.35";
        tl.to(el, { opacity: 1, duration: 0.1 }, delay);
        tl.to(el, {
          left: "calc(50% + 28vw)",
          top: `calc(50% + ${yWave}px)`,
          duration: 0.6 + Math.random() * 0.3,
          ease: "power2.in",
        }, "<");
        tl.to(el, { opacity: 0, duration: 0.2 }, ">-0.15");
      });

      // Document fades as particles leave
      tl.to(rfcDoc, {
        opacity: 0.15, filter: "blur(3px)", scale: 0.95,
        duration: 0.6, ease: "power2.in",
      }, "-=0.8");

      // === Phase 3: Diagram materializes on right ===
      tl.to(diagram, {
        opacity: 1, scale: 1,
        duration: 0.5, ease: "power2.out",
      }, "-=0.3");

      // Nodes appear with stagger
      tl.to(".diagram-node", {
        opacity: 1, scale: 1,
        duration: 0.5,
        stagger: { each: 0.07, from: "random" },
        ease: "back.out(1.7)",
      }, "-=0.2");

      // Connection lines draw in
      tl.to(".diagram-line", {
        opacity: 0.6, strokeDashoffset: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power2.inOut",
      }, "-=0.3");

      // Glow pulse
      tl.to(".diagram-node", {
        textShadow: `0 0 12px ${colors.primary}, 0 0 24px ${colors.glow}`,
        duration: 0.3, ease: "power2.in",
      });
      tl.to(".diagram-node", {
        textShadow: `0 0 6px ${colors.glow}`,
        duration: 0.3, ease: "power2.out",
      });

      // Fully fade out document during diagram hold
      tl.to(rfcDoc, {
        opacity: 0, duration: 0.3, ease: "power2.in",
      }, "-=0.3");

      // Hold diagram
      tl.to({}, { duration: 1.2 });

      // === Phase 4: Fade out for next cycle ===
      tl.to(diagram, {
        opacity: 0, scale: 0.95,
        duration: 0.5, ease: "power2.in",
      });
      tl.to(".diagram-node", { opacity: 0, duration: 0.3 }, "<");
      tl.to(".diagram-line", { opacity: 0, duration: 0.3 }, "<");
    };

    const timeout = setTimeout(() => runAnimationCycle(currentVariationIndex), 50);

    return () => {
      loopActiveRef.current = false;
      clearTimeout(timeout);
      if (assemblyTimelineRef.current) assemblyTimelineRef.current.kill();
    };
  }, [showBootOverlay, prefersReducedMotion]);

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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian pointer-events-none z-10" />

      {showBootOverlay && (
        <TransitionCLI
          sequence={TRANSITION_SEQUENCES.boot()}
          initialDelay={400}
          progressDuration={450}
          finalWait={150}
          exitDuration={0.7}
          onComplete={() => {
            setShowBootOverlay(false);
            setIsLoaded(true);
          }}
        />
      )}

      {/* Morph Stage — left RFC doc, right diagram, particle bridge between */}
      {!showBootOverlay && (
        <div className="morph-stage absolute inset-0 z-[5] pointer-events-none">

          {/* RFC Document — left side */}
          <div
            className="rfc-document absolute w-[280px] sm:w-[320px] rounded-lg overflow-hidden -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: 0,
              visibility: "hidden",
              left: "calc(50% - 28vw)",
              top: "50%",
              background: "linear-gradient(180deg, #0c0c0c 0%, #080808 100%)",
              border: "1px solid rgba(255, 170, 0, 0.25)",
              boxShadow: "0 0 40px rgba(255, 170, 0, 0.08)",
            }}
          >
            {/* IETF-style header bar */}
            <div
              className="flex items-center justify-between px-3 py-1.5"
              style={{ borderBottom: "1px solid rgba(255, 170, 0, 0.15)" }}
            >
              <div className="flex items-center gap-2">
                <span className="rfc-doc-number text-[10px] sm:text-xs font-mono font-bold text-amber/80">
                  {RFC_VARIATIONS[0].rfcNumber}
                </span>
                <span className="rfc-doc-section text-[9px] sm:text-[10px] font-mono text-amber/40">
                  {RFC_VARIATIONS[0].section}
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-mono text-text-muted/40 tracking-wider">
                IETF
              </span>
            </div>

            {/* Title */}
            <div className="px-3 py-1.5" style={{ borderBottom: "1px solid rgba(255, 170, 0, 0.08)" }}>
              <div className="rfc-doc-title text-[9px] sm:text-[11px] font-mono text-amber/50">
                {RFC_VARIATIONS[0].title}
              </div>
            </div>

            {/* Prose body */}
            <div className="px-3 py-2 space-y-2">
              <div
                className="rfc-prose-heading font-mono text-[9px] sm:text-[11px] font-bold text-amber/60 leading-relaxed"
                style={{ opacity: 0 }}
              >
                {RFC_VARIATIONS[0].prose.heading}
              </div>
              {RFC_VARIATIONS[0].prose.paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="rfc-prose-para font-mono text-[8px] sm:text-[10px] text-amber/30 leading-relaxed"
                  style={{ opacity: 0 }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Streaming particles — bridge from doc to diagram */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`stream-${i}`}
              className="stream-particle absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                opacity: 0,
                left: "calc(50% - 28vw)",
                top: "50%",
                background: "radial-gradient(circle, rgba(255, 200, 100, 1) 0%, rgba(255, 140, 0, 0.4) 100%)",
                boxShadow: "0 0 8px rgba(255, 170, 0, 0.6)",
              }}
            />
          ))}

          {/* Diagram — right side */}
          <div
            className="rfc-diagram absolute w-[200px] h-[160px] sm:w-[240px] sm:h-[180px] rounded-lg overflow-hidden -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: 0,
              visibility: "hidden",
              left: "calc(50% + 28vw)",
              top: "50%",
              background: "linear-gradient(135deg, #060610 0%, #0a0a1a 100%)",
              border: "1px solid rgba(0, 200, 255, 0.2)",
            }}
          >
            {/* Grid background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 200, 255, 0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 200, 255, 0.06) 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />

            {/* SVG connection lines */}
            <svg className="absolute inset-0 w-full h-full">
              {RFC_VARIATIONS[0].connections.map((_, i) => (
                <line
                  key={i}
                  className="diagram-line"
                  stroke="rgba(0, 200, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="200"
                  strokeDashoffset="200"
                  style={{ opacity: 0 }}
                />
              ))}
            </svg>

            {/* Term nodes */}
            {RFC_VARIATIONS[0].terms.map((term, i) => (
              <span
                key={i}
                className="diagram-node absolute font-mono text-[10px] sm:text-xs font-bold -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${term.x}%`,
                  top: `${term.y}%`,
                  opacity: 0,
                  color: "#ffaa00",
                  textShadow: "0 0 6px rgba(255, 170, 0, 0.4)",
                }}
              >
                {term.text}
              </span>
            ))}

            {/* Diagram label */}
            <div
              className="diagram-label absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-mono tracking-widest"
              style={{ color: "rgba(255, 255, 255, 0.35)" }}
            >
              {RFC_VARIATIONS[0].diagramLabel}
            </div>
          </div>

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
              FROM RFC TO VISUALIZATION
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
