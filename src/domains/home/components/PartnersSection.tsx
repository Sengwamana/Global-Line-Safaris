import Image from "next/image";
import type { HomepageSectionData } from "@/lib/content/types";

interface PartnerLogo {
  kind: "logo";
  name: string;
  src: string;
  alt: string;
  url: string;
  width: number;
  height: number;
  /**
   * Some marks are published by their owner as solid white and are only legible
   * on a dark surface. Those get a reversed card; the rest sit on the light card
   * in their true brand colours.
   */
  reversed?: boolean;
}

/**
 * Volcanoes National Park has no published mark we are permitted to reproduce —
 * the legacy volcanoesnationalparkrwanda.org domain is no longer operated by the
 * park and now resolves to an unrelated site. Rather than borrow a substitute, we
 * name it as a text badge.
 */
interface PartnerBadge {
  kind: "badge";
  name: string;
  lines: string[];
}

type Partner = PartnerLogo | PartnerBadge;

const DEFAULT_PARTNERS: Partner[] = [
  {
    kind: "logo",
    name: "Rwanda Development Board",
    src: "/partners/rdb.png",
    alt: "Rwanda Development Board",
    url: "https://rdb.rw",
    width: 210,
    height: 54,
  },
  {
    kind: "logo",
    name: "Akagera National Park",
    src: "/partners/akagera-national-park.png",
    alt: "Akagera National Park",
    url: "https://www.africanparks.org/the-parks/akagera",
    width: 310,
    height: 147,
  },
  {
    kind: "logo",
    name: "Nyungwe National Park",
    src: "/partners/nyungwe-national-park.png",
    alt: "Nyungwe National Park",
    url: "https://www.africanparks.org/the-parks/nyungwe",
    width: 124,
    height: 143,
    reversed: true,
  },
  {
    kind: "logo",
    name: "Visit Rwanda",
    src: "/partners/rwanda-tourism.png",
    alt: "Visit Rwanda",
    url: "https://www.visitrwanda.com",
    width: 116,
    height: 48,
    reversed: true,
  },
  {
    kind: "logo",
    name: "Rwanda Tourism and Travel Association",
    src: "/partners/rtta.png",
    alt: "Rwanda Tourism and Travel Association",
    url: "https://rtta.rw/",
    width: 512,
    height: 243,
  },
  {
    kind: "logo",
    name: "Africa Financial Review",
    src: "/partners/afr.jpg",
    alt: "Africa Financial Review",
    url: "https://afr.rw/homepage/",
    width: 500,
    height: 272,
  },
  {
    kind: "logo",
    name: "Rwanda Tourism Board",
    src: "/partners/rtb.jpg",
    alt: "Rwanda Tourism Board",
    url: "https://www.rtb.gov.rw/",
    width: 884,
    height: 560,
  },
  {
    kind: "logo",
    name: "Red Rocks Initiative",
    src: "/partners/redrocks.png",
    alt: "Red Rocks Initiative for Sustainable Development",
    url: "https://www.redrocksinitiative.org/",
    width: 326,
    height: 326,
  },
  {
    kind: "logo",
    name: "BPN Rwanda",
    src: "/partners/bpn.png",
    alt: "Business Professionals Network (BPN) Rwanda",
    url: "https://bpn.rw/",
    width: 1701,
    height: 459,
  },
  {
    kind: "badge",
    name: "Volcanoes National Park",
    lines: ["Volcanoes", "National Park"],
  },
];

function isLogo(partner: Partner): partner is PartnerLogo {
  return partner.kind !== "badge";
}

function LogoCard({ partner }: { partner: PartnerLogo }) {
  const content = (
    <div
      className={`partner-card${partner.reversed ? " partner-card-reversed" : ""}`}
    >
      <div className="partner-card-inner">
        <Image
          src={partner.src}
          alt={partner.alt}
          width={partner.width}
          height={partner.height}
          loading="lazy"
          decoding="async"
          className="partner-logo"
        />
      </div>
    </div>
  );

  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="partner-link"
      aria-label={`Visit ${partner.name} (opens in a new tab)`}
    >
      {content}
    </a>
  );
}

function BadgeCard({ partner }: { partner: PartnerBadge }) {
  return (
    <div
      className="partner-card partner-card-reversed"
      role="group"
      aria-label={partner.name}
    >
      <div className="partner-card-inner">
        <span className="partner-badge">
          {partner.lines.map((line) => (
            <span key={line} className="partner-badge-line">
              {line}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

export function PartnersSection({
  section,
}: {
  section?: HomepageSectionData;
}) {
  const cmsPartners = Array.isArray(section?.items)
    ? (section.items as any[])
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          if (item.kind === "badge") {
            return {
              kind: "badge" as const,
              name: item.name || item.title || "",
              lines: Array.isArray(item.lines)
                ? item.lines.filter((l: any) => typeof l === "string")
                : [item.line1, item.line2].filter((l: any) => typeof l === "string"),
            };
          }
          if (item.src || item.image || item.url || item.name) {
            return {
              kind: "logo" as const,
              name: item.name || item.title || "",
              src: item.src || item.image || "",
              alt: item.alt || item.name || item.title || "",
              url: item.url || "#",
              width: Number(item.width) || 200,
              height: Number(item.height) || 100,
              reversed: Boolean(item.reversed),
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  const partners = cmsPartners.length ? (cmsPartners as Partner[]) : DEFAULT_PARTNERS;
  if (!partners.length) return null;

  // Duplicate the list for a seamless infinite scroll loop
  const doubled = [...partners, ...partners];

  return (
    <section className="safari-section partners-section">
      <div className="safari-container">
        <div className="editorial-heading">
          <div>
            <div className="safari-eyebrow">
              <span className="safari-eyebrow-line" />
              <span>{section?.eyebrow || "Our Partners"}</span>
            </div>
            <h2>{section?.title || "Trusted By The Best"}</h2>
          </div>
          <div>
            <p>
              {section?.subtitle ||
                "We are a Rwanda Development Board registered tour operator and work with the park authorities that manage the country’s protected areas."}
            </p>
          </div>
        </div>
      </div>

      <div className="partners-marquee">
        <div className="partners-track animate-scroll">
          {doubled.map((partner, index) =>
            isLogo(partner) ? (
              <LogoCard key={`${partner.name}-${index}`} partner={partner} />
            ) : (
              <BadgeCard key={`${partner.name}-${index}`} partner={partner} />
            )
          )}
        </div>
      </div>
    </section>
  );
}
