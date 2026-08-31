import type {
  Diagram,
  DiagramEdge,
  DiagramNode,
  DiagramNodeKind,
} from "@/content/diagrams";
import { cn } from "@/lib/utils";

const COL_W = 178;
const COL_GAP = 74;
const ROW_H = 66;
const ROW_GAP = 36;
const PAD_X = 26;
const LANE_H = 40;
const CHANNEL = 26;
const CORNER = 9;

type Point = [number, number];

type Box = {
  node: DiagramNode;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const KIND_STYLE: Record<
  DiagramNodeKind,
  { stroke: string; fill: string; dash?: string; accent: string }
> = {
  client: {
    stroke: "var(--bone-dim)",
    fill: "color-mix(in oklab, var(--bone) 5%, transparent)",
    accent: "var(--bone)",
  },
  edge: {
    stroke: "var(--olive-bright)",
    fill: "color-mix(in oklab, var(--olive) 42%, transparent)",
    accent: "var(--olive-bright)",
  },
  service: {
    stroke: "var(--brass)",
    fill: "color-mix(in oklab, var(--brass) 10%, transparent)",
    accent: "var(--brass-bright)",
  },
  store: {
    stroke: "#a8434a",
    fill: "color-mix(in oklab, var(--oxblood) 34%, transparent)",
    accent: "#e08a90",
  },
  queue: {
    stroke: "var(--brass)",
    fill: "color-mix(in oklab, var(--brass) 5%, transparent)",
    dash: "5 4",
    accent: "var(--brass-bright)",
  },
  external: {
    stroke: "var(--smoke)",
    fill: "transparent",
    dash: "3 4",
    accent: "var(--bone-dim)",
  },
};

export const DIAGRAM_LEGEND: Array<{ kind: DiagramNodeKind; label: string }> = [
  { kind: "client", label: "Client" },
  { kind: "edge", label: "Edge" },
  { kind: "service", label: "Service" },
  { kind: "store", label: "Datastore" },
  { kind: "queue", label: "Log / queue" },
  { kind: "external", label: "Third party" },
];

/**
 * SVG will happily let a label run out of its box, so shrink the type until it
 * fits rather than clipping it. Advance widths are approximations per family.
 */
function fitFontSize(
  text: string,
  maxWidth: number,
  baseSize: number,
  advance: number,
) {
  const width = text.length * baseSize * advance;
  if (width <= maxWidth) return baseSize;
  return Math.max(baseSize * (maxWidth / width), 7);
}

function dedupe(points: Point[]): Point[] {
  return points.filter(
    (point, i) =>
      i === 0 ||
      point[0] !== points[i - 1][0] ||
      point[1] !== points[i - 1][1],
  );
}

/** Orthogonal polyline with rounded corners. */
function orthPath(rawPoints: Point[], radius = CORNER): string {
  const points = dedupe(rawPoints);
  if (points.length < 2) return "";

  let d = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const inLength = Math.hypot(cx - px, cy - py);
    const outLength = Math.hypot(nx - cx, ny - cy);
    if (inLength === 0 || outLength === 0) continue;

    const r = Math.min(radius, inLength / 2, outLength / 2);
    const inX = (cx - px) / inLength;
    const inY = (cy - py) / inLength;
    const outX = (nx - cx) / outLength;
    const outY = (ny - cy) / outLength;

    d += ` L ${cx - inX * r} ${cy - inY * r}`;
    d += ` Q ${cx} ${cy} ${cx + outX * r} ${cy + outY * r}`;
  }

  const last = points[points.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

/** Midpoint by arc length, used to sit the label on the wire. */
function midpointOf(rawPoints: Point[]): Point {
  const points = dedupe(rawPoints);
  const lengths = points
    .slice(1)
    .map((point, i) => Math.hypot(point[0] - points[i][0], point[1] - points[i][1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);

  let travelled = 0;
  for (let i = 0; i < lengths.length; i += 1) {
    if (travelled + lengths[i] >= total / 2) {
      const ratio = lengths[i] === 0 ? 0 : (total / 2 - travelled) / lengths[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * ratio,
        points[i][1] + (points[i + 1][1] - points[i][1]) * ratio,
      ];
    }
    travelled += lengths[i];
  }

  return points[0];
}

function routeEdge(
  edge: DiagramEdge,
  from: Box,
  to: Box,
  boxes: Box[],
  overY: number,
  underY: number,
): Point[] {
  const route = edge.route ?? "auto";

  if (route === "over" || route === "under") {
    const goingUp = route === "over";
    const channelY = goingUp ? overY : underY;
    const goingRight = to.node.col >= from.node.col;

    // Leave the source towards the target, and come into the target's near
    // side offset from its centre so a return edge never lands on top of the
    // outbound one.
    const exitX = from.cx + (goingRight ? 24 : -24);
    const sideX = goingRight ? from.right + 22 : from.left - 22;
    // Kept well clear of the mid-gap lane used by ordinary elbow edges.
    const approachX = goingRight ? to.left - 16 : to.right + 16;
    const entryX = goingRight ? to.left : to.right;
    const entryY = to.cy + (goingUp ? -13 : 13);

    // Dropping straight to the channel would cut through anything stacked
    // in the same column, so step sideways into the column gap first.
    const obstructed = boxes.some(
      (box) =>
        box.node.col === from.node.col &&
        (goingUp
          ? box.node.row < from.node.row
          : box.node.row > from.node.row),
    );

    const start: Point[] = obstructed
      ? [
          [exitX, goingUp ? from.top : from.bottom],
          [exitX, goingUp ? from.top - ROW_GAP / 2 : from.bottom + ROW_GAP / 2],
          [sideX, goingUp ? from.top - ROW_GAP / 2 : from.bottom + ROW_GAP / 2],
          [sideX, channelY],
        ]
      : [
          [exitX, goingUp ? from.top : from.bottom],
          [exitX, channelY],
        ];

    return [
      ...start,
      [approachX, channelY],
      [approachX, entryY],
      [entryX, entryY],
    ];
  }

  if (from.node.col === to.node.col) {
    const downwards = to.node.row > from.node.row;
    return [
      [from.cx, downwards ? from.bottom : from.top],
      [to.cx, downwards ? to.top : to.bottom],
    ];
  }

  const backwards = to.node.col < from.node.col;
  const midX = backwards
    ? (from.left + to.right) / 2
    : (from.right + to.left) / 2;

  return [
    [backwards ? from.left : from.right, from.cy],
    [midX, from.cy],
    [midX, to.cy],
    [backwards ? to.right : to.left, to.cy],
  ];
}

export function SystemDiagram({
  diagram,
  className,
}: {
  diagram: Diagram;
  className?: string;
}) {
  const cols = Math.max(diagram.lanes.length, ...diagram.nodes.map((n) => n.col + 1));
  const rows = Math.max(...diagram.nodes.map((n) => n.row + 1));

  const usesOver = diagram.edges.some((edge) => edge.route === "over");
  const usesUnder = diagram.edges.some((edge) => edge.route === "under");

  const topPad = LANE_H + (usesOver ? CHANNEL : 8);
  const bottomPad = usesUnder ? CHANNEL + 14 : 14;
  const gridW = cols * COL_W + (cols - 1) * COL_GAP;
  const gridH = rows * ROW_H + (rows - 1) * ROW_GAP;
  const width = gridW + PAD_X * 2;
  const height = gridH + topPad + bottomPad;

  const boxes = new Map<string, Box>();
  for (const node of diagram.nodes) {
    const x = PAD_X + node.col * (COL_W + COL_GAP);
    const y = topPad + node.row * (ROW_H + ROW_GAP);
    boxes.set(node.id, {
      node,
      x,
      y,
      w: COL_W,
      h: ROW_H,
      cx: x + COL_W / 2,
      cy: y + ROW_H / 2,
      left: x,
      right: x + COL_W,
      top: y,
      bottom: y + ROW_H,
    });
  }

  const allBoxes = [...boxes.values()];
  const overY = topPad - CHANNEL + 4;
  const underY = topPad + gridH + CHANNEL - 6;
  const uid = `dg-${diagram.slug}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`${diagram.title}. ${diagram.summary}`}
    >
      <defs>
        <marker
          id={`${uid}-arrow`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--brass)" />
        </marker>
      </defs>

      {diagram.lanes.map((lane, i) => {
        const x = PAD_X + i * (COL_W + COL_GAP);
        return (
          <g key={lane}>
            {/* Bands rather than rules: the grouping reads without adding
                vertical lines for edges to get lost against. */}
            {i % 2 === 1 && (
              <rect
                x={x - COL_GAP / 2}
                y={LANE_H - 16}
                width={COL_W + COL_GAP}
                height={height - LANE_H + 10}
                fill="var(--bone)"
                opacity="0.018"
              />
            )}
            <text
              x={x + COL_W / 2}
              y={LANE_H - 22}
              textAnchor="middle"
              fill="var(--smoke)"
              fontSize="10"
              letterSpacing="2.4"
              fontFamily="var(--font-mono), ui-monospace, monospace"
            >
              {lane.toUpperCase()}
            </text>
          </g>
        );
      })}

      {diagram.edges.map((edge) => {
        const from = boxes.get(edge.from);
        const to = boxes.get(edge.to);
        if (!from || !to) return null;

        const points = routeEdge(edge, from, to, allBoxes, overY, underY);
        const [labelX, labelY] = midpointOf(points);
        const labelWidth = edge.label ? edge.label.length * 5.4 + 12 : 0;

        return (
          <g key={`${edge.from}-${edge.to}-${edge.label ?? ""}`}>
            <path
              d={orthPath(points)}
              fill="none"
              stroke="var(--brass)"
              strokeOpacity={edge.dashed ? 0.5 : 0.72}
              strokeWidth="1.25"
              strokeDasharray={edge.dashed ? "5 5" : undefined}
              markerEnd={`url(#${uid}-arrow)`}
              markerStart={
                edge.bidirectional ? `url(#${uid}-arrow)` : undefined
              }
            />
            {edge.label && (
              <>
                <rect
                  x={labelX - labelWidth / 2}
                  y={labelY - 8}
                  width={labelWidth}
                  height="16"
                  rx="2"
                  fill="var(--ink)"
                />
                <text
                  x={labelX}
                  y={labelY + 3.5}
                  textAnchor="middle"
                  fill="var(--bone-dim)"
                  fontSize="9.5"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                >
                  {edge.label}
                </text>
              </>
            )}
          </g>
        );
      })}

      {diagram.nodes.map((node) => {
        const box = boxes.get(node.id)!;
        const style = KIND_STYLE[node.kind];
        const maxTextWidth = COL_W - 20;
        const labelSize = fitFontSize(node.label, maxTextWidth, 13.5, 0.53);
        const detailSize = node.detail
          ? fitFontSize(node.detail, maxTextWidth, 9.5, 0.6)
          : 0;
        return (
          <g key={node.id}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              rx="2"
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth="1.1"
              strokeDasharray={style.dash}
            />
            <rect
              x={box.x}
              y={box.y}
              width="3"
              height={box.h}
              fill={style.accent}
              opacity="0.75"
            />
            <text
              x={box.cx + 2}
              y={node.detail ? box.cy - 2 : box.cy + 4}
              textAnchor="middle"
              fill="var(--bone)"
              fontSize={labelSize}
              fontFamily="var(--font-sans), system-ui, sans-serif"
            >
              {node.label}
            </text>
            {node.detail && (
              <text
                x={box.cx + 2}
                y={box.cy + 15}
                textAnchor="middle"
                fill="var(--smoke)"
                fontSize={detailSize}
                fontFamily="var(--font-mono), ui-monospace, monospace"
              >
                {node.detail}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function DiagramLegendSwatch({ kind }: { kind: DiagramNodeKind }) {
  const style = KIND_STYLE[kind];
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3 w-6 shrink-0 rounded-[2px] border"
      style={{
        background: style.fill,
        borderColor: style.stroke,
        borderStyle: style.dash ? "dashed" : "solid",
      }}
    />
  );
}
