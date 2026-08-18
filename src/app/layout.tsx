import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  title: "Paper Moderation System | Wayamba University of Sri Lanka",
  description: "Examination Question Paper & Marking Scheme Moderation System — Faculty of Applied Sciences, Wayamba University of Sri Lanka.",
  keywords: ["Paper Moderation", "Wayamba University", "Faculty of Applied Sciences", "Exam Moderation System"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Paper Moderation System | Wayamba University of Sri Lanka",
    description: "Digital Question Paper & Marking Scheme Moderation Portal — Faculty of Applied Sciences.",
    siteName: "Paper Moderation System",
    images: [
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "Wayamba University Crest Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Paper Moderation System | Wayamba University of Sri Lanka",
    description: "Digital Question Paper & Marking Scheme Moderation Portal — Faculty of Applied Sciences.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
