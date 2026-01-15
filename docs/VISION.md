# Explain RFC — Vision & Implementation Plan

> *"A museum of invisible systems."*

---

## The Concept

**Explain RFC** is not a documentation site. It's an **interactive protocol museum** — a collection of crafted exhibits where each RFC becomes a living, explorable experience.

The internet runs on invisible protocols: packets flying through routers, handshakes negotiating trust, state machines orchestrating chaos into order. These systems are beautiful, but their beauty is hidden in dense technical specifications. We make that beauty visible.

---

## Design Philosophy: "Holographic Blueprints in the Dark"

### Visual Identity

The site feels like stepping into a **dark control room** where protocols are projected as **holographic blueprints** — technical, precise, but alive with motion and light.

| Element | Treatment |
|---------|-----------|
| **Background** | Deep blacks with subtle noise/grain texture |
| **Surfaces** | "Black glass" panels with thin luminous borders |
| **Accents** | Neon holographic colors — each RFC gets its own palette |
| **Typography** | Monospace for technical content, geometric sans for UI |
| **Grid** | Blueprint-style overlays with measurement ticks and annotations |
| **Motion** | Everything breathes — subtle pulses, data flows, gentle parallax |

### Light Mode Alternative

"Paper blueprint" aesthetic: off-white background, navy ink lines, reduced glow. Still technical and premium, never generic.

### What Makes This Different

Most technical learning sites follow the pattern: text article → static diagram → maybe a video.

We invert this: **the visualization IS the primary medium**. Text provides narration. The user doesn't read about how TCP works — they watch it happen, control it, and explore it.

---

## Core Experience: The Exhibit Player

Each RFC is presented as a **guided walkthrough with an interactive exhibit**.

```
┌──────────────────────────────────────────────────────────────────┐
│  ◀ Back to Museum                              Theme ◐   ⌘K     │
├──────────────┬───────────────────────────────────┬───────────────┤
│              │                                   │               │
│  NARRATION   │       LIVE EXHIBIT                │  INSTRUMENTS  │
│              │       (2D/3D Scene)               │               │
│  Step 3/12   │                                   │  ┌─────────┐  │
│              │     ╭─────╮        ╭─────╮        │  │ Packet  │  │
│  "The client │     │ SYN │───────▶│     │        │  │ Inspector│ │
│  initiates   │     ╰─────╯        ╰─────╯        │  └─────────┘  │
│  by sending  │                                   │               │
│  a SYN..."   │       CLIENT        SERVER        │  ┌─────────┐  │
│              │                                   │  │ State   │  │
│  ┌─────────┐ │                                   │  │ Machine │  │
│  │ ◀ │ ▶ │ ▶▶│ │                                   │  └─────────┘  │
│  └─────────┘ │                                   │               │
│              │                                   │  ┌─────────┐  │
│  ━━━●━━━━━━━ │                                   │  │ Glossary│  │
│  Timeline    │                                   │  └─────────┘  │
│              │                                   │               │
└──────────────┴───────────────────────────────────┴───────────────┘
```

### Three Panels

1. **Narration** (left)
   - Current step explanation in plain language
   - Step navigation (prev/next) + timeline scrubber
   - "What to notice" callouts
   - Deep-linkable: `/rfc/793#step-7`

2. **Live Exhibit** (center)
   - The visualization — 2D, 3D, or hybrid
   - Responds to steps: camera moves, elements highlight, packets animate
   - Interactive: hover for details, drag to rotate, click to inspect
   - Each RFC can have a wildly different scene

3. **Instruments** (right, collapsible)
   - **Packet Inspector**: shows current packet structure, headers, fields
   - **State Machine**: visual FSM with current state highlighted
   - **Glossary**: instant definitions without leaving the page
   - **Layer Toggles**: hide/show handshake, crypto, congestion windows, etc.

---

## Home: The Constellation Map

The landing page is not a list. It's a **navigable star map of RFC relationships**.

```
                        ┌─────┐
                   ┌────│HTTP/3│
                   │    └─────┘
              ┌────┴─┐
         ┌────│ QUIC │────────┐
         │    └──────┘        │
    ┌────┴─┐              ┌───┴──┐
    │ TLS  │──────────────│ UDP  │
    └──────┘              └──────┘
         │                    │
    ┌────┴─────────────────────┴────┐
    │              TCP              │
    └───────────────────────────────┘
                   │
              ┌────┴────┐
              │   IP    │
              └─────────┘
```

- **Nodes** = RFC exhibits (pulsing, alive)
- **Edges** = dependencies ("understands" / "builds on")
- **Hover** = exhibit poster (title, difficulty, time, concepts)
- **Click** = enter the exhibit
- **Learning paths** = highlighted trails through the constellation

---

## Visualization Principles

### Every RFC is Unique, But Unified

Each visualization can be completely different in style and approach — what matters is that it **serves the explanation**:

| RFC | Visualization Concept |
|-----|----------------------|
| **TCP (793)** | Two entities as glowing nodes performing a choreographed handshake dance; sliding window as a fluid buffer |
| **DNS (1035)** | Query traveling as a light pulse through a tree of resolvers; cache hits as shortcuts |
| **TLS 1.3 (8446)** | Key exchange as a geometric lock-and-key ceremony; encrypted data as transformed crystals |
| **HTTP/2 (7540)** | Multiplexed streams as parallel fiber channels; header compression as data condensing |
| **IP (791)** | Packets as orbs hopping through a network mesh; fragmentation shown as orb splitting and rejoining |
| **BGP (4271)** | AS relationships as territories on a map; route announcements as spreading signals |

### Interactivity Requirements

Every exhibit must support:
- **Play/Pause/Scrub** — control the animation timeline
- **Step navigation** — jump to any point in the explanation
- **Hover inspection** — details on any element
- **Camera control** (for 3D) — rotate, zoom, pan
- **Layer visibility** — toggle complexity levels

### Performance Discipline

- Scenes lazy-load (only when you enter an exhibit)
- Quality presets: Full / Balanced / Lite
- Mobile gets simplified 2D fallbacks when needed
- `prefers-reduced-motion` fully respected

---

## Tech Stack

Chosen for: **stability**, **expressiveness**, **free static hosting**, **clean authoring**.

### Core

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | **Astro** | Content-first, static output, islands architecture for interactive parts |
| **Language** | **TypeScript** | Type safety, better DX |
| **3D Engine** | **Three.js** | Stable, huge ecosystem, works everywhere |
| **Animation** | **GSAP** | Industry standard, timeline precision, works with Three.js |
| **Styling** | **Tailwind CSS v4** | Fast iteration, dark mode built-in |
| **Search** | **Fuse.js** | Client-side fuzzy search, no server |
| **Syntax Highlighting** | **Shiki** | Build-time, gorgeous themes |

### Deployment

Static export → **Cloudflare Pages** / **Vercel** / **GitHub Pages**

Zero hosting cost. Zero server.

### Why Astro?

- Content collections with type safety
- MDX support for rich content
- Islands architecture: static by default, interactive where needed
- Perfect Lighthouse scores out of the box
- First-class static export

---

## Content Architecture

### How to Add a New RFC

```
content/
└── rfcs/
    └── 793-tcp/
        ├── exhibit.mdx          # Content + metadata
        ├── storyboard.yaml      # Step-by-step walkthrough definition
        └── assets/              # Images, custom shaders, etc.

src/
└── scenes/
    └── 793-tcp/
        └── index.ts             # Scene module (Three.js/Canvas)
```

### Exhibit File (`exhibit.mdx`)

```mdx
---
id: 793
title: "Transmission Control Protocol"
shortTitle: "TCP"
year: 1981
status: "Internet Standard"
difficulty: "beginner"
estimatedMinutes: 15
concepts: ["handshake", "reliable-delivery", "flow-control", "congestion"]
prereqs: [791]  # IP
accentColors: ["#00f5d4", "#9b5de5"]
---

# The Protocol That Made the Internet Reliable

TCP is the foundation of reliable communication on the internet...

<Callout type="insight">
Every time you load a webpage, TCP ensures every byte arrives in order.
</Callout>
```

### Storyboard File (`storyboard.yaml`)

```yaml
steps:
  - id: intro
    title: "Meet the Players"
    narration: "Every TCP connection has two endpoints: a client and a server."
    scene:
      focus: [client, server]
      camera: { x: 0, y: 5, z: 10 }
      highlight: [client, server]
    instruments:
      stateMachine: { state: "CLOSED" }

  - id: syn
    title: "Step 1: SYN"
    narration: "The client initiates by sending a SYN packet..."
    scene:
      action: emitPacket
      from: client
      to: server
      packet: { flags: ["SYN"], seq: 1000 }
    instruments:
      packetInspector: { show: true }
      stateMachine: { state: "SYN-SENT" }
```

### Scene Module Interface

```typescript
// src/scenes/793-tcp/index.ts

interface SceneController {
  apply(step: StoryboardStep): void;
  dispose(): void;
}

export async function init(
  canvas: HTMLCanvasElement,
  assets: AssetBundle
): Promise<SceneController> {
  // Set up Three.js scene...
  return {
    apply(step) {
      // Respond to storyboard events
    },
    dispose() {
      // Cleanup
    }
  };
}
```

This architecture means:
- **Writers** can author new RFCs by editing MDX + YAML
- **Artists** can go wild with scenes without touching content
- **Scenes are isolated** — one broken scene doesn't affect others
- **Shared instruments** work across all RFCs automatically

---

## Features

### Launch (v1)

| Feature | Description |
|---------|-------------|
| **Constellation Home** | Interactive RFC relationship map |
| **Exhibit Player** | Full walkthrough experience with all three panels |
| **3 Flagship Exhibits** | TCP, DNS, TLS 1.3 (or similar) |
| **Packet Inspector** | Live packet structure view |
| **State Machine Panel** | FSM visualization |
| **Glossary** | Hover definitions |
| **Dark/Light Theme** | Seamless toggle |
| **Client-side Search** | Fuzzy search across all RFCs |
| **Deep Links** | Share links to specific steps |
| **Mobile Support** | Responsive with quality presets |

### Future (v2+)

- More RFC exhibits (HTTP/2, QUIC, BGP, etc.)
- Learning paths (curated trails through related RFCs)
- Comparison mode (e.g., TLS 1.2 vs 1.3 side-by-side)
- Community contributions workflow
- Offline PWA mode
- Audio narration option

---

## Implementation Plan

### Phase 1: Foundation + Flagship Exhibit
*~3-4 days*

- [ ] Initialize Astro project with TypeScript
- [ ] Set up Tailwind with design tokens (dark/light themes)
- [ ] Create base layout and navigation shell
- [ ] Build Exhibit Player component (three-panel layout)
- [ ] Implement scene module loader (lazy loading)
- [ ] Define storyboard schema + step navigation
- [ ] Build first scene: **TCP Handshake** (full 3D experience)
- [ ] Wire up narration panel to storyboard
- [ ] Deploy to Cloudflare Pages / Vercel

**Deliverable**: One RFC that feels *unfairly polished*.

### Phase 2: Instruments + Content Pipeline
*~2-3 days*

- [ ] Build Packet Inspector component
- [ ] Build State Machine panel
- [ ] Build Glossary overlay with hover triggers
- [ ] Set up Astro content collections for RFCs
- [ ] Create exhibit.mdx + storyboard.yaml schema validation
- [ ] Build second exhibit: **DNS Resolution**

**Deliverable**: Adding new RFCs is now mostly content work.

### Phase 3: Home + Navigation
*~2 days*

- [ ] Build Constellation Map (D3 or Three.js force-directed graph)
- [ ] Add exhibit "poster" cards on hover
- [ ] Implement Fuse.js search
- [ ] Add command palette (⌘K) for quick navigation
- [ ] Build third exhibit: **TLS 1.3 Handshake**

**Deliverable**: Site feels like a complete product.

### Phase 4: Polish + Accessibility
*~1-2 days*

- [ ] Add page transitions and loading states
- [ ] Implement `prefers-reduced-motion` fallbacks
- [ ] Keyboard navigation for exhibit player
- [ ] Mobile optimization pass
- [ ] Performance audit (Lighthouse 95+)
- [ ] SEO metadata and Open Graph images

**Deliverable**: Portfolio-ready, production-quality.

---

## Success Criteria

1. **Someone who knows nothing about networking** can use the TCP exhibit and understand the three-way handshake
2. **A senior engineer** finds it useful as a quick refresher
3. **Lighthouse score** > 95 on all metrics
4. **Adding a new RFC** takes < 1 day (content + basic scene)
5. **People share it** because it looks impressive

---

## What We're NOT Building (Yet)

- User accounts
- Backend / database
- Comments / community features
- Gamification / XP / badges
- Learning path progress tracking
- Content management system

These can come later. First, we nail the core experience.

---

*Last updated: January 14, 2026*
