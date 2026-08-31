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
needed to run the site — the Instagram pane falls back to a curated set until a
token is added.

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
| `frames.ts`    | Curated stills used until Instagram is connected                   |

### Your portrait

Drop a square image at `public/portrait.jpg`. Until then the masthead shows a
monogram plate rather than a broken frame — nothing needs changing in code.

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

## Connecting the Instagram feed

Instagram's Basic Display API was shut down on 4 December 2024, and **there is
no longer any supported way to read a personal account's media.** The only
remaining route is the Instagram API with Instagram Login, which requires a
professional account.

Until a token is present the left pane shows the curated stills from
`src/content/frames.ts`, drawn as procedural contact-sheet plates, and says so
in a small notice. That is a legitimate state to ship in.

To connect the real feed:

1. Convert `@vishisonit` to a **Creator** account in the Instagram app
   (Settings → Account type). Creator accounts do not need a linked Facebook
   Page, which makes this the lighter of the two paths.
2. Create an app at [developers.facebook.com](https://developers.facebook.com/)
   and add the **Instagram** product, using *Business login for Instagram*.
3. Request the `instagram_business_basic` scope only. Publishing, messaging and
   insights scopes are not needed for a read-only feed and slow down App Review.
4. Exchange the short-lived token for a long-lived one and set it as
   `INSTAGRAM_ACCESS_TOKEN` in Vercel (Settings → Environment Variables).

Long-lived tokens last 60 days and must be refreshed before they expire. When
one lapses the pane falls back to the curated set and shows the reason rather
than breaking.

Responses are cached for an hour (`revalidate: 3600`) because Instagram rate
limits aggressively and a portfolio feed does not need to be fresher than that.

## Deploying to Vercel

1. Push this repository and import it at [vercel.com/new](https://vercel.com/new).
   The framework preset, build command and output are all detected.
2. Add environment variables from `.env.example` — both are optional.
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
    frames-pane     left half: Instagram or curated stills
    frame-grid      tile grid and lightbox
    frame-plate     seeded procedural plate for frames with no photograph
    work-pane       right half: writing and diagrams
    work-list       filtering, cards, reading and diagram dialogs
    system-diagram  spec-driven diagram renderer
  content/        all copy
  lib/            Instagram fetching, date formatting
```

The two panes scroll independently above 1024px so both halves stay in view.
Below that the page returns to a normal document scroll and a switcher decides
which half is showing, so nobody has to scroll past the whole feed to reach the
work.
