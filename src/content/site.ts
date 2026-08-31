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
  role: "Software Engineer",
  location: "London",
  /** Sits directly under the name in the masthead. */
  tagline: "Systems on one side, film on the other.",
  /** The longer introduction, kept to two sentences on purpose. */
  intro:
    "I build backend systems and the diagrams that make them legible to everyone else in the room. Away from the terminal I shoot on 35mm around Camden and wherever else I end up.",
  portrait: {
    /** Drop a square image at this path in `public/` and it appears automatically. */
    src: "/portrait.jpg",
    alt: "Vishal Sakaria",
  },
  instagramHandle: "vishisonit",
  email: "hello@example.com",
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
  {
    label: "Email",
    handle: site.email,
    href: `mailto:${site.email}`,
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
    blurb: "What I point a camera at when nothing is on fire.",
  },
  right: {
    id: "work",
    kicker: "Right of stage",
    title: "The Work",
    blurb: "Writing about systems, and the diagrams behind them.",
  },
} as const;
