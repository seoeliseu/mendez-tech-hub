import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { renderMdx } from "./mdx";

// `renderMdx` returns `<MDXRemote ... />` — an *unexecuted* element wrapping an async
// React Server Component. React 19's synchronous `renderToStaticMarkup` cannot await an
// async component (it throws "A component suspended while responding to synchronous
// input" — confirmed empirically; see task-3-report.md for the RED evidence). To render
// real output synchronously in a Vitest/jsdom environment, we resolve the async component
// ourselves first: call the element's `type` (the MDXRemote function) with its `props`,
// await the Promise it returns (this is where MDX compilation + remark-gfm + rehype-pretty-
// code actually run), and only then hand the fully-resolved, plain React element tree to
// `renderToStaticMarkup`. This still exercises the real `renderMdx` production function and
// the real plugin pipeline end to end — nothing about `renderMdx` or `mdxComponents` changes.
async function resolveToStaticMarkup(el: ReactElement): Promise<string> {
  const asyncComponent = el.type as (props: unknown) => Promise<ReactElement>;
  const resolved = await asyncComponent(el.props);
  return renderToStaticMarkup(resolved);
}

describe("renderMdx", () => {
  it("renders markdown headings and gfm tables", async () => {
    const el = await renderMdx("## Título\n\n| A | B |\n|---|---|\n| 1 | 2 |\n");
    const html = await resolveToStaticMarkup(el as ReactElement);
    expect(html).toContain("Título");
    expect(html).toContain("<table");
  });

  it("highlights fenced code blocks via rehype-pretty-code (shiki)", async () => {
    const el = await renderMdx('## Code\n\n```ts\nconst x = 1;\n```\n');
    const html = await resolveToStaticMarkup(el as ReactElement);
    // rehype-pretty-code annotates the compiled <pre>/<code> with the fence's language
    // and per-line spans; presence of these attributes (rather than just a bare <pre>)
    // is what distinguishes "shiki actually ran" from plain unprocessed markdown output.
    expect(html).toContain('data-language="ts"');
    expect(html).toContain("data-line");
    expect(html).not.toContain("background-color"); // keepBackground: false
  });
});
