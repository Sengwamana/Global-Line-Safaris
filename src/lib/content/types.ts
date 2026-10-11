// Domain types shared between the CMS repositories and the public website.

export interface Service {
  name: string;
  description: string;
  benefits: string[];
  icon: string;
  image?: string | null;
}

export interface ServiceCategory {
  id?: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  cta: string;
  image?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  services: Service[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  image?: string | null;
  photo?: string | null;
  isFounder?: boolean;
  email?: string;
  linkedin?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
  displayOrder?: number;
}

export interface Industry {
  name: string;
  description: string;
  icon: string;
  image?: string | null;
  slug?: string;
}

export interface WhoWeServe {
  name: string;
  description: string;
  icon: string;
  services: string[];
}

export interface HomepageSectionData {
  sectionKey: string;
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  items: Array<{ icon: string; title: string; description: string }>;
  image?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}

export interface HomepageContent {
  hero: HomepageSectionData;
  services: HomepageSectionData;
  about: HomepageSectionData;
  whyChoose: HomepageSectionData;
  destinations: HomepageSectionData;
  packages: HomepageSectionData;
  gallery: HomepageSectionData;
  partners: HomepageSectionData;
  finalCta: HomepageSectionData;
}

export interface SiteSettings {
  companyName: string;
  shortName: string;
  tagline: string;
  description: string;
  logo?: string;
  favicon?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  phoneSecondary: string;
  email: string;
  businessHoursLine1: string;
  businessHoursLine2: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  bookingUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
  copyright: string;
  designerCredit: string;
  adminEmail: string;
}

export interface SiteImageSetting {
  key: string;
  url: string;
  alt?: string | null;
}

// ---------------------------------------------------------------------------
// Tourism content
// ---------------------------------------------------------------------------

export interface Destination {
  id?: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  location?: string | null;
  category?: string | null;
  image?: string | null;
  galleryImages?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  displayOrder?: number;
  featured?: boolean;
}

export interface TourPackageDay {
  heading?: string;
  body?: string;
}

export interface TourPackage {
  id?: string;
  title: string;
  slug: string;
  location?: string | null;
  category?: string | null;
  duration?: string | null;
  price?: string | null;
  priceNote?: string | null;
  overview: string;
  facts?: string | null;
  highlights?: string[] | null;
  itinerary?: TourPackageDay[] | null;
  inclusions?: string[] | null;
  exclusions?: string[] | null;
  note?: string | null;
  image?: string | null;
  galleryImages?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featured?: boolean;
  displayOrder?: number;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  image?: string | null;
  author?: string | null;
  readTime?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featured?: boolean;
  displayOrder?: number;
  status?: string;
  createdAt?: string;
}

export interface TripInquiry {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  travelDate?: string | null;
  duration?: string | null;
  travelers?: string | null;
  preferredPackage?: string | null;
  budget?: string | null;
  destination?: string | null;
  message?: string | null;
  status?: string;
  read?: boolean;
  createdAt?: string;
}
