import { FramesPane } from "@/components/frames-pane";
import { Masthead } from "@/components/masthead";
import { SplitStage } from "@/components/split-stage";
import { WorkPane } from "@/components/work-pane";
import { panes } from "@/content/site";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <a
        href={`#${panes.right.id}`}
        className="focus:bg-brass focus:text-ink sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:font-mono focus:text-xs"
      >
        Skip to the work
      </a>

      <Masthead />

      <SplitStage
        left={<FramesPane />}
        right={<WorkPane />}
        labels={{ left: panes.left.title, right: panes.right.title }}
      />
    </main>
  );
}
