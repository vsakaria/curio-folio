"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Expand } from "lucide-react";

import {
  DIAGRAM_LEGEND,
  DiagramLegendSwatch,
  SystemDiagram,
} from "@/components/system-diagram";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Diagram } from "@/content/diagrams";
import type { Post } from "@/content/posts";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Filter = "all" | "writing" | "diagrams";

type WorkItem =
  | { type: "post"; date: string; post: Post }
  | { type: "diagram"; date: string; diagram: Diagram };

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "Everything" },
  { id: "writing", label: "Writing" },
  { id: "diagrams", label: "Diagrams" },
];

function Kicker({
  label,
  meta,
}: {
  label: string;
  meta: Array<string | undefined>;
}) {
  return (
    <p className="stage-label flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <span className="text-brass-bright">{label}</span>
      {meta.filter(Boolean).map((entry) => (
        <span key={entry} className="flex items-center gap-2.5">
          <span aria-hidden="true" className="bg-smoke/40 h-px w-3" />
          {entry}
        </span>
      ))}
    </p>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-3.5 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="border-border text-smoke rounded-xs px-2 py-0 font-mono text-[0.6rem] tracking-[0.14em] uppercase"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

const CARD_CLASS =
  "group border-border/70 hover:bg-ink-raised/60 focus-visible:ring-brass relative block w-full border-b px-5 py-6 text-left transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none sm:px-8 lg:px-9";

function PostCard({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const body = (
    <>
      <Kicker
        label="Writing"
        meta={[formatDate(post.date), `${post.readingMinutes} min read`]}
      />
      <h3 className="font-display text-bone group-hover:text-brass-bright mt-2.5 text-[1.35rem] leading-tight tracking-[-0.01em] transition-colors lg:text-[1.5rem]">
        {post.title}
      </h3>
      <p className="text-bone-dim mt-2 max-w-prose text-[0.86rem] leading-relaxed">
        {post.excerpt}
      </p>
      <Tags tags={post.tags} />
      <span className="text-smoke group-hover:text-brass mt-4 inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.2em] uppercase transition-colors">
        {post.href ? "Read the article" : "Read the notes"}
        <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
      </span>
    </>
  );

  if (post.href) {
    return (
      <a
        href={post.href}
        target="_blank"
        rel="noreferrer"
        className={CARD_CLASS}
      >
        {body}
      </a>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={CARD_CLASS}>
      {body}
    </button>
  );
}

function DiagramCard({
  diagram,
  onOpen,
}: {
  diagram: Diagram;
  onOpen: () => void;
}) {
  return (
    <button type="button" onClick={onOpen} className={CARD_CLASS}>
      <Kicker
        label="Diagram"
        meta={[formatDate(diagram.date), `${diagram.nodes.length} components`]}
      />
      <h3 className="font-display text-bone group-hover:text-brass-bright mt-2.5 text-[1.35rem] leading-tight tracking-[-0.01em] transition-colors lg:text-[1.5rem]">
        {diagram.title}
      </h3>
      <p className="text-bone-dim mt-2 max-w-prose text-[0.86rem] leading-relaxed">
        {diagram.summary}
      </p>

      {/* Shown as a crop rather than shrunk to fit: at full width the labels
          would be too small to read, and an unreadable diagram is decoration. */}
      <div className="border-border/70 bg-ink group-hover:border-brass/40 relative mt-4 h-40 overflow-hidden border transition-colors lg:h-48">
        <div className="absolute top-0 left-0 w-[140%] origin-top-left opacity-80 transition-opacity duration-500 group-hover:opacity-100">
          <SystemDiagram diagram={diagram} />
        </div>
        <span className="from-ink pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l to-transparent" />
        <span className="from-ink pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t to-transparent" />
        <span className="border-brass/40 bg-ink/90 text-brass-bright absolute right-2 bottom-2 flex items-center gap-1.5 border px-2 py-1 font-mono text-[0.6rem] tracking-[0.16em] uppercase opacity-0 transition-opacity group-hover:opacity-100">
          <Expand className="size-2.5" />
          Open
        </span>
      </div>

      <Tags tags={diagram.tags} />
    </button>
  );
}

export function WorkList({
  posts,
  diagrams,
}: {
  posts: Post[];
  diagrams: Diagram[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openPost, setOpenPost] = useState<Post | null>(null);
  const [openDiagram, setOpenDiagram] = useState<Diagram | null>(null);

  const items = useMemo<WorkItem[]>(() => {
    const merged: WorkItem[] = [
      ...posts.map<WorkItem>((post) => ({
        type: "post",
        date: post.date,
        post,
      })),
      ...diagrams.map<WorkItem>((diagram) => ({
        type: "diagram",
        date: diagram.date,
        diagram,
      })),
    ];

    return merged
      .filter((item) =>
        filter === "all"
          ? true
          : filter === "writing"
            ? item.type === "post"
            : item.type === "diagram",
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [posts, diagrams, filter]);

  return (
    <>
      <div
        role="group"
        aria-label="Filter work"
        className="border-border/70 bg-ink/90 sticky top-0 z-10 flex items-center gap-1 border-b px-5 py-2.5 backdrop-blur-sm sm:px-8 lg:px-9"
      >
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            aria-pressed={filter === entry.id}
            className={cn(
              "focus-visible:ring-ring rounded-xs px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.2em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none",
              filter === entry.id
                ? "text-ink bg-brass"
                : "text-smoke hover:text-bone-dim",
            )}
          >
            {entry.label}
          </button>
        ))}
        <span className="stage-label ml-auto hidden sm:block">
          {items.length} entries
        </span>
      </div>

      <div>
        {items.map((item) =>
          item.type === "post" ? (
            <PostCard
              key={item.post.slug}
              post={item.post}
              onOpen={() => setOpenPost(item.post)}
            />
          ) : (
            <DiagramCard
              key={item.diagram.slug}
              diagram={item.diagram}
              onOpen={() => setOpenDiagram(item.diagram)}
            />
          ),
        )}
      </div>

      <Dialog
        open={openPost !== null}
        onOpenChange={(open) => !open && setOpenPost(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          {openPost && (
            <article>
              <Kicker
                label="Writing"
                meta={[
                  formatDate(openPost.date),
                  `${openPost.readingMinutes} min read`,
                ]}
              />
              <DialogTitle className="font-display text-bone mt-3 text-2xl leading-tight font-normal tracking-[-0.01em]">
                {openPost.title}
              </DialogTitle>
              <DialogDescription className="text-bone-dim mt-3 text-[0.92rem] leading-relaxed">
                {openPost.standfirst}
              </DialogDescription>

              <div className="border-border mt-6 border-t pt-5">
                <p className="stage-label">What it comes down to</p>
                <ul className="mt-3 space-y-3">
                  {openPost.takeaways.map((takeaway) => (
                    <li
                      key={takeaway}
                      className="text-bone-dim flex gap-3 text-[0.86rem] leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-brass/60 mt-2.5 h-px w-4 shrink-0"
                      />
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>

              <Tags tags={openPost.tags} />
            </article>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDiagram !== null}
        onOpenChange={(open) => !open && setOpenDiagram(null)}
      >
        <DialogContent className="sm:max-w-5xl">
          {openDiagram && (
            <article>
              <Kicker label="Diagram" meta={[formatDate(openDiagram.date)]} />
              <DialogTitle className="font-display text-bone mt-3 text-2xl leading-tight font-normal tracking-[-0.01em]">
                {openDiagram.title}
              </DialogTitle>
              <DialogDescription className="text-bone-dim mt-2 max-w-prose text-[0.88rem] leading-relaxed">
                {openDiagram.context}
              </DialogDescription>

              <div className="border-border bg-ink pane-scroll mt-5 overflow-x-auto border p-3">
                {/* Below this width the labels stop being readable, so scroll
                    sideways rather than shrink any further. */}
                <div className="min-w-[900px]">
                  <SystemDiagram diagram={openDiagram} />
                </div>
              </div>
              <p className="stage-label mt-2 sm:hidden">Scroll sideways</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {DIAGRAM_LEGEND.map((entry) => (
                  <span
                    key={entry.kind}
                    className="text-smoke flex items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.14em] uppercase"
                  >
                    <DiagramLegendSwatch kind={entry.kind} />
                    {entry.label}
                  </span>
                ))}
              </div>

              <div className="border-border mt-6 border-t pt-5">
                <p className="stage-label">How to read it</p>
                <ul className="mt-3 grid gap-3 md:grid-cols-2">
                  {openDiagram.notes.map((note) => (
                    <li
                      key={note}
                      className="text-bone-dim flex gap-3 text-[0.86rem] leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-brass/60 mt-2.5 h-px w-4 shrink-0"
                      />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              <Tags tags={openDiagram.tags} />
            </article>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
