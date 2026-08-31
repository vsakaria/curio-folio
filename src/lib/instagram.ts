import { curatedFrames } from "@/content/frames";

/**
 * Instagram's Basic Display API was shut down in December 2024, so there is no
 * longer any supported way to read a *personal* account's media. The remaining
 * option is the Instagram API with Instagram Login, which needs the account to
 * be a Creator or Business account and a long-lived token.
 *
 * That token is the only piece of configuration this site has. When it is
 * absent — locally, in preview, or before the account has been converted — the
 * feed falls back to the curated set in `src/content/frames.ts` and the pane
 * says so plainly rather than rendering an empty grid.
 */

const GRAPH_ENDPOINT = "https://graph.instagram.com/me/media";
const FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "permalink",
  "thumbnail_url",
  "timestamp",
].join(",");

export type FeedItem = {
  id: string;
  caption: string;
  permalink: string | null;
  imageUrl: string | null;
  isVideo: boolean;
  timestamp: string;
  location: string | null;
};

export type FeedSource = "live" | "curated";

export type Feed = {
  items: FeedItem[];
  source: FeedSource;
  /** Present when a live fetch was attempted and did not work out. */
  notice: string | null;
};

type GraphMedia = {
  id: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
};

function curatedFeed(notice: string | null): Feed {
  return {
    source: "curated",
    notice,
    items: curatedFrames.map((frame) => ({
      id: frame.id,
      caption: frame.caption,
      permalink: frame.permalink ?? null,
      imageUrl: frame.src ?? null,
      isVideo: false,
      timestamp: frame.date,
      location: frame.location ?? null,
    })),
  };
}

export async function getInstagramFeed(limit = 12): Promise<Feed> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return curatedFeed(null);
  }

  const url = new URL(GRAPH_ENDPOINT);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);

  try {
    const response = await fetch(url, {
      // Instagram rate limits hard, and the feed does not need to be fresher
      // than this. Vercel will serve the cached copy in between.
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return curatedFeed(
        `Instagram returned ${response.status}. Showing curated stills.`,
      );
    }

    const payload = (await response.json()) as { data?: GraphMedia[] };
    const media = payload.data ?? [];

    if (media.length === 0) {
      return curatedFeed("No posts came back from Instagram.");
    }

    return {
      source: "live",
      notice: null,
      items: media.slice(0, limit).map((item) => ({
        id: item.id,
        caption: item.caption?.trim() ?? "",
        permalink: item.permalink ?? null,
        imageUrl:
          item.media_type === "VIDEO"
            ? (item.thumbnail_url ?? item.media_url ?? null)
            : (item.media_url ?? null),
        isVideo: item.media_type === "VIDEO",
        timestamp: item.timestamp ?? "",
        location: null,
      })),
    };
  } catch {
    return curatedFeed("Could not reach Instagram. Showing curated stills.");
  }
}
