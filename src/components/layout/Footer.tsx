import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Linkedin, Twitter, Music2Icon } from "lucide-react";
import { getSiteSettings } from "@/lib/content/service.server";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { siteConfig } from "@/lib/site";

function externalHref(value: string) {
  const href = value.trim();
  if (!href || href === "#") return null;
  return /^https?:\/\//i.test(href) ? href : `https://${href}`;
}

const socialIcons: Record<string, React.ElementType> = {
  Instagram,
  Facebook,
  LinkedIn: Linkedin,
  "X (Twitter)": Twitter,
  TikTok: Music2Icon,
};

// Lowercase map for case-insensitive social label lookups
const socialIconsLowercase: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  "x (twitter)": Twitter,
  tiktok: Music2Icon,
};

export async function Footer() {
  const settings = await getSiteSettings();

  // Build social links directly from CMS settings, falling back to siteConfig
  // hardcoded URLs. This avoids label-matching fragility and ensures icons
  // always render when a valid URL exists in either source.
  const socials = [
    { label: "Facebook", href: externalHref(settings.facebook) ?? siteConfig.socialLinks.find((l) => l.label === "Facebook")?.href ?? null },
    { label: "Instagram", href: externalHref(settings.instagram) ?? siteConfig.socialLinks.find((l) => l.label === "Instagram")?.href ?? null },
    { label: "TikTok", href: externalHref(settings.tiktok) },
    { label: "LinkedIn", href: externalHref(settings.linkedin) ?? siteConfig.socialLinks.find((l) => l.label === "LinkedIn")?.href ?? null },
  ].filter((s): s is { label: string; href: string } => s.href !== null && s.href !== undefined);

  return (
    <footer className="safari-footer">
      <div className="safari-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label="Global Line Safaris home">
              {/* settings.logo is CMS-overridable, so its aspect ratio is unknown —
                  fit it inside a fixed box rather than assuming one. */}
              <span className="footer-logo">
                <Image
                  src={settings.logo || "/gls/logo.png"}
                  alt="Global Line Safaris"
                  fill
                  sizes="132px"
                  loading="lazy"
                  decoding="async"
                  className="object-contain"
                />
              </span>
            </Link>
            <p>{settings.description}</p>
            {socials.length > 0 && (
              <div className="footer-social">
                {socials.map((s) => {
                  const Icon = socialIcons[s.label] ?? socialIconsLowercase[s.label.toLowerCase()] ?? null;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${s.label}`}
                      title={s.label}
                    >
                      <Icon width={18} height={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <h3>Explore</h3>
            <ul>
              <li>
                <Link href="/destinations">Destinations</Link>
              </li>
              <li>
                <Link href="/tour-packages">Tour Packages</Link>
              </li>
              <li>
                <Link href="/services">Travel Services</Link>
              </li>
              <li>
                <Link href="/gallery">Travel Gallery</Link>
              </li>
              <li>
                <Link href="/plan-your-trip">Plan Your Trip</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Get to know us</h3>
            <ul>
              <li>
                <Link href="/about">Our Story</Link>
              </li>
              <li>
                <Link href="/about#team">Our Team</Link>
              </li>
              <li>
                <Link href="/why-choose-us">Why Travel With Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Let&apos;s start a conversation</h3>
            <div className="footer-contact">
              <a href={`tel:${settings.phone.replace(/[^+0-9]/g, "")}`}>
                {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
              <span>
                {[settings.addressLine1, settings.city, settings.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
            <div className="footer-newsletter">
              <NewsletterForm />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </p>
          <div>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </div>
        </div>
        <p className="footer-credit">
          Designed &amp; Developed by{" "}
          <a href="https://icetechrwanda.com" target="_blank" rel="noopener noreferrer">
            Ice Tech Rwanda
          </a>
        </p>
      </div>
    </footer>
  );
}
