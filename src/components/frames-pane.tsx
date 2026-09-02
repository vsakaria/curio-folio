import { ArrowUpRight, Info } from "lucide-react";

import { FrameGrid } from "@/components/frame-grid";
import { Pane } from "@/components/pane";
import { panes, site } from "@/content/site";
import { getFramesFeed } from "@/lib/behold";

function CuratedNotice({ notice }: { notice: string | null }) {
  return (
    <div className="border-brass/25 bg-brass/[0.045] text-bone-dim m-px flex items-start gap-3 border px-4 py-3">
      <Info className="text-brass mt-px size-3.5 shrink-0" />
      <p className="text-[0.72rem] leading-relaxed">
        {notice ?? "The live feed is not connected yet."} These plates stand in
        for photographs. Save stills into{" "}
        <code className="text-brass font-mono">public/frames/</code>, or point{" "}
        <code className="text-brass font-mono">BEHOLD_FEED_URL</code> at a
        Behold feed for the live grid — the README has both.
      </p>
    </div>
  );
}

export async function FramesPane() {
  // No limit: the pane scrolls on its own, so it carries the whole feed.
  const feed = await getFramesFeed();

  // Once real photographs are in place the grid speaks for itself, so the
  // notice is only worth showing while every tile is still a drawn plate.
  const showNotice =
    feed.source === "curated" &&
    feed.items.every((item) => item.slides.every((slide) => !slide.imageUrl));

  return (
    <Pane
      {...panes.left}
      className="lg:bg-[var(--ink-stage-left)]"
      aside={
        <a
          href={`https://www.instagram.com/${site.instagramHandle}/`}
          target="_blank"
          rel="noreferrer"
          className="text-bone-dim hover:text-brass-bright focus-visible:ring-ring group flex items-center gap-1.5 rounded-xs font-mono text-[0.7rem] tracking-[0.1em] transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <span
            aria-hidden="true"
            className="bg-flash inline-block size-1.5 rounded-full"
          />
          @{site.instagramHandle}
          <ArrowUpRight className="size-3 opacity-60 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
        </a>
      }
    >
      {showNotice && <CuratedNotice notice={feed.notice} />}
      <FrameGrid items={feed.items} handle={site.instagramHandle} />
    </Pane>
  );
}
