import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Compass,
  Mountain,
  Camera,
  Route,
  Sun,
  Car,
  Check,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { CTASection } from "@/domains/home/components/CTASection";
import { PackageCard } from "@/domains/packages/components/PackageCard";
import { DestinationCard } from "@/components/shared/DestinationCard";
import {
  getDestination,
  getDestinations,
  getTourPackages,
} from "@/lib/content/service.server";
import { siteImages } from "@/lib/siteImages";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/shared/JsonLd";

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

const categoryHighlights: Record<string, string[]> = {
  "National Park": [
    "Wildlife viewing and game drives",
    "Guided nature walks and tracking experiences",
    "Diverse ecosystems and birdwatching",
    "Photography opportunities in pristine habitats",
  ],
  Lake: [
    "Scenic lakeside views and sunsets",
    "Water-based activities and boat excursions",
    "Relaxed atmosphere and beachside leisure",
    "Birdwatching and lakeside dining",
  ],
  Forest: [
    "Canopy walks and nature trails",
    "Primate tracking and birdwatching",
    "Lush tropical vegetation and waterfalls",
    "Eco-tourism and conservation experiences",
  ],
  City: [
    "Cultural landmarks and historical sites",
    "Local markets and artisan shopping",
    "Museums and art galleries",
    "Dining and nightlife experiences",
  ],
  Highlands: [
    "Breathtaking mountain panoramas",
    "Hiking and trekking trails",
    "Tea and coffee plantation visits",
    "Cool climate and scenic drives",
  ],
  "Adventure Trail": [
    "Multi-day hiking and cycling routes",
    "Camping under the stars",
    "Challenging terrain for active travelers",
    "Remote villages and cultural encounters",
  ],
  "Culture & Heritage": [
    "Historical sites and monuments",
    "Traditional ceremonies and performances",
    "Local craft workshops and demonstrations",
    "Community-based tourism experiences",
  ],
  Country: [
    "Diverse landscapes from volcanoes to savannah",
    "Rich cultural heritage and traditions",
    "World-class wildlife and primate experiences",
    "Warm hospitality and vibrant communities",
  ],
};

const categoryBestTime: Record<string, string> = {
  "National Park": "Year-round, with the dry seasons (June–September and December–February) offering the best wildlife viewing conditions.",
  Lake: "Enjoyable year-round. The dry season (June–September) is ideal for water activities and lakeside relaxation.",
  Forest: "Visit during the dry season (June–September) for the most comfortable hiking conditions, though the forest is beautiful year-round.",
  City: "Kigali enjoys a mild, spring-like climate year-round. The dry season (June–September) is particularly pleasant for exploring.",
  Highlands: "The dry season (June–September) offers the clearest views and most comfortable hiking conditions.",
  "Adventure Trail": "Best during the dry season (June–September) when trails are most accessible and conditions are safest.",
  "Culture & Heritage": "Year-round, though cultural events and ceremonies are more frequent during the dry season.",
  Country: "Rwanda is a year-round destination. The dry seasons (June–September and December–February) are the most popular for wildlife and outdoor activities.",
};

const categoryGettingThere: Record<string, string> = {
  "National Park": "Most national parks are accessible by road from Kigali, with transfers ranging from 2–3 hours. We arrange private 4x4 vehicles with experienced driver-guides.",
  Lake: "Lakes are easily reachable by road from Kigali, typically within 1–2 hours. Private transfers can be arranged as part of your itinerary.",
  Forest: "Forest destinations are accessible by road, usually within 2–3 hours from Kigali. A 4x4 vehicle is recommended for some routes.",
  City: "Kigali is well-connected by air, road, and public transport. The city is compact and easy to navigate with our guided tours.",
  Highlands: "Highland destinations are reachable by scenic drives from Kigali, typically 1–3 hours depending on the specific location.",
  "Adventure Trail": "Trailheads are accessible by road from Kigali or nearby towns. We arrange transfers to and from the trail, with support vehicles where applicable.",
  "Culture & Heritage": "Heritage sites are spread across the country, most within 1–3 hours of Kigali by road. We arrange guided visits with local experts.",
  Country: "Rwanda is accessible via Kigali International Airport (KGL), with direct flights from major African and European hubs. Domestic travel is by road.",
};

export default async function DestinationDetailPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const [destination, allDestinations, packages] = await Promise.all([
    getDestination(slug),
    getDestinations(),
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

  const relatedDestinations = allDestinations
    .filter((d) => d.slug !== destination.slug)
    .filter(
      (d) =>
        d.category === destination.category ||
        d.location === destination.location
    )
    .slice(0, 3);
  const moreDestinations = relatedDestinations.length
    ? relatedDestinations
    : allDestinations.filter((d) => d.slug !== destination.slug).slice(0, 3);

  const highlights = categoryHighlights[destination.category ?? ""] ?? [
    "Guided tours with experienced local experts",
    "Breathtaking natural scenery and photo opportunities",
    "Cultural encounters and authentic experiences",
    "Comfortable accommodations and transport",
  ];

  const bestTime = categoryBestTime[destination.category ?? ""] ?? "Rwanda is a year-round destination with mild temperatures and two dry seasons (June–September and December–February) that are ideal for outdoor activities.";

  const gettingThere = categoryGettingThere[destination.category ?? ""] ?? "We arrange all transfers from Kigali with private 4x4 vehicles and experienced driver-guides.";

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
      <JsonLd data={structuredData} />
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

      {/* Quick facts bar */}
      <section className="bg-brand text-white py-6">
        <div className="safari-container">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
            {destination.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-accent" />
                {destination.location}
              </span>
            )}
            {destination.category && (
              <span className="inline-flex items-center gap-2">
                <Compass className="size-4 text-accent" />
                {destination.category}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 text-accent" />
              Year-round destination
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-accent" />
              Recommended: 1–3 days
            </span>
          </div>
        </div>
      </section>

      {/* Main content with sidebar */}
      <section className="safari-section">
        <div className="safari-container">
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
            {/* Left column — main content */}
            <div>
              {/* Overview */}
              <div className="mb-12">
                <div className="safari-eyebrow">
                  <span className="safari-eyebrow-line" />
                  <span>Overview</span>
                </div>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Discover {destination.name}
                </h2>
                <div className="mt-6 space-y-5">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((p, i) => (
                      <p key={i} className="text-base leading-8 text-slate-600 dark:text-slate-400">
                        {p}
                      </p>
                    ))
                  ) : (
                    <p className="text-base leading-8 text-slate-500 dark:text-slate-400">
                      Detailed information for this destination is being prepared.
                      Contact our team for a personalised overview.
                    </p>
                  )}
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-12">
                <div className="safari-eyebrow">
                  <span className="safari-eyebrow-line" />
                  <span>Highlights</span>
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  What You&apos;ll Experience
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="mt-0.5 size-4 flex-shrink-0 text-brand dark:text-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best time to visit */}
              <div className="mb-12 rounded-2xl border border-slate-100 bg-brand-bg-light p-6 dark:border-slate-700/50 dark:bg-slate-800">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-accent">
                    <Sun className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      Best Time to Visit
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {bestTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Getting there */}
              <div className="mb-12 rounded-2xl border border-slate-100 bg-brand-bg-light p-6 dark:border-slate-700/50 dark:bg-slate-800">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-accent">
                    <Car className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      Getting There
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {gettingThere}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              {gallery.length > 0 && (
                <div className="mb-12">
                  <div className="safari-eyebrow">
                    <span className="safari-eyebrow-line" />
                    <span>Gallery</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {destination.name} in Pictures
                  </h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {gallery.map((src, i) => (
                      <div
                        key={src}
                        className={`relative overflow-hidden rounded-2xl ${
                          i === 0 && gallery.length > 2 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                        }`}
                      >
                        <Image
                          src={src}
                          alt={`${destination.name} — photo ${i + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          loading="lazy"
                          decoding="async"
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — sticky sidebar */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-slate-100 bg-brand-bg-light p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Plan your visit
                </p>
                <p className="mt-1 font-serif text-2xl font-bold text-brand dark:text-accent">
                  {destination.name}
                </p>
                {destination.location && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="size-4" />
                    {destination.location}
                  </p>
                )}
                <Link
                  href={`/plan-your-trip?destination=${encodeURIComponent(destination.name)}`}
                  className="safari-button mt-6 block w-full text-center"
                >
                  Plan Your Trip <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/contact"
                  className="mt-3 block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-brand/30 hover:text-brand dark:border-slate-600 dark:text-slate-300 dark:hover:border-accent/30 dark:hover:text-accent"
                >
                  Ask a Question
                </Link>
                <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  <Mountain className="mt-0.5 size-4 flex-shrink-0 text-brand dark:text-accent" />
                  Every itinerary is customised. Tell us your dates and travel
                  style for a tailored quote.
                </p>
              </div>

              {/* Quick info card */}
              <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 dark:border-slate-700/50 dark:bg-slate-900">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick Facts
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  {destination.category && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500 dark:text-slate-400">Category</dt>
                      <dd className="font-medium text-slate-900 dark:text-white">{destination.category}</dd>
                    </div>
                  )}
                  {destination.location && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500 dark:text-slate-400">Location</dt>
                      <dd className="font-medium text-slate-900 dark:text-white">{destination.location}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Best for</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {destination.category === "National Park" ? "Wildlife & Nature" :
                       destination.category === "Lake" ? "Relaxation & Water Sports" :
                       destination.category === "Forest" ? "Hiking & Primates" :
                       destination.category === "City" ? "Culture & History" :
                       destination.category === "Highlands" ? "Scenic Drives & Hiking" :
                       destination.category === "Adventure Trail" ? "Adventure & Multi-day Treks" :
                       destination.category === "Culture & Heritage" ? "History & Culture" :
                       "All-round Experience"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">Recommended stay</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">1–3 days</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Tours visiting this destination */}
      {suggestions.length > 0 && (
        <section className="safari-section section-bg-cream">
          <div className="safari-container">
            <div className="editorial-heading">
              <div>
                <div className="safari-eyebrow">
                  <span className="safari-eyebrow-line" />
                  <span>Featured Tours</span>
                </div>
                <h2>Tours Visiting {destination.name}</h2>
              </div>
              <Link className="safari-text-link" href="/tour-packages">
                All Packages <ArrowRight width={14} height={14} />
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

      {/* Related destinations */}
      {moreDestinations.length > 0 && (
        <section className="safari-section">
          <div className="safari-container">
            <div className="editorial-heading">
              <div>
                <div className="safari-eyebrow">
                  <span className="safari-eyebrow-line" />
                  <span>Explore More</span>
                </div>
                <h2>Other Destinations</h2>
              </div>
              <Link className="safari-text-link" href="/destinations">
                All Destinations <ArrowRight width={14} height={14} />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {moreDestinations.map((d) => (
                <DestinationCard key={d.slug} destination={d} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection />
    </div>
  );
}
