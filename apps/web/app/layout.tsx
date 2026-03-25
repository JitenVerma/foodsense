import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FoodSense",
  description: "Upload a meal photo and get an editable macro estimate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${ibmPlexSans.variable} bg-[linear-gradient(180deg,#f4fbf7_0%,#edf6fb_48%,#f8fafc_100%)] text-slate-950 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
