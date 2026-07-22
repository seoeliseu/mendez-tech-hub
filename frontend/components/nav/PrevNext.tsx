import Link from "next/link";
import type { ModuleMeta } from "@/lib/content";
export function getPrevNext(slug: string, mods: ModuleMeta[]) {
  const i = mods.findIndex((m) => m.slug === slug);
  return { prev: i > 0 ? mods[i - 1] : null, next: i < mods.length - 1 ? mods[i + 1] : null };
}
export function PrevNext({ prev, next }: { prev: ModuleMeta | null; next: ModuleMeta | null }) {
  return (
    <nav className="mt-16 flex justify-between border-t border-border pt-6 text-sm">
      {prev ? <Link href={`/concepts/${prev.slug}`} className="text-muted hover:text-text">← {prev.title}</Link> : <span />}
      {next ? <Link href={`/concepts/${next.slug}`} className="text-muted hover:text-text">{next.title} →</Link> : <span />}
    </nav>
  );
}
