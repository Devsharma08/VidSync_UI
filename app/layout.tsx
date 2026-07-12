import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VidSync - Multimodal Stream Intel Terminal",
  description: "Asynchronous stream captions parsing, semantic timeline analytics, and sentiment processing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans bg-transparent text-gray-100">{children}</body>
    </html>
  );
}
