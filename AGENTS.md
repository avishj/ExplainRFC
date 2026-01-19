# AGENTS.md

YOU MUST use the edit tool instead of create tool unless the vast majority of the file needs changing.

## Commands
- `bun run dev` — Start dev server
- `bun run build` — Typecheck and build for production (run after changes to verify)
- `bun run preview` — Preview production build

## Workflow
- Use `dev-browser` skill to verify animations/UI visually before committing
- Use `git-committing` skill after each logical block of work
- Run `bun run build` before committing to catch TypeScript errors
- Clean up unused variables flagged by build warnings immediately

## Git Conventions
- **Format:** `<type>: <short-desc>` (4-5 words max, use shortforms)
- **Types:** `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`, `ci`
- **Sign-off:** Always use `-s --author="Avish <avish.j@protonmail.com>"`
- **Examples:** `feat: add jwt auth impl`, `fix: null ptr in parser`
- Only stage files related to current logical block—never batch unrelated changes

## Architecture
Astro static site with React islands for interactivity. Three.js for 3D visualizations, GSAP for animations, Tailwind CSS v4 for styling.

**Structure:** `src/components/` (UI, exhibit, home), `src/data/rfcs/` (RFC content), `src/scenes/` (Three.js scenes), `src/types/` (TypeScript types), `src/lib/` (utilities), `src/pages/` (Astro routes).

**Adding an RFC:**
1. Create `src/data/rfcs/<id>/data.ts` with metadata and storyboard
2. Add scene in `src/scenes/<id>/index.ts` exporting `SceneInitFn`
3. Register in `SceneCanvas.tsx` scenePaths and `[id].astro` rfcRegistry
4. Extend `SceneState` in `src/types/rfc.ts` if new scene parameters needed
5. See `793-tcp` for reference implementation

## Code Style
- TypeScript strict mode; use explicit types for exports and interfaces
- Path aliases: `@/`, `@components/`, `@lib/`, `@scenes/`, `@types/`
- Use `cn()` from `@/lib/utils` for className merging
- React components: named exports, interface props with `Props` suffix
- Tailwind classes inline; no separate CSS files for components
- Scene modules export `SceneInitFn` returning `SceneController`

## GSAP Animation Patterns
- **Timeline cleanup:** Always `tl.kill()` in useEffect cleanup to prevent memory leaks
- **Sequential effects:** Use separate useEffect hooks for each animation phase, triggered by state flags (e.g., `bootComplete`, `showDocumentAssembly`, `isLoaded`)
- **DOM readiness:** Use small `setTimeout` (50ms) inside useEffect when querying dynamically rendered elements
- **Staggering:** Use relative timing (`"-=0.3"`, `"<0.05"`) for tight, staggered sequences
- **Initial visibility:** Set `opacity: 0` in inline styles to prevent flash before GSAP runs
- **Element positioning:** Use `data-x`, `data-y`, `data-final-x`, `data-final-y` attributes for GSAP to read positions
- **Frame-rate independence:** Use `requestAnimationFrame` with delta time (`dt`) for canvas animations

## Scene Implementation (Three.js)
- **Controller pattern:** `init` function returns `SceneController` with `apply(step)`, `setProgress`, `dispose`
- **Entity management:** Create entities in `createEntities`, manage via `Map<string, Entity>` interface
- **Animation control:** GSAP timelines in `apply` method, keyed by `step.scene.action`
- **Visual metaphor:** Each RFC needs a unique, consistent metaphor (TCP: endpoints + packets, BGP: crystalline nodes + wave propagation)

## Astro/React Integration
- **No function props:** Astro cannot serialize functions to client-hydrated React components
- **Pattern:** Pass static context (e.g., `baseUrl` string) instead; handle logic in React component
- **Example:** `<RFCSearch client:visible baseUrl={base} />` not `onSelectRFC={(id) => ...}`

## UI/UX Conventions
- **Clickable feedback:** Use `cursor-pointer` for interactive elements, `cursor-not-allowed` for disabled
- **Navigation hints:** Show all keyboard shortcuts in control areas (e.g., `← back · → or Space advance`)
- **Play button behavior:** When user presses play, advance immediately—don't wait for auto-advance timer
- **Accessibility:** Check `prefers-reduced-motion` and skip complex animations if true

## Animation Sequencing (Complex Transitions)
1. Break into distinct phases via state flags (`bootComplete` → `showDocumentAssembly` → `isLoaded`)
2. Each phase triggers its own useEffect with a GSAP timeline
3. Use `tl.call(() => setNextState(true))` or `onComplete` callbacks to chain phases
4. Overlap timings with `-=X` for seamless visual flow
5. Define CSS classes as GSAP hooks (e.g., `.boot-overlay`, `.hero-glow`) separate from styling

## Configuration via Data Structures
- Decouple behavior config from logic (e.g., `BOOT_SEQUENCE: BootLine[]` array)
- Structure: `{ text, typingSpeed, postDelay, isProgressBar? }`
- Review sequences for logical narrative flow (network connection before archive loading)

## Visual Polish
- **Glitch effects:** Rapid small `x` translations before fade
- **Scanline wipes:** Dedicated element for vertical wipe during transitions
- **Easing variety:** `power3.in` for exits, `back.out(1.5)` for playful entrances
- **Core effects:** Radial gradients, text-shadow glow, noise textures for atmosphere
