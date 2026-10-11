import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminGuard } from "@/components/layout/AdminGuard";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { FloatingWhatsApp } from "@/components/shared/FloatingWhatsApp";
import { Analytics } from "@/components/analytics/Analytics";
import { Toaster } from "sonner";
import { siteConfig } from "@/lib/site";
import { getSiteSettings } from "@/lib/content/service.server";

const editorial = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Jost({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} | Rwanda Safaris & East Africa Tours`,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/images/rwanda-hills.jpg",
        alt: "Gorilla trekking in the misty forests of Volcanoes National Park, Rwanda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/images/rwanda-hills.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  const socialLinks = [
    { label: "Facebook", href: settings.facebook },
    { label: "Instagram", href: settings.instagram },
    { label: "TikTok", href: settings.tiktok },
    { label: "LinkedIn", href: settings.linkedin },
  ].filter((s) => s.href && s.href !== "#");

  /* Determine favicon from CMS settings */
  const favicon = settings.favicon || "/favicon.ico";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.name} — Travel Journal`}
          href="/feed.xml"
        />
        <link rel="icon" href={favicon} type="image/x-icon" />
      </head>
      <body
        className={`${editorial.variable} ${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AdminGuard>
            <Header socialLinks={socialLinks} logoUrl={settings.logo || ""} />
          </AdminGuard>
          <main id="main-content" tabIndex={-1} className="min-h-screen">{children}</main>
          <AdminGuard>
            <Footer />
          </AdminGuard>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <AdminGuard><FloatingWhatsApp /></AdminGuard>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? <Analytics /> : null}
      </body>
    </html>
  );
}
