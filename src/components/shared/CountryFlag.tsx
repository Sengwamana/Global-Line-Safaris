import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Country flags are served as static SVG files from /public/flags (source:
 * flag-icons, MIT licence; flag artwork itself is public domain). They are
 * rendered unoptimized because the Next image optimizer rejects SVG sources.
 */
const FLAG_SOURCES: Record<string, string> = {
  Rwanda: "/flags/rw.svg",
  Tanzania: "/flags/tz.svg",
  Kenya: "/flags/ke.svg",
  Uganda: "/flags/ug.svg",
};

export function hasCountryFlag(country: string): boolean {
  return country in FLAG_SOURCES;
}

export function CountryFlag({
  country,
  className = "",
  alt,
}: {
  country: string;
  className?: string;
  alt?: string;
}) {
  const src = FLAG_SOURCES[country];
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt ?? `Flag of ${country}`}
      width={640}
      height={480}
      unoptimized
      loading="lazy"
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}
