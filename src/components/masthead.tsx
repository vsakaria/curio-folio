import { existsSync } from "node:fs";
import { join } from "node:path";
import { ArrowUpRight } from "lucide-react";

import { Portrait } from "@/components/portrait";
import { billboard, site, socials } from "@/content/site";

/**
 * The page is prerendered, so this runs at build time against the real
 * `public/` directory. Dropping a portrait in and rebuilding is all it takes.
 */
function portraitExists(src: string) {
  if (!src.startsWith("/")) return true;
  return existsSync(join(process.cwd(), "public", src.slice(1)));
}

function Billboard() {
  const strip = [...billboard, ...billboard];

  return (
    <div className="border-border/70 bg-ink-raised/60 relative overflow-hidden border-t">
      <div className="billboard-track flex w-max items-center py-1.5">
        {strip.map((entry, index) => (
          <span
            key={`${entry}-${index}`}
            className="stage-label flex shrink-0 items-center whitespace-nowrap px-5"
          >
            {entry}
            <span
              aria-hidden="true"
              className="bg-brass/60 ml-5 inline-block size-[3px] rounded-full"
            />
          </span>
        ))}
      </div>
      <div className="from-ink pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent" />
      <div className="from-ink pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent" />
    </div>
  );
}

export function Masthead() {
  const [firstName, ...restOfName] = site.name.split(" ");

  return (
    <header className="border-border relative z-20 shrink-0 border-b">
      <div className="curtain-rise px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex shrink-0 items-center gap-5 lg:gap-7">
            <Portrait
              src={site.portrait.src}
              alt={site.portrait.alt}
              name={site.name}
              available={portraitExists(site.portrait.src)}
              sizePx={92}
              className="lg:!h-[104px] lg:!w-[104px]"
            />

            <div className="min-w-0">
              <p className="stage-label flex flex-wrap items-center gap-x-2.5 gap-y-1 max-sm:tracking-[0.16em]">
                <span className="bg-flash inline-block size-1.5 shrink-0 rounded-full" />
                <span className="whitespace-nowrap">{site.role}</span>
                <span className="text-brass/50">/</span>
                <span className="whitespace-nowrap">{site.location}</span>
              </p>

              <h1 className="font-display mt-2 text-[2.1rem] leading-[0.92] tracking-[-0.025em] whitespace-nowrap sm:text-5xl lg:text-[2.9rem] xl:text-[3.4rem]">
                <span className="text-bone">{firstName}</span>{" "}
                <span className="text-brass-bright italic">
                  {restOfName.join(" ")}
                </span>
              </h1>

              <p className="text-bone-dim mt-2.5 max-w-md text-sm leading-snug sm:text-[0.95rem]">
                {site.tagline}
              </p>
            </div>
          </div>

          {/* The introduction sits alongside the name once there is room for a
              column, and directly under it when there is not. */}
          <p className="text-smoke max-w-prose text-[0.8rem] leading-relaxed xl:hidden">
            {site.intro}
          </p>

          <p className="text-smoke hidden max-w-[22rem] border-l pl-6 text-[0.8rem] leading-relaxed xl:block">
            {site.intro}
          </p>

          <nav
            aria-label="Elsewhere"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:ml-auto lg:flex-col lg:items-end lg:gap-y-1.5"
          >
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="me noreferrer"
                className="group text-bone-dim hover:text-brass-bright focus-visible:ring-ring flex items-center gap-1.5 rounded-xs text-[0.7rem] tracking-[0.12em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="text-smoke group-hover:text-brass hidden font-mono text-[0.65rem] normal-case transition-colors lg:inline">
                  {social.handle}
                </span>
                <span className="border-transparent group-hover:border-brass/60 border-b pb-px">
                  {social.label}
                </span>
                <ArrowUpRight className="size-3 opacity-50 transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100" />
              </a>
            ))}
          </nav>
        </div>
      </div>

      <Billboard />
    </header>
  );
}
