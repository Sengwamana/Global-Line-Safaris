import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { buildPageMetadata, getTeam } from "@/lib/content/service.server";
import { AboutHero } from "@/domains/about/components/AboutHero";
import { FounderProfile } from "@/domains/about/components/FounderProfile";
import { VisionSection } from "@/domains/about/components/VisionSection";
import { TeamGrid } from "@/domains/about/components/TeamGrid";
import { CompanyTimeline } from "@/domains/about/components/CompanyTimeline";
import { CompanyValues } from "@/domains/about/components/CompanyValues";
import { CTASection } from "@/domains/home/components/CTASection";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('about', {
    title: 'About Us',
    description: 'Learn about Global Line Safaris — a Rwanda-based travel company creating memorable safari and tour experiences across Rwanda and East Africa.',
    path: '/about',
  });
}

export default async function AboutPage() {
  const team = await getTeam();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.siteUrl;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "KG 7 Ave",
      addressLocality: "Kigali",
      addressCountry: "RW",
    },
    telephone: siteConfig.phone,
  };

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutHero />
      <FounderProfile founder={team.founder} />
      <CompanyTimeline />
      <VisionSection />
      <CompanyValues />
      <TeamGrid members={team.members} />
      <CTASection />
    </div>
  );
}
