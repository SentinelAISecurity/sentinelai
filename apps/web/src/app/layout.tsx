import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SentinelAI - AI-Powered Web3 Security Platform",
    template: "%s | SentinelAI",
  },
  description:
    "Open-source AI-powered Web3 security platform for smart contract auditing, vulnerability detection, and continuous blockchain monitoring.",
  keywords: [
    "smart contract audit",
    "web3 security",
    "soroban scanner",
    "blockchain security",
    "vulnerability detection",
    "AI security",
  ],
  authors: [{ name: "SentinelAI Contributors" }],
  creator: "SentinelAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sentinelai.dev",
    siteName: "SentinelAI",
    title: "SentinelAI - AI-Powered Web3 Security",
    description: "Open-source AI-powered Web3 security platform for smart contract auditing.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SentinelAI - AI-Powered Web3 Security",
    description: "Open-source AI-powered Web3 security platform for smart contract auditing.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
