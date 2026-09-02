"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Images,
  MapPin,
  Play,
} from "lucide-react";

import { FramePlate } from "@/components/frame-plate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FeedItem, FeedMedia } from "@/lib/behold";
import { formatDate, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";

function altFor(item: FeedItem): string {
  return item.caption ? truncate(item.caption, 120) : "Instagram photograph";
}

function Still({
  media,
  seed,
  index,
  alt,
  sizes,
  fit = "cover",
  className,
}: {
  media: FeedMedia;
  /** Keeps a frame's procedural plate stable across renders. */
  seed: string;
  index: number;
  alt: string;
  sizes: string;
  /** Tiles crop; the lightbox must not, since the feed mixes aspect ratios. */
  fit?: "cover" | "contain";
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  // Plates are generated to fill whatever frame they are given, so they always
  // cover — there is no original composition to protect.
  if (!media.imageUrl || broken) {
    return (
      <FramePlate
        seed={seed}
        index={index}
        className={cn("h-full w-full", className)}
      />
    );
  }

  return (
    <Image
      src={media.imageUrl}
      alt={alt}
      fill
      sizes={sizes}
      onError={() => setBroken(true)}
      className={cn(
        fit === "cover" ? "object-cover" : "object-contain",
        className,
      )}
    />
  );
}

function Lightbox({
  item,
  index,
  handle,
}: {
  item: FeedItem;
  index: number;
  handle: string;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = item.slides[slideIndex];
  const total = item.slides.length;

  const step = (delta: number) =>
    setSlideIndex((current) => (current + delta + total) % total);

  return (
    <div className="grid gap-5">
      <div className="bg-ink relative aspect-4/5 max-h-[62dvh] w-full overflow-hidden sm:aspect-4/3">
        {slide.videoUrl ? (
          <video
            // A fresh element per slide, so switching never plays the wrong one.
            key={slide.id}
            src={slide.videoUrl}
            poster={slide.imageUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        ) : (
          <Still
            key={slide.id}
            media={slide}
            seed={item.id}
            index={index}
            alt={altFor(item)}
            fit="contain"
            sizes="(max-width: 640px) 92vw, 760px"
          />
        )}

        {total > 1 && (
          <>
            <SlideButton direction="previous" onClick={() => step(-1)} />
            <SlideButton direction="next" onClick={() => step(1)} />
            {/* Top left, clear of the native video controls along the bottom. */}
            <p className="border-brass/40 bg-ink/80 text-bone-dim absolute top-2.5 left-2.5 border px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.16em]">
              {slideIndex + 1} / {total}
            </p>
          </>
        )}
      </div>

      <div>
        <p className="stage-label flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-brass-bright">@{handle}</span>
          {item.location && <span>{item.location}</span>}
          {item.timestamp && <span>{formatDate(item.timestamp)}</span>}
        </p>

        {item.caption ? (
          <DialogTitle className="font-display text-bone mt-2 text-lg leading-snug font-normal">
            {truncate(item.caption, 90)}
          </DialogTitle>
        ) : (
          <DialogTitle className="sr-only">Frame</DialogTitle>
        )}

        {item.caption.length > 90 && (
          <DialogDescription className="text-bone-dim mt-2 text-[0.85rem] leading-relaxed">
            {item.caption}
          </DialogDescription>
        )}

        {item.permalink && (
          <a
            href={item.permalink}
            target="_blank"
            rel="noreferrer"
            className="text-brass hover:text-brass-bright mt-4 inline-flex items-center gap-1.5 font-mono text-[0.7rem] tracking-[0.16em] uppercase transition-colors"
          >
            Open on Instagram
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function SlideButton({
  direction,
  onClick,
}: {
  direction: "previous" | "next";
  onClick: () => void;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-brass/40 bg-ink/70 text-bone hover:text-brass-bright hover:border-brass/70 focus-visible:ring-brass absolute top-1/2 flex size-8 -translate-y-1/2 items-center justify-center border transition-colors focus-visible:ring-2 focus-visible:outline-none",
        direction === "previous" ? "left-2" : "right-2",
      )}
    >
      <Icon className="size-4" />
      <span className="sr-only">
        {direction === "previous" ? "Previous slide" : "Next slide"}
      </span>
    </button>
  );
}

export function FrameGrid({
  items,
  handle,
}: {
  items: FeedItem[];
  handle: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = openIndex === null ? null : items[openIndex];

  if (items.length === 0) {
    return (
      <div className="px-5 py-16 text-center sm:px-8">
        <p className="font-display text-bone-dim text-lg">
          Nothing on the wall yet.
        </p>
        <p className="text-smoke mx-auto mt-2 max-w-xs text-[0.8rem] leading-relaxed">
          Add stills to <code className="text-brass">src/content/frames.ts</code>{" "}
          or connect the Instagram feed and this grid fills itself.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Container-relative, because this grid only ever fills half the stage. */}
      <div className="@2xl:grid-cols-3 @5xl:grid-cols-4 grid grid-cols-2 gap-px p-px">
        {items.map((item, index) => {
          const cover = item.slides[0];
          const slides = item.slides.length;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group bg-ink-raised focus-visible:ring-brass relative block aspect-4/5 w-full overflow-hidden text-left focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Still
                media={cover}
                seed={item.id}
                index={index}
                alt={altFor(item)}
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />

              <div
                aria-hidden="true"
                className="from-ink/95 via-ink/25 absolute inset-0 bg-gradient-to-t to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-95"
              />

              {slides > 1 ? (
                <span className="border-brass/50 bg-ink/70 text-brass-bright absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[0.6rem] leading-none">
                  <Images className="size-2.5" />
                  {slides}
                </span>
              ) : (
                cover.videoUrl && (
                  <span className="border-brass/50 bg-ink/70 text-brass-bright absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full border">
                    <Play className="size-2.5 fill-current" />
                  </span>
                )
              )}

              <div className="absolute inset-x-0 bottom-0 translate-y-1.5 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {item.location && (
                  <p className="text-brass-bright flex items-center gap-1 font-mono text-[0.6rem] tracking-[0.16em] uppercase">
                    <MapPin className="size-2.5" />
                    {item.location}
                  </p>
                )}
                {item.caption && (
                  <p className="text-bone mt-1 text-[0.72rem] leading-snug">
                    {truncate(item.caption, 72)}
                  </p>
                )}
              </div>

              <span
                aria-hidden="true"
                className="border-brass/0 group-hover:border-brass/50 absolute inset-1.5 border transition-colors duration-300"
              />
            </button>
          );
        })}
      </div>

      <div className="border-border/70 border-t px-5 py-8 text-center sm:px-8">
        <a
          href={`https://www.instagram.com/${handle}/`}
          target="_blank"
          rel="noreferrer"
          className="text-bone-dim hover:text-brass-bright focus-visible:ring-ring inline-flex items-center gap-2 rounded-xs font-mono text-[0.7rem] tracking-[0.2em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          The rest of the roll on Instagram
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>

      <Dialog
        open={active !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          {active && (
            // Keyed so reopening always starts on the first slide.
            <Lightbox
              key={active.id}
              item={active}
              index={openIndex ?? 0}
              handle={handle}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
