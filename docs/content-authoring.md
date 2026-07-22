# Content authoring guide

How to add or edit a concept in the Mendez Tech Hub. This describes how the code actually works
(`frontend/lib/frontmatter-schema.ts`, `frontend/lib/content.ts`,
`frontend/components/mdx/mdx-components.tsx`), not an aspirational spec.

## Add a concept

1. Create `content/<category>/<slug>.mdx` at the repo root (not under `frontend/`).
   `category` must be one of: `backend | infra | database | architecture`.
2. Add frontmatter (see fields below) and write the body in Markdown + the MDX components
   listed further down.
3. Regenerate the search index — see [Reindexing](#reindexing).
4. Run `npm run dev` (from `frontend/`) and open `/concepts/<slug>` to check it renders as
   expected: every table, code block, callout, and diagram should look right, and the new card
   should appear on the landing page and in search.

No app code changes are needed to add a concept — the landing grid, sidebar, and search index are
all generated from content frontmatter at build time.

## Required frontmatter fields

Validated by the Zod schema in `frontend/lib/frontmatter-schema.ts`; the build throws (and fails)
if any `.mdx` file's frontmatter doesn't satisfy it.

| Field         | Type / constraint                                  | Notes                                                             |
|---------------|-----------------------------------------------------|--------------------------------------------------------------------|
| `title`       | non-empty string                                   | Shown on the card, page header, breadcrumb, nav.                   |
| `slug`        | string matching `^[a-z0-9-]+$`                     | Kebab-case. Used in the URL `/concepts/<slug>` and must be unique. |
| `category`    | `backend \| infra \| database \| architecture`     | Closed enum — anything else fails validation.                     |
| `icon`        | non-empty string                                   | Usually a single emoji, shown on the card and nav.                 |
| `accent`       | string matching `^#[0-9a-fA-F]{6}$`                | Hex color, e.g. `"#38bdf8"`. Drives the card/page accent color.    |
| `description` | non-empty string                                   | Card subtitle / meta description.                                  |
| `tags`        | array of strings (defaults to `[]` if omitted)     | Shown as chips on the card; also searchable.                      |
| `order`       | integer                                            | Sort order across the landing grid and sidebar (ascending).        |
| `updated`     | date, e.g. `2026-07-22` (quoted or bare YAML date)  | Both an unquoted YAML date and a quoted string are accepted and normalized to `YYYY-MM-DD`. |

Example:

```yaml
---
title: "Banco de Dados & Escala"
slug: banco-escala
category: database
icon: "🗄️"
accent: "#fbbf24"
description: "Sharding, Replicação, Particionamento, Read Replicas e estratégias para escalar banco de dados horizontalmente."
tags: [Sharding, Replicação, Particionamento, Read Replica]
order: 6
updated: 2026-07-22
---
```

Existing modules use an informal accent palette (purple `#a78bfa`, blue `#38bdf8`, green
`#66bb6a`, orange `#fb923c`, yellow `#fbbf24`, red `#f87171`); it's not enforced, but reusing one
of these keeps new content visually consistent with the rest of the hub.

## Available MDX components

Registered in `frontend/components/mdx/mdx-components.tsx`; use them directly in the body, no
import needed.

| Component | Usage |
|---|---|
| `Callout` | `<Callout type="tip\|warn\|info">**Lead-in:** resto da nota.</Callout>` — colored note box; drop any emoji from your source text, the component renders its own icon per `type`. |
| `Pill` | `<Pill color="purple\|blue\|green\|orange\|yellow">texto</Pill>` — small colored inline tag (defaults to purple if omitted/unrecognized). |
| `CardGrid` / `Card` | `<CardGrid cols={2}><Card accent="#38bdf8" title="Título">corpo em markdown (parágrafos, listas, código)</Card></CardGrid>` — `cols` is `2` or `3` only. |
| `Badge` | `<Badge>texto</Badge>` — small inline monospace tag, no props besides children. |
| `Pipeline` | `<Pipeline steps={[{ label: "App", kind: "req" }, { label: "DB", kind: "res", note: "opcional" }]} caption="opcional" />` — left-to-right boxes joined by arrows; `kind` is `"req" \| "res" \| "step"` (default `"step"`). Good for request/response flows. |
| `FlowDiagram` | `<FlowDiagram title="opcional" rows={[{ box: "Nome", color: "#hex", note: "opcional", indent: 1 }]} />` — a vertical list of boxes; `indent` (integer, multiplies a left margin) is how you flatten a hierarchical, branching, or even 2D/concentric source diagram into this linear component — use the `note` on each row and/or a prose caption after the component to carry any relationship the flattening can't express visually. |
| `ThreadTimeline` | `<ThreadTimeline threads={[{ label: "Thread 1", bars: [{ w: 80, kind: "work" }, { w: 40, kind: "io" }] }]} />` — parallel horizontal timelines; `w` is a pixel width, `kind` is `"work" \| "io"`. |
| `ComparisonTable` | `<ComparisonTable head={["Aspecto", "A", "B"]} rows={[["<strong>Linha</strong>", "célula", "célula"]]} />` — cells are raw HTML strings (rendered via `dangerouslySetInnerHTML`), so inline tags like `<strong>` or `<span style="color:#66bb6a">` work directly; for plain text tables prefer a normal GFM Markdown table instead. |

Plain GFM Markdown (via `remark-gfm`) works throughout: paragraphs, lists, blockquotes, tables,
and fenced code blocks (`​```ts`, `​```sql`, `​```yaml`, ... — highlighted by Shiki).

## Heading rules

`##`/`###` headings double as the sticky table of contents *and* the search index's section
boundaries (`frontend/lib/toc.ts#extractToc`, `frontend/lib/search-record.ts#buildRecords`), and
the rendered `<h2>`/`<h3>` gets the same id (`frontend/components/mdx/mdx-components.tsx`). All
three derive the anchor by slugifying the heading's visible text, using simple per-line matching
against the raw MDX — not a full parser. That means:

- **Every `##`/`###` heading's text must be unique within the file.** Two headings with the same
  text produce the same anchor id, and the TOC/search link to the second becomes unreachable.
  Disambiguate duplicates by folding in their section's topic (e.g. two "Configuração" headings
  become "PgBouncer — Configuração" / "HikariCP — Configuração").
- **Never start a line inside a fenced code block with `##` or `###` followed by a space.** The
  TOC/search extraction scans every line of the raw body, fence or not — such a line would be
  misread as a real heading. (A single `#` — e.g. a shell/YAML comment — is fine; only `##`/`###`
  at line-start is a problem.)
- **No inline JSX inside a heading line** (e.g. `## <Pill>Beta</Pill> Feature`) — the same
  plain-text matching runs before MDX/JSX compilation, so it won't render as intended in the
  TOC or search results.

Two more MDX-wide gotchas worth knowing when writing prose (not inside code fences):

- Escape literal `{` / `}` in prose, or wrap them in backticks — MDX treats `{` as the start of a
  JS expression.
- Wrap generic-looking syntax such as `Promise<T>` in backticks in prose — a bare `<T>` parses as
  an (unknown) JSX tag otherwise. This is not a concern inside fenced code blocks.

## Reindexing

The search index (`frontend/public/search-index.json`) is a build artifact, not something you
hand-edit. From `frontend/`, run:

```bash
npm run predev    # regenerates the index only
# or
npm run build     # runs `prebuild` (same index step) then the production build
```

`npm run dev` and `npm run build` already run this automatically via the `predev`/`prebuild` npm
hooks — you only need to run `npm run predev` by hand if you edited content while the dev server
was already running and want the index refreshed without restarting it.
