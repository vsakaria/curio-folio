import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * One half of the stage. On large screens the body scrolls independently so
 * both halves stay in view; below that the page returns to a single document
 * scroll and the switcher in `SplitStage` decides which half is showing.
 */
export function Pane({
  id,
  kicker,
  title,
  blurb,
  aside,
  children,
  className,
}: {
  id: string;
  kicker: string;
  title: string;
  blurb: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("flex min-h-0 flex-col", className)}
    >
      <div className="border-border/70 relative shrink-0 border-b px-5 pt-6 pb-4 sm:px-8 lg:px-9">
        <p className="stage-label">{kicker}</p>

        <div className="mt-1.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2
            id={`${id}-title`}
            className="font-display text-bone text-[1.75rem] leading-none tracking-[-0.01em] lg:text-[2rem]"
          >
            {title}
          </h2>
          {aside}
        </div>

        <p className="text-smoke mt-2 max-w-sm text-[0.8rem] leading-relaxed">
          {blurb}
        </p>
      </div>

      <div className="pane-scroll @container flex-1 lg:min-h-0 lg:overflow-y-auto">
        {children}
      </div>
    </section>
  );
}
