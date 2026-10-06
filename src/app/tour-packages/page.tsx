import type { Metadata } from "next";
import { DiscoveryGrid } from "@/components/shared/DiscoveryGrid";
import { PageHero } from "@/components/shared/PageHero";
import { CTASection } from "@/domains/home/components/CTASection";
import { buildPageMetadata, getTourPackages } from "@/lib/content/service.server";
import { siteImages } from "@/lib/siteImages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('tour-packages', {
    title: 'Tour Packages',
    description: 'Browse safari and tour packages across Rwanda and East Africa with Global Line Safaris — gorilla trekking, wildlife safaris, cultural tours and more.',
    path: '/tour-packages',
  });
}

interface TourPackagesPageProps {
  searchParams?: Promise<{ page?: string; q?: string; category?: string; duration?: string }>;
}

export default async function TourPackagesPage({ searchParams }: TourPackagesPageProps) {
  const params = (await searchParams) ?? {};
  const packages = await getTourPackages();

  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Safaris & Tours"
        title="Tour Packages"
        description="Curated itineraries across Rwanda and East Africa — from gorilla trekking and Big Five game drives to cultural journeys, hiking and lakeside escapes."
        image={siteImages.smallBusiness.src}
        breadcrumb={[{ label: "Tour Packages", href: "/tour-packages" }]}
      />

      <section className="safari-section"><div className="safari-container"><DiscoveryGrid packages={packages} params={params} /></div></section>

      <CTASection />
    </div>
  );
}
