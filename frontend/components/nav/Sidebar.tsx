import Link from "next/link";
import type { ModuleMeta } from "@/lib/content";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/frontmatter-schema";

export function Sidebar({ modules, current }: { modules: ModuleMeta[]; current: string }) {
  const groups = CATEGORIES.map((cat) => ({
    cat,
    items: modules.filter((m) => m.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <nav className="sticky top-10 flex flex-col gap-6">
        {groups.map((g) => (
          <div key={g.cat}>
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {CATEGORY_LABELS[g.cat]}
            </div>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/concepts/${m.slug}`}
                    className={`block rounded-md px-2 py-1.5 text-sm transition ${
                      m.slug === current ? "bg-surface2 text-text" : "text-muted hover:text-text"
                    }`}
                  >
                    {m.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
