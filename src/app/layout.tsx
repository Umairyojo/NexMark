import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { GlobalLogo } from "@/components/global-logo";
import { LiquidBackground } from "@/components/liquid-background";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Bookmark App",
  description: "Private, real-time bookmark manager with Google OAuth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <div className="relative min-h-screen overflow-x-clip">
          <LiquidBackground />
          <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/72 px-4 py-3 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-6xl">
              <GlobalLogo />
            </div>
          </header>
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
