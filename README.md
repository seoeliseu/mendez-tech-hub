# Mendez Tech Hub

A personal knowledge hub for studying software engineering concepts — backend, infrastructure,
databases, and architecture. It started as a set of six standalone HTML study pages and has been
migrated into a single searchable Next.js application: one componentized MDX file per concept,
a landing grid with category filters, per-concept navigation (sidebar, sticky table of contents,
breadcrumb, prev/next), and a global `Cmd+K` full-text search.

## Monorepo layout

```
mendez-tech-hub/
├─ frontend/   # Next.js (App Router) application — UI, navigation, search, MDX rendering
├─ content/    # MDX study material — the source of truth for every concept
├─ docs/       # Project documentation (this repo's design spec, ADRs, authoring guide)
└─ backend/    # Future — not implemented this iteration (see backend/README.md)
```

Content is decoupled from the app on purpose: `frontend/` reads `../content/**/*.mdx` at build
time (see `frontend/lib/content-paths.ts`), so a future backend or tool can consume the same
`content/` folder without depending on the Next.js app.

## Quickstart

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000. Press `Cmd+K` (or `Ctrl+K`) anywhere in the app to search.

Other scripts (run from `frontend/`):

| Script          | What it does                                                  |
|-----------------|-----------------------------------------------------------------|
| `npm run dev`   | Starts the dev server (runs `predev` first, see below)          |
| `npm run build` | Production build (runs `prebuild` first, see below)             |
| `npm start`     | Serves a previously built app                                   |
| `npm run lint`  | ESLint                                                           |
| `npx vitest run`| Runs the test suite (component + content-logic tests)           |

## Where content lives

Every concept is one `.mdx` file under `content/<category>/<slug>.mdx`, where `category` is one
of `backend | infra | database | architecture`. The file's frontmatter (title, slug, category,
icon, accent color, description, tags, order, updated) drives the landing page card, the nav
sidebar, and search — there is no hardcoded list of concepts anywhere in `frontend/`. Adding a
new concept is just adding a new `.mdx` file; see **`docs/content-authoring.md`** for the full
guide (required frontmatter fields, available MDX components, heading rules).

Frontmatter is validated against a Zod schema (`frontend/lib/frontmatter-schema.ts`) via
`getAllModules()` (`frontend/lib/content.ts`) — the build fails if any module has invalid or
missing frontmatter.

## How the search index builds

`Cmd+K` search is powered by a build-time JSON index, not a server or database. The `predev` and
`prebuild` npm scripts (see `frontend/package.json`) run:

```bash
tsx scripts/build-search-index.mts
```

before `next dev` / `next build`. That script walks all content modules (`getAllModules`), splits
each module's body into one search record per `##` section (`buildRecords`, in
`frontend/lib/search-record.ts`), and writes the result to `frontend/public/search-index.json`.
The client loads that JSON and indexes it with FlexSearch; the `cmdk` palette
(`frontend/components/search/CommandPalette.tsx`) renders results and jumps straight to the
matched section anchor. Because it's a `pre*` hook, the index is always regenerated automatically
before you run dev or build — you don't need to run it by hand, but you can:
`npm run predev` regenerates `public/search-index.json` on demand (useful after editing content
without restarting the dev server).

## Stack

- **Node 24**, **Next.js 16** (App Router, RSC), **React 19**, **TypeScript**
- **Tailwind CSS v4** for styling (dark theme)
- **next-mdx-remote** for loading MDX from outside the app directory (`content/`)
- **Shiki** (via `rehype-pretty-code`) for code syntax highlighting, **remark-gfm** for tables
- **FlexSearch** + a build-time JSON index + **cmdk** for the `Cmd+K` search overlay
- **Zod** for frontmatter validation
- **Vitest** + **Testing Library** for tests

## Status

All 6 study modules are migrated (C# concepts, microservices, messaging/queues, architecture
patterns, system design, database scaling). The `backend/` package is an intentional placeholder
for this iteration — see `backend/README.md`.
