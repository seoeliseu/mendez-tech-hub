# Mendez Tech Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js knowledge hub with componentized MDX content, category navigation, and instant `Cmd+K` full-text search, migrating all 6 existing HTML study modules.

**Architecture:** Monorepo — `frontend/` (Next.js App Router app) reads `content/` (MDX = source of truth) at build time. `docs/` holds project documentation; `backend/` is a future placeholder. Content metadata drives the landing grid, sidebar, and a build-time search index; MDX bodies render through `next-mdx-remote/rsc` with a custom component library.

**Tech Stack:** Next.js (App Router, TypeScript, RSC), Tailwind CSS v4 (CSS-first `@theme`), `next-mdx-remote/rsc`, `gray-matter`, `remark-gfm`, `rehype-pretty-code` (Shiki), `flexsearch`, `cmdk`, Zod, Vitest + Testing Library.

## Global Constraints

- **Language of content/UI:** Portuguese (PT-BR). Keep existing copy verbatim during migration.
- **Node:** use the repo's Node LTS; package manager **npm** (Windows environment).
- **Content location:** all study MDX lives in repo-root `content/`, NOT inside `frontend/`. The app reads it via `path.join(process.cwd(), '..', 'content')`.
- **Category enum (closed):** `backend | infra | database | architecture`. No other values allowed.
- **Dark theme palette (from source `index.html`):** `--bg:#080b14 --surface:#0f1220 --surface2:#171c2e --border:#1f2540 --text:#dde1f0 --muted:#5f6882 --dim:#3a4060`. Accent gradient: `#818cf8 → #38bdf8 → #4ade80`. Fonts: Space Grotesk (sans), JetBrains Mono (mono).
- **No hardcoded module lists** in components — always derive from `content/` frontmatter.
- **Version verification:** at Task 1, confirm current major versions of Next.js, `tailwindcss`, `@tailwindcss/postcss`, `next-mdx-remote`, `rehype-pretty-code`, `flexsearch`, `cmdk` via Context7 before installing; the code below targets Tailwind v4 CSS-first and `next-mdx-remote/rsc`.

---

## File Structure

```
mendez-tech-hub/
├─ content/                              # MDX study material (source of truth)
│  ├─ backend/csharp-concepts.mdx
│  ├─ architecture/microservicos.mdx
│  ├─ architecture/arquiteturas.mdx
│  ├─ infra/filas-mensageria.mdx
│  ├─ infra/system-design.mdx
│  └─ database/banco-escala.mdx
├─ docs/                                 # project docs
│  ├─ superpowers/specs/…                # design spec (already committed)
│  ├─ superpowers/plans/…                # this plan
│  └─ content-authoring.md               # how to add a concept (Task 19)
├─ backend/README.md                     # placeholder (Task 19)
├─ frontend/
│  ├─ app/
│  │  ├─ layout.tsx                       # root layout: fonts, theme, <SearchProvider>
│  │  ├─ page.tsx                         # landing (hero, stats, filters, card grid)
│  │  ├─ globals.css                      # Tailwind v4 @import + @theme palette
│  │  └─ concepts/[slug]/page.tsx         # module page + generateStaticParams
│  ├─ components/
│  │  ├─ mdx/                             # Callout, Pipeline, FlowDiagram, ThreadTimeline,
│  │  │                                   #   CardGrid, Card, Pill, ComparisonTable, mdx-components.tsx
│  │  ├─ nav/                             # Sidebar, Toc, Breadcrumb, PrevNext
│  │  ├─ landing/                         # Hero, Stats, Filters, ConceptCard
│  │  └─ search/                          # CommandPalette (cmdk + flexsearch)
│  ├─ lib/
│  │  ├─ content-paths.ts                 # CONTENT_DIR resolution
│  │  ├─ content.ts                       # list/get modules, frontmatter (gray-matter)
│  │  ├─ frontmatter-schema.ts            # Zod schema + Category type
│  │  └─ toc.ts                           # extract headings → TOC tree
│  ├─ scripts/
│  │  └─ build-search-index.mts           # walk content → public/search-index.json
│  ├─ public/                             # search-index.json (generated), fonts if self-hosted
│  ├─ postcss.config.mjs
│  ├─ next.config.ts
│  ├─ vitest.config.ts
│  ├─ vitest.setup.ts
│  ├─ tsconfig.json
│  └─ package.json
└─ README.md                             # repo overview (Task 19)
```

---

### Task 1: Scaffold app, Tailwind v4 theme, repo folders

**Files:**
- Create: `frontend/` (via create-next-app), `frontend/app/globals.css`, `frontend/postcss.config.mjs`, `frontend/app/layout.tsx`
- Create: `content/.gitkeep`, `backend/.gitkeep`
- Modify: `frontend/app/page.tsx` (temporary smoke content)

**Interfaces:**
- Produces: a running Next.js app at `frontend/` with the dark theme tokens available as Tailwind theme colors (`bg-bg`, `text-text`, `border-border`, `font-sans`, `font-mono`) and CSS vars.

- [ ] **Step 1: Verify versions via Context7**, then scaffold. Run in repo root:

```bash
cd /c/r/mendez-tech-hub
npx create-next-app@latest frontend --typescript --app --eslint --src-dir=false --import-alias "@/*" --no-tailwind
```

Answer prompts: App Router yes, Turbopack default. (We install Tailwind v4 manually for the CSS-first setup.)

- [ ] **Step 2: Install Tailwind v4 + deps**

```bash
cd frontend
npm install -D tailwindcss @tailwindcss/postcss postcss
npm install next-mdx-remote gray-matter remark-gfm rehype-pretty-code shiki flexsearch cmdk
npm install -D zod vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: PostCSS config** — create `frontend/postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 4: Theme in `frontend/app/globals.css`** (replace file contents):

```css
@import "tailwindcss";

@theme {
  --color-bg: #080b14;
  --color-surface: #0f1220;
  --color-surface2: #171c2e;
  --color-border: #1f2540;
  --color-text: #dde1f0;
  --color-muted: #5f6882;
  --color-dim: #3a4060;

  --font-sans: "Space Grotesk", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

html { scroll-behavior: smooth; }
body { background: var(--color-bg); color: var(--color-text); }

/* dotted background from source index.html */
body::before {
  content: "";
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(circle, #1f2540 1px, transparent 1px);
  background-size: 28px 28px; opacity: 0.45;
}
```

- [ ] **Step 5: Load fonts in `frontend/app/layout.tsx`** using `next/font/google`:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Mendez Tech Hub",
  description: "Hub de conhecimento — engenharia de software",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

Update `@theme` font vars to reference the next/font variables: change `--font-sans` to `var(--font-space-grotesk), system-ui, sans-serif` and `--font-mono` to `var(--font-jetbrains-mono), ui-monospace, monospace`.

- [ ] **Step 6: Smoke content** — set `frontend/app/page.tsx` to a temporary heading `<main className="mx-auto max-w-5xl p-10"><h1 className="text-4xl font-bold">Mendez Tech Hub</h1></main>`.

- [ ] **Step 7: Run dev server, verify**

Run: `npm run dev` → open `http://localhost:3000`.
Expected: dark background (#080b14), dotted grid, Space Grotesk heading renders.

- [ ] **Step 8: Create sibling folders** — `content/.gitkeep`, `backend/.gitkeep`.

- [ ] **Step 9: Commit**

```bash
cd /c/r/mendez-tech-hub
git add frontend content backend
git commit -m "feat: scaffold Next.js app with Tailwind v4 dark theme"
```

---

### Task 2: Frontmatter schema + content loader (TDD)

**Files:**
- Create: `frontend/lib/frontmatter-schema.ts`, `frontend/lib/content-paths.ts`, `frontend/lib/content.ts`
- Test: `frontend/lib/content.test.ts`
- Create fixture: `content/backend/_fixture-test.mdx` (removed at end of task)

**Interfaces:**
- Produces:
  - `Category = "backend" | "infra" | "database" | "architecture"`
  - `frontmatterSchema` (Zod) and `type Frontmatter = z.infer<typeof frontmatterSchema>` with fields: `title:string, slug:string, category:Category, icon:string, accent:string, description:string, tags:string[], order:number, updated:string`.
  - `getAllModules(): ModuleMeta[]` — sorted by `order`; `ModuleMeta = Frontmatter & { relPath: string }`.
  - `getModuleBySlug(slug: string): { meta: ModuleMeta; body: string } | null`.
  - `CONTENT_DIR: string`.

- [ ] **Step 1: Zod schema** — `frontend/lib/frontmatter-schema.ts`:

```ts
import { z } from "zod";

export const CATEGORIES = ["backend", "infra", "database", "architecture"] as const;
export type Category = (typeof CATEGORIES)[number];

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(CATEGORIES),
  icon: z.string().min(1),
  accent: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  order: z.number().int(),
  updated: z.string().min(1),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
```

- [ ] **Step 2: Path resolution** — `frontend/lib/content-paths.ts`:

```ts
import path from "node:path";
export const CONTENT_DIR = path.join(process.cwd(), "..", "content");
```

- [ ] **Step 3: Write the failing test** — `frontend/lib/content.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR } from "./content-paths";
import { getAllModules, getModuleBySlug } from "./content";

const fixture = path.join(CONTENT_DIR, "backend", "_fixture-test.mdx");

beforeAll(() => {
  fs.mkdirSync(path.dirname(fixture), { recursive: true });
  fs.writeFileSync(
    fixture,
    `---\ntitle: Fixture\nslug: _fixture-test\ncategory: backend\nicon: "🧪"\naccent: "#a78bfa"\ndescription: d\ntags: [X]\norder: 999\nupdated: 2026-07-21\n---\n\n## Hello\nbody\n`
  );
});
afterAll(() => fs.rmSync(fixture));

describe("content loader", () => {
  it("lists modules including the fixture, sorted by order", () => {
    const mods = getAllModules();
    expect(mods.at(-1)?.slug).toBe("_fixture-test");
    expect(mods.at(-1)?.category).toBe("backend");
  });
  it("gets a module body by slug", () => {
    const m = getModuleBySlug("_fixture-test");
    expect(m?.meta.title).toBe("Fixture");
    expect(m?.body).toContain("## Hello");
  });
  it("returns null for unknown slug", () => {
    expect(getModuleBySlug("nope")).toBeNull();
  });
});
```

- [ ] **Step 4: Run test, verify it fails**

Run: `cd frontend && npx vitest run lib/content.test.ts`
Expected: FAIL — `getAllModules` not defined (module missing).

- [ ] **Step 5: Implement loader** — `frontend/lib/content.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CONTENT_DIR } from "./content-paths";
import { frontmatterSchema, type Frontmatter } from "./frontmatter-schema";

export type ModuleMeta = Frontmatter & { relPath: string };

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.endsWith(".mdx") ? [p] : [];
  });
}

export function getAllModules(): ModuleMeta[] {
  return walk(CONTENT_DIR)
    .map((abs) => {
      const raw = fs.readFileSync(abs, "utf8");
      const { data } = matter(raw);
      const meta = frontmatterSchema.parse(data); // throws → build fails on bad content
      return { ...meta, relPath: path.relative(CONTENT_DIR, abs) };
    })
    .sort((a, b) => a.order - b.order);
}

export function getModuleBySlug(slug: string): { meta: ModuleMeta; body: string } | null {
  const found = getAllModules().find((m) => m.slug === slug);
  if (!found) return null;
  const raw = fs.readFileSync(path.join(CONTENT_DIR, found.relPath), "utf8");
  const { content } = matter(raw);
  return { meta: found, body: content };
}
```

- [ ] **Step 6: Vitest config** — `frontend/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
});
```

And `frontend/vitest.setup.ts`: `import "@testing-library/jest-dom";`

- [ ] **Step 7: Run test, verify it passes**

Run: `npx vitest run lib/content.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add frontend/lib frontend/vitest.config.ts frontend/vitest.setup.ts frontend/package.json
git commit -m "feat: content loader with Zod-validated frontmatter"
```

---

### Task 3: MDX rendering + component map

**Files:**
- Create: `frontend/components/mdx/mdx-components.tsx`, `frontend/lib/mdx.tsx`
- Test: `frontend/lib/mdx.test.tsx`

**Interfaces:**
- Consumes: `getModuleBySlug` (Task 2).
- Produces: `renderMdx(body: string): Promise<React.ReactElement>` using `MDXRemote` from `next-mdx-remote/rsc` with `remark-gfm` + `rehype-pretty-code` and the component map. `mdxComponents` object exported for reuse.

- [ ] **Step 1: Component map stub** — `frontend/components/mdx/mdx-components.tsx`:

```tsx
import type { MDXComponents } from "mdx/types";

// Real components added in Tasks 4-7. Start with element styling.
export const mdxComponents: MDXComponents = {
  h2: (p) => <h2 className="mt-12 mb-4 border-b border-border pb-2 text-2xl font-bold scroll-mt-24" {...p} />,
  h3: (p) => <h3 className="mt-8 mb-3 text-lg font-semibold" {...p} />,
  p: (p) => <p className="my-4 leading-7 text-text/90" {...p} />,
  ul: (p) => <ul className="my-4 list-disc pl-6 space-y-1" {...p} />,
  a: (p) => <a className="text-[#38bdf8] underline underline-offset-2" {...p} />,
  table: (p) => <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-sm" {...p} /></div>,
  th: (p) => <th className="border-b border-border bg-surface2 px-4 py-3 text-left text-xs uppercase tracking-wide text-muted" {...p} />,
  td: (p) => <td className="border-b border-border px-4 py-3" {...p} />,
};
```

- [ ] **Step 2: Render helper** — `frontend/lib/mdx.tsx`:

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx/mdx-components";

export function renderMdx(body: string) {
  return (
    <MDXRemote
      source={body}
      components={mdxComponents}
      options={{
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode, { theme: "github-dark", keepBackground: false }]],
        },
      }}
    />
  );
}
```

- [ ] **Step 3: Write the failing test** — `frontend/lib/mdx.test.tsx` (renders MDX string to HTML; `MDXRemote` is async server component):

```tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMdx } from "./mdx";

describe("renderMdx", () => {
  it("renders markdown headings and gfm tables", async () => {
    const el = await renderMdx("## Título\n\n| A | B |\n|---|---|\n| 1 | 2 |\n");
    const html = renderToStaticMarkup(el as React.ReactElement);
    expect(html).toContain("Título");
    expect(html).toContain("<table");
  });
});
```

- [ ] **Step 4: Run test, verify it fails** — Run: `npx vitest run lib/mdx.test.tsx` → FAIL (module/plugin not wired).

- [ ] **Step 5: Make it pass** — ensure imports resolve; if `rehype-pretty-code` needs a Shiki highlighter, the default string theme works out of the box. Re-run.

Run: `npx vitest run lib/mdx.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/mdx/mdx-components.tsx frontend/lib/mdx.tsx frontend/lib/mdx.test.tsx
git commit -m "feat: MDX rendering with gfm + shiki code highlighting"
```

---

### Task 4: Callout + Pill components

**Files:**
- Create: `frontend/components/mdx/Callout.tsx`, `frontend/components/mdx/Pill.tsx`
- Modify: `frontend/components/mdx/mdx-components.tsx` (register `Callout`, `Pill`)
- Test: `frontend/components/mdx/Callout.test.tsx`

**Interfaces:**
- Produces: `<Callout type="tip"|"warn"|"info">…</Callout>`, `<Pill color="purple"|"blue"|"green"|"orange"|"yellow">…</Pill>`. Registered in `mdxComponents` so MDX can use them.

- [ ] **Step 1: Write the failing test** — `Callout.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Callout } from "./Callout";

describe("Callout", () => {
  it("renders children and warn styling", () => {
    render(<Callout type="warn"><strong>Cuidado</strong> texto</Callout>);
    expect(screen.getByText("Cuidado")).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveAttribute("data-type", "warn");
  });
});
```

- [ ] **Step 2: Run → FAIL** — Run: `npx vitest run components/mdx/Callout.test.tsx` → FAIL (no Callout).

- [ ] **Step 3: Implement `Callout.tsx`:**

```tsx
const STYLES = {
  tip: "border-[#66bb6a]/40 bg-[#66bb6a]/10",
  warn: "border-[#ffd54f]/40 bg-[#ffd54f]/10",
  info: "border-[#38bdf8]/40 bg-[#38bdf8]/10",
} as const;
const ICON = { tip: "✅", warn: "⚠️", info: "💡" } as const;

export function Callout({ type = "info", children }: { type?: keyof typeof STYLES; children: React.ReactNode }) {
  return (
    <div role="note" data-type={type} className={`my-5 flex gap-3 rounded-xl border p-4 text-sm ${STYLES[type]}`}>
      <span className="shrink-0 text-lg">{ICON[type]}</span>
      <div className="[&_strong]:block [&_strong]:mb-1">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `Pill.tsx`:**

```tsx
const COLORS: Record<string, string> = {
  purple: "bg-[#a78bfa]/15 text-[#a78bfa]",
  blue: "bg-[#38bdf8]/15 text-[#38bdf8]",
  green: "bg-[#66bb6a]/15 text-[#66bb6a]",
  orange: "bg-[#fb923c]/15 text-[#fb923c]",
  yellow: "bg-[#fbbf24]/15 text-[#fbbf24]",
};
export function Pill({ color = "purple", children }: { color?: string; children: React.ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${COLORS[color] ?? COLORS.purple}`}>{children}</span>;
}
```

- [ ] **Step 5: Register** in `mdx-components.tsx`: import and add `Callout, Pill` to `mdxComponents`.

- [ ] **Step 6: Run → PASS** — Run: `npx vitest run components/mdx/Callout.test.tsx` → PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/mdx
git commit -m "feat: Callout and Pill MDX components"
```

---

### Task 5: CardGrid + Card + Badge

**Files:**
- Create: `frontend/components/mdx/CardGrid.tsx` (exports `CardGrid`, `Card`, `Badge`)
- Modify: `frontend/components/mdx/mdx-components.tsx`
- Test: `frontend/components/mdx/CardGrid.test.tsx`

**Interfaces:**
- Produces: `<CardGrid cols={2|3}>`, `<Card accent="#hex" pill="..." title="...">children</Card>`, `<Badge>…</Badge>`. Registered in `mdxComponents`.

- [ ] **Step 1: Failing test** — assert grid renders N children and applies `cols` class:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CardGrid, Card } from "./CardGrid";
describe("CardGrid", () => {
  it("renders cards", () => {
    render(<CardGrid cols={3}><Card title="A">x</Card><Card title="B">y</Card></CardGrid>);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `CardGrid.tsx`:**

```tsx
export function CardGrid({ cols = 2, children }: { cols?: 2 | 3; children: React.ReactNode }) {
  const c = cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`my-5 grid grid-cols-1 gap-4 ${c}`}>{children}</div>;
}
export function Card({ accent = "#818cf8", pill, title, children }:
  { accent?: string; pill?: string; title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6" style={{ borderColor: `${accent}66` }}>
      {pill && <span className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: `${accent}26`, color: accent }}>{pill}</span>}
      {title && <h3 className="mb-2 text-base font-bold">{title}</h3>}
      <div className="text-sm text-muted">{children}</div>
    </div>
  );
}
export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-border bg-surface2 px-2 py-0.5 font-mono text-[10px] text-muted">{children}</span>;
}
```

- [ ] **Step 4: Register in `mdx-components.tsx`** (`CardGrid, Card, Badge`).

- [ ] **Step 5: Run → PASS. Commit:**

```bash
git add frontend/components/mdx
git commit -m "feat: CardGrid, Card, Badge MDX components"
```

---

### Task 6: Diagram components — Pipeline, FlowDiagram, ThreadTimeline

**Files:**
- Create: `frontend/components/mdx/Pipeline.tsx`, `frontend/components/mdx/FlowDiagram.tsx`, `frontend/components/mdx/ThreadTimeline.tsx`
- Modify: `frontend/components/mdx/mdx-components.tsx`
- Test: `frontend/components/mdx/diagrams.test.tsx`

**Interfaces:**
- Produces:
  - `<Pipeline steps={[{ label, note, kind?: "req"|"res"|"step" }]} caption?/>`
  - `<FlowDiagram rows={[{ box, color?, note?, indent?: number }]} title?/>`
  - `<ThreadTimeline threads={[{ label, bars: [{ w: number, kind: "work"|"io" }] }]} />`
  - All registered in `mdxComponents`.

- [ ] **Step 1: Failing test** — render each with sample data, assert labels/notes present:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Pipeline } from "./Pipeline";
import { FlowDiagram } from "./FlowDiagram";
import { ThreadTimeline } from "./ThreadTimeline";
describe("diagrams", () => {
  it("Pipeline renders steps + arrows", () => {
    render(<Pipeline steps={[{ label: "Request", note: "HTTP", kind: "req" }, { label: "Auth", note: "token" }]} />);
    expect(screen.getByText("Request")).toBeInTheDocument();
    expect(screen.getByText("Auth")).toBeInTheDocument();
  });
  it("FlowDiagram renders boxes", () => {
    render(<FlowDiagram rows={[{ box: "T1", note: "runs" }]} />);
    expect(screen.getByText("T1")).toBeInTheDocument();
  });
  it("ThreadTimeline renders labels", () => {
    render(<ThreadTimeline threads={[{ label: "Thread 1", bars: [{ w: 120, kind: "work" }] }]} />);
    expect(screen.getByText("Thread 1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `Pipeline.tsx`** (flex row of step boxes separated by arrows; `req`/`res` tint borders):

```tsx
type Step = { label: string; note?: string; kind?: "req" | "res" | "step" };
const BORDER = { req: "border-[#38bdf8]", res: "border-[#66bb6a]", step: "border-border" };
export function Pipeline({ steps, caption }: { steps: Step[]; caption?: string }) {
  return (
    <figure className="my-5">
      <div className="flex flex-wrap items-center gap-0 rounded-2xl border border-border bg-surface p-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`min-w-28 rounded-xl border bg-surface2 px-3 py-4 text-center ${BORDER[s.kind ?? "step"]}`}>
              <div className="text-sm font-bold">{s.label}</div>
              {s.note && <div className="text-xs text-muted">{s.note}</div>}
            </div>
            {i < steps.length - 1 && <span className="px-2 text-xl text-[#818cf8]">→</span>}
          </div>
        ))}
      </div>
      {caption && <figcaption className="mt-2 text-center text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}
```

- [ ] **Step 4: Implement `FlowDiagram.tsx`** (vertical rows, optional indent + colored box + note):

```tsx
type Row = { box: string; color?: string; note?: string; indent?: number };
export function FlowDiagram({ rows, title }: { rows: Row[]; title?: string }) {
  return (
    <div className="my-5 rounded-2xl border border-border bg-surface p-7">
      {title && <h4 className="mb-5 text-xs uppercase tracking-wide text-muted">{title}</h4>}
      {rows.map((r, i) => (
        <div key={i} className="mb-2 flex items-center gap-3" style={{ marginLeft: (r.indent ?? 0) * 40 }}>
          <div className="rounded-lg border border-border bg-surface2 px-4 py-2.5 text-sm font-semibold" style={r.color ? { borderColor: `${r.color}99`, color: r.color } : undefined}>{r.box}</div>
          {r.note && <span className="text-xs text-muted">{r.note}</span>}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Implement `ThreadTimeline.tsx`** (rows of proportional bars; work vs io tint):

```tsx
type Bar = { w: number; kind: "work" | "io" };
type Thread = { label: string; bars: Bar[] };
const BAR = { work: "bg-[#818cf8]/30 border-[#818cf8]/60 text-[#a89cf7]", io: "bg-[#ffd54f]/15 border-[#ffd54f]/40 text-[#ffd54f]" };
export function ThreadTimeline({ threads }: { threads: Thread[] }) {
  return (
    <div className="my-5 rounded-2xl border border-border bg-surface p-7">
      {threads.map((t, i) => (
        <div key={i} className="mb-3 flex items-center gap-3">
          <div className="w-24 shrink-0 text-xs font-bold text-muted">{t.label}</div>
          {t.bars.map((b, j) => (
            <div key={j} className={`flex h-7 items-center rounded-md border px-3 text-[11px] font-semibold ${BAR[b.kind]}`} style={{ width: b.w }}>
              {b.kind === "work" ? "CPU" : "I/O"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Register all three** in `mdx-components.tsx`.

- [ ] **Step 7: Run → PASS. Commit:**

```bash
git add frontend/components/mdx
git commit -m "feat: Pipeline, FlowDiagram, ThreadTimeline diagram components"
```

---

### Task 7: ComparisonTable + shiki code-block polish

**Files:**
- Create: `frontend/components/mdx/ComparisonTable.tsx`
- Modify: `frontend/app/globals.css` (style `pre[data-theme]`/`code` output from rehype-pretty-code), `frontend/components/mdx/mdx-components.tsx`
- Test: `frontend/components/mdx/ComparisonTable.test.tsx`

**Interfaces:**
- Produces: `<ComparisonTable head={string[]} rows={string[][]} />`. Registered in `mdxComponents`. Also global CSS so fenced code blocks render on the dark surface with padding and horizontal scroll.

- [ ] **Step 1: Failing test:**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComparisonTable } from "./ComparisonTable";
describe("ComparisonTable", () => {
  it("renders head and rows", () => {
    render(<ComparisonTable head={["Padrão", "Resolve"]} rows={[["Retry", "falha transitória"]]} />);
    expect(screen.getByText("Padrão")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `ComparisonTable.tsx`:**

```tsx
export function ComparisonTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead><tr>{head.map((h, i) => <th key={i} className="border-b border-border bg-surface2 px-4 py-3 text-left text-xs uppercase tracking-wide text-muted">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-border px-4 py-3" dangerouslySetInnerHTML={{ __html: c }} />)}</tr>)}</tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Code-block CSS** — append to `globals.css`:

```css
pre { overflow-x: auto; border-radius: 12px; border: 1px solid var(--color-border); background: #131722 !important; padding: 20px 22px; margin: 20px 0; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; }
pre code { display: grid; background: transparent !important; }
:not(pre) > code { background: var(--color-surface2); border-radius: 4px; padding: 1px 6px; font-family: var(--font-mono); font-size: 0.9em; }
```

- [ ] **Step 5: Register `ComparisonTable`. Run → PASS. Commit:**

```bash
git add frontend/components/mdx frontend/app/globals.css
git commit -m "feat: ComparisonTable + shiki code-block styling"
```

---

### Task 8: Landing page — hero, stats, filters, card grid

**Files:**
- Create: `frontend/components/landing/Hero.tsx`, `Stats.tsx`, `Filters.tsx`, `ConceptCard.tsx`
- Modify: `frontend/app/page.tsx`
- Test: `frontend/components/landing/Filters.test.tsx`

**Interfaces:**
- Consumes: `getAllModules()` (Task 2).
- Produces: landing at `/` listing all modules as cards, with client-side category filter buttons (`all` + the 4 categories). `Filters` is a client component owning selected category state; `ConceptCard` links to `/concepts/[slug]`.

- [ ] **Step 1: Failing test for filter logic** — `Filters.test.tsx` renders buttons and toggles a card's visibility by category (test the pure `matchesFilter(cat, active)` helper):

```tsx
import { describe, it, expect } from "vitest";
import { matchesFilter } from "./Filters";
describe("matchesFilter", () => {
  it("all shows everything", () => expect(matchesFilter("backend", "all")).toBe(true));
  it("matches same category", () => expect(matchesFilter("infra", "infra")).toBe(true));
  it("hides other categories", () => expect(matchesFilter("backend", "infra")).toBe(false));
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `Filters.tsx`** (client component; exports `matchesFilter` + `Filters` that renders buttons and calls `onChange`):

```tsx
"use client";
import { useState } from "react";
import { CATEGORIES, type Category } from "@/lib/frontmatter-schema";
export function matchesFilter(cat: Category, active: Category | "all") {
  return active === "all" || cat === active;
}
export function Filters({ onChange }: { onChange: (a: Category | "all") => void }) {
  const [active, setActive] = useState<Category | "all">("all");
  const opts: (Category | "all")[] = ["all", ...CATEGORIES];
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {opts.map((o) => (
        <button key={o} onClick={() => { setActive(o); onChange(o); }}
          className={`rounded-md border px-3.5 py-1.5 text-xs font-medium ${active === o ? "border-dim bg-surface2 text-text" : "border-border text-muted"}`}>
          {o === "all" ? "Todos" : o}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Implement `ConceptCard.tsx`, `Hero.tsx`, `Stats.tsx`** — port markup/classes from source `index.html` (`.card`, `.hero`, `.stats`). `ConceptCard` props: `module: ModuleMeta`. Use `next/link`. Accent via inline `style={{ "--cc": module.accent }}`.

```tsx
// ConceptCard.tsx
import Link from "next/link";
import type { ModuleMeta } from "@/lib/content";
export function ConceptCard({ module: m }: { module: ModuleMeta }) {
  return (
    <Link href={`/concepts/${m.slug}`} data-cat={m.category}
      className="group relative flex flex-col gap-3.5 overflow-hidden rounded-xl border border-border bg-surface p-6 transition hover:-translate-y-1"
      style={{ borderTopColor: m.accent }}>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] text-xl" style={{ background: `${m.accent}1f` }}>{m.icon}</div>
        <span className="rounded border border-border bg-surface2 px-2 py-1 font-mono text-[9px] text-muted">{m.category}</span>
      </div>
      <div><div className="text-base font-semibold">{m.title}</div><p className="mt-1 text-[13px] text-muted">{m.description}</p></div>
      <div className="flex flex-wrap gap-1.5">{m.tags.slice(0, 4).map((t) => <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${m.accent}1a`, color: m.accent }}>{t}</span>)}</div>
    </Link>
  );
}
```

- [ ] **Step 5: Compose `app/page.tsx`** — server component gets `getAllModules()`, passes to a client `LandingGrid` that holds filter state and renders `ConceptCard`s filtered by `matchesFilter`. Include `Hero` + `Stats` (stats computed: module count, unique categories, tag count).

- [ ] **Step 6: Run filter test → PASS; `npm run dev` and verify** grid + filters visually.

Run: `npx vitest run components/landing/Filters.test.tsx`
Expected: PASS. Dev: clicking a category hides non-matching cards.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/landing frontend/app/page.tsx
git commit -m "feat: landing page with concept cards and category filters"
```

---

### Task 9: Concept page + sidebar + breadcrumb + prev/next

**Files:**
- Create: `frontend/app/concepts/[slug]/page.tsx`, `frontend/components/nav/Sidebar.tsx`, `Breadcrumb.tsx`, `PrevNext.tsx`
- Test: `frontend/components/nav/prevnext.test.ts`

**Interfaces:**
- Consumes: `getAllModules`, `getModuleBySlug`, `renderMdx`.
- Produces: static route per slug via `generateStaticParams`; page renders sidebar (grouped by category) + MDX body + breadcrumb + prev/next. Pure helper `getPrevNext(slug, modules)` returns `{ prev, next }`.

- [ ] **Step 1: Failing test** — `prevnext.test.ts` for `getPrevNext` ordering:

```ts
import { describe, it, expect } from "vitest";
import { getPrevNext } from "./PrevNext";
const mods = [{ slug: "a" }, { slug: "b" }, { slug: "c" }] as any;
describe("getPrevNext", () => {
  it("middle has both", () => expect(getPrevNext("b", mods)).toEqual({ prev: mods[0], next: mods[2] }));
  it("first has no prev", () => expect(getPrevNext("a", mods).prev).toBeNull());
  it("last has no next", () => expect(getPrevNext("c", mods).next).toBeNull());
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `PrevNext.tsx`** (helper + component):

```tsx
import Link from "next/link";
import type { ModuleMeta } from "@/lib/content";
export function getPrevNext(slug: string, mods: ModuleMeta[]) {
  const i = mods.findIndex((m) => m.slug === slug);
  return { prev: i > 0 ? mods[i - 1] : null, next: i < mods.length - 1 ? mods[i + 1] : null };
}
export function PrevNext({ prev, next }: { prev: ModuleMeta | null; next: ModuleMeta | null }) {
  return (
    <nav className="mt-16 flex justify-between border-t border-border pt-6 text-sm">
      {prev ? <Link href={`/concepts/${prev.slug}`} className="text-muted hover:text-text">← {prev.title}</Link> : <span />}
      {next ? <Link href={`/concepts/${next.slug}`} className="text-muted hover:text-text">{next.title} →</Link> : <span />}
    </nav>
  );
}
```

- [ ] **Step 4: Implement `Sidebar.tsx`** (groups `getAllModules()` by category, current slug highlighted) and `Breadcrumb.tsx` (`Hub / {category} / {title}`).

- [ ] **Step 5: Implement `app/concepts/[slug]/page.tsx`:**

```tsx
import { notFound } from "next/navigation";
import { getAllModules, getModuleBySlug } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { Sidebar } from "@/components/nav/Sidebar";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { PrevNext, getPrevNext } from "@/components/nav/PrevNext";

export function generateStaticParams() {
  return getAllModules().map((m) => ({ slug: m.slug }));
}
export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);
  if (!mod) notFound();
  const mods = getAllModules();
  const { prev, next } = getPrevNext(slug, mods);
  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10">
      <Sidebar modules={mods} current={slug} />
      <article className="min-w-0 flex-1">
        <Breadcrumb category={mod.meta.category} title={mod.meta.title} />
        <h1 className="mb-6 text-4xl font-bold">{mod.meta.title}</h1>
        {await renderMdx(mod.body)}
        <PrevNext prev={prev} next={next} />
      </article>
    </div>
  );
}
```

Note: confirm the `params` Promise signature against the installed Next.js major via Context7 (App Router made `params` a Promise in Next 15).

- [ ] **Step 6: Run prevnext test → PASS. Commit:**

```bash
git add frontend/app/concepts frontend/components/nav
git commit -m "feat: concept page with sidebar, breadcrumb, prev/next"
```

---

### Task 10: Sticky table of contents (TDD on extractor)

**Files:**
- Create: `frontend/lib/toc.ts`, `frontend/components/nav/Toc.tsx`
- Modify: `frontend/app/concepts/[slug]/page.tsx` (render `<Toc>`)
- Test: `frontend/lib/toc.test.ts`

**Interfaces:**
- Produces: `extractToc(body: string): { depth: 2|3; text: string; id: string }[]` (slugifies headings identically to the `rehype`/`h2` anchors). `<Toc items>` renders a sticky aside.

- [ ] **Step 1: Failing test:**

```ts
import { describe, it, expect } from "vitest";
import { extractToc } from "./toc";
describe("extractToc", () => {
  it("captures h2/h3 with slug ids", () => {
    const t = extractToc("## Ciclo de Vida\n\ntext\n\n### Scoped\n");
    expect(t[0]).toEqual({ depth: 2, text: "Ciclo de Vida", id: "ciclo-de-vida" });
    expect(t[1].id).toBe("scoped");
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `toc.ts`** (regex headings, slugify: lowercase, strip accents, non-alnum→`-`):

```ts
export function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function extractToc(body: string) {
  return body.split("\n").flatMap((line) => {
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!m) return [];
    return [{ depth: m[1].length as 2 | 3, text: m[2].trim(), id: slugify(m[2].trim()) }];
  });
}
```

- [ ] **Step 4: Ensure heading anchors match** — in `mdx-components.tsx`, give `h2`/`h3` an `id` via `slugify(children)`. Add a small helper that stringifies children.

- [ ] **Step 5: Implement `Toc.tsx`** (sticky right aside, `#id` links). Add to concept page grid.

- [ ] **Step 6: Run → PASS. Commit:**

```bash
git add frontend/lib/toc.ts frontend/components/nav/Toc.tsx frontend/components/mdx/mdx-components.tsx frontend/app/concepts
git commit -m "feat: sticky table of contents with anchored headings"
```

---

### Task 11: Build-time search index (TDD)

**Files:**
- Create: `frontend/scripts/build-search-index.mts`, `frontend/lib/search-record.ts`
- Modify: `frontend/package.json` (`prebuild`/`predev` script), generates `frontend/public/search-index.json`
- Test: `frontend/lib/search-record.test.ts`

**Interfaces:**
- Produces: `type SearchRecord = { id: string; slug: string; title: string; category: Category; section: string; anchor: string; text: string; tags: string[] }`. Pure `buildRecords(meta, body): SearchRecord[]` splits a module into one record per `##` section (plus a title record). Script writes all records to JSON.

- [ ] **Step 1: Failing test** — `search-record.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildRecords } from "./search-record";
const meta = { slug: "csharp", title: "C#", category: "backend", tags: ["DI"] } as any;
describe("buildRecords", () => {
  it("creates one record per section with anchors", () => {
    const recs = buildRecords(meta, "intro\n\n## Dependency Injection\n\nscoped transient\n\n## Async\n\nawait\n");
    expect(recs.find((r) => r.section === "Dependency Injection")?.anchor).toBe("dependency-injection");
    expect(recs.some((r) => r.section === "Async")).toBe(true);
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `search-record.ts`** (reuse `slugify` from `toc.ts`; strip MDX/JSX tags and markdown symbols from `text`):

```ts
import { slugify } from "./toc";
import type { Category } from "./frontmatter-schema";
export type SearchRecord = { id: string; slug: string; title: string; category: Category; section: string; anchor: string; text: string; tags: string[] };
export function buildRecords(meta: { slug: string; title: string; category: Category; tags: string[] }, body: string): SearchRecord[] {
  const clean = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/[#*`>_|-]/g, " ").replace(/\s+/g, " ").trim();
  const parts = body.split(/^##\s+/m);
  const records: SearchRecord[] = [{ id: `${meta.slug}#_`, slug: meta.slug, title: meta.title, category: meta.category, section: meta.title, anchor: "", text: clean(parts[0]), tags: meta.tags }];
  for (const part of parts.slice(1)) {
    const nl = part.indexOf("\n");
    const section = part.slice(0, nl < 0 ? undefined : nl).trim();
    const anchor = slugify(section);
    records.push({ id: `${meta.slug}#${anchor}`, slug: meta.slug, title: meta.title, category: meta.category, section, anchor, text: clean(part.slice(nl + 1)), tags: meta.tags });
  }
  return records;
}
```

- [ ] **Step 4: Implement `build-search-index.mts`** — imports `getAllModules` + reads bodies + `buildRecords`, writes `public/search-index.json`. Add to `package.json`: `"predev": "node --experimental-strip-types scripts/build-search-index.mts"` and `"prebuild": "node --experimental-strip-types scripts/build-search-index.mts"` (confirm Node flag for the installed version; alternatively compile with `tsx`).

- [ ] **Step 5: Run script + test → PASS**

Run: `npx vitest run lib/search-record.test.ts` → PASS. Then `npm run predev` and verify `public/search-index.json` exists and contains section records.

- [ ] **Step 6: Commit**

```bash
git add frontend/scripts frontend/lib/search-record.ts frontend/package.json frontend/public/search-index.json
git commit -m "feat: build-time search index generation"
```

---

### Task 12: Cmd+K command palette (FlexSearch + cmdk)

**Files:**
- Create: `frontend/components/search/CommandPalette.tsx`, `frontend/components/search/SearchProvider.tsx`
- Modify: `frontend/app/layout.tsx` (wrap children in `<SearchProvider>`)
- Test: `frontend/components/search/search-engine.test.ts`

**Interfaces:**
- Consumes: `public/search-index.json` (`SearchRecord[]`).
- Produces: `createEngine(records): { search(q): SearchRecord[] }` (FlexSearch Document index over `text`/`section`/`tags`). `<CommandPalette>` opens on `Cmd/Ctrl+K`, lists results, navigates to `/concepts/{slug}#{anchor}`.

- [ ] **Step 1: Failing test** — `search-engine.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createEngine } from "./search-engine";
const recs = [
  { id: "1", slug: "csharp", title: "C#", category: "backend", section: "Dependency Injection", anchor: "di", text: "scoped transient singleton lifetime", tags: ["DI"] },
  { id: "2", slug: "sys", title: "System Design", category: "infra", section: "Caching", anchor: "cache", text: "cdn redis cache", tags: [] },
] as any;
describe("search engine", () => {
  it("finds by body term", () => {
    const e = createEngine(recs);
    expect(e.search("transient")[0].slug).toBe("csharp");
  });
  it("finds by section", () => {
    expect(createEngine(recs).search("caching")[0].slug).toBe("sys");
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement `search-engine.ts`** (extract the engine from the component so it is unit-testable):

```ts
import FlexSearch from "flexsearch";
import type { SearchRecord } from "@/lib/search-record";
export function createEngine(records: SearchRecord[]) {
  const index = new FlexSearch.Document<SearchRecord>({
    document: { id: "id", index: ["section", "text", "tags", "title"], store: true },
    tokenize: "forward",
  });
  records.forEach((r) => index.add(r));
  return {
    search(q: string): SearchRecord[] {
      if (!q.trim()) return [];
      const res = index.search(q, { enrich: true, limit: 12 }) as any[];
      const seen = new Set<string>();
      const out: SearchRecord[] = [];
      for (const group of res) for (const hit of group.result) if (!seen.has(hit.id)) { seen.add(hit.id); out.push(hit.doc); }
      return out;
    },
  };
}
```

- [ ] **Step 4: Implement `CommandPalette.tsx`** (client): fetch `/search-index.json` once, `createEngine`, `cmdk` `<Command.Dialog>` toggled by `Cmd/Ctrl+K` keydown, render results grouped, `onSelect` → `router.push`. `SearchProvider` renders `<CommandPalette>` + a header button showing `⌘K`.

- [ ] **Step 5: Wire into `layout.tsx`.**

- [ ] **Step 6: Run engine test → PASS; dev-verify** `Cmd+K` opens, typing "transient" jumps to the C# DI section.

Run: `npx vitest run components/search/search-engine.test.ts` → PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/search frontend/app/layout.tsx
git commit -m "feat: Cmd+K full-text command palette"
```

---

## Migration Reference (Tasks 13–18)

Each source file in `C:/Users/elise/OneDrive/03_STUDY/hub-conhecimento/*.html` becomes one MDX file. Apply this deterministic mapping — content copied **verbatim** (PT-BR), only the wrapper changes:

| Source HTML construct | MDX target |
|---|---|
| `<section><div class="section-header">…<h2>` | `## Heading` |
| `<h3>` sub-headings | `### Heading` |
| body `<p>` | plain markdown paragraph |
| `<div class="code-block"><pre>…manual <span> highlight…</pre>` | fenced block ` ```csharp … ``` ` with the raw code (drop the manual `<span>` markup — Shiki re-highlights) |
| `<div class="callout callout-tip/warn/info">` | `<Callout type="tip\|warn\|info">…</Callout>` |
| `<div class="pipeline">…steps…` | `<Pipeline steps={[…]} caption="…" />` |
| `<div class="flow-diagram">…rows…` | `<FlowDiagram title="…" rows={[…]} />` |
| `<div class="thread-visual">…` | `<ThreadTimeline threads={[…]} />` |
| `<div class="cards colN">…<div class="card">` | `<CardGrid cols={N}><Card …>…</Card></CardGrid>` |
| `<span class="pill pill-COLOR">` | `<Pill color="COLOR">…</Pill>` |
| `<table>` reference tables | GFM markdown table, or `<ComparisonTable>` when cells contain colored HTML |

Frontmatter values per module (title/slug/category/icon/accent/description/tags/order) come from the corresponding `<a class="card">` in the source `index.html` (Task 8 already ported the card data — reuse the exact icon, accent `--cc`, description, tags).

Per-module procedure (repeat for each): read the source HTML, create the MDX file at the mapped path, port every section in order, then verify: `npm run dev`, open `/concepts/{slug}`, confirm every diagram/callout/table/code block renders and no content is missing versus the original HTML. Regenerate the search index (`npm run predev`). Commit.

### Task 13: Migrate `csharp-concepts` (backend) — reference module

**Files:** Create `content/backend/csharp-concepts.mdx`. Source: `csharp-concepts.html`.

- [ ] **Step 1:** Create frontmatter (order 1, icon ⚡, accent `#a78bfa`, tags `[Middleware, DI, Async, Design Patterns, Resiliência]`, description from source card).
- [ ] **Step 2:** Port sections in order: Middleware, Inversão de Dependência (incl. the new "Ciclo de Vida por Camada" subsection), Threads, Tasks, Async/Await, Design Patterns, Resiliência, Comparativo — using the mapping table (Pipeline for middleware/resilience, ThreadTimeline for threads, FlowDiagram for async/CB states, Callout/CardGrid/ComparisonTable throughout, fenced `csharp` blocks).
- [ ] **Step 3:** Remove the `_fixture-test.mdx` leftover if present.
- [ ] **Step 4:** `npm run dev` → `/concepts/csharp-concepts`; verify against original side by side (all 8 sections, every code block highlighted, diagrams render).
- [ ] **Step 5:** `npm run predev` to refresh the index.
- [ ] **Step 6: Commit** `git add content/backend/csharp-concepts.mdx frontend/public/search-index.json && git commit -m "content: migrate C# concepts module to MDX"`.

### Task 14: Migrate `microservicos` (architecture)

**Files:** Create `content/architecture/microservicos.mdx`. Source: `microservicos-guia.html`. Frontmatter: order 2, icon 🔗, accent `#38bdf8`, tags `[API Gateway, Circuit Breaker, Service Mesh]`.
- [ ] Steps 1–6: same procedure as Task 13 for this source. Verify `/concepts/microservicos`. Commit `content: migrate microservices module to MDX`.

### Task 15: Migrate `filas-mensageria` (infra)

**Files:** Create `content/infra/filas-mensageria.mdx`. Source: `filas-mensageria.html`. Frontmatter: order 3, icon 📨, accent `#fb923c`, tags `[Kafka, RabbitMQ, Pub/Sub, DLQ]`.
- [ ] Steps 1–6: same procedure. Verify `/concepts/filas-mensageria`. Commit `content: migrate messaging/queues module to MDX`.

### Task 16: Migrate `arquiteturas` (architecture)

**Files:** Create `content/architecture/arquiteturas.mdx`. Source: `arquiteturas.html`. Frontmatter: order 4, icon 🏛️, accent `#34d399`, tags `[CQRS, Event Sourcing, DDD, Hexagonal]`.
- [ ] Steps 1–6: same procedure. Verify `/concepts/arquiteturas`. Commit `content: migrate architecture patterns module to MDX`.

### Task 17: Migrate `system-design` (infra)

**Files:** Create `content/infra/system-design.mdx`. Source: `system-design.html`. Frontmatter: order 5, icon ⚙️, accent `#f87171`, tags `[Load Balancer, CAP, Cache, CDN]`.
- [ ] Steps 1–6: same procedure. Verify `/concepts/system-design`. Commit `content: migrate system design module to MDX`.

### Task 18: Migrate `banco-escala` (database)

**Files:** Create `content/database/banco-escala.mdx`. Source: `banco-escala.html`. Frontmatter: order 6, icon 🗄️, accent `#fbbf24`, tags `[Sharding, Replicação, Particionamento, Read Replica]`.
- [ ] Steps 1–6: same procedure. Verify `/concepts/banco-escala`. Then confirm the landing grid shows all 6 cards and `Cmd+K` searches across every module. Commit `content: migrate database scaling module to MDX`.

---

### Task 19: Project docs, README, backend placeholder

**Files:**
- Create: `README.md` (repo root), `docs/content-authoring.md`, `backend/README.md`
- Modify: remove `content/.gitkeep`, `backend/.gitkeep` if now redundant

**Interfaces:** Documentation only — no code.

- [ ] **Step 1:** Root `README.md` — what the hub is, monorepo layout, `cd frontend && npm run dev`, where content lives, how search index builds.
- [ ] **Step 2:** `docs/content-authoring.md` — how to add a concept: create `content/<category>/<slug>.mdx`, required frontmatter (link to the Zod schema fields), available MDX components (Callout, Pipeline, FlowDiagram, ThreadTimeline, CardGrid/Card, Pill, ComparisonTable) with a one-line usage each, and "run `npm run predev` to reindex".
- [ ] **Step 3:** `backend/README.md` — "Future: API to serve `content/` and user features. Not implemented in this iteration."
- [ ] **Step 4: Commit** `git add README.md docs/content-authoring.md backend/README.md && git commit -m "docs: repo README, authoring guide, backend placeholder"`.

---

## Self-Review

- **Spec coverage:** monorepo folders (Task 1, 19) ✓; MDX componentized content (Tasks 3–7, 13–18) ✓; landing with filters from metadata (Task 8) ✓; nav sidebar/TOC/breadcrumb/prev-next (Tasks 9–10) ✓; Cmd+K build-time search (Tasks 11–12) ✓; Zod frontmatter validation (Task 2) ✓; all 6 modules migrated (Tasks 13–18) ✓; backend placeholder (Task 19) ✓; testing via Vitest on all logic units ✓.
- **Type consistency:** `ModuleMeta`, `Frontmatter`, `Category`, `SearchRecord`, `slugify`, `matchesFilter`, `getPrevNext`, `buildRecords`, `createEngine` are defined once and referenced consistently.
- **Open verifications (do at implementation time, not placeholders):** exact package majors and the Next.js `params` Promise signature — both flagged inline (Tasks 1, 9) to confirm via Context7.
```
