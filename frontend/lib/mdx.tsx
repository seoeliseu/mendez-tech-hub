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
        // Content lives in this repo (content/**/*.mdx, authored by us, compiled at build
        // time) — it is NOT untrusted remote/CMS content. next-mdx-remote v6 defaults to
        // `blockJS: true`, which silently strips every JSX *expression* attribute
        // (`prop={...}`) and keeps only literal string attributes (see
        // node_modules/next-mdx-remote/dist/plugins/remove-javascript-expressions.js).
        // That breaks every component here that takes object/array/number/boolean props —
        // Pipeline's `steps`, FlowDiagram's `rows`, ThreadTimeline's `threads`, CardGrid's
        // `cols`, ComparisonTable's `head`/`rows` — turning them into `undefined` and
        // crashing with "Cannot read properties of undefined (reading 'map')" during
        // `next build`'s static prerender. `blockDangerousJS` (default true) stays on for
        // defense-in-depth — it still throws on eval/require/process/Function/prototype/etc.
        // even with blockJS off.
        blockJS: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode, { theme: "github-dark", keepBackground: false }]],
        },
      }}
    />
  );
}
