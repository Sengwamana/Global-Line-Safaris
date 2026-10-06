import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { HomepageSectionData, SiteImageSetting } from "@/lib/content/types";
import { siteImages } from "@/lib/siteImages";

export function AboutPreviewSection({
  section,
  image,
}: {
  section: HomepageSectionData;
  image?: SiteImageSetting;
}) {
  return (
    <section id="discover" className="safari-section intro-section">
      <div className="safari-container intro-grid">
        <figure className="intro-photograph">
          <Image
            src={image?.url || siteImages.about.src}
            alt={image?.alt || siteImages.about.alt}
            fill
            sizes="(max-width: 800px) 100vw, 45vw"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="intro-copy">
          <div className="safari-eyebrow">
            <span className="safari-eyebrow-line" />
            <span>{section.eyebrow || "Our home. Your next adventure."}</span>
          </div>
          <h2>{section.title || "Discover Rwanda With Global Line Safaris"}</h2>
          <p>{section.subtitle}</p>
          {section.description && <p>{section.description}</p>}
          <Link
            className="safari-text-link"
            href={section.ctaUrl || "/about"}
          >
            {section.ctaLabel || "Our Story"}
            <ArrowUpRight width={14} height={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
