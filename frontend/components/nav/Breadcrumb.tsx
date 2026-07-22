import Link from "next/link";
import { CATEGORY_LABELS, type Category } from "@/lib/frontmatter-schema";

export function Breadcrumb({ category, title }: { category: Category; title: string }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
      <Link href="/" className="hover:text-text">Hub</Link>
      <span>/</span>
      <span>{CATEGORY_LABELS[category]}</span>
      <span>/</span>
      <span className="text-text">{title}</span>
    </nav>
  );
}
