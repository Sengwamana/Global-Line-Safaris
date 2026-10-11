import type { Metadata } from "next";
import { ServicesHero } from "@/domains/services/components/ServicesHero";
import { ServiceCard } from "@/domains/services/components/ServiceCard";
import { CTASection } from "@/domains/home/components/CTASection";
import { buildPageMetadata, getServiceCategories } from "@/lib/content/service.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('services', {
    title: 'Services',
    description: "Explore Global Line Safaris' tours, safaris and travel services in Rwanda and East Africa — wildlife safaris, cultural tours, car rental, accommodation and more.",
    path: '/services',
  });
}

export default async function ServicesPage() {
  const categories = await getServiceCategories();

  return (
    <div className="overflow-x-hidden">
      <ServicesHero />
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            {categories.map((category) => (
              <ServiceCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}
