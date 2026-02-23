import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { TransitionCLI, TRANSITION_SEQUENCES } from "@components/ui/TransitionCLI";

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

export function FoundryHero() {
  // Check skip condition once to set correct initial states (avoids flash)
  const skipIntroRef = useRef(
    typeof window !== "undefined" && !!sessionStorage.getItem('rfcVisitedAt')
  );
  const skipIntro = skipIntroRef.current;
  
  const [isLoaded, setIsLoaded] = useState(skipIntro);
  const [, setTitleVisible] = useState(false);
  const [showBootOverlay, setShowBootOverlay] = useState(!skipIntro);
  const [showDocumentAssembly, setShowDocumentAssembly] = useState(skipIntro);
  const skipAnimationsRef = useRef(skipIntro);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);
  const assemblyTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const loopActiveRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Skip intro if returning from RFC visit
  useEffect(() => {
    if (!skipAnimationsRef.current) return;
    sessionStorage.removeItem('rfcVisitedAt');
  }, []);

  // Effect 1: When document assembly layer mounts, run the fragment animation in a loop
  useEffect(() => {
    if (!showDocumentAssembly) return;
    if (prefersReducedMotion) return;

    loopActiveRef.current = true;

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
          if (loopActiveRef.current) {
            const nextIdx = (variationIdx + 1) % DOCUMENT_VARIATIONS.length;
            setCurrentVariationIndex(nextIdx);
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
            setShowDocumentAssembly(true);
            setIsLoaded(true);
          }}
        />
      )}

      {/* Document Assembly Layer - RFC fragments converging into a document, then transforming to visualization */}
      {showDocumentAssembly && (
        <div className="document-assembly-layer absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
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
