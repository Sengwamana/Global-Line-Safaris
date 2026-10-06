"use client";

import Image from "next/image";
import { Compass, HeartHandshake, Leaf, Sparkles } from "lucide-react";
import { siteImages } from "@/lib/siteImages";

const visionItems = [
  {
    icon: Compass,
    title: "Authentic Journeys",
    description:
      "Creating genuine travel experiences that connect our guests with Rwanda's people, culture, nature and destinations.",
  },
  {
    icon: HeartHandshake,
    title: "Personal Service",
    description:
      "Understanding the needs and interests of every traveller, and designing journeys that are enjoyable, meaningful and professionally organized.",
  },
  {
    icon: Leaf,
    title: "Responsible Tourism",
    description:
      "Promoting travel that respects the environment, supports local communities and protects the destinations we love.",
  },
  {
    icon: Sparkles,
    title: "Lasting Memories",
    description:
      "Helping every traveller return home with meaningful experiences, unforgettable stories and memories that last a lifetime.",
  },
];

export function VisionSection() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900">
      <div className="it-container px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand mb-4">
            Our Vision
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            A World Where Every Journey Matters
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            We aspire to be a trusted and inspiring travel company, showcasing
            the beauty, culture, wildlife and unique experiences of Rwanda and
            East Africa through authentic and responsible travel.
          </p>
        </div>

        {/* Team collaboration illustration */}
        <div className="relative mb-16 overflow-hidden rounded-3xl">
          <Image
            src={siteImages.aboutPage.teamCollaboration.src}
            alt={siteImages.aboutPage.teamCollaboration.alt}
            width={1600}
            height={600}
            loading="lazy"
            decoding="async"
            className="h-64 sm:h-80 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg-dark/60 to-transparent" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visionItems.map((item) => (
            <div
              key={item.title}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-brand/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand/5 dark:bg-brand/10 text-brand mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
