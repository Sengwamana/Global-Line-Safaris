import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServiceCategory } from "@/lib/content/types";
import { siteImages } from "@/lib/siteImages";

export function ServiceCard({ category }: { category: ServiceCategory }) {
  const image =
    category.image ||
    category.services.find((service) => service.image)?.image ||
    siteImages.servicesHero.src;

  return (
    <Link href={`/services/${category.slug}`} className="experience-card">
      <div className="experience-image">
        <Image
          src={image}
          alt={category.title}
          fill
          sizes="(max-width: 800px) 100vw, (max-width: 1100px) 50vw, 33vw"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="experience-copy">
        <h3>{category.title}</h3>
        <p>{category.description}</p>
        <span className="safari-text-link">
          Explore experiences
          <ArrowUpRight width={14} height={14} />
        </span>
      </div>
    </Link>
  );
}
