# Explain RFC

> *A museum of invisible systems.*

Interactive, beautifully crafted visualizations that explain how the internet works. Each RFC becomes an explorable exhibit — not just documentation, but an experience.

![Explain RFC](https://img.shields.io/badge/RFC-Visualized-00f5d4?style=for-the-badge)

## Features

- **Interactive 3D Visualizations** — Watch protocols come alive with Three.js animations
- **Step-by-Step Walkthroughs** — Guided narration explains each concept
- **Instrument Panels** — Packet inspector, state machine viewer, glossary
- **Dark/Light Mode** — Beautiful in any lighting
- **Fully Static** — No server required, deploys anywhere

## Tech Stack

- [Astro](https://astro.build) — Static site generation
- [React](https://react.dev) — Interactive islands
- [Three.js](https://threejs.org) — 3D visualizations
- [GSAP](https://gsap.com) — Smooth animations
- [Tailwind CSS](https://tailwindcss.com) — Styling

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── exhibit/       # Exhibit player components
│   ├── three/         # Three.js components
│   └── ui/            # Reusable UI components
├── data/
│   └── rfcs/          # RFC content and storyboards
├── layouts/           # Page layouts
├── lib/               # Utilities
├── pages/             # Routes
├── scenes/            # Three.js scene modules
├── styles/            # Global styles
└── types/             # TypeScript types
```

## Adding a New RFC

1. Create a new folder in `src/data/rfcs/<rfc-id>/`
2. Add a `data.ts` file with RFC metadata and storyboard
3. Create a scene module in `src/scenes/<rfc-id>/`
4. Add the route in `src/pages/rfc/[id].astro`

See `src/data/rfcs/793-tcp/data.ts` for an example.

## Deployment

This is a fully static site. Deploy to any static hosting:

```bash
npm run build
# Upload the `dist/` folder
```

## License

AGPL 3.0
