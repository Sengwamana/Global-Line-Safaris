import type { Metadata } from "next";
import { ServicesHero } from "@/domains/services/components/ServicesHero";
import { ServiceCard } from "@/domains/services/components/ServiceCard";
import { CTASection } from "@/domains/home/components/CTASection";
import { Pagination } from "@/components/shared/Pagination";
import { buildPageMetadata, getServiceCategories } from "@/lib/content/service.server";
import { clampPage, paginate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SERVICES_PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('services', {
    title: 'Services',
    description: "Explore Global Line Safaris' tours, safaris and travel services in Rwanda and East Africa — wildlife safaris, cultural tours, car rental, accommodation and more.",
    path: '/services',
  });
}

interface ServicesPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams;
  const categories = await getServiceCategories();
  const totalPages = Math.max(1, Math.ceil(categories.length / SERVICES_PAGE_SIZE));
  const page = clampPage(params?.page, totalPages);
  const { items } = paginate(categories, page, SERVICES_PAGE_SIZE);

  return (
    <div className="overflow-x-hidden">
      <ServicesHero />
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            {items.map((category) => (
              <ServiceCard key={category.slug} category={category} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) => (p > 1 ? `?page=${p}` : "/services")}
            pageLabel="Services pages"
          />
        </div>
      </section>
      <CTASection />
    </div>
  );
}
