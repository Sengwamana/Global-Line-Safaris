import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/lib/content/types";
import { siteImages } from "@/lib/siteImages";

export function DestinationCard({
  destination,
  featured = false,
}: {
  destination: Destination;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={`destination-card ${featured ? "destination-large" : ""}`}
    >
      <Image
        src={destination.image || siteImages.servicesHero.src}
        alt={destination.name}
        fill
          sizes={
            featured
              ? "(max-width: 640px) 100vw, (max-width: 1100px) 100vw, 50vw"
              : "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
          }
        loading="lazy"
        decoding="async"
      />
      <div className="destination-shade" />
      <div className="destination-copy">
        <div className="safari-eyebrow">
          <span className="safari-eyebrow-line" />
          <span>{destination.category || destination.location || "Explore Rwanda"}</span>
        </div>
        <h3>{destination.name}</h3>
        {destination.shortDescription && (
          <p className="destination-summary">{destination.shortDescription}</p>
        )}
        <span className="destination-explore">
          Explore destination
          <ArrowUpRight width={14} height={14} />
        </span>
      </div>
    </Link>
  );
}
