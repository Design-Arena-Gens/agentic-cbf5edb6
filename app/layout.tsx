import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watchlist Organizer",
  description: "Modern movie and TV show watchlist manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
