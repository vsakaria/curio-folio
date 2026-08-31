"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The portrait falls back to a monogram plate if the image is not there yet,
 * so the masthead never shows a broken frame while you are still choosing a
 * photograph. Drop a square image at `public/portrait.jpg` and it takes over.
 */
export function Portrait({
  src,
  alt,
  name,
  available,
  className,
  sizePx = 112,
}: {
  src: string;
  alt: string;
  name: string;
  /** Resolved at build time, so a missing file never becomes a 404 request. */
  available: boolean;
  className?: string;
  sizePx?: number;
}) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const showPlate = !available || failed;

  // The server-rendered <img> can finish failing before React hydrates, in
  // which case onError never fires. Check the outcome once on mount too.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, []);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full",
        "ring-brass/45 ring-1 ring-offset-2 ring-offset-[var(--ink)]",
        "shadow-[0_0_0_1px_rgba(11,10,9,0.9),0_18px_40px_-24px_rgba(0,0,0,0.9)]",
        className,
      )}
      style={{ width: sizePx, height: sizePx }}
    >
      {showPlate ? (
        <div className="from-oxblood/70 via-ink to-olive/60 flex h-full w-full items-center justify-center bg-gradient-to-br">
          <span
            className="text-brass-bright font-display text-2xl tracking-[0.08em]"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span className="sr-only">{alt}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- a single fixed-size asset with an onError fallback
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={sizePx}
          height={sizePx}
          onError={() => setFailed(true)}
          className="text-ink h-full w-full object-cover text-[0px]"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 24%, rgba(236,226,208,0.16), transparent 58%)",
        }}
      />
    </div>
  );
}
