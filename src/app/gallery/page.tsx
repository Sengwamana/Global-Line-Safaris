import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { CTASection } from "@/domains/home/components/CTASection";
import { GalleryGrid } from "@/domains/gallery/components/GalleryGrid";
import { Pagination } from "@/components/shared/Pagination";
import { buildPageMetadata, getGalleryImages } from "@/lib/content/service.server";
import { clampPage, paginate } from "@/lib/utils";
import { siteImages } from "@/lib/siteImages";

export const dynamic = "force-dynamic";

const GALLERY_PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('gallery', {
    title: 'Gallery',
    description: 'A visual journey through Rwanda and East Africa with Global Line Safaris — wildlife, landscapes, people and unforgettable moments.',
    path: '/gallery',
  });
}

interface GalleryPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const images = await getGalleryImages();
  const totalPages = Math.max(1, Math.ceil(images.length / GALLERY_PAGE_SIZE));
  const page = clampPage(params?.page, totalPages);
  const { items } = paginate(images, page, GALLERY_PAGE_SIZE);

  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Moments"
        title="Gallery"
        description="A visual journey through Rwanda and East Africa — wildlife, landscapes, people and the moments that make a trip unforgettable."
        image={siteImages.contact.src}
        breadcrumb={[{ label: "Gallery", href: "/gallery" }]}
      />

      <section className="bg-white py-20 dark:bg-slate-950 sm:py-28">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <GalleryGrid images={items} />
          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) => (p > 1 ? `?page=${p}` : "/gallery")}
            pageLabel="Gallery pages"
          />
        </div>
      </section>

      <CTASection />
    </div>
  );
}
