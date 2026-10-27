import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "LAUNCH Transparency Dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Deliberately bare: every page brings its own stylesheet (ported verbatim from
// the original single-file HTML pages). Cross-page links are plain <a> tags
// (see components/PageLink.tsx) so each navigation is a full page load and one
// page's global CSS never lingers on another.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
