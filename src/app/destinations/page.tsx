import type { Metadata } from "next";
import { DiscoveryGrid } from "@/components/shared/DiscoveryGrid";
import { PageHero } from "@/components/shared/PageHero";
import { CTASection } from "@/domains/home/components/CTASection";
import { buildPageMetadata, getDestinations } from "@/lib/content/service.server";
import { siteImages } from "@/lib/siteImages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations', {
    title: 'Destinations',
    description: "Explore Rwanda's destinations with Global Line Safaris — Volcanoes National Park, Akagera, Nyungwe, Lake Kivu, Kigali, the Congo Nile Trail and more.",
    path: '/destinations',
  });
}

interface DestinationsPageProps {
  searchParams?: Promise<{ page?: string; q?: string; category?: string }>;
}

export default async function DestinationsPage({ searchParams }: DestinationsPageProps) {
  const params = (await searchParams) ?? {};
  const destinations = await getDestinations();

  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Explore Rwanda"
        title="Destinations"
        description="From the misty Virunga volcanoes to the warm shores of Lake Kivu and the Big Five plains of Akagera, discover the places that define a Rwandan adventure."
        image={siteImages.servicesHero.src}
        breadcrumb={[{ label: "Destinations", href: "/destinations" }]}
      />

      <section className="safari-section"><div className="safari-container"><DiscoveryGrid destinations={destinations} params={params} /></div></section>

      <CTASection />
    </div>
  );
}
