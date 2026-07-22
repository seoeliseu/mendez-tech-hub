import { z } from "zod";

export const CATEGORIES = ["backend", "infra", "database", "architecture"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  backend: "Backend",
  infra: "Infraestrutura",
  database: "Database",
  architecture: "Arquitetura",
};

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(CATEGORIES),
  icon: z.string().min(1),
  accent: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  description: z.string().min(1),
  tags: z.array(z.string()).default([]),
  order: z.number().int(),
  // gray-matter's YAML parser turns an unquoted date scalar (e.g. `updated: 2026-07-21`,
  // the canonical format used in docs/superpowers/specs/2026-07-21-mendez-tech-hub-design.md)
  // into a native Date, not a string. Accept both and normalize to YYYY-MM-DD so the
  // documented content format validates without every author needing to quote the date.
  updated: z
    .union([z.string().min(1), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
