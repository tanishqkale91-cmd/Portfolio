# Tanishq Kale Portfolio

Personal portfolio with an interactive keyboard hero, a scroll-responsive 3D space scene, selected projects, live coding activity, and a contact area that leads into the footer scene.

**Live site:** https://tanishq-kale.vercel.app/

## Features

- Responsive Work, About, Experience, Stack, Activity, Contact, and footer sections.
- Keyboard-inspired hero with accessible project dialogs and direct in-page contact links.
- One lazy-loaded Three.js canvas for the scroll flight, DOM-tracked contact key scene, and footer horizon.
- Static contact and footer fallbacks for reduced motion, low-power devices, and unsupported WebGL.
- GitHub contribution activity and LeetCode statistics integrations.
- Keyboard-accessible in-page navigation with smooth scrolling and focus management.
- Contact email copy control with a clipboard fallback.

## Tech stack

- React 19 and Vite
- Three.js, React Three Fiber, and Drei
- Tailwind CSS
- Framer Motion, GSAP, and Lenis

## Requirements

- Node.js compatible with the installed Vite version
- npm

## Run locally

```bash
git clone git@github.com:tanishqkale91-cmd/Portfolio.git
cd Portfolio
npm install
npm run dev
```

Vite prints the local development URL in the terminal, usually `http://localhost:5173`.

## Build and preview

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Deployment

The site is deployed at [https://portfolio-lovat-pi-speucrunnm.vercel.app/](https://portfolio-lovat-pi-speucrunnm.vercel.app/). A Vercel project can use:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

The `/api/leetcode` endpoint is included for the LeetCode section.

## Project layout

```text
api/                   Serverless API endpoint
src/components/        Page sections and interface components
src/components/scene/  3D scene components
src/config/            Site settings and portfolio content
src/hooks/              Capability and reduced-motion hooks
src/lib/                Shared browser utilities
src/styles/             Component-specific styles
```

## Update portfolio content

- Change the contact email and GitHub or LeetCode profile settings in `src/config/site.js`. The contact address is defined once as `CONTACT_EMAIL`.
- Add or update projects in `src/config/projects.js`.
- Add or update work history in `src/config/experience.js`. Organization icons live in `public/icons/`: use `gfg-rbu.svg`, `.png`, `.webp`, or `.jpeg` for GeeksforGeeks, and `mechhelp.svg`, `.png`, or `.webp` when a Mechhelp logo is available. The supplied GeeksforGeeks JPEG is included as `public/icons/gfg-rbu.jpeg`; Mechhelp currently uses its monogram fallback.
- Update portfolio copy and dialog text in `src/config/content.js` and `src/config/dialogs.js`.
- Change the near-black background, green accent, border, and keycap presentation tokens in `src/index.css`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Vite development server. |
| `npm run build` | Build the production site into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run verify` | Run the Playwright verification script. |
