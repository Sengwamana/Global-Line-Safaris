import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { getSiteSettings } from "@/lib/content/service.server";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

function externalHref(value: string) {
  const href = value.trim();
  if (!href || href === "#") return null;
  return /^https?:\/\//i.test(href) ? href : `https://${href}`;
}

const socialIcons: Record<string, React.ElementType> = {
  Instagram,
  Facebook,
  Linkedin,
  "X (Twitter)": Twitter,
};

export async function Footer() {
  const settings = await getSiteSettings();
  const socials = [
    { label: "Instagram", href: externalHref(settings.instagram) },
    { label: "Facebook", href: externalHref(settings.facebook) },
    { label: "LinkedIn", href: externalHref(settings.linkedin) },
  ].filter((social): social is { label: string; href: string } => Boolean(social.href));

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
                  const Icon = socialIcons[s.label] ?? Instagram;
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
      </div>
    </footer>
  );
}
