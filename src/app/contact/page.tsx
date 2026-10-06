import type { Metadata } from "next";
import { buildPageMetadata, getSiteSettings } from "@/lib/content/service.server";
import { ContactHero } from "@/domains/contact/components/ContactHero";
import { ContactForm } from "@/domains/contact/components/ContactForm";
import { CTASection } from "@/domains/home/components/CTASection";
import { Phone, MapPin, Clock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('contact', {
    title: 'Contact',
    description: 'Get in touch with Global Line Safaris for safari and tour experiences across Rwanda and East Africa. Call, email or visit our Kigali office.',
    path: '/contact',
  });
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const details = [
    {
      icon: Phone,
      label: "Phone",
      lines: [...new Set([settings.phone, settings.phoneSecondary].filter(Boolean))],
      href: `tel:${settings.phone.replace(/[^+0-9]/g, "")}`,
    },
    {
      icon: Mail,
      label: "Email",
      lines: [settings.email],
      href: `mailto:${settings.email}`,
    },
    {
      icon: MapPin,
      label: "Visit Us",
      lines: [settings.addressLine1, settings.addressLine2].filter(Boolean),
    },
    {
      icon: Clock,
      label: "Office Hours",
      lines: [settings.businessHoursLine1, settings.businessHoursLine2],
    },
  ];

  return (
    <div className="overflow-x-hidden">
      <ContactHero />
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="it-container px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="relative rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-soft">
                <div className="pointer-events-none absolute -top-px right-12 h-1 w-24 rounded-b-full bg-gradient-to-r from-brand to-accent" />
                <ContactForm />
              </div>
            </div>

            {/* Contact details side panel */}
            <aside className="lg:col-span-2 lg:sticky lg:top-28">
              <div className="rounded-3xl bg-gradient-to-br from-brand-bg-dark via-brand-bg-dark-mid to-brand p-8 sm:p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(217,255,58,0.12),transparent_55%)]" />
                <div className="relative">
                  <h2 className="text-2xl font-bold tracking-tight font-serif">
                    Contact Information
                  </h2>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    Reach out by phone or email, or visit our Kigali office.
                    We&apos;re happy to help plan your journey.
                  </p>

                  <div className="mt-8 space-y-6">
                    {details.filter(detail => detail.lines.some(Boolean)).map((detail) => (
                      <div key={detail.label} className="flex gap-4">
                        <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl text-accent">
                          <detail.icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {detail.label}
                          </h3>
                          <div className="mt-1 space-y-0.5 text-sm text-slate-300">
                            {detail.lines.map((line, i) =>
                              line && detail.href && i === 0 ? (
                                <a
                                  key={i}
                                  href={detail.href}
                                  className="block hover:text-accent transition-colors"
                                >
                                  {line}
                                </a>
                              ) : (
                                <p key={i}>{line}</p>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-base font-bold text-white">
                      Prefer to Book Online?
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-300">
                      Tell us about your trip and request a personalised
                      itinerary.
                    </p>
                    <Link href={settings.bookingUrl} className="mt-4 inline-block">
                      <Button
                        variant="accent"
                        className="gap-2 rounded-xl text-slate-950"
                      >
                        Plan Your Trip <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}
