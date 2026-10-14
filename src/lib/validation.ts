import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address").max(255);

/**
 * Password policy for admin accounts.
 * Returns an error message when the password is too weak, or null when valid.
 */
export function validatePassword(password: string): string | null {
  if (typeof password !== "string" || password.length < 12) {
    return "Password must be at least 12 characters long.";
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
}

export const slugSchema = z.string().max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format").optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function parsePagination(params: URLSearchParams): Pagination {
  const page = parseInt(params.get("page") || "1", 10);
  const limit = parseInt(params.get("limit") || "20", 10);
  return {
    page: isNaN(page) || page < 1 ? 1 : Math.min(page, 10000),
    limit: isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100),
  };
}

// ---------------------------------------------------------------------------
// Public form schemas
// ---------------------------------------------------------------------------

// Client-generated UUID used to make a form submission idempotent.
const idempotencyKeySchema = z
  .string()
  .min(16, "Invalid submission key")
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid submission key")
  .optional();

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: emailSchema,
  subject: z.string().min(1, "Subject is required").max(300),
  message: z.string().min(1, "Message is required").max(5000),
  phone: z.string().max(50).nullable().optional(),
  company: z.string().max(200).nullable().optional(),
  service: z.string().max(200).nullable().optional(),
  idempotencyKey: idempotencyKeySchema,
});

export const newsletterSchema = z.object({
  email: emailSchema,
});

export const settingsSchema = z.record(z.string(), z.string());

// ---------------------------------------------------------------------------
// Admin content schemas (for admin API validation)
// ---------------------------------------------------------------------------

export const serviceCategorySchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  icon: z.string().max(100).default("Building2"),
  image: z.string().max(500).nullable().optional(),
  cta: z.string().max(200).default("Plan Your Trip"),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  displayOrder: z.number().int().default(0),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const serviceCategoryUpdateSchema = serviceCategorySchema.partial();

export const serviceSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  description: z.string().min(1).max(5000),
  shortDescription: z.string().max(500).nullable().optional(),
  icon: z.string().max(100).default("Briefcase"),
  image: z.string().max(500).nullable().optional(),
  ctaLabel: z.string().max(200).default("Request a Consultation"),
  ctaUrl: z.string().max(500).default("/contact"),
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
  benefits: z.array(z.string().max(500)).optional(),
});

export const serviceUpdateSchema = serviceSchema.partial();

export const teamMemberSchema = z.object({
  name: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  bio: z.string().max(2000).nullable().optional(),
  photo: z.string().max(500).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  linkedin: z.string().max(500).nullable().optional(),
  expertise: z.array(z.string().max(200)).default([]),
  isFounder: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const teamMemberUpdateSchema = teamMemberSchema.partial();

export const industrySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  description: z.string().min(1).max(2000),
  icon: z.string().max(100).default("Building2"),
  image: z.string().max(500).nullable().optional(),
  services: z.array(z.string().max(200)).default([]),
  displayOrder: z.number().int().default(0),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const industryUpdateSchema = industrySchema.partial();

export const faqSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
  category: z.string().max(100).default("General"),
  displayOrder: z.number().int().default(0),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const faqUpdateSchema = faqSchema.partial();

export const homepageSectionSchema = z.object({
  eyebrow: z.string().max(200).nullable().optional(),
  title: z.string().max(300).nullable().optional(),
  subtitle: z.string().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  items: z.array(z.any()).nullable().optional(),
  imageKey: z.string().max(200).nullable().optional(),
  ctaLabel: z.string().max(200).nullable().optional(),
  ctaUrl: z.string().max(200).nullable().optional(),
});

export const seoSettingSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  ogImage: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().max(500).nullable().optional(),
  indexable: z.boolean().default(true),
});

export const userCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: emailSchema,
  password: z
    .string()
    .min(12, "Password must be at least 12 characters long.")
    .max(200)
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]).default("EDITOR"),
  phone: z.string().max(50).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: emailSchema.optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]).optional(),
  active: z.boolean().optional(),
  phone: z.string().max(50).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
});

// ---------------------------------------------------------------------------
// Tourism schemas
// ---------------------------------------------------------------------------

export const tripInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: emailSchema,
  phone: z.string().max(50).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  travelDate: z.string().max(50).nullable().optional(),
  duration: z.string().max(100).nullable().optional(),
  travelers: z.string().max(50).nullable().optional(),
  preferredPackage: z.string().max(300).nullable().optional(),
  budget: z.string().max(100).nullable().optional(),
  destination: z.string().max(200).nullable().optional(),
  message: z.string().max(5000).nullable().optional(),
  idempotencyKey: idempotencyKeySchema,
});

export const tripInquiryUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: emailSchema.optional(),
  phone: z.string().max(50).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  travelDate: z.string().max(50).nullable().optional(),
  duration: z.string().max(100).nullable().optional(),
  travelers: z.string().max(50).nullable().optional(),
  preferredPackage: z.string().max(300).nullable().optional(),
  budget: z.string().max(100).nullable().optional(),
  destination: z.string().max(200).nullable().optional(),
  message: z.string().max(5000).nullable().optional(),
  status: z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "QUALIFIED", "CONVERTED", "CLOSED", "SPAM"]).optional(),
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
  assignedToId: z.string().max(100).nullable().optional(),
});

/** Programme types an applicant can apply for. Shared by the public form and admin editor. */
export const PROGRAM_TYPE_VALUES = [
  "INTERNSHIP",
  "INDUSTRIAL_ATTACHMENT",
  "APPRENTICESHIP",
  "VOLUNTEER",
] as const;

export const PROGRAM_TYPE_LABELS: Record<(typeof PROGRAM_TYPE_VALUES)[number], string> = {
  INTERNSHIP: "Internship",
  INDUSTRIAL_ATTACHMENT: "Industrial Attachment",
  APPRENTICESHIP: "Apprenticeship",
  VOLUNTEER: "Volunteering",
};

const PROGRAM_TYPE_ENUM = z.enum(PROGRAM_TYPE_VALUES);

export const internshipInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: emailSchema,
  phone: z.string().max(50).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  university: z.string().max(200).nullable().optional(),
  fieldOfStudy: z.string().max(200).nullable().optional(),
  programType: PROGRAM_TYPE_ENUM.nullable().optional(),
  preferredStartDate: z.string().max(50).nullable().optional(),
  duration: z.string().max(100).nullable().optional(),
  experience: z.string().max(1000).nullable().optional(),
  areasOfInterest: z.string().max(500).nullable().optional(),
  message: z.string().max(5000).nullable().optional(),
  idempotencyKey: idempotencyKeySchema,
});

export const internshipInquiryUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: emailSchema.optional(),
  phone: z.string().max(50).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  university: z.string().max(200).nullable().optional(),
  fieldOfStudy: z.string().max(200).nullable().optional(),
  programType: PROGRAM_TYPE_ENUM.nullable().optional(),
  preferredStartDate: z.string().max(50).nullable().optional(),
  duration: z.string().max(100).nullable().optional(),
  experience: z.string().max(1000).nullable().optional(),
  areasOfInterest: z.string().max(500).nullable().optional(),
  message: z.string().max(5000).nullable().optional(),
  status: z
    .enum(["NEW", "CONTACTED", "IN_PROGRESS", "QUALIFIED", "CONVERTED", "CLOSED", "SPAM"])
    .optional(),
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
  assignedToId: z.string().max(100).nullable().optional(),
});

export const destinationSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  shortDescription: z.string().max(500).nullable().optional(),
  description: z.string().max(20000).default(""),
  location: z.string().max(300).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  galleryImages: z.array(z.string().max(500)).optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(170).nullable().optional(),
  displayOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const destinationUpdateSchema = destinationSchema.partial();export const tourPackageSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  location: z.string().max(300).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  duration: z.string().max(100).nullable().optional(),
  price: z.string().max(100).nullable().optional(),
  priceNote: z.string().max(300).nullable().optional(),
  overview: z.string().max(20000).default(""),
  facts: z.string().max(2000).nullable().optional(),
  highlights: z.array(z.string().max(1000)).optional(),
  itinerary: z
    .array(z.object({ heading: z.string().max(300).optional(), body: z.string().max(10000).optional() }))
    .optional(),
  inclusions: z.array(z.string().max(1000)).optional(),
  exclusions: z.array(z.string().max(1000)).optional(),
  note: z.string().max(2000).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  galleryImages: z.array(z.string().max(500)).optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(170).nullable().optional(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const tourPackageUpdateSchema = tourPackageSchema.partial();

export const blogPostSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
  excerpt: z.string().max(500).default(""),
  content: z.string().max(50000).default(""),
  category: z.string().max(100).default("Travel Guides"),
  image: z.string().max(500).nullable().optional(),
  author: z.string().max(200).default("Global Line Safaris"),
  readTime: z.number().int().min(1).max(240).nullable().optional(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(170).nullable().optional(),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const blogPostUpdateSchema = blogPostSchema.partial();
