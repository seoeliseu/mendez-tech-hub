import type { MDXComponents } from "mdx/types";
import { Callout } from "./Callout";
import { Pill } from "./Pill";

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
  Callout,
  Pill,
};
