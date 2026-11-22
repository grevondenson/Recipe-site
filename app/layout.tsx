import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ivy Cooks — Find your next favourite",
  description:
    "A little inspiration for whatever you're craving. Discover recipes and make them your own.",
  applicationName: "Ivy Cooks",
};

export const viewport: Viewport = {
  themeColor: "#11170f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
