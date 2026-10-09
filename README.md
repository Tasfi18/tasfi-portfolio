# Tahmid Hasan Tasfi, portfolio

Personal portfolio built with React 19, Vite and Tailwind CSS v4, with GSAP for the scroll and intro animations. Fonts are self-hosted through Fontsource, so the site makes no third-party requests.

The site is laid out as a set of drawing sheets: a drafted cover, an about sheet, a services index, project plates, a changelog of roles, a small game, and a blueprint contact sheet.

## Getting started

```bash
npm install
npm run dev
```

The dev server prints its local URL (default `http://localhost:5173`).

## Where to edit things

| File | What it holds |
| --- | --- |
| `src/config/site.js` | Name, role, email, phone, WhatsApp, social links |
| `src/config/content.js` | Bio, facts, stack rows, services, projects, changelog, game layers |
| `src/config/sheets.js` | The order and names of the sections in the navbar |
| `src/index.css` | Colours, fonts and the shared drafting styles |

### Still to fill in

These are placeholders in `src/config/site.js`. Empty values hide the parts of the page that use them.

- `phone` and `whatsapp`
- `socials.linkedin`
- `url`, then add the canonical and `og:url` tags in `index.html`

In `src/config/content.js`, each project has empty `repo` and `live` fields. Fill them in and the buttons appear; while they are empty the project shows an "Ask me about this project" button instead. A project can also take an `image` (import it at the top of the file) to replace its drawing with a screenshot.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── components/   Hero, Navbar, About, Services, Project, Changelog, Play, Contact,
│                 ComingSoon, plus Wordmark, Plates, StackGame and Drafting helpers
├── config/       site.js, content.js, sheets.js
└── lib/          motion.js (GSAP scroll reveals and magnetic buttons)
public/           favicon.svg, og.jpg
```

## Deploying

`vercel.json` is set up for Vercel with the Vite preset: import the repository, keep the default build settings, then add your domain under Settings, Domains.
