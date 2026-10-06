import Image from "next/image";
import { siteImages } from "@/lib/siteImages";
import type { SiteImages } from "@/lib/siteImages";

export type TeamSlug = keyof SiteImages["team"];

interface TeamAvatarProps {
  /** Optional preset slug (founder, raymond, alexis, ismail, diane). */
  slug?: TeamSlug;
  /** CMS photo URL. Takes precedence over slug. */
  photo?: string | null;
  /** Display name, used for the alt text and initials fallback. */
  name?: string;
  /** Avatar box size in pixels. Defaults to 64. */
  size?: number;
  /** Show a "Photo coming soon" caption under the avatar. Defaults to false. */
  showLabel?: boolean;
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamAvatar({ slug, photo, name, size = 64, showLabel = false }: TeamAvatarProps) {
  const preset = slug ? siteImages.team[slug] : undefined;
  const resolvedName = name ?? preset?.name ?? "Team member";
  const resolvedSrc = photo ?? preset?.src ?? null;
  const initials = name ? initialsFor(name) : preset?.initials ?? "GL";
  const hasImage = Boolean(resolvedSrc);

  return (
    <div className="team-avatar">
      {hasImage ? (
        <Image
          src={resolvedSrc as string}
          alt={`${resolvedName} — Global Line Safaris`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="team-avatar-img"
        />
      ) : (
        <div
          role="img"
          aria-label={`${resolvedName} — Global Line Safaris`}
          className="team-avatar-fallback"
        >
          {initials}
        </div>
      )}
      {showLabel && !hasImage && (
        <span className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Photo coming soon
        </span>
      )}
    </div>
  );
}
