import { ArrowUpRight, Info } from "lucide-react";

import { FrameGrid } from "@/components/frame-grid";
import { Pane } from "@/components/pane";
import { panes, site } from "@/content/site";
import { getInstagramFeed } from "@/lib/instagram";

function CuratedNotice({ notice }: { notice: string | null }) {
  return (
    <div className="border-brass/25 bg-brass/[0.045] text-bone-dim m-px flex items-start gap-3 border px-4 py-3">
      <Info className="text-brass mt-px size-3.5 shrink-0" />
      <p className="text-[0.72rem] leading-relaxed">
        {notice ?? "The live feed is not connected yet."} These are curated
        stills. Add an{" "}
        <code className="text-brass font-mono">INSTAGRAM_ACCESS_TOKEN</code> and
        the real grid takes over — the README has the four steps.
      </p>
    </div>
  );
}

export async function FramesPane() {
  const feed = await getInstagramFeed(12);

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
      {feed.source === "curated" && <CuratedNotice notice={feed.notice} />}
      <FrameGrid items={feed.items} handle={site.instagramHandle} />
    </Pane>
  );
}
