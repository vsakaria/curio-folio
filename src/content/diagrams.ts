/**
 * System diagrams shown in the right-hand pane.
 *
 * Diagrams are declared as data, not drawn by hand: place each node on a
 * column/row grid and the renderer in `src/components/system-diagram.tsx`
 * handles geometry, orthogonal edge routing and the legend. Adding a diagram
 * means adding an entry here.
 */

export type DiagramNodeKind =
  | "client"
  | "edge"
  | "service"
  | "store"
  | "queue"
  | "external";

export type DiagramNode = {
  id: string;
  label: string;
  detail?: string;
  kind: DiagramNodeKind;
  col: number;
  row: number;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  bidirectional?: boolean;
  /**
   * `auto` elbows through the gap between the two columns. `over` and `under`
   * send the edge around the outside of the grid, which is how backward and
   * column-skipping edges stay clear of the nodes in between.
   */
  route?: "auto" | "over" | "under";
};

export type Diagram = {
  slug: string;
  title: string;
  /** Shown on the card. */
  summary: string;
  /** Where the diagram came from, in one line. */
  context: string;
  date: string;
  tags: string[];
  lanes: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  /** How to read it — shown beside the diagram when opened. */
  notes: string[];
};

export const diagrams: Diagram[] = [
  {
    slug: "order-pipeline",
    title: "Order pipeline, after the rewrite",
    summary:
      "Transactional outbox in front of the event bus, so an order is never accepted without the events that follow it.",
    context:
      "Replaced a dual-write between the orders database and the message broker that had been silently dropping events under load.",
    date: "2026-05-20",
    tags: ["Event-driven", "Outbox", "Kafka"],
    lanes: ["Client", "Edge", "Write path", "Fan-out", "Consumers"],
    nodes: [
      {
        id: "storefront",
        label: "Storefront",
        detail: "Web + iOS",
        kind: "client",
        col: 0,
        row: 1,
      },
      {
        id: "gateway",
        label: "API gateway",
        detail: "Auth · rate limit · idempotency key",
        kind: "edge",
        col: 1,
        row: 1,
      },
      {
        id: "orders",
        label: "Order service",
        detail: "Validates and persists intent",
        kind: "service",
        col: 2,
        row: 0,
      },
      {
        id: "ordersdb",
        label: "Orders",
        detail: "Postgres · source of truth",
        kind: "store",
        col: 2,
        row: 1,
      },
      {
        id: "outbox",
        label: "Outbox table",
        detail: "Written in the same transaction",
        kind: "queue",
        col: 2,
        row: 2,
      },
      {
        id: "bus",
        label: "Event bus",
        detail: "Kafka · order.*",
        kind: "queue",
        col: 3,
        row: 1,
      },
      { id: "payments", label: "Payments", kind: "service", col: 4, row: 0 },
      { id: "inventory", label: "Inventory", kind: "service", col: 4, row: 1 },
      {
        id: "notify",
        label: "Notifications",
        kind: "service",
        col: 4,
        row: 2,
      },
      {
        id: "readmodel",
        label: "Warehouse read model",
        detail: "Rebuilt from the log",
        kind: "store",
        col: 4,
        row: 3,
      },
    ],
    edges: [
      { from: "storefront", to: "gateway" },
      { from: "gateway", to: "orders", label: "POST /orders" },
      { from: "orders", to: "ordersdb" },
      { from: "ordersdb", to: "outbox", label: "one transaction" },
      { from: "outbox", to: "bus", label: "relay polls" },
      { from: "bus", to: "payments" },
      { from: "bus", to: "inventory" },
      { from: "bus", to: "notify" },
      { from: "bus", to: "readmodel" },
      {
        from: "payments",
        to: "bus",
        label: "payment.settled",
        dashed: true,
        route: "over",
      },
    ],
    notes: [
      "The order write and its outbox row commit together, so there is no window where the database and the bus disagree.",
      "A relay process is the only thing allowed to publish. Consumers never write back through the order service.",
      "Payments emits its own settlement event rather than calling back, which keeps the fan-out one-directional.",
      "The warehouse read model is disposable — it can be dropped and rebuilt from the log at any time.",
    ],
  },
  {
    slug: "catalogue-read-path",
    title: "Read path for a multi-region catalogue",
    summary:
      "Three layers of cache with an explicit freshness budget at each one, and a single writer region.",
    context:
      "Built to bring catalogue p99 under 150ms outside Europe without giving merchandisers a stale-looking site.",
    date: "2025-08-14",
    tags: ["Caching", "Multi-region", "Latency"],
    lanes: ["Reader", "Edge", "Region", "Data", "Refresh"],
    nodes: [
      {
        id: "browser",
        label: "Browser",
        detail: "Anywhere",
        kind: "client",
        col: 0,
        row: 1,
      },
      {
        id: "cdn",
        label: "Edge cache",
        detail: "stale-while-revalidate, 60s",
        kind: "edge",
        col: 1,
        row: 1,
      },
      {
        id: "bff",
        label: "BFF",
        detail: "Composes the page payload",
        kind: "service",
        col: 2,
        row: 0,
      },
      {
        id: "redis",
        label: "Regional cache",
        detail: "Redis · hot keys, 5m",
        kind: "store",
        col: 2,
        row: 1,
      },
      {
        id: "catalogue",
        label: "Catalogue API",
        detail: "Region-local",
        kind: "service",
        col: 2,
        row: 2,
      },
      {
        id: "replica",
        label: "Read replica",
        detail: "Same region",
        kind: "store",
        col: 3,
        row: 1,
      },
      {
        id: "primary",
        label: "Primary",
        detail: "eu-west · only writer",
        kind: "store",
        col: 3,
        row: 2,
      },
      {
        id: "indexer",
        label: "Indexer",
        detail: "Pre-warms on change",
        kind: "service",
        col: 4,
        row: 1,
      },
    ],
    edges: [
      { from: "browser", to: "cdn" },
      { from: "cdn", to: "bff", label: "miss" },
      { from: "bff", to: "redis" },
      { from: "redis", to: "catalogue", label: "miss" },
      { from: "catalogue", to: "replica" },
      { from: "primary", to: "replica", label: "replication", dashed: true },
      { from: "primary", to: "indexer", label: "change stream", dashed: true },
      {
        from: "indexer",
        to: "redis",
        label: "pre-warm",
        dashed: true,
        route: "under",
      },
    ],
    notes: [
      "Every layer has a stated freshness budget. Merchandisers were given those numbers up front, which ended the argument about whether the site was 'broken'.",
      "The edge serves stale while it revalidates, so a cold regional cache never becomes a user-visible latency spike.",
      "Only the primary accepts writes. Replicas being read-only is what makes adding a region a config change.",
      "Pre-warming from the change stream turned the miss rate on freshly-edited products from the worst case into the best one.",
    ],
  },
  {
    slug: "identity-and-session",
    title: "Session and identity, end to end",
    summary:
      "Claims are resolved once at the edge and passed down, so no product service ever handles a raw credential.",
    context:
      "Drawn for a security review; it became the reference diagram every new service was onboarded against.",
    date: "2025-03-09",
    tags: ["Identity", "OIDC", "Security"],
    lanes: ["Client", "Edge", "Identity", "Product"],
    nodes: [
      {
        id: "client",
        label: "Browser / iOS",
        detail: "Holds an opaque cookie",
        kind: "client",
        col: 0,
        row: 1,
      },
      {
        id: "middleware",
        label: "Edge middleware",
        detail: "Cookie → signed claims",
        kind: "edge",
        col: 1,
        row: 1,
      },
      {
        id: "idp",
        label: "OIDC provider",
        detail: "Google · Apple · SSO",
        kind: "external",
        col: 2,
        row: 0,
      },
      {
        id: "auth",
        label: "Auth service",
        detail: "Issues and rotates sessions",
        kind: "service",
        col: 2,
        row: 1,
      },
      {
        id: "sessions",
        label: "Session store",
        detail: "Redis · sliding 30m",
        kind: "store",
        col: 2,
        row: 2,
      },
      {
        id: "product",
        label: "Product APIs",
        detail: "Trust the claims header only",
        kind: "service",
        col: 3,
        row: 1,
      },
      {
        id: "audit",
        label: "Audit trail",
        detail: "Append-only",
        kind: "store",
        col: 3,
        row: 2,
      },
    ],
    edges: [
      { from: "client", to: "middleware" },
      { from: "middleware", to: "auth", label: "resolve" },
      {
        from: "auth",
        to: "idp",
        label: "code exchange",
        bidirectional: true,
      },
      { from: "auth", to: "sessions", label: "issue / rotate" },
      { from: "auth", to: "product", label: "claims" },
      { from: "product", to: "audit", dashed: true },
      { from: "auth", to: "audit", dashed: true, route: "under" },
    ],
    notes: [
      "The cookie is opaque. Nothing downstream can read it, so nothing downstream can be tricked by it.",
      "Claims are resolved exactly once per request at the edge and travel as a signed header with a short expiry.",
      "Sessions slide rather than expire hard, and rotation happens on privilege change rather than on a timer.",
      "Both the auth service and every product API write to the same append-only trail, so the audit story is one query rather than five.",
    ],
  },
];
