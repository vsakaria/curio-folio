/**
 * A deterministic, seeded plate drawn for any frame that has no photograph yet.
 *
 * The point is that an unconnected feed should still look art-directed: these
 * read as duotone contact-sheet prints rather than as grey placeholder boxes.
 * The same id always produces the same plate.
 */

const PALETTES: Array<{ from: string; to: string; mark: string }> = [
  { from: "#7e1d24", to: "#1a0d0c", mark: "#ddb877" },
  { from: "#3c4331", to: "#0d0f0c", mark: "#b58a4a" },
  { from: "#b58a4a", to: "#17120c", mark: "#ece2d0" },
  { from: "#2a2f3d", to: "#0b0a09", mark: "#b58a4a" },
  { from: "#c8102e", to: "#190a0b", mark: "#ece2d0" },
  { from: "#5c4a2a", to: "#100c07", mark: "#e3c98f" },
  { from: "#1f3b3a", to: "#080d0d", mark: "#8fb8ae" },
  { from: "#4a2338", to: "#120a10", mark: "#d99bb4" },
];

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomiser(seed: number) {
  let state = seed || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function FramePlate({
  seed,
  index,
  className,
}: {
  seed: string;
  index: number;
  className?: string;
}) {
  const numericSeed = hashSeed(seed);
  const random = randomiser(numericSeed);
  const palette = PALETTES[numericSeed % PALETTES.length];
  const uid = `plate-${numericSeed.toString(36)}`;

  const angle = Math.round(random() * 320 - 160);
  const orbX = 14 + random() * 72;
  const orbY = 14 + random() * 70;
  const orbR = 14 + random() * 30;
  const horizonY = 34 + random() * 60;
  const horizonTilt = random() * 22 - 11;
  const horizonDepth = 8 + random() * 34;
  const bandY = 18 + random() * 80;
  const bandH = 0.6 + random() * 2.6;
  const arcSweep = 24 + random() * 62;
  const frequency = (0.01 + random() * 0.03).toFixed(3);
  // Kept fine so the halftone still reads as texture when a plate is blown up
  // to fill the lightbox rather than a thumbnail.
  const dotGap = 2.2 + random() * 1.8;
  const dotAngle = Math.round(random() * 90);
  const composition = Math.floor(random() * 3);
  const stamp = `${String((numericSeed % 36) + 1).padStart(2, "0")}${String.fromCharCode(65 + (index % 6))}`;

  return (
    <svg
      viewBox="0 0 100 125"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id={`${uid}-wash`}
          gradientTransform={`rotate(${angle} 0.5 0.5)`}
        >
          <stop offset="0%" stopColor={palette.from} stopOpacity="0.95" />
          <stop offset="58%" stopColor={palette.to} stopOpacity="0.98" />
          <stop offset="100%" stopColor="#080706" stopOpacity="1" />
        </linearGradient>

        <radialGradient id={`${uid}-orb`}>
          <stop offset="0%" stopColor={palette.mark} stopOpacity="0.5" />
          <stop offset="70%" stopColor={palette.mark} stopOpacity="0.06" />
          <stop offset="100%" stopColor={palette.mark} stopOpacity="0" />
        </radialGradient>

        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves="3"
            seed={numericSeed % 1000}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <pattern
          id={`${uid}-halftone`}
          width={dotGap}
          height={dotGap}
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${dotAngle})`}
        >
          <circle
            cx={dotGap / 2}
            cy={dotGap / 2}
            r={dotGap * 0.19}
            fill={palette.mark}
          />
        </pattern>
      </defs>

      <rect width="100" height="125" fill="#0b0a09" />
      <rect width="100" height="125" fill={`url(#${uid}-wash)`} />
      <rect
        width="100"
        height="125"
        filter={`url(#${uid}-grain)`}
        opacity="0.3"
        style={{ mixBlendMode: "overlay" }}
      />
      <circle cx={orbX} cy={orbY} r={orbR} fill={`url(#${uid}-orb)`} />

      {/* Three loose compositions so a grid of plates does not read as one
          repeated texture: a horizon, a stack of rules, or an arc study. */}
      {composition === 0 && (
        <path
          d={`M -6 ${horizonY} L 106 ${horizonY + horizonTilt} L 106 ${horizonY + horizonTilt + horizonDepth} L -6 ${horizonY + horizonDepth} Z`}
          fill="#000"
          opacity="0.4"
        />
      )}

      {composition === 1 &&
        [0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M -6 ${bandY + i * (5 + arcSweep / 14)} L 106 ${bandY + i * (5 + arcSweep / 14) + horizonTilt}`}
            stroke={palette.mark}
            strokeWidth={bandH * (1 - i * 0.18)}
            opacity={0.26 - i * 0.05}
            fill="none"
          />
        ))}

      {composition === 2 && (
        <>
          <circle
            cx={100 - orbX}
            cy={125 - orbY}
            r={orbR * 0.55}
            fill="none"
            stroke={palette.mark}
            strokeWidth="0.5"
            opacity="0.45"
          />
          <circle
            cx={100 - orbX}
            cy={125 - orbY}
            r={orbR * 0.9}
            fill="none"
            stroke={palette.mark}
            strokeWidth="0.35"
            opacity="0.28"
          />
        </>
      )}

      <rect
        width="100"
        height="125"
        fill={`url(#${uid}-halftone)`}
        opacity="0.16"
      />
      <path
        d={`M -6 ${bandY} L 106 ${bandY - arcSweep / 6}`}
        stroke={palette.mark}
        strokeWidth={bandH}
        opacity="0.24"
        fill="none"
      />
      <path
        d={`M ${orbX - orbR} ${orbY + orbR * 1.4} A ${orbR * 1.5} ${orbR * 1.5} 0 0 1 ${orbX + orbR * 1.2} ${orbY + arcSweep / 3}`}
        stroke={palette.mark}
        strokeWidth="0.4"
        opacity="0.5"
        fill="none"
      />
      <rect
        x="3"
        y="3"
        width="94"
        height="119"
        fill="none"
        stroke={palette.mark}
        strokeOpacity="0.22"
        strokeWidth="0.4"
      />
      <text
        x="6.5"
        y="119"
        fill={palette.mark}
        fillOpacity="0.6"
        fontSize="4"
        letterSpacing="0.8"
        fontFamily="ui-monospace, monospace"
      >
        {stamp}
      </text>
    </svg>
  );
}
