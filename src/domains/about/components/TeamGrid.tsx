"use client";

import Link from "next/link";
import Image from "next/image";
import type { TeamMember } from "@/lib/content/types";
import { ArrowUpRight } from "lucide-react";

interface TeamGridProps {
  members: TeamMember[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TeamGrid({ members }: TeamGridProps) {
  return (
    <section id="team" className="bg-white py-20 dark:bg-slate-950 sm:py-28">
      <div className="it-container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            Our Team
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            The People Behind Global Line Safaris
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Our team is passionate about travel and committed to creating memorable
            experiences for every guest. Together, we bring knowledge, professionalism
            and a genuine love for Rwanda and East Africa to every journey.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <Link
              key={member.name}
              href={`/about/team/${slugify(member.name)}`}
              className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:border-brand/20 hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-900"
            >
              {/* Large Photo */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    decoding="async"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/20 to-brand/5 text-4xl font-bold text-brand/40">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                    View Profile
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <ArrowUpRight className="size-4 text-white" />
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-brand">{member.role}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {member.bio}
                </p>
                {member.expertise.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {member.expertise.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-block rounded-md bg-brand/5 px-2 py-0.5 text-[10px] font-medium text-brand dark:bg-brand/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
