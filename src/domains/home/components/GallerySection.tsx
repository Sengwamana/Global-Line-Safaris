import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HomepageSectionData } from "@/lib/content/types";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

export function GallerySection({
  images,
  section,
}: {
  images: GalleryImage[];
  section: HomepageSectionData;
}) {
  const items = images.slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="safari-section">
      <div className="safari-container">
        <div className="editorial-heading">
          <div>
            <div className="safari-eyebrow">
              <span className="safari-eyebrow-line" />
              <span>{section.eyebrow || "Travel inspiration"}</span>
            </div>
            <h2>{section.title || "Moments From the Journey"}</h2>
          </div>
          <div>
            <p>{section.subtitle}</p>
            <Link
              className="safari-text-link"
              href={section.ctaUrl || "/gallery"}
            >
              {section.ctaLabel || "Explore the Gallery"}
              <ArrowUpRight width={14} height={14} />
            </Link>
          </div>
        </div>
        <div className="gallery-editorial">
          {items.map((image) => (
            <Link
              href="/gallery"
              key={image.id}
              aria-label="Explore the travel gallery"
            >
<Image
                src={image.url}
                alt={image.alt || "Travel photography from Global Line Safaris"}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                loading="lazy"
                decoding="async"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
