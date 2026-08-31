import { Pane } from "@/components/pane";
import { WorkList } from "@/components/work-list";
import { diagrams } from "@/content/diagrams";
import { posts } from "@/content/posts";
import { panes, site, socials } from "@/content/site";

function Colophon() {
  const email = socials.find((social) => social.label === "Email");

  return (
    <footer className="border-border/70 border-t px-5 py-8 sm:px-8 lg:px-9">
      <p className="font-display text-bone-dim max-w-sm text-base leading-snug">
        Working on something that needs a diagram before it needs a sprint?
      </p>
      {email && (
        <a
          href={email.href}
          className="text-brass hover:text-brass-bright focus-visible:ring-ring mt-3 inline-block rounded-xs font-mono text-[0.72rem] tracking-[0.14em] transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {email.handle}
        </a>
      )}
      <p className="stage-label mt-6">
        {site.name} · {site.location} · MMXXVI
      </p>
    </footer>
  );
}

export function WorkPane() {
  return (
    <Pane
      {...panes.right}
      className="lg:bg-[var(--ink-stage-right)]"
      aside={
        <p className="stage-label">
          {posts.length} pieces · {diagrams.length} diagrams
        </p>
      }
    >
      <WorkList posts={posts} diagrams={diagrams} />
      <Colophon />
    </Pane>
  );
}
