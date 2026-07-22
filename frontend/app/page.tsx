import { getAllModules } from "@/lib/content";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { LandingGrid } from "@/components/landing/LandingGrid";

export default function Home() {
  const modules = getAllModules();
  return (
    <main className="relative z-[1] mx-auto max-w-[1200px] px-7">
      <Hero />
      <Stats modules={modules} />
      <LandingGrid modules={modules} />
    </main>
  );
}
