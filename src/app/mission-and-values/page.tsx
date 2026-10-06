import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { CTASection } from "@/domains/home/components/CTASection";
import { buildPageMetadata } from "@/lib/content/service.server";
import { siteImages } from "@/lib/siteImages";
import { Compass, Eye, Heart, ShieldCheck, Sparkles, Star } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('mission-and-values', {
    title: 'Mission, Vision & Values',
    description: 'Discover the mission, vision and values that guide Global Line Safaris in creating responsible, memorable travel experiences across Rwanda and East Africa.',
    path: '/mission-and-values',
  });
}

const values = [
  {
    icon: Heart,
    title: "Authenticity",
    description:
      "We create genuine travel experiences that allow our guests to connect with Rwanda's people, culture, nature and destinations.",
  },
  {
    icon: Star,
    title: "Excellence",
    description:
      "We strive to provide high-quality services, attention to detail and professional support throughout every journey.",
  },
  {
    icon: ShieldCheck,
    title: "Responsibility",
    description:
      "We promote responsible tourism that respects the environment, supports local communities and protects the destinations we love.",
  },
  {
    icon: Sparkles,
    title: "Lasting Memories",
    description:
      "We want every traveler to return home with meaningful experiences, unforgettable stories and memories that last a lifetime.",
  },
];

export default async function MissionAndValuesPage() {
  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Our Direction"
        title="Mission, Vision & Values"
        description="What drives our journey — and the principles that shape every experience we create."
        image={siteImages.aboutPage.office.src}
        breadcrumb={[
          { label: "About Us", href: "/about" },
          { label: "Mission & Values", href: "/mission-and-values" },
        ]}
      />

      <section className="bg-white py-20 dark:bg-slate-950 sm:py-28">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-brand-bg-light p-8 dark:border-slate-700/50 dark:bg-slate-900 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand dark:bg-brand/10 dark:text-accent">
                <Compass className="size-3.5" /> Our Mission
              </span>
              <h2 className="mt-5 font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Inspiring People to Explore Rwanda
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                <p>
                  To provide exceptional, personalized and memorable travel
                  experiences that allow our guests to discover the natural
                  beauty, cultural heritage and extraordinary wildlife of Rwanda
                  and East Africa.
                </p>
                <p>
                  We are committed to understanding the needs and interests of
                  every traveler and creating journeys that are enjoyable,
                  meaningful and professionally organized.
                </p>
                <p>
                  We work to promote responsible tourism while supporting
                  appreciation for local communities, cultural heritage and the
                  natural environment.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-brand-bg-dark p-8 text-white dark:border-slate-700/50 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-soft">
                <Eye className="size-3.5" /> Our Vision
              </span>
              <h2 className="mt-5 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                A World Where Every Journey Matters
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-200/90 sm:text-base">
                <p>
                  To become a trusted and inspiring travel company recognized for
                  showcasing the beauty, culture, wildlife and unique experiences
                  of Rwanda and East Africa.
                </p>
                <p>
                  We envision a future where travelers from around the world can
                  discover Rwanda through authentic, responsible and
                  unforgettable experiences.
                </p>
                <p>
                  Through our work, we aspire to connect people with destinations
                  in ways that create appreciation for nature, culture and the
                  communities that make every destination special.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand dark:bg-brand/10 dark:text-accent">
              Our Values
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              What We Stand For
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Our values shape the way we serve our guests, create experiences
              and represent Rwanda.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <div
                key={value.title}
                className="group rounded-3xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:border-brand/20 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-brand/5 text-brand transition-transform group-hover:scale-110 dark:bg-brand/10 dark:text-accent">
                    <value.icon className="size-5" />
                  </div>
                  <span className="font-serif text-2xl font-bold text-slate-200 dark:text-slate-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
