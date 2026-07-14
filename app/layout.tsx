import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/nav/Nav";
import GridGuides from "@/components/ui/GridGuides";
import StatusFooter from "@/components/ui/StatusFooter";
import { TransitionProvider } from "@/context/TransitionContext";
import { Analytics } from "@vercel/analytics/next";

const niagara = localFont({
  src: "./fonts/NiagaraSolid.ttf",
  variable: "--font-niagara",
  display: "swap",
});

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://b53studios.com"),
  title: "B53 Studios",
  description: "Creative technologist. Real-time interactive experiences.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${niagara.variable} ${geist.variable} ${geistMono.variable} antialiased`}>
        <TransitionProvider>
          <GridGuides />
          <Nav />
          {children}
          <StatusFooter />
        </TransitionProvider>
        <Analytics />
      </body>
    </html>
  );
}
