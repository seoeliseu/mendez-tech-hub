import Link from "next/link";
import type { ModuleMeta } from "@/lib/content";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/frontmatter-schema";

export function Sidebar({ modules, current }: { modules: ModuleMeta[]; current: string }) {
  // Children (modules with a parent) are indented under their parent instead of listed flat.
  const childrenByParent = new Map<string, ModuleMeta[]>();
  for (const m of modules) {
    if (!m.parent) continue;
    const arr = childrenByParent.get(m.parent) ?? [];
    arr.push(m);
    childrenByParent.set(m.parent, arr);
  }

  const groups = CATEGORIES.map((cat) => ({
    cat,
    items: modules.filter((m) => m.category === cat && !m.parent),
  })).filter((g) => g.items.length > 0);

  const linkCls = (slug: string) =>
    `block rounded-md px-2 py-1.5 text-sm transition ${
      slug === current ? "bg-surface2 text-text" : "text-muted hover:text-text"
    }`;

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <nav className="sticky top-10 flex flex-col gap-6">
        {groups.map((g) => (
          <div key={g.cat}>
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {CATEGORY_LABELS[g.cat]}
            </div>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((m) => {
                const kids = childrenByParent.get(m.slug) ?? [];
                return (
                  <li key={m.slug}>
                    <Link href={`/concepts/${m.slug}`} className={linkCls(m.slug)}>
                      {m.title}
                    </Link>
                    {kids.length > 0 && (
                      <ul className="mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2.5">
                        {kids.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/concepts/${c.slug}`} className={linkCls(c.slug)}>
                              {c.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
