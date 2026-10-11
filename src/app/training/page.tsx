import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Clock,
  Users,
  Award,
  BookOpen,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { buildPageMetadata, getServiceCategory } from "@/lib/content/service.server";
import { siteImages } from "@/lib/siteImages";
import { siteConfig } from "@/lib/site";
import { CTASection } from "@/domains/home/components/CTASection";
import { TrainingApplicationForm } from "@/domains/training/components/TrainingApplicationForm";
import { JsonLd } from "@/components/shared/JsonLd";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('training', {
    title: 'Training & Internships',
    description: 'Professional tourism training, internships and industrial attachments with Global Line Safaris — accredited short courses and hands-on industry placements in Rwanda.',
    path: '/training',
  });
}

const steps = [
  {
    icon: BookOpen,
    title: "Submit Your Application",
    description:
      "Tell us about your background, interests and learning goals. We review every application personally and match you with the right program.",
  },
  {
    icon: GraduationCap,
    title: "Complete Foundation Training",
    description:
      "Build essential knowledge through our accredited short courses — tour operations, guiding principles, customer service and destination expertise.",
  },
  {
    icon: Users,
    title: "Field Practice & Mentorship",
    description:
      "Work alongside experienced guides and operations staff on real tours, receiving hands-on mentorship and practical feedback.",
  },
  {
    icon: Briefcase,
    title: "Industry Placement",
    description:
      "Apply your skills in a structured industrial attachment with Global Line Safaris or partner organizations across Rwanda's tourism sector.",
  },
  {
    icon: Award,
    title: "Qualify for Internship",
    description:
      "Students who successfully complete all modules and field hours qualify for a structured internship placement with Global Line Safaris.",
  },
];

const outcomes = [
  {
    icon: Award,
    title: "Accredited Certification",
    description:
      "Earn recognized certification through our Rwanda TVET Board accredited tourism training center.",
  },
  {
    icon: Users,
    title: "Professional Mentorship",
    description:
      "Learn directly from experienced guides, tour operators and hospitality professionals.",
  },
  {
    icon: BookOpen,
    title: "Practical Curriculum",
    description:
      "Industry-focused training that combines classroom knowledge with real-world field experience.",
  },
  {
    icon: Clock,
    title: "Flexible Programs",
    description:
      "Short courses and attachment schedules designed to fit around your studies or current role.",
  },
];

export default async function TrainingPage() {
  const category = await getServiceCategory("training-attachments");
  if (!category) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: category.title,
    description: category.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
    areaServed: "Rwanda",
    url: `${siteConfig.siteUrl.replace(/\/$/, "")}/training`,
  };

  return (
    <div className="overflow-x-hidden">
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="safari-page-hero page-hero-min-height-70">
        <Image
          src={category.image || siteImages.trainingHero.src}
          alt={category.title}
          fill
          priority
          sizes="100vw"
          className="hero-photograph"
        />
        <div className="hero-shade" />
        <div className="safari-container page-hero-content">
          <nav aria-label="Breadcrumb" className="safari-breadcrumb">
            <Link href="/">Home</Link>
            <span>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">Training & Internships</span>
            </span>
          </nav>
          <div className="safari-eyebrow">
            <span className="safari-eyebrow-line" />
            <span>Professional Development</span>
          </div>
          <h1>Training & Internships</h1>
          <p className="page-hero-description">
            {category.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-xl"
            >
              Apply Now <ArrowRight className="size-4" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Quick stats bar */}
      <section className="bg-brand text-white py-6">
        <div className="safari-container">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
            <span className="inline-flex items-center gap-2">
              <Award className="size-4 text-accent" />
              TVET Accredited
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-accent" />
              Kigali, Rwanda
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 text-accent" />
              Year-round intake
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-accent" />
              Flexible duration
            </span>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="safari-section">
        <div className="safari-container">
          <div className="editorial-heading">
            <div>
              <div className="safari-eyebrow">
                <span className="safari-eyebrow-line" />
                <span>Our Programs</span>
              </div>
              <h2>Pathways Into Tourism</h2>
            </div>
            <p>
              Whether you are starting your career or looking to gain practical
              experience, our training programs are designed to prepare you for
              success in Rwanda&apos;s growing tourism industry.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {category.services.map((service, index) => (
              <div
                key={service.name}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 transition-all duration-300 hover:border-brand/20 hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-900"
              >
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-brand/5 transition-transform duration-500 group-hover:scale-[3] dark:bg-brand/10" />
                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/5 text-brand dark:bg-brand/10 dark:text-accent">
                      <BookOpen className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                        Program {String(index + 1).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {service.description}
                  </p>
                  {service.benefits.length > 0 && (
                    <ul className="mt-5 space-y-2.5">
                      {service.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                        >
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 dark:bg-brand/20">
                            <Check className="size-3 text-brand dark:text-accent" />
                          </div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6">
                    <Link
                      href="#apply"
                      className="safari-text-link"
                    >
                      Apply for this program
                      <ArrowRight width={14} height={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — visual timeline */}
      <section className="safari-section section-bg-cream">
        <div className="safari-container">
          <div className="editorial-heading">
            <div>
              <div className="safari-eyebrow">
                <span className="safari-eyebrow-line" />
                <span>How It Works</span>
              </div>
              <h2 className="text-brand dark:text-white">Your Journey Step by Step</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              From application to internship placement — a structured pathway
              designed to build your skills and confidence.
            </p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand/40 via-brand/20 to-transparent dark:from-accent/40 dark:via-accent/20" />

            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative flex items-start gap-6 py-8"
              >
                {/* Timeline node */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-white shadow-md dark:border-accent dark:bg-slate-900">
                  <step.icon className="size-5 text-brand dark:text-accent" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="safari-section section-bg-brand">
        <div className="safari-container">
          <div className="editorial-heading">
            <div>
              <div className="safari-eyebrow">
                <span className="safari-eyebrow-line" />
                <span>What You Gain</span>
              </div>
              <h2 className="text-white">Training Outcomes</h2>
            </div>
            <p className="text-white/60">
              Our programs are designed to give you the skills, experience and
              professional connections to build a successful career in tourism.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((outcome) => (
              <div
                key={outcome.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-white/10 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent transition-transform duration-300 group-hover:scale-110">
                  <outcome.icon className="size-6" />
                </div>
                <h3 className="mt-5 text-base font-bold tracking-tight text-white">
                  {outcome.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {outcome.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="safari-section">
        <div className="safari-container">
          <div className="editorial-heading">
            <div>
              <div className="safari-eyebrow">
                <span className="safari-eyebrow-line" />
                <span>Why Choose Us</span>
              </div>
              <h2>Learn From Industry Leaders</h2>
            </div>
            <p>
              We combine accredited curriculum with real-world experience to give
              you a competitive edge in Rwanda&apos;s tourism sector.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Accredited & Recognized",
                description:
                  "Our training center is accredited by the Rwanda TVET Board, ensuring your certification is recognized by employers across the industry.",
              },
              {
                icon: Heart,
                title: "Hands-On Experience",
                description:
                  "Learn by doing — our programs include real field work, actual tour operations, and direct engagement with clients and communities.",
              },
              {
                icon: Sparkles,
                title: "Career Pathway",
                description:
                  "Top performers are offered internship placements and may qualify for long-term opportunities with Global Line Safaris and our partners.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 text-center transition-all duration-300 hover:border-brand/20 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-900"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/5 text-brand dark:bg-brand/10 dark:text-accent">
                  <item.icon className="size-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="safari-section scroll-mt-24 section-bg-ivory">
        <div className="safari-container">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <div className="safari-eyebrow justify-center">
                <span className="safari-eyebrow-line" />
                <span>Apply Now</span>
              </div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Start Your Application
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Fill out the form below and our team will get back to you within
                48 hours to discuss the next steps.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900 sm:p-10">
              <TrainingApplicationForm />
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
