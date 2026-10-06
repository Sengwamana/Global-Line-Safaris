import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { CTASection } from "@/domains/home/components/CTASection";
import { PackageCard } from "@/domains/packages/components/PackageCard";
import {
  getDestination,
  getDestinations,
  getTourPackages,
} from "@/lib/content/service.server";
import { siteImages } from "@/lib/siteImages";
import { siteConfig } from "@/lib/site";

export const revalidate = 60;

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const destinations = await getDestinations();
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: DestinationPageProps) {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) return { title: "Destination Not Found" };
  return {
    title: destination.seoTitle || destination.name,
    description:
      destination.seoDescription ??
      destination.shortDescription ??
      `Discover ${destination.name} in Rwanda with Global Line Safaris.`,
    alternates: { canonical: `/destinations/${destination.slug}` },
  };
}

function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function DestinationDetailPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const [destination, packages] = await Promise.all([
    getDestination(slug),
    getTourPackages(),
  ]);

  if (!destination) notFound();

  const related = packages
    .filter(
      (pkg) =>
        pkg.title.toLowerCase().includes(destination.name.toLowerCase()) ||
        (pkg.location ?? "").toLowerCase().includes(destination.name.toLowerCase()) ||
        (pkg.overview ?? "").toLowerCase().includes(destination.name.toLowerCase())
    )
    .slice(0, 3);
  const suggestions = related.length ? related : packages.filter((p) => p.featured).slice(0, 3);
  const paragraphs = toParagraphs(destination.description ?? "");
  const gallery = (destination.galleryImages ?? []).filter(Boolean);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: destination.name,
    description:
      destination.seoDescription ??
      destination.shortDescription ??
      `Discover ${destination.name} in Rwanda with Global Line Safaris.`,
    url: `${siteConfig.siteUrl.replace(/\/$/, "")}/destinations/${destination.slug}`,
    image: destination.image || undefined,
    location: destination.location ? { "@type": "Place", name: destination.location } : undefined,
    provider: {
      "@type": "TravelAgency",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      telephone: siteConfig.phone,
    },
  };

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        eyebrow="Destination"
        title={destination.name}
        description={destination.shortDescription ?? undefined}
        image={destination.image || siteImages.servicesHero.src}
        breadcrumb={[
          { label: "Destinations", href: "/destinations" },
          { label: destination.name, href: `/destinations/${destination.slug}` },
        ]}
      />

      <section className="bg-white py-20 dark:bg-slate-950 sm:py-28">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-slate-200 pb-7">
              <h2 className="text-3xl">Discover {destination.name}</h2>
              <Link
                className="safari-button"
                href={`/plan-your-trip?destination=${encodeURIComponent(destination.name)}`}
              >
                Plan Your Trip <ArrowRight className="size-4" />
              </Link>
            </div>
            {paragraphs.length > 0 ? (
              <div className="space-y-5">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg"
                  >
                    {p}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400">
                Detailed information for this destination is being prepared.
                Contact our team for a personalised overview.
              </p>
            )}
          </div>

          {gallery.length > 0 && (
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((src) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={src}
                    alt={destination.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {suggestions.length > 0 && (
        <section className="bg-brand-bg-light py-20 dark:bg-slate-900 sm:py-28">
          <div className="it-container px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand dark:bg-brand/10 dark:text-accent">
                  <MapPin className="size-3.5" /> Featured Tours
                </span>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Tours Visiting {destination.name}
                </h2>
              </div>
              <Link
                href="/tour-packages"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-all hover:gap-3 dark:text-accent"
              >
                All Packages <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}
