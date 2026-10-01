import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HomepageSectionData } from "@/lib/content/types";

export function CTASection({ section }: { section?: HomepageSectionData }) {
  return (
    <section className="safari-cta">
      <div className="safari-container">
        <div className="safari-eyebrow">
          <span className="safari-eyebrow-line" />
          <span>{section?.eyebrow || "Start your journey"}</span>
        </div>
        <h2>{section?.title || "Your Next Adventure Starts Here"}</h2>
        <p>
          {section?.subtitle ||
            "Tell us what you dream of experiencing. We'll help you plan a journey through Rwanda and East Africa, shaped around you."}
        </p>
        <div className="hero-actions hero-actions-center">
          <Link
            className="safari-button safari-button-ivory"
            href={section?.ctaUrl || "/plan-your-trip"}
          >
            {section?.ctaLabel || "Plan Your Trip"}
            <ArrowUpRight width={14} height={14} />
          </Link>
          <Link className="safari-text-link light-link" href="/contact">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
