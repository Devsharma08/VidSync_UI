import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://vidsync.devsharma.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VidSync — AI Stream Intel Terminal",
    template: "%s | VidSync",
  },
  description:
    "VidSync is an advanced AI-powered multimodal stream ingest terminal. Parse YouTube transcripts, query timeline contexts via local RAG, analyze comment sentiment, and compile progressive analytical summaries.",
  keywords: [
    "YouTube analytics",
    "AI transcript parser",
    "RAG Q&A",
    "sentiment analysis",
    "stream intel",
    "Ollama AI",
    "Gemma local AI",
    "video timeline analysis",
    "VidSync",
  ],
  authors: [{ name: "Devsharma", url: siteUrl }],
  creator: "Devsharma",
  publisher: "Devsharma",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "VidSync",
    title: "VidSync — AI Stream Intel Terminal",
    description:
      "Async YouTube stream parsing, semantic timeline RAG, local AI summaries, and audience sentiment scoring. Powered by Gemma 3 and BullMQ.",
    images: [
      {
        url: "/icon.png",
        width: 1024,
        height: 1024,
        alt: "VidSync App Icon",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VidSync — AI Stream Intel Terminal",
    description:
      "Parse YouTube transcripts, run local RAG Q&A, score comment sentiment, and compile AI summaries in a cinematic terminal dashboard.",
    images: ["/icon.png"],
    creator: "@devsharma08",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "1024x1024" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon.png",
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#0B0D11",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-transparent text-gray-100">
        {children}
      </body>
    </html>
  );
}
