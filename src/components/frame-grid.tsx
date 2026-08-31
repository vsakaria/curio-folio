"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, MapPin, Play } from "lucide-react";

import { FramePlate } from "@/components/frame-plate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FeedItem } from "@/lib/instagram";
import { formatDate, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";

function Visual({
  item,
  index,
  sizes,
  className,
}: {
  item: FeedItem;
  index: number;
  sizes: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!item.imageUrl || broken) {
    return (
      <FramePlate
        seed={item.id}
        index={index}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={item.imageUrl}
      alt={item.caption ? truncate(item.caption, 120) : "Instagram photograph"}
      fill
      sizes={sizes}
      onError={() => setBroken(true)}
      className={cn("object-cover", className)}
    />
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
      <div className="@4xl:grid-cols-3 grid grid-cols-2 gap-px p-px">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group bg-ink-raised focus-visible:ring-brass relative block aspect-4/5 w-full overflow-hidden text-left focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
          >
            <Visual
              item={item}
              index={index}
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />

            <div
              aria-hidden="true"
              className="from-ink/95 via-ink/25 absolute inset-0 bg-gradient-to-t to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-95"
            />

            {item.isVideo && (
              <span className="border-brass/50 bg-ink/70 text-brass-bright absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full border">
                <Play className="size-2.5 fill-current" />
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 translate-y-1.5 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {item.location && (
                <p className="text-brass-bright flex items-center gap-1 font-mono text-[0.6rem] tracking-[0.16em] uppercase">
                  <MapPin className="size-2.5" />
                  {item.location}
                </p>
              )}
              <p className="text-bone mt-1 text-[0.72rem] leading-snug">
                {truncate(item.caption || "Untitled", 72)}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="border-brass/0 group-hover:border-brass/50 absolute inset-1.5 border transition-colors duration-300"
            />
          </button>
        ))}
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
        <DialogContent className="sm:max-w-2xl">
          {active && (
            <div className="grid gap-5">
              <div className="bg-ink relative aspect-4/5 w-full overflow-hidden sm:aspect-3/2">
                <Visual
                  item={active}
                  index={openIndex ?? 0}
                  sizes="(max-width: 640px) 92vw, 640px"
                />
              </div>

              <div>
                <p className="stage-label flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-brass-bright">@{handle}</span>
                  {active.location && <span>{active.location}</span>}
                  {active.timestamp && (
                    <span>{formatDate(active.timestamp)}</span>
                  )}
                </p>

                <DialogTitle className="font-display text-bone mt-2 text-lg leading-snug font-normal">
                  {truncate(active.caption || "Untitled frame", 90)}
                </DialogTitle>

                {active.caption.length > 90 && (
                  <DialogDescription className="text-bone-dim mt-2 text-[0.85rem] leading-relaxed">
                    {active.caption}
                  </DialogDescription>
                )}

                {active.permalink && (
                  <a
                    href={active.permalink}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
