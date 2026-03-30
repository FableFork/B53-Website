import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/nav/Nav";
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
      <body className={`${niagara.variable} ${geist.variable} antialiased`}>
        <TransitionProvider>
          <Nav />
          {children}
        </TransitionProvider>
        <Analytics />
      </body>
    </html>
  );
}
