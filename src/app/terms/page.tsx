import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/content/service.server";
import { CTASection } from "@/domains/home/components/CTASection";
import { PageHero } from "@/components/shared/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("terms", {
    title: "Terms of Use",
    description: `Terms of Use for ${siteConfig.name}, ${siteConfig.location}.`,
    path: "/terms",
  });
}

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using the ${siteConfig.name} website, you agree to be bound by these Terms of Use. If you do not agree, please do not use the site.`,
  },
  {
    title: "2. Use of the Website",
    body: `[Describe acceptable use, prohibited activities and permitted use of site content.]`,
  },
  {
    title: "3. Intellectual Property",
    body: `[Confirm ownership of website content, logos and materials and describe permitted use.]`,
  },
  {
    title: "4. Travel Information",
    body: `Information on this website is provided for general information purposes only. Tour itineraries, prices, availability and travel conditions are subject to change and will be confirmed with you directly before booking. Please review all trip details carefully.`,
  },
  {
    title: "5. Limitation of Liability",
    body: `[Describe the limits of liability in connection with use of the website and services.]`,
  },
  {
    title: "6. Governing Law",
    body: `These Terms of Use are governed by the laws of the Republic of Rwanda.`,
  },
  {
    title: "7. Contact",
    body: `For questions about these Terms of Use, contact us at ${siteConfig.email} or by phone at ${siteConfig.phone}.`,
  },
];

export default function TermsPage() {
  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        description="The terms that govern your use of our website and services."
        image="/images/rwanda-hills.jpg"
        breadcrumb={[{ label: "Terms of Use", href: "/terms" }]}
      />

      <section className="safari-section section-bg-ivory">
        <div className="safari-container">
          <div className="max-w-3xl mx-auto">
            {/* Legal notice */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 px-6 py-5 text-sm text-amber-800 dark:text-amber-200 mb-12">
              <strong className="font-semibold">Review required.</strong> This
              draft must be reviewed and finalized by your legal counsel before
              publication. The following is a structured placeholder, not legal
              advice.
            </div>

            {/* Terms sections */}
            <div className="space-y-12">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-400">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
