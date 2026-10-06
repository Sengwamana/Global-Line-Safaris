"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { siteImages } from "@/lib/siteImages";
import type { SiteImageSetting } from "@/lib/content/types";

interface HeroSectionProps {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  images?: SiteImageSetting[];
}

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaUrl,
  images,
}: HeroSectionProps) {
  const slides = images?.length
    ? images.map((i) => ({
        src: i.url,
        alt: i.alt || "Rwanda travel with Global Line Safaris",
      }))
    : siteImages.heroSlides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const advance = useCallback(
    () => setIndex((i) => (i + 1) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = setInterval(advance, 6000);
    return () => clearInterval(timer);
  }, [advance, paused, index]);

  return (
    <section
      className="safari-hero"
      aria-label="Discover Rwanda"
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-slides">
        {slides.map((s, i) => (
          <div
            key={s.src}
            className={`hero-slide${i === index ? " active" : ""}`}
            aria-hidden={i !== index}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="hero-photograph"
            />
          </div>
        ))}
      </div>
      <div className="hero-shade" />
      <div className="safari-container hero-content">
        <div className="safari-eyebrow">
          <span className="safari-eyebrow-line" />
          <span>{eyebrow || "Rwanda & East Africa"}</span>
        </div>
        <h1>{title || "Discover Rwanda & Beyond"}</h1>
        <p className="hero-description">
          {subtitle ||
            "Experience breathtaking landscapes, extraordinary wildlife, and unforgettable journeys with Global Line Safaris."}
        </p>
        <div className="hero-actions">
          <Link className="safari-button safari-button-ivory" href="/destinations">
            Explore Destinations
            <ArrowRight width={14} height={14} />
          </Link>
          <Link
            className="safari-text-link light-link"
            href={ctaUrl || "/plan-your-trip"}
          >
            {ctaLabel || "Plan Your Trip"}
            <ArrowRight width={14} height={14} />
          </Link>
        </div>
      </div>
      <div className="safari-container hero-bottom">
        <a href="#discover" className="hero-scroll">
          <span className="hero-scroll-line" />
          <span>Discover</span>
        </a>
        <div
          className="hero-controls"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <span aria-live="polite" aria-atomic="true">
            {String(index + 1).padStart(2, "0")}
            <span> / {String(slides.length).padStart(2, "0")}</span>
          </span>
          <button
            aria-label="Previous photograph"
            onClick={() =>
              setIndex((index - 1 + slides.length) % slides.length)
            }
          >
            <ChevronLeft width={16} height={16} />
          </button>
          <button
            aria-label="Next photograph"
            onClick={() => setIndex((index + 1) % slides.length)}
          >
            <ChevronRight width={16} height={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
