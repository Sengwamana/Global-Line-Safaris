import { HeroSection } from "@/domains/home/components/HeroSection";
import { ServicesPreviewSection } from "@/domains/home/components/ServicesPreview";
import { DestinationsSection } from "@/domains/home/components/DestinationsSection";
import { PackagesSection } from "@/domains/home/components/PackagesSection";
import { AboutPreviewSection } from "@/domains/home/components/AboutPreview";
import { WhyChoosePreview } from "@/domains/home/components/WhyChoosePreview";
import { GallerySection } from "@/domains/home/components/GallerySection";
import { CTASection } from "@/domains/home/components/CTASection";
import { JournalSection } from "@/domains/home/components/JournalSection";
import { PartnersSection } from "@/domains/home/components/PartnersSection";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { buildPageMetadata, getServiceCategories, getHomepageContent, getDestinations, getTourPackages, getGalleryImages, getSiteImages } from "@/lib/content/service.server";
export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home", {
    title: `${siteConfig.name} | Rwanda Safaris & East Africa Tours`,
    description: siteConfig.description,
    path: "/",
  });
}
export default async function HomePage() {
  const [categories, homepage, destinations, packages, galleryImages, images] = await Promise.all([
    getServiceCategories(), getHomepageContent(), getDestinations(), getTourPackages(), getGalleryImages(), getSiteImages()
  ]);
  return <div>
    <HeroSection {...homepage.hero} images={images.heroSlides} />
    <PartnersSection section={homepage.partners} />
    <AboutPreviewSection section={homepage.about} image={images.about} />
    <DestinationsSection destinations={destinations} section={homepage.destinations} />
    <ServicesPreviewSection categories={categories} section={homepage.services} />
    <PackagesSection packages={packages} section={homepage.packages} />
    <WhyChoosePreview pillars={homepage.whyChoose.items} section={homepage.whyChoose} />
    <GallerySection images={galleryImages} section={homepage.gallery} />
    <JournalSection />
    <CTASection section={homepage.finalCta} />
  </div>;
}
