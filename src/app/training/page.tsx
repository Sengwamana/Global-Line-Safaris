import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Clock, Users, Award, BookOpen } from "lucide-react";
import { buildPageMetadata, getServiceCategory } from "@/lib/content/service.server";
import { siteImages } from "@/lib/siteImages";
import { siteConfig } from "@/lib/site";
import { CTASection } from "@/domains/home/components/CTASection";
import { TrainingApplicationForm } from "@/domains/training/components/TrainingApplicationForm";

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
    title: "Submit Your Application",
    description:
      "Tell us about your background, interests and learning goals. We review every application personally and match you with the right program.",
  },
  {
    title: "Complete Foundation Training",
    description:
      "Build essential knowledge through our accredited short courses — tour operations, guiding principles, customer service and destination expertise.",
  },
  {
    title: "Field Practice & Mentorship",
    description:
      "Work alongside experienced guides and operations staff on real tours, receiving hands-on mentorship and practical feedback.",
  },
  {
    title: "Industry Placement",
    description:
      "Apply your skills in a structured industrial attachment with Global Line Safaris or partner organizations across Rwanda's tourism sector.",
  },
  {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <section className="safari-page-hero page-hero-min-height-70">
        <Image
          src={category.image || siteImages.aboutPage.office.src}
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

          <div className="grid gap-8 md:grid-cols-2">
            {category.services.map((service) => (
              <div
                key={service.name}
                className="group rounded-2xl border border-slate-100 bg-white p-8 transition-all duration-300 hover:border-brand/20 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-900"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/5 text-brand dark:bg-brand/10">
                    <BookOpen className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {service.name}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {service.description}
                </p>
                {service.benefits.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {service.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-brand dark:text-accent" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="safari-text-link"
                  >
                    Learn More
                    <ArrowRight width={14} height={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="safari-section section-bg-cream">
        <div className="safari-container">
          <div className="editorial-heading">
            <div>
              <div className="safari-eyebrow">
                <span className="safari-eyebrow-line" />
                <span>How It Works</span>
              </div>
              <h2>Your Journey Step by Step</h2>
            </div>
            <p>
              From application to internship placement — a structured pathway
              designed to build your skills and confidence.
            </p>
          </div>

          <ol className="mx-auto max-w-3xl">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex items-start gap-6 border-b border-slate-900/10 py-8 last:border-b-0"
              >
                <span className="w-12 shrink-0 text-right font-serif text-4xl font-light text-accent/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
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
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-accent/30 hover:bg-white/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <outcome.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-white">
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

      {/* Application Form */}
      <section id="apply" className="safari-section scroll-mt-24 section-bg-ivory">
        <div className="safari-container">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900 sm:p-10">
              <TrainingApplicationForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="safari-section section-bg-dark">
        <div className="safari-container">
          <div className="safari-eyebrow section-bg-dark-eyebrow">
            <span className="safari-eyebrow-line" />
            <span>Ready to Start?</span>
          </div>
          <h2 className="section-bg-dark-heading">
            Begin Your Tourism Career With Us
          </h2>
          <p className="section-bg-dark-text">
            Send us your application and our team will guide you through the
            next steps toward a professional tourism career.
          </p>
          <div className="hero-actions hero-actions-center">
            <Link className="safari-button safari-button-ivory" href="#apply">
              Apply Now
              <ArrowRight width={14} height={14} />
            </Link>
            <Link className="safari-text-link light-link" href="/plan-your-trip">
              Plan a Safari
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
