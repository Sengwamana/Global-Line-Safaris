import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteImages } from "@/lib/siteImages";
import type { HomepageSectionData } from "@/lib/content/types";

export function WhyChoosePreview({
  pillars,
  section,
}: {
  pillars: Array<{ icon: string; title: string; description: string }>;
  section?: HomepageSectionData;
}) {
  if (!pillars.length) return null;

  return (
    <section className="safari-philosophy">
      <div className="philosophy-image">
        <Image
          src={siteImages.advisory.src}
          alt={siteImages.advisory.alt}
          fill
          sizes="(max-width: 800px) 100vw, 45vw"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="philosophy-copy">
        <div className="safari-eyebrow">
          <span className="safari-eyebrow-line" />
          <span>{section?.eyebrow || "The Global Line Safaris way"}</span>
        </div>
        <h2>{section?.title || "A journey with a personal touch."}</h2>
        <div className="philosophy-list">
          {pillars.slice(0, 4).map((pillar, index) => (
            <div key={pillar.title}>
              <span className="philosophy-number">
                0{index + 1}
              </span>
              <div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Link className="safari-text-link light-link" href="/why-choose-us">
          Get to know our approach
          <ArrowUpRight width={14} height={14} />
        </Link>
      </div>
    </section>
  );
}
