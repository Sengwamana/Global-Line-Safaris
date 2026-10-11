import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/content/service.server";
import { CTASection } from "@/domains/home/components/CTASection";
import { PageHero } from "@/components/shared/PageHero";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("privacy-policy", {
    title: "Privacy Policy",
    description: `Official Privacy Policy of ${siteConfig.name}. Learn how we collect, handle, safeguard, and process your personal and travel information in accordance with Rwandan law and international data standards.`,
    path: "/privacy-policy",
  });
}

const sections = [
  {
    id: "introduction",
    number: "01",
    title: "Introduction & Scope",
    paragraphs: [
      `${siteConfig.name} ("we," "our," or "us"), operating in Kigali, Rwanda, is dedicated to delivering world-class safari, travel, and hospitality experiences across Rwanda and East Africa while safeguarding the privacy and personal data of our guests and website visitors.`,
      `This Privacy Policy details how we collect, use, process, store, and protect your personal information when you visit our website (${siteConfig.siteUrl}), inquire about our safari itineraries, book gorilla trekking permits, request customized tour packages, register for internship or training attachments, or communicate with our travel consultants.`,
      `By accessing our platform or providing your information to us, you acknowledge and agree to the practices outlined in this policy in accordance with Law N° 058/2021 of 13/10/2021 relating to the Protection of Personal Data and Privacy in Rwanda and relevant international privacy benchmarks.`,
    ],
  },
  {
    id: "information-we-collect",
    number: "02",
    title: "Information We Collect",
    lead: "To provide bespoke safari planning, secure required government permits, and manage seamless bookings, we collect the following categories of information:",
    subsections: [
      {
        title: "A. Personal & Contact Identification",
        items: [
          "Full legal name, gender, nationality, country of residence, and date of birth.",
          "Contact details including primary email address, mobile/telephone number, and WhatsApp contact.",
          "Residential and billing addresses.",
        ],
      },
      {
        title: "B. Travel & Booking Specifications",
        items: [
          "Passport details (passport number, expiry date, issuing authority, and copy scans) strictly when necessary to secure official National Park permits (e.g., Rwanda Development Board gorilla and chimpanzee trekking permits) or cross-border travel documents.",
          "Desired travel dates, trip duration, group size, destination preferences, and accommodation tiers.",
          "Dietary requirements, physical fitness notes, and medical or mobility disclosures relevant to safari activities and remote park logistics.",
          "Emergency contact information for travellers while in Rwanda or East Africa.",
        ],
      },
      {
        title: "C. Professional & Educational Information (Internships & Training)",
        items: [
          "Institution/university, field of study, academic level, curriculum vitae (CV), and areas of interest submitted through our internship and hospitality attachment applications.",
        ],
      },
      {
        title: "D. Technical & Browsing Data",
        items: [
          "IP address, browser type and version, language settings, operating system, referring URL, time spent on pages, and website interaction metrics gathered through standard analytics and functional cookies.",
        ],
      },
    ],
  },
  {
    id: "how-we-use-information",
    number: "03",
    title: "How We Use Your Information",
    lead: "We process your information solely for lawful, transparent, and defined travel operational purposes, including:",
    bulletPoints: [
      "Designing tailor-made safari itineraries, private tour packages, and travel proposals suited to your preferences.",
      "Reserving accommodations, lodges, licensed 4x4 safari vehicles, airport transfers, and professional tour guides.",
      "Procuring official national park permits, conservation passes, and activity permits on your behalf with authorities such as the Rwanda Development Board (RDB).",
      "Communicating logistical updates, pre-departure briefings, travel advisories, and booking confirmations.",
      "Responding promptly to inquiries submitted through our website forms, email, and live messaging channels.",
      "Processing applications for professional tourism internships and student hospitality training programs.",
      "Distributing opt-in newsletters, seasonal safari updates, and exclusive East Africa travel insights (which you may unsubscribe from at any time).",
      "Complying with statutory reporting, safety compliance, accounting, and legal requirements in the Republic of Rwanda.",
    ],
  },
  {
    id: "legal-basis",
    number: "04",
    title: "Legal Basis for Processing",
    lead: "In line with Rwandan Data Protection Law and applicable data protection principles, we process your information under the following legal bases:",
    bulletPoints: [
      "Contractual Necessity: To fulfill our obligations in providing travel proposals, itineraries, bookings, and logistical arrangements agreed upon between you and Global Line Safaris.",
      "Consent: Where you have provided clear, affirmative consent (e.g., subscribing to our newsletter, disclosing voluntary dietary/health requests, or submitting internship applications).",
      "Legal Obligation: Where required to comply with local laws, tax reporting, tourism regulations, and park authority rules.",
      "Legitimate Interests: To improve our website performance, protect against fraudulent inquiries, and ensure security and customer service excellence.",
    ],
  },
  {
    id: "sharing-and-disclosure",
    number: "05",
    title: "Information Sharing & Third Parties",
    lead: `${siteConfig.name} will never sell, rent, or trade your personal data to commercial third parties or advertisers. We share information strictly on a need-to-know basis with trusted partners essential to delivering your safari:`,
    bulletPoints: [
      "Government & Wildlife Authorities: Official bodies such as the Rwanda Development Board (RDB) and immigration/conservation authorities for gorilla trekking permits and national park access.",
      "Accommodations & Safari Lodges: Partner hotels, eco-lodges, and tented camps to confirm room reservations and manage dietary or accessibility requirements.",
      "Local Service Providers: Authorized safari guides, registered transport providers, local domestic flight charters, and partner excursion operators.",
      "Trusted Service Vendors: Secure infrastructure providers hosting our website, database systems, and secure communication channels who operate under strict non-disclosure and security obligations.",
      "Legal & Regulatory Authorities: When required by subpoena, court order, or national safety regulations in Rwanda.",
    ],
  },
  {
    id: "data-security",
    number: "06",
    title: "Data Security & Protection",
    paragraphs: [
      `We implement robust technical and organizational security controls to safeguard your data against accidental loss, unauthorized access, destruction, misuse, or alteration. Our platform utilizes HTTPS encryption, secure server environments, database access restriction protocols, and regular system vulnerability reviews.`,
      `Sensitive travel documents (such as passport copies requested exclusively for gorilla and park permit issuance) are handled strictly by authorized booking specialists and are retained only for the duration required to complete official permit acquisition and fulfill audit obligations.`,
    ],
  },
  {
    id: "data-retention",
    number: "07",
    title: "Data Retention",
    paragraphs: [
      `We retain your personal information only for as long as necessary to carry out the purposes outlined in this Privacy Policy, fulfill travel and itinerary commitments, settle financial accounting, resolve disputes, and satisfy legal and tax compliance obligations under Rwandan commercial and tourism laws.`,
      `Once personal data is no longer necessary for operational or statutory requirements, it is securely deleted or anonymized.`,
    ],
  },
  {
    id: "cookies-and-tracking",
    number: "08",
    title: "Cookies and Analytics",
    paragraphs: [
      `Our website uses essential and analytical cookies to ensure optimal navigation, remember user preferences, and measure website performance. Essential cookies enable core site features such as form handling and layout presentation. Analytical cookies provide aggregated, anonymized insights into visitor interactions, helping us enhance user experience.`,
      `You can configure your browser to decline non-essential cookies or notify you when cookies are set. Please note that disabling certain cookies may affect the interactive functionality of our web pages.`,
    ],
  },
  {
    id: "your-rights",
    number: "09",
    title: "Your Rights as a Data Subject",
    lead: "Under applicable data protection legislation, you possess distinct rights regarding your personal information, including:",
    bulletPoints: [
      "Right to Access: Request a copy of the personal information we hold about you.",
      "Right to Rectification: Request correction of inaccurate, outdated, or incomplete data.",
      "Right to Erasure ('Right to be Forgotten'): Request the deletion of your personal data where retention is no longer legally or contractually mandatory.",
      "Right to Restriction: Request the restriction of data processing in specified circumstances.",
      "Right to Withdraw Consent: Withdraw consent at any time for processing activities that rely upon prior consent (such as promotional newsletters).",
      "Right to Object: Object to processing conducted under legitimate interest grounds.",
    ],
    paragraphs: [
      `To exercise any of these rights, please submit your request to our data compliance team at ${siteConfig.email}. We will review and respond to valid requests within statutory timelines.`,
    ],
  },
  {
    id: "children-privacy",
    number: "10",
    title: "Children and Family Travel",
    paragraphs: [
      `We frequently organize unforgettable family safaris. In these instances, personal information of children (such as names, ages, and passport details required for park entry and permits) is collected solely from and with the explicit consent of the parent, legal guardian, or adult group organizer. We do not intentionally collect data directly from unaccompanied minors online.`,
    ],
  },
  {
    id: "policy-updates",
    number: "11",
    title: "Updates to This Privacy Policy",
    paragraphs: [
      `We may periodically update this Privacy Policy to reflect modifications in our services, operational workflows, or prevailing laws in Rwanda. When changes occur, the updated version will be published on this page with a revised "Last Updated" date. We encourage visitors to review this policy periodically.`,
    ],
  },
  {
    id: "contact-us",
    number: "12",
    title: "Contact Us & Data Inquiries",
    paragraphs: [
      `If you have questions, concerns, or requests regarding this Privacy Policy or how your personal information is managed by ${siteConfig.name}, please contact us directly:`,
    ],
    contactCard: true,
  },
];

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Legal & Privacy"
        title="Privacy Policy"
        description="Our commitment to safeguarding your personal data, travel bookings, and privacy under Rwandan and international data protection standards."
        image="/images/rwanda-hills.jpg"
        breadcrumb={[{ label: "Privacy Policy", href: "/privacy-policy" }]}
      />

      <section className="safari-section section-bg-ivory py-16 md:py-24">
        <div className="safari-container">
          <div className="max-w-4xl mx-auto">
            {/* Trust and Highlights Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Rwandan Law Compliant</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Operated in adherence to Law N° 058/2021 on Personal Data Protection &amp; Privacy in Rwanda.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Protected Bookings</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Passport data for gorilla &amp; park permits is processed securely and retained only as required.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No Data Resale</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  We never sell, rent, or trade your personal information with external advertisers.
                </p>
              </div>
            </div>

            {/* Document Header Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-12 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand dark:text-emerald-400" />
                <span>Document Status: <strong>Official &amp; Active</strong></span>
              </div>
              <div>Last Updated: <strong className="text-slate-800 dark:text-slate-200">{lastUpdated}</strong></div>
            </div>

            {/* Structured Content Sections */}
            <div className="space-y-16">
              {sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="bg-white dark:bg-slate-900/40 rounded-3xl p-8 md:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-brand/10 dark:bg-emerald-500/10 text-brand dark:text-emerald-400">
                      SECTION {section.number}
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>

                  {section.lead && (
                    <p className="text-base md:text-lg font-medium text-slate-800 dark:text-slate-200 mb-6 leading-relaxed">
                      {section.lead}
                    </p>
                  )}

                  {section.paragraphs && (
                    <div className="space-y-4">
                      {section.paragraphs.map((para, i) => (
                        <p key={i} className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {section.subsections && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {section.subsections.map((sub, i) => (
                        <div
                          key={i}
                          className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-850"
                        >
                          <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-3">
                            {sub.title}
                          </h4>
                          <ul className="space-y-2.5">
                            {sub.items.map((item, j) => (
                              <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.bulletPoints && (
                    <ul className="space-y-3 mt-6">
                      {section.bulletPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          <span className="mt-2 size-2 rounded-full bg-brand dark:bg-emerald-400 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.contactCard && (
                    <div className="mt-8 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg text-slate-900 dark:text-white">
                          {siteConfig.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {siteConfig.location}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Operating Hours: {siteConfig.hours}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={`mailto:${siteConfig.email}`}
                          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          Email: {siteConfig.email}
                        </a>
                        <a
                          href={`tel:${siteConfig.phone.replace(/[^+0-9]/g, "")}`}
                          className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Call: {siteConfig.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Quick Link Navigation */}
            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-slate-500 dark:text-slate-400">
                Need more information about our terms and bookings?
              </p>
              <div className="flex gap-6">
                <Link
                  href="/terms"
                  className="font-medium text-brand dark:text-emerald-400 hover:underline"
                >
                  Terms of Use &rarr;
                </Link>
                <Link
                  href="/contact"
                  className="font-medium text-brand dark:text-emerald-400 hover:underline"
                >
                  Contact Us &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
