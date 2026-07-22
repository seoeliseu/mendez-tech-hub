import type { MDXComponents } from "mdx/types";
import { isValidElement, type ReactNode } from "react";
import { slugify } from "@/lib/toc";
import { Callout } from "./Callout";
import { Pill } from "./Pill";
import { CardGrid, Card, Badge } from "./CardGrid";
import { Pipeline } from "./Pipeline";
import { FlowDiagram } from "./FlowDiagram";
import { ThreadTimeline } from "./ThreadTimeline";
import { ComparisonTable } from "./ComparisonTable";

// MDX heading children can be a plain string, or an array mixing strings with inline
// elements (e.g. `## Foo **bar**` compiles to children = ["Foo ", <strong>bar</strong>]).
// Flatten to plain text so `slugify(headingText(children))` reproduces the same id that
// `extractToc` (lib/toc.ts) computes from the raw markdown line — the two MUST stay in
// sync or TOC links silently point at anchors that don't exist.
function headingText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    return headingText(props.children);
  }
  return "";
}

// Real components added in Tasks 4-7. Start with element styling.
export const mdxComponents: MDXComponents = {
  h2: (p) => <h2 id={slugify(headingText(p.children))} className="mt-12 mb-4 border-b border-border pb-2 text-2xl font-bold scroll-mt-24" {...p} />,
  h3: (p) => <h3 id={slugify(headingText(p.children))} className="mt-8 mb-3 text-lg font-semibold" {...p} />,
  p: (p) => <p className="my-4 leading-7 text-text/90" {...p} />,
  ul: (p) => <ul className="my-4 list-disc pl-6 space-y-1" {...p} />,
  a: (p) => <a className="text-[#38bdf8] underline underline-offset-2" {...p} />,
  table: (p) => <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-sm" {...p} /></div>,
  th: (p) => <th className="border-b border-border bg-surface2 px-4 py-3 text-left text-xs uppercase tracking-wide text-muted" {...p} />,
  td: (p) => <td className="border-b border-border px-4 py-3" {...p} />,
  Callout,
  Pill,
  CardGrid,
  Card,
  Badge,
  Pipeline,
  FlowDiagram,
  ThreadTimeline,
  ComparisonTable,
};
