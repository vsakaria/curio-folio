# vishalsakaria.com

A personal portfolio built as a two-column stage: an Instagram feed on the left,
writing and system diagrams on the right, under a masthead that carries the name
and portrait.

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · deployed on Vercel.

## Running it locally

```bash
npm install
npm run dev
```

The dev server binds to <http://localhost:4317>. No environment variables are
needed: the Instagram feed is served as public JSON by Behold, and the pane
falls back to a curated set if that feed cannot be reached.

Two optional variables exist:

| Variable               | Default                                       |
| ---------------------- | --------------------------------------------- |
| `BEHOLD_FEED_URL`      | The feed in `src/lib/behold.ts`               |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:4317`, for Open Graph URLs  |

Useful scripts:

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server on port 4317         |
| `npm run build`     | Production build                |
| `npm run start`     | Serve the production build      |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript, no emit             |

## Editing the content

Everything written on the site lives in `src/content`. No component needs
touching to change what it says.

| File           | What it holds                                                     |
| -------------- | ----------------------------------------------------------------- |
| `site.ts`      | Name, role, location, intro, social links, the ticker strip        |
| `posts.ts`     | Writing shown in the right-hand pane                               |
| `diagrams.ts`  | System diagrams, declared as data                                  |
| `frames.ts`    | Curated stills used when the live feed cannot be reached           |

### Your photographs

The left pane shows the entries in `src/content/frames.ts` whenever the live
feed is unavailable. To use your own stills, save each one into
`public/frames/` named after the `id` of the frame it belongs to —
`frame-01.jpg` for `frame-01`, `frame-02.jpg` for `frame-02`, and so on. Any of
`.jpg`, `.jpeg`, `.png`, `.webp` or `.avif` is picked up.

Then edit the `caption`, `location` and `date` on each entry to match the
photograph. Add or remove entries freely; the grid sizes itself to however many
there are.

Frames with no matching file are drawn as procedural contact-sheet plates, so a
half-finished set still looks deliberate. As with the portrait, the check runs
at build time, so nothing is requested for a photograph you have not added yet
and the small "not connected" notice disappears once real stills are in place.

Once the live feed is reachable those curated entries are not shown at all —
they only exist as the fallback.

### Your portrait

Drop a square image at `public/portrait.jpg`. Until then the masthead shows a
monogram plate rather than a broken frame, and no request is made for the
missing file — the check happens at build time, so a new portrait appears on
the next build.

### Writing

Each post can work two ways:

- Give it an `href` and the card becomes an outbound link to the real article.
- Leave `href` off and the card opens a reading panel built from `standfirst`
  and `takeaways`. Nothing on the page ever points at a dead URL.

### Diagrams

Diagrams are data, not hand-drawn SVG. Place each node on a column/row grid and
the renderer in `src/components/system-diagram.tsx` handles the geometry,
orthogonal edge routing, lane headings and the legend:

```ts
{
  slug: "order-pipeline",
  title: "Order pipeline, after the rewrite",
  summary: "…",
  lanes: ["Client", "Edge", "Write path"],
  nodes: [
    { id: "gateway", label: "API gateway", kind: "edge", col: 1, row: 1 },
    { id: "orders",  label: "Order service", kind: "service", col: 2, row: 0 },
  ],
  edges: [{ from: "gateway", to: "orders", label: "POST /orders" }],
  notes: ["How to read it, one point per line."],
}
```

Node `kind` picks the styling: `client`, `edge`, `service`, `store`, `queue` or
`external`. Edges route automatically through the gap between their columns; set
`route: "over"` or `route: "under"` to send a backward or column-skipping edge
around the outside of the grid so it stays clear of the nodes in between.

## The Instagram feed

The feed comes from [Behold](https://behold.so), not from Instagram directly.
Instagram's Basic Display API was shut down on 4 December 2024 and the API that
replaced it needs a professional account, an app review and a long-lived token
that expires every 60 days. Behold holds all of that, mirrors each still onto
its own CDN and publishes the account as plain JSON, so this site needs no
credentials at all and its image URLs do not expire.

The feed lives at:

```
https://feeds.behold.so/OXLnFevQ5q08FDDC3VH3
```

That is the default in `src/lib/behold.ts`. Set `BEHOLD_FEED_URL` to point at a
different feed — a second account, or a test feed — without touching the code.
The whole feed is rendered; the pane scrolls independently, so there is no need
to cap it.

`src/lib/behold.ts` reads only what the grid draws:

| Field                | Used for                                              |
| -------------------- | ----------------------------------------------------- |
| `sizes.large`        | The still, preferred over `mediaUrl` as it is re-hosted and does not expire |
| `mediaUrl` (video)   | Playback inside the lightbox, with the still as poster |
| `children`           | Carousel slides, stepped through in the lightbox       |
| `caption`            | Tile caption and lightbox title                        |
| `permalink`          | "Open on Instagram"                                    |
| `timestamp`          | The date line                                          |
| `visibility`         | Posts hidden in Behold are skipped                     |

Responses are cached for an hour (`revalidate: 3600`); a portfolio feed does not
need to be fresher than that. If the feed cannot be reached the pane falls back
to the curated stills in `src/content/frames.ts` and shows the reason rather
than breaking.

Behold serves images from `behold.pictures` and Instagram from
`*.cdninstagram.com`; both are allowed in `next.config.ts` so `next/image` can
optimise them.

## Deploying to Vercel

1. Push this repository and import it at [vercel.com/new](https://vercel.com/new).
   The framework preset, build command and output are all detected.
2. Nothing needs to be configured for the feed. Set `BEHOLD_FEED_URL` only if
   you are pointing at a different Behold feed.
3. Add the custom domain and set `NEXT_PUBLIC_SITE_URL` to match, so Open Graph
   tags resolve to absolute URLs.

## How it is put together

```
src/
  app/            layout (fonts, metadata) and the single page
  components/
    masthead        name, portrait, social rail, ticker
    split-stage     the two halves, the spine, the mobile switcher
    pane            shared header + independent scroll body
    frames-pane     left half: the Instagram feed, or curated stills
    frame-grid      tile grid and lightbox, including carousels and video
    frame-plate     seeded procedural plate for frames with no photograph
    work-pane       right half: writing and diagrams
    work-list       filtering, cards, reading and diagram dialogs
    system-diagram  spec-driven diagram renderer
  content/        all copy
  lib/            Behold feed fetching, date formatting
```

The two panes scroll independently above 1024px so both halves stay in view.
Below that the page returns to a normal document scroll and a switcher decides
which half is showing, so nobody has to scroll past the whole feed to reach the
work.
