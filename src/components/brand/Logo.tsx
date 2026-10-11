import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "xs" | "sm" | "md";
  showWordmark?: boolean;
  /** Custom logo URL from the CMS. When provided, overrides the default logo. */
  src?: string;
}

/**
 * Intrinsic pixel dimensions of the file at /gls/logo.png.
 * Keep these in step with the artwork — a mismatch is what squashes the mark.
 */
const LOGO_INTRINSIC = { width: 1600, height: 659 } as const;

const LOGO_RATIO = LOGO_INTRINSIC.width / LOGO_INTRINSIC.height;

const sizeStyles = {
  xs: { box: "h-6 w-6 rounded-md text-xs", title: "text-xs", subtitle: "text-[9px]" },
  sm: { box: "h-8 w-8 rounded-lg text-sm", title: "text-sm", subtitle: "text-[10px]" },
  md: { box: "h-9 w-9 rounded-lg text-base", title: "text-base", subtitle: "text-[11px]" },
} as const;

/** Width is the design intent; height is derived so the mark is never distorted. */
const logoSizes = {
  xs: { width: 64, height: Math.round(64 / LOGO_RATIO) },
  sm: { width: 100, height: Math.round(100 / LOGO_RATIO) },
  md: { width: 150, height: Math.round(150 / LOGO_RATIO) },
} as const;

export function Logo({
  className,
  href = "/",
  size = "md",
  showWordmark = true,
  src,
}: LogoProps) {
  const styles = sizeStyles[size];

  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} — Home`}
      className={cn("flex items-center gap-2.5", className)}
    >
      {src ? (
        /* CMS-provided logo — aspect ratio is unknown, so fit it inside a
           fixed box rather than assuming one (same approach as the footer). */
        <span
          className={cn(
            "relative shrink-0 overflow-hidden",
            size === "sm" ? "h-8 w-8" : "h-9 w-9"
          )}
        >
          <Image
            src={src}
            alt={`${siteConfig.name} logo`}
            fill
            sizes={size === "sm" ? "32px" : "36px"}
            priority
            className="object-contain"
          />
        </span>
      ) : (
        <Image
          src="/gls/logo.png"
          alt={`${siteConfig.name} logo`}
          width={logoSizes[size].width}
          height={logoSizes[size].height}
          priority
          className="h-auto w-auto shrink-0 object-contain"
        />
      )}
      {showWordmark && (
        <span className="hidden flex-col leading-none lg:flex">
          <span
            className={cn(
              "font-bold tracking-tight text-slate-900 dark:text-white",
              styles.title
            )}
          >
            {siteConfig.shortName}
          </span>
          <span
            className={cn(
              "mt-0.5 font-medium tracking-wide text-slate-500 dark:text-slate-400",
              styles.subtitle
            )}
          >
            {siteConfig.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
