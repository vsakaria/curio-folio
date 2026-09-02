/**
 * The left-hand pane pulls live posts from the Behold feed (see
 * `src/lib/behold.ts` and the README). It shows this curated set when that
 * feed cannot be reached.
 *
 * To use your own photographs, save them into `public/frames/` named after the
 * `id` of the frame they belong to — `frame-01.jpg` for `frame-01`, and so on.
 * Any of .jpg, .jpeg, .png, .webp or .avif works. Each one is picked up on the
 * next build; frames with no file are drawn as procedural contact-sheet plates
 * instead, so the page never renders a broken image.
 */

export type CuratedFrame = {
  id: string;
  caption: string;
  location?: string;
  date: string;
  /**
   * Only needed to point somewhere other than `public/frames/<id>.<ext>`, such
   * as an image hosted elsewhere.
   */
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
