/**
 * Writing shown in the right-hand pane.
 *
 * Two ways to use a post:
 *  - Give it an `href` and the card becomes an outbound link to the real article.
 *  - Leave `href` off and the card opens a reading panel built from `standfirst`
 *    and `takeaways`, so nothing on the page ever points at a dead URL.
 */

export type Post = {
  slug: string;
  title: string;
  /** One-line hook shown on the card. */
  excerpt: string;
  /** Opening paragraph shown in the reading panel. */
  standfirst: string;
  takeaways: string[];
  date: string;
  readingMinutes: number;
  tags: string[];
  href?: string;
};

export const posts: Post[] = [
  {
    slug: "the-diagram-is-the-deliverable",
    title: "The diagram is the deliverable",
    excerpt:
      "If four engineers draw the same system four different ways, you do not have a system yet.",
    standfirst:
      "Architecture documents rot because nobody reads prose under pressure. A diagram survives the meeting because it is the only artefact everyone can point at simultaneously. I started treating the diagram as the primary deliverable and the prose as the appendix, and design reviews got materially shorter.",
    takeaways: [
      "Draw the failure path before the happy path — it is where the disagreements live.",
      "One diagram, one question. A picture that answers three questions answers none of them well.",
      "Version diagrams next to the code they describe, not in a wiki nobody has write access to.",
      "If a box needs a paragraph to explain it, it is two boxes.",
    ],
    date: "2026-06-18",
    readingMinutes: 7,
    tags: ["Architecture", "Craft"],
  },
  {
    slug: "idempotency-is-a-product-decision",
    title: "Idempotency is a product decision",
    excerpt:
      "Retries are cheap. Deciding what a duplicate actually means to the business is not.",
    standfirst:
      "Every team reaches for an idempotency key eventually, usually after the second duplicate charge. The hard part was never the key — it was agreeing on the window in which two requests count as the same request, and that turns out to be a question for the people who own the refund policy, not the people who own the queue.",
    takeaways: [
      "The deduplication window is a business rule. Write it down where non-engineers can find it.",
      "Store the response, not just the key, so a retry returns the original outcome.",
      "Natural keys beat generated ones when the client can be trusted to produce them.",
      "Measure duplicate rate as a product metric — it tells you where clients are timing out.",
    ],
    date: "2026-04-02",
    readingMinutes: 9,
    tags: ["Distributed systems", "APIs"],
  },
  {
    slug: "caches-lie-about-what-you-measure",
    title: "Caches lie about what you measure",
    excerpt:
      "A 98% hit rate looked like a win right up until we plotted the misses against revenue.",
    standfirst:
      "Hit rate is the metric everyone reports and the one that hides the most. Our misses were not evenly distributed — they clustered on exactly the catalogue pages that converted best, because those were the ones changing most often. The fix was not a bigger cache. It was a different key.",
    takeaways: [
      "Segment hit rate by the thing the cache is protecting, not by the cache itself.",
      "Stale-while-revalidate turns a latency problem into a freshness budget you can negotiate.",
      "Cache stampedes show up as a p99 cliff long before they show up as an outage.",
      "The best cache invalidation strategy is a shorter TTL and a boring life.",
    ],
    date: "2026-02-11",
    readingMinutes: 6,
    tags: ["Performance", "Distributed systems"],
  },
  {
    slug: "shooting-film-made-me-a-better-engineer",
    title: "Shooting film made me a better engineer",
    excerpt:
      "Thirty-six frames is a constraint, and constraints are the only thing that ever improved my judgement.",
    standfirst:
      "A roll of film costs enough per frame that you stop spraying. You look longer, you commit once, and you find out three weeks later whether you were right. That feedback loop is terrible for photography and excellent for teaching you to think before you act — which is roughly the discipline I have been trying to bring back to code review.",
    takeaways: [
      "Cheap iteration is not free iteration; it just moves the cost somewhere you are not looking.",
      "A long feedback loop forces you to build a model rather than guess and check.",
      "Composition is scoping. Decide what is outside the frame first.",
      "The photographs I like most are the ones I nearly did not take.",
    ],
    date: "2025-11-27",
    readingMinutes: 5,
    tags: ["Essay", "Photography"],
  },
  {
    slug: "on-call-is-a-design-review",
    title: "On-call is a design review that arrives late",
    excerpt:
      "Every page is feedback on a decision somebody made months ago, usually with good intentions.",
    standfirst:
      "The most useful architecture input I have ever received arrived at 03:12 on a Tuesday. Treating incidents as delayed design review — rather than as operational noise to be absorbed — changed which alerts we kept and, more importantly, which services we agreed to stop building.",
    takeaways: [
      "An alert with no documented action is a feeling, not a signal.",
      "Track pages per service per week and put it in the same review as the roadmap.",
      "The postmortem action item that matters is the one that deletes something.",
      "Rotate the people who wrote the service onto the rota that carries it.",
    ],
    date: "2025-09-05",
    readingMinutes: 8,
    tags: ["Reliability", "Teams"],
  },
];
