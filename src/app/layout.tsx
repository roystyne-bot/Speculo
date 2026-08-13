import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { Quicksand } from "next/font/google";
import { LanguageProvider } from "@/components/web/LanguageProvider";
import { ServiceWorkerRegistration } from "@/components/web/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://speculo-two.vercel.app"), // ← replace
  verification: {
    google: "HAfsILOFBedTwFbS9N14g426BYnl2R-NvMec2_sEbOE",
  },
  title: {
    default: "Speculo — AI Mock Interview Practice",
    template: "%s | Speculo",
  },
  description:
    "Practice technical and behavioral interviews with AI-generated questions, real-time scoring, and instant feedback.",
  keywords: ["mock interview", "AI interview practice", "technical interview prep", "coding interview"],
  openGraph: {
    title: "Speculo — AI Mock Interview Practice",
    description:
      "Practice technical and behavioral interviews with AI-generated questions, real-time scoring, and instant feedback.",
    url: "https://speculo-two.vercel.app", // ← replace
    siteName: "Speculo",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Speculo — AI Mock Interview Practice",
    description: "Practice interviews with AI. Real-time scoring, instant feedback.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};


    



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Speculo",
    url: "https://speculo-two.vercel.app",
    logo: "https://speculo-two.vercel.app/icon.svg",
    description:
      "AI-powered mock interview platform offering technical, system design, and behavioral interview practice with real-time scoring.",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Speculo",
    url: "https://speculo-two.vercel.app",
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans",
      )}
    >
      <body className={`${quicksand.className} min-h-full flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider>
          <ConvexClientProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </ConvexClientProvider>
        </ThemeProvider>

        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
