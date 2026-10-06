import "server-only";

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import type {
  ServiceCategory,
  TeamMember,
  FaqItem,
  Industry,
  WhoWeServe,
  HomepageContent,
  HomepageSectionData,
  SiteSettings,
  SiteImageSetting,
  BlogPost,
} from "@/lib/content/types";

export const CONTENT_TAGS = {
  settings: ["settings"],
  services: ["services"],
  team: ["team"],
  industries: ["industries"],
  faqs: ["faqs"],
  homepage: ["homepage"],
  media: ["media"],
  destinations: ["destinations"],
  packages: ["packages"],
  blog: ["blog"],
  tripInquiries: ["trip-inquiries"],
} as const;

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[] = []): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function parseItems(raw: string | null | undefined): HomepageSectionData["items"] {
  return parseJsonArray<{ icon: string; title: string; description: string }>(raw).filter(
    (item) => item && typeof item.title === "string" && item.title.trim()
  );
}

/**
 * Dedupes an array by a key, keeping the first occurrence (which is the
 * founder-first ordering). Guards against React duplicate-key collisions
 * when the database contains rows with identical names.
 */
function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      out.push(item);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

async function loadServiceCategories(): Promise<ServiceCategory[]> {
  const rows = await prisma.serviceCategory.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { displayOrder: "asc" },
    include: {
      services: {
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        include: { benefits: { orderBy: { displayOrder: "asc" } } },
      },
    },
  });

  return rows.map((cat) => ({
    id: cat.id as unknown as string,
    slug: cat.slug,
    title: cat.title,
    description: cat.description,
    icon: cat.icon,
    cta: cat.cta,
    image: cat.image ?? null,
    seoTitle: cat.seoTitle ?? null,
    seoDescription: cat.seoDescription ?? null,
    services: cat.services.map((service) => ({
      id: service.id as unknown as string,
      name: service.name,
      description: service.description,
      benefits: service.benefits.map((b) => b.text),
      icon: service.icon,
      image: service.image ?? null,
    })),
  }));
}

export function getServiceCategories() {
  return cached("serviceCategories", loadServiceCategories, CONTENT_TAGS.services)();
}

async function loadServiceCategory(slug: string): Promise<ServiceCategory | null> {
  const dbCat = await prisma.serviceCategory.findUnique({
    where: { slug },
    include: {
      services: {
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        include: { benefits: { orderBy: { displayOrder: "asc" } } },
      },
    },
  });
  if (!dbCat || dbCat.status !== "PUBLISHED") return null;

  return {
    slug: dbCat.slug,
    title: dbCat.title,
    description: dbCat.description,
    icon: dbCat.icon,
    cta: dbCat.cta,
    image: dbCat.image,
    seoTitle: dbCat.seoTitle,
    seoDescription: dbCat.seoDescription,
    services: dbCat.services.map((service) => ({
      name: service.name,
      description: service.description,
      benefits: service.benefits.map((b) => b.text),
      icon: service.icon,
    })),
  };
}

export function getServiceCategory(slug: string) {
  return cached(`serviceCategory:${slug}`, () => loadServiceCategory(slug), CONTENT_TAGS.services)();
}

// ---------------------------------------------------------------------------
// Service highlights — from homepage "services" section items or empty
// ---------------------------------------------------------------------------

async function loadServiceHighlights(): Promise<Array<{ title: string; description: string; icon: string }>> {
  const section = await prisma.homepageSection.findUnique({ where: { sectionKey: "services" } });
  if (section?.items) {
    return parseJsonArray<{ icon: string; title: string; description: string }>(section.items);
  }
  return [];
}

export function getServiceHighlights() {
  return cached("serviceHighlights", loadServiceHighlights, CONTENT_TAGS.services)();
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

async function loadTeam(): Promise<{ founder: TeamMember; members: TeamMember[] }> {
  const rows = await prisma.teamMember.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFounder: "desc" }, { displayOrder: "asc" }],
  });

  if (!rows.length) {
    return {
      founder: { name: "", role: "", bio: "", expertise: [] },
      members: [],
    };
  }

  const members = dedupeByName(
    rows.map((m) => ({
      name: m.name,
      role: m.role,
      bio: m.bio ?? "",
      expertise: parseJsonArray<string>(m.expertise),
      image: m.photo ?? undefined,
      photo: m.photo ?? undefined,
      isFounder: m.isFounder,
      email: m.email ?? undefined,
      linkedin: m.linkedin ?? undefined,
    }))
  );

  const founder =
    members.find((m) => m.isFounder) ?? members[0];

  return { founder, members };
}

export function getTeam() {
  return cached("team", loadTeam, CONTENT_TAGS.team)();
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

async function loadFaqs(): Promise<FaqItem[]> {
  const rows = await prisma.faqItem.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
  });
  return rows.map((f) => ({
    question: f.question,
    answer: f.answer,
    category: f.category,
    displayOrder: f.displayOrder,
  }));
}

export function getFaqs() {
  return cached("faqs", loadFaqs, CONTENT_TAGS.faqs)();
}

// ---------------------------------------------------------------------------
// Industries
// ---------------------------------------------------------------------------

async function loadIndustries(): Promise<{ industries: Industry[]; whoWeServe: WhoWeServe[] }> {
  const rows = await prisma.industry.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { displayOrder: "asc" },
  });

  const industries = rows.map((row) => ({
    name: row.name,
    description: row.description,
    icon: row.icon,
    image: row.image,
    slug: row.slug,
  }));

  const whoWeServe = rows.map((row) => ({
    name: row.name,
    description: row.description,
    icon: row.icon,
    services: parseJsonArray<string>(row.services),
  }));

  return { industries, whoWeServe };
}

export function getIndustries() {
  return cached("industries", loadIndustries, CONTENT_TAGS.industries)();
}

// ---------------------------------------------------------------------------
// Homepage sections
// ---------------------------------------------------------------------------

async function loadHomepageContent(): Promise<HomepageContent> {
  const rows = await prisma.homepageSection.findMany();
  const sections = new Map(rows.map((r) => [r.sectionKey, r]));

  const build = (key: keyof HomepageContent): HomepageSectionData => {
    const row = sections.get(key);
    return {
      sectionKey: key,
      eyebrow: row?.eyebrow ?? null,
      title: row?.title ?? null,
      subtitle: row?.subtitle ?? null,
      description: row?.description ?? null,
      items: row ? parseItems(row.items) : [],
      image: row?.imageKey ?? null,
      ctaLabel: row?.ctaLabel ?? null,
      ctaUrl: row?.ctaUrl ?? null,
    };
  };

  return {
    hero: build("hero"),
    services: build("services"),
    about: build("about"),
    whyChoose: build("whyChoose"),
    destinations: build("destinations"),
    packages: build("packages"),
    gallery: build("gallery"),
    partners: build("partners"),
    finalCta: build("finalCta"),
  };
}

export function getHomepageContent() {
  return cached("homepage", loadHomepageContent, CONTENT_TAGS.homepage)();
}

// ---------------------------------------------------------------------------
// Site images (editable via admin)
// ---------------------------------------------------------------------------

async function loadSiteImages(): Promise<{
  heroSlides: SiteImageSetting[];
  about: SiteImageSetting;
  advisory: SiteImageSetting;
  servicesHero: SiteImageSetting;
  contact: SiteImageSetting;
  categories: Record<string, SiteImageSetting>;
}> {
  const rows = await prisma.siteImage.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r as SiteImageSetting]));

  const heroKeys = ["hero.1", "hero.2", "hero.3"];
  const heroSlides = heroKeys
    .map((key) => byKey.get(key))
    .filter((s): s is SiteImageSetting => Boolean(s));

  const resolve = (key: string): SiteImageSetting =>
    byKey.get(key) ?? { key, url: "", alt: "" };

  return {
    heroSlides,
    about: resolve("about"),
    advisory: resolve("advisory"),
    servicesHero: resolve("servicesHero"),
    contact: resolve("contact"),
    categories: {
      "tours-and-experiences": resolve("category.tours-and-experiences"),
      "travel-services": resolve("category.travel-services"),
      "training-attachments": resolve("category.training-attachments"),
    },
  };
}

export function getSiteImages() {
  return cached("siteImages", loadSiteImages, CONTENT_TAGS.media)();
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

async function loadSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany();
  const s = new Map(rows.map((r) => [r.key, r.value]));

  const get = (key: string, fallback: string = "") => (s.has(key) ? (s.get(key) || "") : fallback);

  return {
    companyName: get("companyName", siteConfig.name),
    shortName: get("shortName", siteConfig.shortName),
    tagline: get("tagline", siteConfig.tagline),
    description: get("description", siteConfig.description),
    logo: get("logo", ""),
    favicon: get("favicon", ""),
    addressLine1: get("addressLine1", ""),
    addressLine2: get("addressLine2", ""),
    city: get("city", ""),
    province: get("province", ""),
    postalCode: get("postalCode", ""),
    country: get("country", "Rwanda"),
    phone: get("phone", siteConfig.phone),
    phoneSecondary: get("phoneSecondary", ""),
    email: get("email", siteConfig.email),
    businessHoursLine1: get("businessHoursLine1", ""),
    businessHoursLine2: get("businessHoursLine2", ""),
    linkedin: get("linkedin", "#"),
    facebook: get("facebook", "#"),
    instagram: get("instagram", "#"),
    youtube: get("youtube", "#"),
    bookingUrl: get("bookingUrl", siteConfig.bookOnlineUrl),
    whatsappNumber: get("whatsappNumber", siteConfig.whatsappNumber),
    whatsappMessage: get("whatsappMessage", siteConfig.whatsappMessage),
    copyright: get("copyright", `© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`),
    designerCredit: get("designerCredit", ""),
    adminEmail: get("adminEmail", siteConfig.email),
  };
}

export function getSiteSettings() {
  return cached("siteSettings", loadSiteSettings, CONTENT_TAGS.settings)();
}

// ---------------------------------------------------------------------------
// Tourism: destinations & packages
// ---------------------------------------------------------------------------

function mapDestination(row: any): import("@/lib/content/types").Destination {
  return {
    id: row.id as string,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription ?? null,
    description: row.description,
    location: row.location ?? null,
    category: row.category ?? null,
    image: row.image ?? null,
    galleryImages: parseJsonArray<string>(row.galleryImages) ?? null,
    seoTitle: row.seoTitle ?? null,
    seoDescription: row.seoDescription ?? null,
    displayOrder: row.displayOrder,
    featured: row.featured,
  };
}

async function loadDestinations(): Promise<import("@/lib/content/types").Destination[]> {
  const rows = await prisma.destination.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ displayOrder: "asc" }],
  });
  return rows.map(mapDestination);
}

export function getDestinations() {
  return cached("destinations", loadDestinations, CONTENT_TAGS.destinations)();
}

async function loadDestination(slug: string): Promise<import("@/lib/content/types").Destination | null> {
  const row = await prisma.destination.findUnique({
    where: { slug },
  });
  if (!row || row.status !== "PUBLISHED") return null;
  return mapDestination(row);
}

export function getDestination(slug: string) {
  return cached(`destination:${slug}`, () => loadDestination(slug), CONTENT_TAGS.destinations)();
}

function mapPackage(row: any): import("@/lib/content/types").TourPackage {
  return {
    id: row.id as string,
    title: row.title,
    slug: row.slug,
    location: row.location ?? null,
    category: row.category ?? null,
    duration: row.duration ?? null,
    price: row.price ?? null,
    priceNote: row.priceNote ?? null,
    overview: row.overview,
    facts: row.facts ?? null,
    highlights: parseJsonArray<string>(row.highlights),
    itinerary: parseJsonArray<{ heading?: string; body?: string }>(row.itinerary),
    inclusions: parseJsonArray<string>(row.inclusions),
    exclusions: parseJsonArray<string>(row.exclusions),
    note: row.note ?? null,
    image: row.image ?? null,
    galleryImages: parseJsonArray<string>(row.galleryImages),
    seoTitle: row.seoTitle ?? null,
    seoDescription: row.seoDescription ?? null,
    featured: row.featured,
    displayOrder: row.displayOrder,
  };
}

async function loadTourPackages(): Promise<import("@/lib/content/types").TourPackage[]> {
  const rows = await prisma.tourPackage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ displayOrder: "asc" }],
  });
  return rows.map(mapPackage);
}

export function getTourPackages() {
  return cached("tourPackages", loadTourPackages, CONTENT_TAGS.packages)();
}

async function loadTourPackage(slug: string): Promise<import("@/lib/content/types").TourPackage | null> {
  const row = await prisma.tourPackage.findUnique({ where: { slug } });
  if (!row || row.status !== "PUBLISHED") return null;
  return mapPackage(row);
}

export function getTourPackage(slug: string) {
  return cached(`tourPackage:${slug}`, () => loadTourPackage(slug), CONTENT_TAGS.packages)();
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

function mapBlogPost(row: any): BlogPost {
  return {
    id: row.id as string,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? null,
    content: row.content ?? null,
    category: row.category ?? null,
    image: row.image ?? null,
    author: row.author ?? null,
    readTime: row.readTime ?? null,
    seoTitle: row.seoTitle ?? null,
    seoDescription: row.seoDescription ?? null,
    featured: row.featured,
    displayOrder: row.displayOrder,
    status: row.status,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : undefined,
  };
}

async function loadBlogPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapBlogPost);
}

export function getBlogPosts() {
  return cached("blogPosts", loadBlogPosts, CONTENT_TAGS.blog)();
}

async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  if (!row || row.status !== "PUBLISHED") return null;
  return mapBlogPost(row);
}

export function getBlogPost(slug: string) {
  return cached(`blogPost:${slug}`, () => loadBlogPost(slug), CONTENT_TAGS.blog)();
}

// Gallery media (public)
async function loadGalleryImages(): Promise<
  Array<{ id: string; url: string; alt: string | null; width: number | null; height: number | null }>
> {
  const rows = await prisma.media.findMany({
    where: { mimeType: { startsWith: "image/" } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((m) => ({
    id: m.id,
    url: m.url,
    alt: m.title ?? m.alt ?? null,
    width: m.width,
    height: m.height,
  }));
}

export function getGalleryImages() {
  return cached("galleryImages", loadGalleryImages, CONTENT_TAGS.media)();
}

// SEO metadata for a page (seeded from /admin/seo)
export function getSeoSetting(pageKey: string): Promise<{
  title: string | null;
  description: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  indexable: boolean;
} | null> {
  return getCachedSeoSetting(pageKey).then((row) => {
    if (!row) return null;
    return {
      title: row.title,
      description: row.description,
      ogImage: row.ogImage,
      canonicalUrl: row.canonicalUrl,
      indexable: row.indexable,
    };
  });
}

/**
 * Builds Next.js `Metadata` from the CMS-managed SEO record for a page, falling
 * back to hardcoded defaults when no record (or a given field) is set.
 *
 * Every public page routes its metadata through this so edits made in
 * /admin/seo actually take effect instead of silently being ignored.
 */
export async function buildPageMetadata(
  pageKey: string,
  defaults: { title: string; description: string; path?: string }
): Promise<Metadata> {
  const seo = await getCachedSeoSetting(pageKey);
  const path = defaults.path ?? pageKey;

  const title = seo?.title || defaults.title;
  const description = seo?.description || defaults.description;
  const ogImage = seo?.ogImage || undefined;
  const url = seo?.canonicalUrl || path;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Global Line Safaris",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: seo?.indexable === false ? { index: false, follow: false } : undefined,
  };
}

async function getCachedSeoSetting(pageKey: string) {
  return unstable_cache(
    async () => prisma.seoSetting.findUnique({ where: { pageKey } }),
    [`seo:${pageKey}`],
    { revalidate: 60, tags: ["seo"] }
  )();
}

// ---------------------------------------------------------------------------
// Cached helper
// ---------------------------------------------------------------------------

type CachedFn<T> = () => Promise<T>;

function cached<T>(key: string, loader: () => Promise<T>, tags: readonly string[]): CachedFn<T> {
  return unstable_cache(loader, [key], { revalidate: 60, tags: [...tags] });
}
