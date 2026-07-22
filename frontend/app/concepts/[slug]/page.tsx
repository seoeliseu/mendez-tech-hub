import { notFound } from "next/navigation";
import { getAllModules, getModuleBySlug } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { extractToc } from "@/lib/toc";
import { Sidebar } from "@/components/nav/Sidebar";
import { Breadcrumb } from "@/components/nav/Breadcrumb";
import { PrevNext, getPrevNext } from "@/components/nav/PrevNext";
import { Toc } from "@/components/nav/Toc";

export function generateStaticParams() {
  return getAllModules().map((m) => ({ slug: m.slug }));
}
export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);
  if (!mod) notFound();
  const mods = getAllModules();
  const { prev, next } = getPrevNext(slug, mods);
  const toc = extractToc(mod.body);
  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10">
      <Sidebar modules={mods} current={slug} />
      <article className="min-w-0 flex-1">
        <Breadcrumb category={mod.meta.category} title={mod.meta.title} />
        <h1 className="mb-6 text-4xl font-bold">{mod.meta.title}</h1>
        {await renderMdx(mod.body)}
        <PrevNext prev={prev} next={next} />
      </article>
      <Toc items={toc} />
    </div>
  );
}
