import { slugify } from "./toc";
import type { Category } from "./frontmatter-schema";

export type SearchRecord = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  section: string;
  anchor: string;
  text: string;
  tags: string[];
};

export function buildRecords(
  meta: { slug: string; title: string; category: Category; tags: string[] },
  body: string
): SearchRecord[] {
  const clean = (s: string) =>
    s
      .replace(/<[^>]+>/g, " ")
      .replace(/[#*`>_|-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // Line-based split with no code-fence awareness — matches extractToc's ## split in
  // toc.ts for the same reason (consistency with Task 10, YAGNI); see task-11-brief.md.
  const parts = body.split(/^##\s+/m);

  const records: SearchRecord[] = [
    {
      id: `${meta.slug}#_`,
      slug: meta.slug,
      title: meta.title,
      category: meta.category,
      section: meta.title,
      anchor: "",
      text: clean(parts[0]),
      tags: meta.tags,
    },
  ];

  for (const part of parts.slice(1)) {
    const nl = part.indexOf("\n");
    const section = part.slice(0, nl < 0 ? undefined : nl).trim();
    // Reuse toc.ts's slugify so this anchor equals the heading `id` rendered on the page
    // (mdx-components.tsx) — same single-source contract as extractToc. Do not redefine.
    const anchor = slugify(section);
    records.push({
      id: `${meta.slug}#${anchor}`,
      slug: meta.slug,
      title: meta.title,
      category: meta.category,
      section,
      anchor,
      text: clean(part.slice(nl + 1)),
      tags: meta.tags,
    });
  }

  return records;
}
