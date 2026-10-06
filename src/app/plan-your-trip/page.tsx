import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/shared/PageHero";
import { TripInquiryForm } from "@/domains/trip/components/TripInquiryForm";
import { buildPageMetadata, getDestinations, getTourPackages } from "@/lib/content/service.server";
import { siteImages } from "@/lib/siteImages";
import { siteConfig } from "@/lib/site";
import { Phone, Mail, MapPin, Clock, ShieldCheck, Compass } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('plan-your-trip', {
    title: 'Plan Your Trip',
    description: 'Plan a tailor-made safari or tour in Rwanda and East Africa with Global Line Safaris. Tell us your dates and interests for a personalised itinerary and quote.',
    path: '/plan-your-trip',
  });
}

export default async function PlanYourTripPage() {
  const [destinations, packages] = await Promise.all([
    getDestinations(),
    getTourPackages(),
  ]);

  const destinationNames = destinations.map((d) => d.name);
  const packageOptions = packages.map((p) => ({ title: p.title, category: p.category }));

  const contactRows = [
    { icon: Phone, label: "Phone / WhatsApp", value: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/[^0-9+]/g, "")}` },
    { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: MapPin, label: "Office", value: siteConfig.location },
    { icon: Clock, label: "Office Hours", value: siteConfig.hours },
  ];

  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Start Your Journey"
        title="Plan Your Trip"
        description="Tell us where you'd like to go and what you'd love to experience. Our team will design a tailor-made itinerary and quote just for you."
        image={siteImages.advisory.src}
        breadcrumb={[{ label: "Plan Your Trip", href: "/plan-your-trip" }]}
      />

      <section className="bg-white py-20 dark:bg-slate-950 sm:py-28">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900 sm:p-8">
              <Suspense fallback={<div className="min-h-[420px]" />}>
                <TripInquiryForm destinations={destinationNames} packages={packageOptions} />
              </Suspense>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-brand-bg-light p-6 dark:border-slate-700/50 dark:bg-slate-800">
                <div className="flex items-center gap-2 text-brand dark:text-accent">
                  <Compass className="size-5" />
                  <h2 className="font-serif text-lg font-bold">How It Works</h2>
                </div>
                <ol className="mt-5 space-y-4">
                  {[
                    "Send us your trip request with your interests and dates.",
                    "We design a tailored itinerary and send you a quote.",
                    "Refine the details together until everything is perfect.",
                    "Confirm your booking and get ready to travel.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white dark:bg-accent dark:text-brand-strong">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 dark:border-slate-700/50 dark:bg-slate-800">
                <div className="flex items-center gap-2 text-brand dark:text-accent">
                  <Mail className="size-5" />
                  <h2 className="font-serif text-lg font-bold">Contact Us Directly</h2>
                </div>
                <ul className="mt-5 space-y-4">
                  {contactRows.map((row) => (
                    <li key={row.label} className="flex gap-3">
                      <row.icon className="mt-0.5 size-4 flex-shrink-0 text-brand dark:text-accent" />
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          {row.label}
                        </p>
                        {row.href ? (
                          <a href={row.href} className="text-sm text-slate-700 hover:text-brand dark:text-slate-200 dark:hover:text-accent">
                            {row.value}
                          </a>
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-200">{row.value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent-subtle p-5 text-sm text-slate-700 dark:text-slate-200">
                <ShieldCheck className="mt-0.5 size-5 flex-shrink-0 text-brand dark:text-accent" />
                <p>
                  No payment is required to request a quote. Every itinerary can
                  be customised to your travel dates, budget and pace.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
