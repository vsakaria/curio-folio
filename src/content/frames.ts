/**
 * The left-hand pane pulls live posts from Instagram when a token is present
 * (see `src/lib/instagram.ts` and the README). Until then it shows this
 * curated set, drawn as procedural contact-sheet plates rather than stock
 * photography, so the page never renders a broken image.
 *
 * Drop real files in `public/frames/` and set `src` to use your own stills.
 */

export type CuratedFrame = {
  id: string;
  caption: string;
  location?: string;
  date: string;
  /** e.g. "/frames/camden-lock.jpg" — optional. */
  src?: string;
  permalink?: string;
};

export const curatedFrames: CuratedFrame[] = [
  {
    id: "frame-01",
    caption: "Last light on the lock, waiting for the crowd to thin out.",
    location: "Camden Lock",
    date: "2026-07-14",
  },
  {
    id: "frame-02",
    caption: "Portico Vs. Contax T2. Portico won.",
    location: "Camden High Street",
    date: "2026-06-29",
  },
  {
    id: "frame-03",
    caption: "Sound check from the back of the room. Nobody in it yet.",
    location: "KOKO",
    date: "2026-06-02",
  },
  {
    id: "frame-04",
    caption: "Brass, velvet, and a doorway I was probably not supposed to use.",
    location: "Camden Town",
    date: "2026-05-18",
  },
  {
    id: "frame-05",
    caption: "Portra 400 pushed a stop. Worth every frame of grain.",
    location: "Regent's Canal",
    date: "2026-04-27",
  },
  {
    id: "frame-06",
    caption: "Sunday market, before the queue.",
    location: "Camden Market",
    date: "2026-04-06",
  },
  {
    id: "frame-07",
    caption: "Somebody's whole record collection, out on the pavement.",
    location: "Inverness Street",
    date: "2026-03-15",
  },
  {
    id: "frame-08",
    caption: "The dome, from a bus that would not stop moving.",
    location: "Mornington Crescent",
    date: "2026-02-21",
  },
  {
    id: "frame-09",
    caption: "Rain on the way home. Shot it anyway.",
    location: "Chalk Farm Road",
    date: "2026-01-30",
  },
];
