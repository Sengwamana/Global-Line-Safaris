import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  X,
  CalendarDays,
  ListChecks,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { CTASection } from "@/domains/home/components/CTASection";
import { PackageCard } from "@/domains/packages/components/PackageCard";
import { Button } from "@/components/ui/button";
import {
  getTourPackage,
  getTourPackages,
} from "@/lib/content/service.server";
import { displayPackagePrice } from "@/lib/utils";
import { siteImages } from "@/lib/siteImages";
import { siteConfig } from "@/lib/site";

export const revalidate = 60;

interface PackagePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const packages = await getTourPackages();
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: PackagePageProps) {
  const { slug } = await params;
  const pkg = await getTourPackage(slug);
  if (!pkg) return { title: "Tour Package Not Found" };
  return {
    title: pkg.seoTitle || pkg.title,
    description:
      pkg.seoDescription ??
      pkg.overview?.slice(0, 160) ??
      `Book ${pkg.title} with Global Line Safaris.`,
    alternates: { canonical: `/tour-packages/${pkg.slug}` },
  };
}

export default async function TourPackageDetailPage({ params }: PackagePageProps) {
  const { slug } = await params;
  const [pkg, allPackages] = await Promise.all([
    getTourPackage(slug),
    getTourPackages(),
  ]);

  if (!pkg) notFound();

  const price = displayPackagePrice(pkg.price);
  const itinerary = pkg.itinerary ?? [];
  const highlights = pkg.highlights ?? [];
  const inclusions = pkg.inclusions ?? [];
  const exclusions = pkg.exclusions ?? [];
  const gallery = (pkg.galleryImages ?? []).filter(Boolean);
  const more = allPackages.filter((p) => p.slug !== pkg.slug).slice(0, 3);
  const bookingHref = `/plan-your-trip?package=${encodeURIComponent(pkg.title)}`;

  const facts = [
    pkg.duration && { icon: Clock, label: "Duration", value: pkg.duration },
    pkg.location && { icon: MapPin, label: "Location", value: pkg.location },
    { icon: CalendarDays, label: "Trip Type", value: "Private / Tailor-made" },
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string }>;

  const packageUrl = `${siteConfig.siteUrl.replace(/\/$/, "")}/tour-packages/${pkg.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.overview || pkg.seoDescription || `Book ${pkg.title} with Global Line Safaris.`,
    url: packageUrl,
    image: pkg.image || undefined,
    duration: pkg.duration || undefined,
    provider: {
      "@type": "TravelAgency",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      telephone: siteConfig.phone,
    },
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: price.replace(/[^0-9.,]/g, "").replace(/,/g, ""),
            availability: "https://schema.org/InStock",
            url: packageUrl,
          },
        }
      : {}),
    itinerary: itinerary.map((day, i) => ({
      "@type": "TouristTrip",
      name: day.heading || `Day ${i + 1}`,
      description: day.body || undefined,
    })),
  };

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        eyebrow="Tour Package"
        title={pkg.title}
        description={pkg.overview}
        image={pkg.image || siteImages.servicesHero.src}
        breadcrumb={[
          { label: "Tour Packages", href: "/tour-packages" },
          { label: pkg.title, href: `/tour-packages/${pkg.slug}` },
        ]}
      />

      <section className="bg-white py-16 dark:bg-slate-950 sm:py-24">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
            <div>
              {pkg.overview && (
                <div className="mb-10">
                  <div className="safari-eyebrow">
                    <span className="safari-eyebrow-line" />
                    <span>Your journey at a glance</span>
                  </div>
                  <h2 className="text-3xl">The experience</h2>
                  <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600">
                    {pkg.overview}
                  </p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-2xl border border-slate-100 bg-brand-bg-light p-4 dark:border-slate-700/50 dark:bg-slate-800"
                  >
                    <fact.icon className="size-5 text-brand dark:text-accent" />
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {fact.label}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>

              {pkg.facts && (
                <p className="mt-8 rounded-2xl border border-accent/20 bg-accent-subtle p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {pkg.facts}
                </p>
              )}

              {highlights.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Trip Highlights
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {highlights.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <Check className="mt-0.5 size-4 flex-shrink-0 text-brand dark:text-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {itinerary.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Day-by-Day Itinerary
                  </h2>
                  <ol className="mt-6 space-y-6 border-l border-slate-200 dark:border-slate-700">
                    {itinerary.map((day, i) => (
                      <li key={i} className="relative pl-8">
                        <span className="absolute -left-[9px] top-1 flex size-4 items-center justify-center rounded-full border-2 border-brand bg-white dark:border-accent dark:bg-slate-950" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {day.heading || `Day ${i + 1}`}
                        </h3>
                        {day.body && (
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {day.body}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {(inclusions.length > 0 || exclusions.length > 0) && (
                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                  {inclusions.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 p-6 dark:border-slate-700/50">
                      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                        What&apos;s Included
                      </h3>
                      <ul className="mt-4 space-y-2.5">
                        {inclusions.map((item, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="mt-0.5 size-4 flex-shrink-0 text-brand dark:text-accent" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exclusions.length > 0 && (
                    <div className="rounded-2xl border border-slate-100 p-6 dark:border-slate-700/50">
                      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                        What&apos;s Not Included
                      </h3>
                      <ul className="mt-4 space-y-2.5">
                        {exclusions.map((item, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                            <X className="mt-0.5 size-4 flex-shrink-0 text-rose-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {gallery.length > 0 && (
                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  {gallery.map((src) => (
                    <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image
                        src={src}
                        alt={pkg.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loading="lazy"
                        decoding="async"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking sidebar */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-slate-100 bg-brand-bg-light p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {price ? "Starting from" : "Pricing"}
                </p>
                <p className="mt-1 font-serif text-3xl font-bold text-brand dark:text-accent">
                  {price ?? "On request"}
                </p>
                {pkg.priceNote && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pkg.priceNote}</p>
                )}
                <Link href={bookingHref} className="mt-6 block">
                  <Button variant="accent" size="xl" className="w-full gap-2 rounded-xl">
                    Request This Trip <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/contact" className="mt-3 block">
                  <Button variant="outline" size="xl" className="w-full rounded-xl">
                    Ask a Question
                  </Button>
                </Link>
                <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  <ListChecks className="mt-0.5 size-4 flex-shrink-0 text-brand dark:text-accent" />
                  Every itinerary can be customised. Tell us your dates and
                  travel style for a tailored quote.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="bg-brand-bg-light py-20 dark:bg-slate-900 sm:py-28">
          <div className="it-container px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                You May Also Like
              </h2>
              <Link
                href="/tour-packages"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-all hover:gap-3 dark:text-accent"
              >
                All Packages <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <PackageCard key={p.slug} pkg={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}
