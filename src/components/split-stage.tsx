"use client";

import { useState, type ReactNode } from "react";

import { site } from "@/content/site";
import { cn } from "@/lib/utils";

type Half = "left" | "right";

function Spine({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="border-border relative hidden w-14 shrink-0 flex-col items-center justify-center border-x lg:flex"
    >
      <div className="from-brass/0 via-brass/35 to-brass/0 absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b" />
      <span className="bg-ink text-brass/70 relative py-3 text-[9px] leading-none">
        ◆
      </span>
      <span
        className="bg-ink text-smoke relative py-6 font-mono text-[0.6rem] tracking-[0.42em] uppercase"
        style={{ writingMode: "vertical-rl", rotate: "180deg" }}
      >
        {label}
      </span>
      <span className="bg-ink text-brass/70 relative py-3 text-[9px] leading-none">
        ◆
      </span>
    </div>
  );
}

function Switcher({
  active,
  onChange,
  labels,
}: {
  active: Half;
  onChange: (half: Half) => void;
  labels: Record<Half, string>;
}) {
  return (
    <div className="border-border bg-ink/95 sticky top-0 z-30 flex shrink-0 border-b backdrop-blur-sm lg:hidden">
      {(["left", "right"] as const).map((half) => (
        <button
          key={half}
          type="button"
          onClick={() => onChange(half)}
          aria-pressed={active === half}
          className={cn(
            "focus-visible:ring-ring relative flex-1 px-4 py-3 font-mono text-[0.7rem] tracking-[0.24em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:-outline-offset-2",
            active === half
              ? "text-brass-bright"
              : "text-smoke hover:text-bone-dim",
          )}
        >
          {labels[half]}
          <span
            aria-hidden="true"
            className={cn(
              "bg-brass absolute inset-x-4 bottom-0 h-px transition-opacity",
              active === half ? "opacity-90" : "opacity-0",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function SplitStage({
  left,
  right,
  labels,
}: {
  left: ReactNode;
  right: ReactNode;
  labels: Record<Half, string>;
}) {
  const [active, setActive] = useState<Half>("left");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Switcher active={active} onChange={setActive} labels={labels} />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          data-showing={active === "left"}
          className="flex min-h-0 flex-1 flex-col max-lg:data-[showing=false]:hidden"
        >
          {left}
        </div>

        <Spine label={site.shortName} />

        <div
          data-showing={active === "right"}
          className="flex min-h-0 flex-1 flex-col max-lg:data-[showing=false]:hidden"
        >
          {right}
        </div>
      </div>
    </div>
  );
}
