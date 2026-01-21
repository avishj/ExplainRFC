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
- **Push after commit** — always `git push` after committing
- **Shared files with multiple changes:** Use `git add -p` to stage hunks selectively, commit smallest logical unit first

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

## Base Path Handling
- **Use `import.meta.env.BASE_URL`** for all asset paths and internal navigation links
- Pass `baseUrl` prop to React components from Astro pages: `<Component client:visible baseUrl={import.meta.env.BASE_URL} />`
- Config sets `/ExplainRFC` in prod, `/` locally via `process.env.NODE_ENV === 'production'` check in `astro.config.mjs`
- Assets: `src={`${baseUrl}table.png`}` not `src="table.png"`
- Links: `href={`${baseUrl}rfc/${id}`}` not `href={`rfc/${id}`}`

## GSAP Animation Patterns
- **Timeline cleanup:** Always `tl.kill()` in useEffect cleanup to prevent memory leaks
- **Sequential effects:** Use separate useEffect hooks for each animation phase, triggered by state flags (e.g., `bootComplete`, `showDocumentAssembly`, `isLoaded`)
- **DOM readiness:** Use small `setTimeout` (50ms) inside useEffect when querying dynamically rendered elements
- **Staggering:** Use relative timing (`"-=0.3"`, `"<0.05"`) for tight, staggered sequences
- **Initial visibility:** Set `opacity: 0` or `visibility: hidden` in inline styles to prevent flash before GSAP runs
- **Element positioning:** Use `data-x`, `data-y`, `data-final-x`, `data-final-y` attributes for GSAP to read positions
- **Frame-rate independence:** Use `requestAnimationFrame` with delta time (`dt`) for canvas animations
- **Looping animations:** Use refs (`loopActiveRef`) to control lifecycle; set `false` in cleanup, check before scheduling next cycle

## State & Effect Race Conditions
- **Skip logic guards:** When skipping animations via sessionStorage/localStorage, use a dedicated ref (`skipAnimationsRef`) to prevent subsequent effects from re-enabling animation phases
- **Effect dependency chains:** If `effectA` sets `stateB` which triggers `effectB`, ensure `effectB` checks refs/guards before overwriting skip logic
- **Initial state from storage:** Initialize state in the state declaration itself (not in effects) when skip conditions depend on sessionStorage: `useState(() => shouldSkip ? finalValue : initialValue)`
- **sessionStorage vs localStorage:** Use `sessionStorage` for skip flags that should reset on browser restart but persist across in-app navigation

## Navigation & Transitions
- **Browser back hijacking:** Use `history.pushState(null, '', location.href)` immediately in `popstate` handler to cancel navigation, then run exit transition
- **Exit transition pattern:** Set transition state → render `TransitionCLI` → call `window.location.href` only in `onComplete` callback
- **Header/logo clicks:** Convert `<a>` to `<button>` with `onClick` that triggers exit state and `e.preventDefault()`
- **Home skip after RFC visit:** Store timestamp in `sessionStorage` (e.g., `rfcVisitedAt`), check on home mount, skip boot sequence if recent

## 3D CSS Transforms (Books/Cards)
- **Z-index with 3D:** `z-index` alone doesn't work in 3D space; use `translateZ()` to layer elements
- **DOM order matters:** When `translateZ` values are similar, elements rendered later in JSX appear on top
- **Clickable bounding box:** Apply `scale()` to the clickable parent wrapper, not inner content, so hit area matches visible size
- **Transform origin:** For book/page turns, set `transformOrigin` correctly (e.g., `right center` for left page pivoting from spine)
- **Keyframe sync:** Any `translateZ` change in base styles must be mirrored in animation keyframes

## Scene Implementation (Three.js)
- **Controller pattern:** `init` function returns `SceneController` with `apply(step)`, `setProgress`, `dispose`
- **Entity management:** Create entities in `createEntities`, manage via `Map<string, Entity>` interface
- **Animation control:** GSAP timelines in `apply` method, keyed by `step.scene.action`
- **Visual metaphor:** Each RFC needs a unique, consistent metaphor (TCP: endpoints + packets, BGP: crystalline nodes + wave propagation)
- **Render order:** Use `mesh.renderOrder = N` and appropriate `depthWrite`/`depthTest` settings for layering (particles behind solids)
- **Material for overlays:** Use `side: THREE.DoubleSide` and dark colors for container meshes that should occlude particles

## CLI Typing Animation
- **Single rAF loop:** Use one `requestAnimationFrame` loop with `performance.now()` elapsed-time tracking, not per-character `setTimeout`
- **State machine phases:** `'initial-wait' | 'typing' | 'progress-bar' | 'post-delay' | 'done'`
- **Character timing variance:** Spaces fast (0.3x), control chars near-instant (0.5x), inject micro-pauses every 5-8 chars
- **Initial cursor display:** Show `> ` prompt with blinking cursor before typing starts

## Astro/React Integration
- **No function props:** Astro cannot serialize functions to client-hydrated React components
- **Pattern:** Pass static context (e.g., `baseUrl` string) instead; handle logic in React component
- **Example:** `<RFCSearch client:visible baseUrl={base} />` not `onSelectRFC={(id) => ...}`

## UI/UX Conventions
- **Clickable feedback:** Use `cursor-pointer` for interactive elements, `cursor-not-allowed` for disabled
- **Navigation hints:** Show all keyboard shortcuts in control areas (e.g., `← back · → or Space advance`)
- **Play button behavior:** When user presses play, advance immediately—don't wait for auto-advance timer
- **Accessibility:** Check `prefers-reduced-motion` and skip complex animations if true
- **Debug clicks:** Use `document.elementFromPoint(x, y)` to confirm which element receives click when layered CSS is involved

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

## Common Debugging Patterns
- **Animation not running:** Check if elements exist in DOM when GSAP queries them; add `setTimeout(50)` or trigger from state change
- **Elements hidden/occluded:** In 3D, check `translateZ`, DOM order, and `renderOrder`; use browser devtools 3D view
- **Clicks not registering:** Check for overlays with high z-index (ensure `pointer-events: none`), verify element at click point with `elementFromPoint`
- **Hydration failures:** If interactivity fails after load, restart dev server and clear cache; test with `dev-browser` skill
