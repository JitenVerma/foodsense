import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, Press_Start_2P } from "next/font/google";

import { AuthProvider } from "../components/providers/AuthProvider";
import "./globals.css";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FoodSense",
  description: "Retro arcade nutrition tracking with editable AI meal analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart.variable} ${ibmPlexSans.variable} min-h-screen antialiased arcade-shell`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
