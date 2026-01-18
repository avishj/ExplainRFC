# AGENTS.md

YOU MUST use the edit tool instead of create tool unless the vast majority of the file needs changing.

## Commands
- `bun run dev` — Start dev server
- `bun run build` — Typecheck and build for production
- `bun run preview` — Preview production build

## Architecture
Astro static site with React islands for interactivity. Three.js for 3D visualizations, GSAP for animations, Tailwind CSS v4 for styling.

**Structure:** `src/components/` (UI, exhibit, home), `src/data/rfcs/` (RFC content), `src/scenes/` (Three.js scenes), `src/types/` (TypeScript types), `src/lib/` (utilities), `src/pages/` (Astro routes).

**Adding an RFC:** Create `src/data/rfcs/<id>/data.ts` with metadata/storyboard, add scene in `src/scenes/<id>/index.ts`. See `793-tcp` for reference.

## Code Style
- TypeScript strict mode; use explicit types for exports and interfaces
- Path aliases: `@/`, `@components/`, `@lib/`, `@scenes/`, `@types/`
- Use `cn()` from `@/lib/utils` for className merging
- React components: named exports, interface props with `Props` suffix
- Tailwind classes inline; no separate CSS files for components
- Scene modules export `SceneInitFn` returning `SceneController`
