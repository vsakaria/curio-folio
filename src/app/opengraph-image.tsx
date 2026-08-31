import { ImageResponse } from "next/og";

import { site } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.role}`;

export default function OpenGraphImage() {
  const [firstName, ...restOfName] = site.name.split(" ");

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
          fontFamily: "serif",
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
          <div style={{ display: "flex", color: "#b58a4a" }}>◆</div>
          <div style={{ display: "flex" }}>The Work</div>
        </div>
      </div>
    ),
    size,
  );
}
