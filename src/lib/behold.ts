import { existsSync } from "node:fs";
import { join } from "node:path";

import { curatedFrames, type CuratedFrame } from "@/content/frames";

/**
 * The feed is published by Behold (behold.so), which holds the Instagram
 * credentials, mirrors every still onto its own CDN and serves the account as
 * plain JSON. None of Instagram's own APIs are involved here: there is no
 * token to keep alive, and the re-hosted image URLs do not carry the expiry
 * that graph.instagram.com media does.
 *
 * When the feed cannot be reached the pane falls back to the curated set in
 * `src/content/frames.ts` and says so, rather than rendering an empty grid.
 */

const FEED_URL =
  process.env.BEHOLD_FEED_URL ?? "https://feeds.behold.so/OXLnFevQ5q08FDDC3VH3";

/** Behold caches on its own side; a portfolio feed need be no fresher. */
const REVALIDATE_SECONDS = 60 * 60;

export type FeedMedia = {
  id: string;
  /** The still. For a video this is also its poster. */
  imageUrl: string | null;
  videoUrl: string | null;
};

export type FeedItem = {
  id: string;
  caption: string;
  permalink: string | null;
  timestamp: string;
  location: string | null;
  /** Every slide of the post in order; a single-media post has exactly one. */
  slides: FeedMedia[];
};

export type FeedSource = "live" | "curated";

export type Feed = {
  items: FeedItem[];
  source: FeedSource;
  /** Present when a live fetch was attempted and did not work out. */
  notice: string | null;
};

type BeholdSize = {
  mediaUrl?: string;
};

type BeholdMedia = {
  id?: string;
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl?: string;
  thumbnailUrl?: string;
  sizes?: Partial<Record<"small" | "medium" | "large" | "full", BeholdSize>>;
};

type BeholdPost = BeholdMedia & {
  id: string;
  permalink?: string;
  timestamp?: string;
  caption?: string;
  /** Behold's own hide-a-post switch. */
  visibility?: "visible" | "hidden";
  children?: BeholdMedia[];
};

const FRAME_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

/**
 * A curated frame uses `public/frames/<id>.<ext>` when that file is there and
 * falls back to a procedural plate when it is not. Resolving it here, on the
 * server, means a photograph you have not added yet never becomes a 404 on
 * every page view — the same trade the masthead portrait makes.
 */
function resolveFrameImage(frame: CuratedFrame): string | null {
  const candidates = frame.src
    ? [frame.src]
    : FRAME_EXTENSIONS.map((extension) => `/frames/${frame.id}.${extension}`);

  const found = candidates.find(
    (path) =>
      // Anything not rooted in `public/` is somebody else's to serve.
      !path.startsWith("/") ||
      existsSync(join(process.cwd(), "public", path.slice(1))),
  );

  return found ?? null;
}

function curatedFeed(notice: string | null): Feed {
  return {
    source: "curated",
    notice,
    items: curatedFrames.map((frame) => ({
      id: frame.id,
      caption: frame.caption,
      permalink: frame.permalink ?? null,
      timestamp: frame.date,
      location: frame.location ?? null,
      slides: [
        { id: frame.id, imageUrl: resolveFrameImage(frame), videoUrl: null },
      ],
    })),
  };
}

function toMedia(media: BeholdMedia, fallbackId: string): FeedMedia {
  // Behold re-hosts each still at a few widths and those URLs are stable, so
  // they are preferred over the raw Instagram `mediaUrl`, which expires.
  const still =
    media.sizes?.large ??
    media.sizes?.medium ??
    media.sizes?.full ??
    media.sizes?.small;
  const isVideo = media.mediaType === "VIDEO";

  return {
    id: media.id ?? fallbackId,
    imageUrl:
      still?.mediaUrl ??
      media.thumbnailUrl ??
      (isVideo ? null : media.mediaUrl) ??
      null,
    videoUrl: isVideo ? (media.mediaUrl ?? null) : null,
  };
}

function toItem(post: BeholdPost): FeedItem {
  // A carousel repeats its cover as the first child, so the children alone
  // describe the whole post.
  const slides = post.children?.length
    ? post.children.map((child, index) => toMedia(child, `${post.id}-${index}`))
    : [toMedia(post, post.id)];

  return {
    id: post.id,
    caption: post.caption?.trim() ?? "",
    permalink: post.permalink ?? null,
    timestamp: post.timestamp ?? "",
    // Behold does not carry location; only curated frames have one.
    location: null,
    slides,
  };
}

/**
 * @param limit Caps the number of posts. Left off, the whole feed is returned.
 */
export async function getFramesFeed(limit?: number): Promise<Feed> {
  try {
    const response = await fetch(FEED_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return curatedFeed(
        `The feed returned ${response.status}. Showing curated stills.`,
      );
    }

    const payload = (await response.json()) as { posts?: BeholdPost[] };
    const posts = (payload.posts ?? []).filter(
      (post) => post.id && post.visibility !== "hidden",
    );

    if (posts.length === 0) {
      return curatedFeed("No posts came back from the feed.");
    }

    return {
      source: "live",
      notice: null,
      items: (limit ? posts.slice(0, limit) : posts).map(toItem),
    };
  } catch {
    return curatedFeed("Could not reach the feed. Showing curated stills.");
  }
}
