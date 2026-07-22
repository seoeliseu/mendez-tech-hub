import type { TocItem } from "@/lib/toc";

// Static anchor list — no scroll-spy/active-section tracking by design (YAGNI for this
// task). `scroll-behavior: smooth` is already set globally (app/globals.css) and each
// h2/h3 has `scroll-mt-24`, so plain `#id` links already scroll smoothly to the right
// offset without any client JS here.
export function Toc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <nav className="sticky top-10 flex flex-col gap-1">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Nesta página
        </div>
        <ul className="flex flex-col gap-0.5 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block rounded-md px-2 py-1 text-muted transition hover:text-text ${
                  item.depth === 3 ? "pl-5" : ""
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
