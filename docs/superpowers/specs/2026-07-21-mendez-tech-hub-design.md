# Mendez Tech Hub — Design

**Date:** 2026-07-21
**Status:** Approved
**Author:** Elise (with Claude)

## Purpose

Build a robust, easily navigable and searchable knowledge hub for studying software
engineering concepts. Migrate the 6 existing self-contained HTML study modules from
`C:/Users/elise/OneDrive/03_STUDY/hub-conhecimento` into a Next.js application, converting
each into componentized MDX. The hub must make it easy to browse concepts by category and
to full-text search across everything.

Non-goals (this iteration): the backend. It gets a placeholder only.

## Success Criteria

- All 6 existing modules migrated faithfully to MDX (diagrams, code blocks, callouts, tables preserved).
- Landing page lists modules from content metadata (not hardcoded) with category filters.
- Each module renders with sidebar navigation, sticky table of contents, breadcrumb, prev/next.
- Global `Cmd+K` full-text search returns results across titles, sections, tags, and body, and
  navigates directly to the matched section.
- Adding a new concept = create one `.mdx` file in `content/`, no app code changes.
- Build fails if any MDX has invalid/missing frontmatter (Zod validation).

## Architecture — Monorepo

```
mendez-tech-hub/
├─ frontend/          # Next.js App Router, TypeScript, RSC — UI, navigation, search
├─ content/           # MDX study material = source of truth for concepts
├─ docs/              # PROJECT documentation (this spec, ADRs, authoring guide)
├─ backend/           # future — placeholder README only this iteration
└─ README.md
```

Content is decoupled from the app. The Next.js app in `frontend/` reads `../content/**/*.mdx`
at build time. A future backend can consume the same `content/` folder.

## Stack

| Layer          | Choice                                   | Rationale                                        |
|----------------|------------------------------------------|--------------------------------------------------|
| Framework      | Next.js (App Router) + TypeScript + RSC  | Static generation, file-based routing            |
| Styling        | Tailwind CSS + CSS variables (dark theme)| Reuse the current palette/gradients/fonts        |
| MDX            | `next-mdx-remote/rsc`                     | Load MDX from an external folder (`content/`)    |
| Code highlight | Shiki via `rehype-pretty-code`           | Real syntax highlighting; replaces manual spans  |
| Search         | FlexSearch + build-time JSON index + `cmdk` | Instant full-text, zero backend                |
| Validation     | Zod frontmatter schema                    | Build breaks on malformed content                |
| Testing        | Vitest + Testing Library                  | MDX components + search/filter logic             |

Exact versions (Next.js, Tailwind v4, `next-mdx-remote`, `shiki`, `flexsearch`, `cmdk`) are to
be confirmed against Context7 before writing code.

## Content Model

Each module is one `.mdx` file with frontmatter:

```yaml
---
title: "C# Avançado"
slug: csharp-concepts
category: backend          # backend | infra | database | architecture
icon: "⚡"
accent: "#a78bfa"
description: "Middleware, DI, Async/Await, Design Patterns, Resiliência..."
tags: [Middleware, DI, Async, Design Patterns, Resiliência]
order: 1
updated: 2026-07-21
---
```

- `category` is a closed enum: `backend | infra | database | architecture`.
- `##` headings become the auto-generated table of contents (anchored) and define search
  granularity — each section is an individually addressable search hit.
- Frontmatter is validated by a Zod schema; unknown categories or missing required fields fail the build.

### Content file layout

```
content/
├─ backend/csharp-concepts.mdx
├─ architecture/microservicos.mdx
├─ architecture/arquiteturas.mdx
├─ infra/filas-mensageria.mdx
├─ infra/system-design.mdx
└─ database/banco-escala.mdx
```

## MDX Component Library

The rich visuals in the current HTML become reusable React components, mapped into MDX:

- `<Callout type="tip|warn|info">` — colored callouts.
- `CodeBlock` — rendered from fenced code (```` ```csharp ````) through Shiki.
- `<Pipeline>` / `<FlowDiagram>` / `<ThreadTimeline>` — the diagrams (middleware pipeline,
  circuit-breaker states, thread timeline, resilience pipeline).
- `<CardGrid>` / `<Card>` / `<Pill>` — card grids and pills/badges.
- `<ComparisonTable>` — comparison/reference tables.

Authors write markdown plus these components. Each component has one clear purpose, a typed
props interface, and can be tested in isolation.

## Navigation & Search

- **Landing `/`** — port of `index.html`: hero, stats, category filters, card grid. Cards are
  generated from content frontmatter (not hardcoded).
- **`/concepts/[slug]`** — module page: sidebar (categories → modules), content, sticky TOC,
  breadcrumb, prev/next navigation.
- **`Cmd+K` global** — full-text search overlay (title, section, tags, body). Selecting a result
  navigates directly to the matched section anchor.

### Search index

A build-time script reads all MDX, strips to text per section, and emits a JSON index consumed
by FlexSearch on the client. The `cmdk` palette renders results. No server round-trip.

## Migration Plan (all 6 now)

Convert module-by-module, using C# (the most complete) as the reference pattern:

1. `csharp-concepts` (backend)
2. `microservicos` (architecture)
3. `filas-mensageria` (infra)
4. `arquiteturas` (architecture)
5. `system-design` (infra)
6. `banco-escala` (database)

Each: rich HTML → MDX + components, preserving diagrams, tables, and code. Content is migrated
faithfully with no loss of substance.

## Error Handling & Robustness

- Zod validates the frontmatter of every `.mdx`; the build fails on invalid content.
- Unknown slug → `notFound()` (404 page).
- Search has explicit empty and no-results states.
- Static generation (`output: export` viable) enables static hosting (Vercel / GitHub Pages).

## Testing

- **Zod content validation** — schema check for every MDX at build.
- **Vitest + Testing Library** — MDX components render correctly; search/filter logic returns
  expected matches.
- Playwright smoke tests deferred (not in this iteration's scope).

## Scope Boundary

In scope: `frontend/` app, migration of all 6 modules to `content/`, `Cmd+K` search, navigation,
project docs scaffolding. Out of scope this iteration: `backend/` (placeholder README only).
