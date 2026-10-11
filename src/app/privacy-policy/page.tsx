import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/content/service.server";
import { CTASection } from "@/domains/home/components/CTASection";
import { PageHero } from "@/components/shared/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("privacy-policy", {
    title: "Privacy Policy",
    description: `Privacy Policy for ${siteConfig.name}, ${siteConfig.location}.`,
    path: "/privacy-policy",
  });
}

const sections = [
  {
    title: "1. Introduction",
    body: `[Company name] ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose and protect personal information in connection with our website and services.`,
  },
  {
    title: "2. Information We Collect",
    body: `[Describe the personal information collected, such as name, email address, phone number, company and details provided through our contact form.]`,
  },
  {
    title: "3. How We Use Your Information",
    list: [
      "[Responding to inquiries and providing services]",
      "[Sending relevant updates, where consent has been given]",
      "[Improving our website and services]",
    ],
  },
  {
    title: "4. Sharing of Information",
    body: `[Describe any third parties with whom information may be shared and the safeguards used.]`,
  },
  {
    title: "5. Data Security & Retention",
    body: `[Describe security measures and retention periods for personal information.]`,
  },
  {
    title: "6. Your Rights",
    body: `[Describe rights to access, correct or request deletion of personal information and how to exercise them.]`,
  },
  {
    title: "7. Contact Us",
    body: `If you have any questions about this Privacy Policy, contact us at ${siteConfig.email} or by phone at ${siteConfig.phone}.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `[Describe how and when updates to this policy will be communicated.]`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information."
        image="/images/rwanda-hills.jpg"
        breadcrumb={[{ label: "Privacy Policy", href: "/privacy-policy" }]}
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

            {/* Policy sections */}
            <div className="space-y-12">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                  {section.body && (
                    <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-400">
                      {section.body}
                    </p>
                  )}
                  {section.list && (
                    <ul className="mt-4 space-y-3 text-base leading-7 text-slate-600 dark:text-slate-400">
                      {section.list.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2.5 size-1.5 rounded-full bg-brand dark:bg-accent flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
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
