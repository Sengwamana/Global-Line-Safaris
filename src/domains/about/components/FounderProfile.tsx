import Image from "next/image";
import type { TeamMember } from "@/lib/content/types";
import { TeamAvatar } from "@/domains/team/components/TeamAvatar";
import { siteImages } from "@/lib/siteImages";

interface FounderProfileProps {
  founder: TeamMember;
}

export function FounderProfile({ founder }: FounderProfileProps) {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
      <div className="it-container px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Content */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand mb-4">
              Leadership
            </span>
            <div className="flex items-center gap-5">
              <TeamAvatar photo={founder.photo} name={founder.name} size={88} />
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {founder.name}
                </h2>
                <p className="mt-1 text-lg text-brand font-medium">
                  {founder.role}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>{founder.bio}</p>
            </div>

            {/* Office illustration */}
            <div className="relative mt-6 overflow-hidden rounded-2xl">
              <Image
                src={siteImages.aboutPage.office.src}
                alt={siteImages.aboutPage.office.alt}
                width={800}
                height={500}
                loading="lazy"
                decoding="async"
                className="h-56 w-full object-cover"
              />
            </div>
          </div>

          {/* Expertise & Info */}
          <div>
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Areas of Expertise
              </h3>
              <ul className="space-y-3">
                {founder.expertise.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Our Story
              </h3>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  Global Line Safaris grew from a passion for tourism,
                  professional guiding and skills development within Rwanda&apos;s
                  tourism sector. What began with hands-on experience as a
                  tourist driver-guide has grown into a full travel company.
                </p>
                <p>
                  Today we combine carefully designed safari and tour experiences
                  with professional tourism training, internships and industry
                  attachments — helping travellers discover Rwanda while helping
                  the next generation of tourism professionals build practical
                  skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
