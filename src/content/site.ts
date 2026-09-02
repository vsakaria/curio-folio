/**
 * Everything written on this site is edited from `src/content`.
 * This file holds the masthead: who you are, where to find you, and the
 * standing copy that frames the two halves of the page.
 */

export type SocialLink = {
  label: string;
  handle: string;
  href: string;
  /** Shown in the masthead rail as well as the footer. */
  primary?: boolean;
};

export const site = {
  name: "Vishal Sakaria",
  /** Used for the vertical spine between the two halves. */
  shortName: "Vishal Sakaria",
  role: "Senior Solutions Architect at Salesforce",
  location: "London",
  /** Sits directly under the name in the masthead. */
  tagline: "Art on one side, technology on the other.",
  portrait: {
    /** Drop a square image at this path in `public/` and it appears automatically. */
    src: "/portrait.jpg",
    alt: "Vishal Sakaria",
  },
  instagramHandle: "vishisonit",
} as const;

export const socials: SocialLink[] = [
  {
    label: "Instagram",
    handle: `@${site.instagramHandle}`,
    href: `https://www.instagram.com/${site.instagramHandle}/`,
    primary: true,
  },
  {
    label: "GitHub",
    handle: "@vishisonit",
    href: "https://github.com/vishisonit",
    primary: true,
  },
  {
    label: "LinkedIn",
    handle: "in/vishalsakaria",
    href: "https://www.linkedin.com/in/vishalsakaria/",
  },
];

/** The rolling billboard strip beneath the masthead. */
export const billboard: string[] = [
  "Distributed systems",
  "Event-driven architecture",
  "35mm",
  "Diagrams that survive the meeting",
  "Camden",
  "Platform engineering",
  "Darkroom scans",
  "Observability",
];

export const panes = {
  left: {
    id: "frames",
    kicker: "Left of stage",
    title: "Frames",
    blurb: "Music, art, travel and whatever the hell makes me tick.",
  },
  right: {
    id: "work",
    kicker: "Right of stage",
    title: "The Work",
    blurb: "Writing about systems, and the diagrams behind them.",
  },
} as const;
