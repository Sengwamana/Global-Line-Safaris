import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServiceCategory } from "@/lib/content/types";
import { siteImages } from "@/lib/siteImages";

export function ServicePreviewCard({ category }: { category: ServiceCategory }) {
  const image =
    category.image ||
    category.services.find((service) => service.image)?.image ||
    (category.slug === "training-attachments"
      ? siteImages.trainingHero.src
      : siteImages.servicesHero.src);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:border-brand/20 hover:shadow-xl dark:border-slate-800/50 dark:bg-slate-900">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={category.title}
          fill
          sizes="(max-width: 800px) 100vw, (max-width: 1100px) 50vw, 33vw"
          loading="lazy"
          decoding="async"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-serif text-xl font-bold text-white drop-shadow-md sm:text-2xl">
            {category.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {category.description}
        </p>

        {/* CTA link */}
        <div className="mt-auto pt-5">
          <Link
            href={`/services/${category.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-all hover:gap-3 dark:text-accent"
          >
            Explore
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
