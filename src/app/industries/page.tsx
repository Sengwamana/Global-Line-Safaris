import type { Metadata } from "next";
import { buildPageMetadata, getIndustries } from "@/lib/content/service.server";
import { IndustriesHero } from "@/domains/industries/components/IndustriesHero";
import { IndustryGrid } from "@/domains/industries/components/IndustryGrid";
import { CTASection } from "@/domains/home/components/CTASection";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('industries', {
    title: 'Who We Serve',
    description: 'Global Line Safaris serves travellers of all kinds — wildlife and safari lovers, gorilla trekking adventurers, families, students and cultural explorers.',
    path: '/industries',
  });
}

export default async function IndustriesPage() {
  const { industries } = await getIndustries();

  return (
    <div className="overflow-x-hidden">
      <IndustriesHero />
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <IndustryGrid industries={industries} />
        </div>
      </section>
      <CTASection />
    </div>
  );
}
