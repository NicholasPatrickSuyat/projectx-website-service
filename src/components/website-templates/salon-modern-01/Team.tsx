import { WebsiteImage } from "@/components/media/WebsiteImage";
import type { SalonWebsiteContent } from "@/lib/templates/types";

export function Team({ content }: { content: SalonWebsiteContent }) {
  return (
    <section
      id="team"
      className="scroll-mt-24 bg-[var(--sa-surface)] px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-[var(--sa-accent)] uppercase">
          {content.sections.team.eyebrow}
        </p>
        <h2 className="sa01-display mt-4 max-w-xl text-3xl leading-tight font-medium sm:text-5xl">
          {content.sections.team.heading}
        </h2>
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {content.team.map((member) => (
            <li key={member.id}>
              <div className="sa01-image aspect-[3/4]">
                <WebsiteImage
                  src={member.imageSrc}
                  alt={member.imageAlt}
                  width={900}
                  height={1200}
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="sa01-display mt-4 text-2xl font-medium tracking-tight">
                {member.name}
              </h3>
              <p className="mt-1 text-[11px] tracking-[0.2em] text-[var(--sa-accent)] uppercase">
                {member.role}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--sa-muted)]">{member.bio}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
