import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/lib/content/types";

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
      {destination.image && (
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          sizes={
            featured
              ? "(max-width: 800px) 100vw, 60vw"
              : "(max-width: 640px) 100vw, 40vw"
          }
          loading="lazy"
          decoding="async"
        />
      )}
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
