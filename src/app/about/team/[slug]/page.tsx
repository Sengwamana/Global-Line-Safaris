import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Mail, Linkedin } from "lucide-react";
import { getTeam, getSeoSetting } from "@/lib/content/service.server";
import { CTASection } from "@/domains/home/components/CTASection";
import { siteConfig } from "@/lib/site";

export const revalidate = 60;

interface TeamMemberPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const team = await getTeam();
  return team.members.map((m) => ({ slug: slugify(m.name) }));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateMetadata({ params }: TeamMemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [team, seo] = await Promise.all([getTeam(), getSeoSetting("team")]);
  const member = team.members.find((m) => slugify(m.name) === slug);
  if (!member) return { title: "Team Member Not Found" };

  const title = seo?.title
    ? seo.title.replace(/\{name\}/gi, member.name)
    : `${member.name} | Global Line Safaris`;
  const description = seo?.description
    ? seo.description.replace(/\{name\}/gi, member.name)
    : member.bio.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/about/team/${slug}` },
    openGraph: {
      title,
      description,
      url: `/about/team/${slug}`,
      siteName: "Global Line Safaris",
      type: "profile",
      ...(member.photo ? { images: [{ url: member.photo }] } : {}),
    },
    ...(seo?.indexable === false ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = await params;
  const team = await getTeam();
  const member = team.members.find((m) => slugify(m.name) === slug);

  if (!member) notFound();

  const memberIndex = team.members.findIndex((m) => slugify(m.name) === slug);
  const prevMember = team.members[memberIndex - 1];
  const nextMember = team.members[memberIndex + 1];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio,
    image: member.photo || undefined,
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <section className="safari-page-hero page-hero-min-height-50">
        <div className="safari-container page-hero-content">
          <nav aria-label="Breadcrumb" className="safari-breadcrumb">
            <Link href="/">Home</Link>
            <span>
              <span aria-hidden="true"> / </span>
              <Link href="/about">About Us</Link>
            </span>
            <span>
              <span aria-hidden="true"> / </span>
              <Link href="/about#team">Our Team</Link>
            </span>
            <span>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">{member.name}</span>
            </span>
          </nav>
          <div className="safari-eyebrow">
            <span className="safari-eyebrow-line" />
            <span>Our Team</span>
          </div>
          <h1>{member.name}</h1>
          <p className="page-hero-description">{member.role}</p>
        </div>
      </section>

      {/* Profile */}
      <section className="safari-section">
        <div className="safari-container">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            {/* Left - Photo & Quick Info */}
            <div>
              <div className="sticky top-28">
                <div className="overflow-hidden rounded-2xl">
                  {member.photo ? (
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-brand/20 to-brand/5 text-6xl font-bold text-brand/40">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  )}
                </div>
                <div className="mt-6 space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      {member.role}
                    </p>
                  </div>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-brand/20 dark:border-slate-700/50 dark:bg-slate-800"
                    >
                      <Mail className="size-4 text-brand dark:text-accent" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {member.email}
                      </span>
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-brand/20 dark:border-slate-700/50 dark:bg-slate-800"
                    >
                      <Linkedin className="size-4 text-brand dark:text-accent" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        LinkedIn Profile
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Bio & Expertise */}
            <div>
              <div className="safari-eyebrow">
                <span className="safari-eyebrow-line" />
                <span>Biography</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                About {member.name.split(" ")[0]}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                <p>{member.bio}</p>
              </div>

              {member.expertise.length > 0 && (
                <div className="mt-10">
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    Areas of Expertise
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {member.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-brand/10 bg-brand/5 px-4 py-2 text-sm font-medium text-brand dark:border-accent/20 dark:bg-accent/10 dark:text-accent"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-700">
                {prevMember ? (
                  <Link
                    href={`/about/team/${slugify(prevMember.name)}`}
                    className="group flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand dark:text-slate-400 dark:hover:text-accent"
                  >
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                    <span>{prevMember.name}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {nextMember ? (
                  <Link
                    href={`/about/team/${slugify(nextMember.name)}`}
                    className="group flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand dark:text-slate-400 dark:hover:text-accent"
                  >
                    <span>{nextMember.name}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
