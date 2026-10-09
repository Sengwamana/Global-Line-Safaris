import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import type { TourPackage } from "@/lib/content/types";
import { displayPackagePrice } from "@/lib/utils";
import { siteImages } from "@/lib/siteImages";

export function PackageCard({ pkg }: { pkg: TourPackage }) {
  const price = displayPackagePrice(pkg.price);

  return (
    <Link href={`/tour-packages/${pkg.slug}`} className="safari-package">
      <div className="package-image">
        <Image
          src={pkg.image || siteImages.servicesHero.src}
          alt={pkg.title}
          fill
          sizes="(max-width: 800px) 100vw, (max-width: 1100px) 50vw, 33vw"
          loading="lazy"
          decoding="async"
        />
        {pkg.duration && (
          <span className="package-duration">
            <Clock width={12} height={12} />
            {pkg.duration}
          </span>
        )}
      </div>
      <div className="package-copy">
        {pkg.location && (
          <div className="safari-eyebrow">
            <span className="safari-eyebrow-line" />
            <span>{pkg.location}</span>
          </div>
        )}
        <h3>{pkg.title}</h3>
        {pkg.overview && <p className="package-overview">{pkg.overview}</p>}
        <div className="package-bottom">
          <span>{price ? `From ${price}` : "Price on request"}</span>
          <span>
            View Details
            <ArrowUpRight width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
