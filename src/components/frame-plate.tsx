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

  const angle = Math.round(random() * 140 - 70);
  const orbX = 20 + random() * 60;
  const orbY = 18 + random() * 54;
  const orbR = 16 + random() * 26;
  const bandY = 24 + random() * 52;
  const bandH = 1 + random() * 3;
  const arcSweep = 30 + random() * 50;
  const frequency = (0.012 + random() * 0.02).toFixed(3);
  const dotGap = 5 + Math.round(random() * 3);
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
        >
          <circle
            cx={dotGap / 2}
            cy={dotGap / 2}
            r={0.72}
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
