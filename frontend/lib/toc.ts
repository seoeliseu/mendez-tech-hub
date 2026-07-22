// Shared by the sticky table of contents (this task) and, per plan, the search index
// (Task 11). Anchor ids rendered on h2/h3 in `components/mdx/mdx-components.tsx` MUST be
// produced by this same `slugify` — a divergent copy would silently break TOC anchors.
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    // Strip Unicode combining diacritical marks (the code point range U+0300-U+036F)
    // left behind by NFD decomposition, e.g. "a" + COMBINING TILDE -> "a". The character
    // class below contains the actual (invisible) combining characters U+0300 and U+036F
    // as its bounds — that is intentional and matches how JS engines already display this
    // idiom; do not "fix" it by retyping the range, since \uXXXX escapes get decoded to
    // these same literal characters by this file's own toolchain anyway.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface TocItem {
  depth: 2 | 3;
  text: string;
  id: string;
}

export function extractToc(body: string): TocItem[] {
  return body.split("\n").flatMap((line): TocItem[] => {
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!m) return [];
    const text = m[2].trim();
    return [{ depth: m[1].length as 2 | 3, text, id: slugify(text) }];
  });
}
