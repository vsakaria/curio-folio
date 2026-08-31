import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.role}`;

// Bodoni is bundled rather than fetched so the card renders in the site's own
// display face without a network call at build time.
const FONT_DIR = join(process.cwd(), "src/assets");

export default async function OpenGraphImage() {
  const [firstName, ...restOfName] = site.name.split(" ");

  const [roman, italic] = await Promise.all([
    readFile(join(FONT_DIR, "bodoni-moda-regular.ttf")),
    readFile(join(FONT_DIR, "bodoni-moda-italic.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0b0a09 0%, #141110 55%, #1d1512 100%)",
          padding: "72px 80px",
          color: "#ece2d0",
          fontFamily: "Bodoni Moda",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#7a7263",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 99,
              background: "#c8102e",
            }}
          />
          {site.role}
          <div style={{ color: "#b58a4a" }}>/</div>
          {site.location}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 116, lineHeight: 1 }}>
            <span>{firstName}</span>
            <span style={{ color: "#ddb877", fontStyle: "italic" }}>
              &nbsp;{restOfName.join(" ")}
            </span>
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#b3a894",
              maxWidth: 900,
              fontFamily: "sans-serif",
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(181,138,74,0.45)",
            paddingTop: 26,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#7a7263",
            fontFamily: "monospace",
          }}
        >
          <div style={{ display: "flex" }}>Frames</div>
          {/* A drawn lozenge rather than a glyph, so no font has to be
              fetched at build time for a single decorative character. */}
          <div
            style={{
              width: 12,
              height: 12,
              background: "#b58a4a",
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ display: "flex" }}>The Work</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bodoni Moda", data: roman, style: "normal", weight: 400 },
        { name: "Bodoni Moda", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}
