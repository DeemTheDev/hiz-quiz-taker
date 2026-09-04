import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { siteUrlObject } from "@/lib/config";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrlObject(),
  title: {
    default: "Prevention Challenge",
    template: "%s · Prevention Challenge",
  },
  description:
    "How much do you know about HIV prevention? Take this 10-question challenge and find out!",
  applicationName: "HIV Prevention Challenge",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: "HIV Prevention Challenge",
    title: "HIV Prevention Challenge",
    description:
      "How much do you know about HIV prevention? Take this 10-question challenge and find out!",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "HIV Prevention Challenge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HIV Prevention Challenge",
    description:
      "How much do you know about HIV prevention? Take this 10-question challenge and find out!",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F6F1FF",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA" className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
