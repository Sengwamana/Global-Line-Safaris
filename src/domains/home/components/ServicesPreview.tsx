import { ServicePreviewCard } from "@/domains/home/components/ServicePreviewCard";
import type { ServiceCategory, HomepageSectionData } from "@/lib/content/types";

export function ServicesPreviewSection({
  categories,
  section,
}: {
  categories: ServiceCategory[];
  section?: HomepageSectionData;
}) {
  if (!categories.length) return null;

  return (
    <section className="safari-section experiences-section">
      <div className="safari-container">
        <div className="editorial-heading">
          <div>
            <div className="safari-eyebrow">
              <span className="safari-eyebrow-line" />
              <span>{section?.eyebrow || "Your kind of adventure"}</span>
            </div>
            <h2>{section?.title || "Tours, Safaris & Travel Services"}</h2>
          </div>
          <p>{section?.subtitle}</p>
        </div>
        <div className="experience-grid">
          {categories.map((category) => (
            <ServicePreviewCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
