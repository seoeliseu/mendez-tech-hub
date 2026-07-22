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
