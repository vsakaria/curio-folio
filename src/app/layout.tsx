import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda, JetBrains_Mono } from "next/font/google";

import { GrainOverlay } from "@/components/grain-overlay";
import { site } from "@/content/site";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const description = `${site.role} in ${site.location}. ${site.intro}`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4317",
  ),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description,
    type: "profile",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`dark ${bodoni.variable} ${archivo.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="bg-ink text-bone min-h-full">
        <GrainOverlay />
        {children}
      </body>
    </html>
  );
}
