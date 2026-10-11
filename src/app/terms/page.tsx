import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/content/service.server";
import { CTASection } from "@/domains/home/components/CTASection";
import { PageHero } from "@/components/shared/PageHero";
import {
  ShieldCheck,
  FileText,
  DollarSign,
  Compass,
  CheckCircle2,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("terms", {
    title: "Terms & Booking Conditions",
    description: `Official Terms of Service and Safari Booking Conditions for ${siteConfig.name}. Review booking policies, national park permits, payments, cancellations, and liability under Rwandan tourism law.`,
    path: "/terms",
  });
}

const termsSections = [
  {
    id: "agreement-to-terms",
    number: "01",
    title: "Acceptance & Scope of Agreement",
    paragraphs: [
      `Welcome to ${siteConfig.name} ("Company," "we," "our," or "us"), a licensed safari and travel operator headquartered in Kigali, Rwanda (${siteConfig.location}). These Terms of Service & Booking Conditions govern your access to and use of our website (${siteConfig.siteUrl}) as well as all safari packages, tour bookings, private transport, guide services, and internship attachments facilitated by us.`,
      `By browsing our platform, submitting an inquiry, confirming an itinerary, or submitting a deposit or payment, you ("the Client," "Guest," or "Lead Traveler") agree to be legally bound by these terms on behalf of yourself and all members of your traveling party.`,
      `If you do not agree with any provision of these terms, please refrain from using our website or booking our safari services.`,
    ],
  },
  {
    id: "booking-and-confirmation",
    number: "02",
    title: "Booking, Inquiries & Itinerary Confirmation",
    lead: "To provide custom itineraries and guarantee lodging and park access across Rwanda and East Africa, reservations follow a structured confirmation process:",
    bulletPoints: [
      "Inquiries & Proposals: Initial inquiries, price estimates, and provisional itinerary drafts do not constitute a confirmed contract until official availability is validated and requisite deposits are secured.",
      "Lead Traveler Representation: The person making the booking warrants that they possess legal authority to act on behalf of all persons named in the reservation and that all submitted traveler details (names, dates of birth, passport information) are accurate.",
      "Permits & Availability: National park activities—including Volcanoes National Park Mountain Gorilla trekking, Golden Monkey trekking, and Nyungwe Forest Chimpanzee tracking—are subject to strict permit quotas governed by the Rwanda Development Board (RDB). Permitted slots can only be secured once permit fees are paid in full.",
      "Binding Contract: A contract is formally established once we have issued a booking confirmation invoice following receipt of the agreed deposit or full payment.",
    ],
  },
  {
    id: "payments-and-pricing",
    number: "03",
    title: "Pricing, Deposits & Payment Terms",
    lead: "Transparent pricing and secure payment handling are central to our customer commitment:",
    subsections: [
      {
        title: "A. Safari Deposits & Park Permits",
        items: [
          "A non-refundable deposit of 100% of all government park permit fees (Gorilla, Chimpanzee, Canopy Walk, and National Park entry permits) is required immediately upon booking to secure your official RDB permits.",
          "A deposit of 30% to 50% of the remaining safari package balance is required to secure accommodation reservations, custom 4x4 safari vehicles, and private driver-guides.",
        ],
      },
      {
        title: "B. Balance Payments",
        items: [
          "The outstanding safari balance is due no later than 30 to 45 days prior to your scheduled tour commencement date, unless otherwise specified in your customized booking agreement.",
          "For reservations made within 30 days of arrival, full payment (100%) is required upon itinerary confirmation.",
        ],
      },
      {
        title: "C. Accepted Payment Methods & Currency",
        items: [
          "Payments may be executed via direct international bank wire transfer (SWIFT) or authorized merchant credit card payment links.",
          "Prices are quoted in US Dollars (USD) or Rwandan Francs (RWF) as designated on your invoice. Clients are responsible for any intermediary bank transfer charges or foreign exchange transaction fees.",
        ],
      },
    ],
  },
  {
    id: "cancellation-and-refunds",
    number: "04",
    title: "Cancellations, Amendments & Refund Policy",
    lead: "If you must cancel or modify your safari, notice must be provided in writing to info@globallinesafaris.rw. Refunds are processed according to the following guidelines:",
    bulletPoints: [
      "Official Wildlife & Park Permits: Rwanda Development Board (RDB) permits for Mountain Gorilla Trekking and Chimpanzee Tracking are 100% non-refundable and strictly non-transferable under official national conservation rules, except where statutory RDB force majeure provisions apply.",
      "Cancellations 60+ Days Prior to Safari: Refund of package funds minus permit costs, bank charges, and non-refundable lodge booking commitments.",
      "Cancellations 31 to 59 Days Prior: 50% refund of the safari package balance (excluding permit fees and committed lodge retainers).",
      "Cancellations 30 Days or Fewer Prior to Safari: No refund is provided due to prepaid commitments made to lodges, transport fleets, and regional suppliers.",
      "Itinerary Amendments by Client: We endeavor to accommodate adjustments where practical. Any additional fees charged by lodges or transport suppliers for requested date alterations will be passed to the client.",
      "Unused Services: No refunds or credits are issued for missed tour segments, early departures, voluntary itinerary omissions, or unused hotel nights.",
    ],
  },
  {
    id: "travel-insurance",
    number: "05",
    title: "Mandatory Travel, Health & Evacuation Insurance",
    paragraphs: [
      `Comprehensive international travel insurance is strongly recommended and mandatory for all clients participating in our East African wilderness safaris.`,
      `Your insurance policy must cover emergency medical expenses, international medical evacuation, wilderness search and rescue, trip cancellation and curtailment, personal baggage loss, and adventure activities including high-altitude forest hiking (as encountered in Volcanoes National Park and Nyungwe National Park).`,
      `${siteConfig.name} accepts no liability for personal medical costs, hospitalization, or emergency transport fees incurred before, during, or after your journey.`,
    ],
  },
  {
    id: "health-passports-and-visas",
    number: "06",
    title: "Passports, Visas & Health Regulations",
    paragraphs: [
      `Clients are solely responsible for ensuring that their passports are valid for at least six (6) months beyond their planned departure date from Rwanda and East Africa, and contain sufficient blank visa pages.`,
      `Travelers must obtain all required entry visas (such as the standard Rwanda Tourist Visa or the East Africa Tourist Visa covering Rwanda, Uganda, and Kenya) prior to departure or at eligible points of entry.`,
      `Travelers must comply with all mandatory health requirements, including Yellow Fever vaccinations (where applicable), malaria prophylactics, and park authority health guidelines. For the safety of endangered mountain gorillas and primates, park authorities will prohibit trekking access to any guest displaying symptoms of contagious respiratory illness (such as severe cough or flu).`,
    ],
  },
  {
    id: "safari-operations-and-force-majeure",
    number: "07",
    title: "Operational Flexibility & Force Majeure",
    paragraphs: [
      `Wilderness expeditions and cross-country safaris operate in dynamic, natural environments. ${siteConfig.name} reserves the right to alter routes, substitute accommodation of equal standard, or reschedule game drives if necessitated by adverse weather, road accessibility, wildlife movements, park administration directives, or mechanical contingencies.`,
      `Force Majeure: We shall not be held liable or provide monetary compensation for delays, alterations, or cancellations caused by events beyond our reasonable control. Such events include acts of God, extreme climatic events, epidemics, government park closures, flight cancellations, civil unrest, or statutory travel prohibitions.`,
    ],
  },
  {
    id: "client-conduct-and-safety",
    number: "08",
    title: "Client Conduct, Wildlife Etiquette & Safety",
    lead: "To protect natural reserves and ensure guest safety, travelers must strictly adhere to field rules:",
    bulletPoints: [
      "Follow Guide Instructions: Clients must comply with all instructions given by park rangers, professional safari guides, and wildlife trackers at all times.",
      "Wildlife Distances: Strict minimum distances (e.g., 7–10 meters from mountain gorillas and chimpanzees) and park rules regarding flash photography, noise levels, and littering must be honored.",
      "Right to Exclude: We reserve the right to decline or terminate the tour participation of any individual whose behavior is disruptive, abusive, dangerous to wildlife, or threatening to the safety and well-being of the group, with no refund entitlement.",
    ],
  },
  {
    id: "intellectual-property",
    number: "09",
    title: "Website Content & Intellectual Property",
    paragraphs: [
      `All materials featured on this website—including photography, itinerary descriptions, text, logos, graphic design, layout, and brand elements—are the exclusive intellectual property of ${siteConfig.name} or its content licensors and are protected under Rwandan and international copyright and trademark laws.`,
      `You may view, print, or download itinerary summaries solely for personal, non-commercial travel planning. Republication, reproduction, scraping, or commercial exploitation of any site content without prior written permission is strictly prohibited.`,
    ],
  },
  {
    id: "limitation-of-liability",
    number: "10",
    title: "Limitation of Liability",
    paragraphs: [
      `To the maximum extent permitted by the laws of Rwanda, ${siteConfig.name}, its directors, safari guides, and employees shall not be liable for any indirect, consequential, incidental, or special damages, including personal injury, baggage loss, theft, emotional distress, or financial losses incurred during travel.`,
      `Our aggregate liability arising out of or in connection with any travel package or booking contract shall in no event exceed the total amount actually received by us from the client for the specific service in dispute.`,
    ],
  },
  {
    id: "governing-law",
    number: "11",
    title: "Governing Law & Dispute Resolution",
    paragraphs: [
      `These Terms of Service and any contractual relationship between you and ${siteConfig.name} shall be governed by, construed, and enforced in accordance with the substantive laws of the Republic of Rwanda.`,
      `Any controversy or claim arising from these terms or your safari tour shall first be resolved through good-faith amicable consultation. If an agreement cannot be reached within thirty (30) days, disputes shall be submitted to the exclusive jurisdiction of the competent courts of Kigali, Rwanda.`,
    ],
  },
  {
    id: "contact-information",
    number: "12",
    title: "Legal & Booking Inquiries",
    paragraphs: [
      `For any questions concerning these Terms of Service, booking terms, or formal travel contracts, please reach out to our management team:`,
    ],
    contactCard: true,
  },
];

export default function TermsPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="overflow-x-hidden">
      <PageHero
        eyebrow="Legal & Operations"
        title="Terms of Service"
        description="Official travel terms, safari booking conditions, payment schedules, and cancellation policies governing our East Africa tours."
        image="/images/rwanda-hills.jpg"
        breadcrumb={[{ label: "Terms of Use", href: "/terms" }]}
      />

      <section className="safari-section section-bg-ivory py-16 md:py-24">
        <div className="safari-container">
          <div className="max-w-4xl mx-auto">
            {/* Value & Protection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Guaranteed Permits</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Direct coordination with RDB for official mountain gorilla and national park permits.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Transparent Pricing</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Clear breakdowns of inclusions, lodging tiers, transport fees, and park entrance fees.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Rwandan Jurisdiction</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Fully registered Rwandan tourism enterprise operating under standard tourism legal codes.
                </p>
              </div>
            </div>

            {/* Document Header Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-12 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 gap-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-brand dark:text-emerald-400" />
                <span>Document Status: <strong>Official Booking Agreement</strong></span>
              </div>
              <div>Last Updated: <strong className="text-slate-800 dark:text-slate-200">{lastUpdated}</strong></div>
            </div>

            {/* Structured Content Sections */}
            <div className="space-y-16">
              {termsSections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="bg-white dark:bg-slate-900/40 rounded-3xl p-8 md:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-brand/10 dark:bg-emerald-500/10 text-brand dark:text-emerald-400">
                      CLAUSE {section.number}
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
                    <div className="grid grid-cols-1 gap-6 mt-6">
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
                          Support Hours: {siteConfig.hours}
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
                Learn more about how we safeguard your data and privacy.
              </p>
              <div className="flex gap-6">
                <Link
                  href="/privacy-policy"
                  className="font-medium text-brand dark:text-emerald-400 hover:underline"
                >
                  Privacy Policy &rarr;
                </Link>
                <Link
                  href="/plan-your-trip"
                  className="font-medium text-brand dark:text-emerald-400 hover:underline"
                >
                  Plan Your Safari &rarr;
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
