import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Smart Inter-Wilaya Taxi v2",
    template: "%s | Smart Taxi",
  },
  description: "منصة ذكية لربط السائقين بالركاب في رحلات بين الولايات الجزائرية - Smart platform connecting drivers with passengers for inter-city travel across Algeria",
  keywords: [
    "Smart Taxi",
    "Algeria",
    "Inter-Wilaya",
    "Taxi",
    "Transportation",
    "الجزائر",
    "تاكسي",
    "نقل",
    "رحلات",
  ],
  authors: [{ name: "Smart Taxi Team" }],
  creator: "ilyeseia",
  publisher: "Smart Taxi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    alternateLocale: "fr_DZ",
    url: "https://smart-inter-wilaya-taxi-v2.vercel.app",
    siteName: "Smart Inter-Wilaya Taxi",
    title: "Smart Inter-Wilaya Taxi v2",
    description: "منصة ذكية لربط السائقين بالركاب في رحلات بين الولايات الجزائرية",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smart Inter-Wilaya Taxi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Inter-Wilaya Taxi v2",
    description: "منصة ذكية لربط السائقين بالركاب في رحلات بين الولايات الجزائرية",
    images: ["/og-image.png"],
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Theme script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('smart-taxi-theme') || 'system';
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(resolved);
                  document.documentElement.style.colorScheme = resolved;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link">
          انتقل إلى المحتوى الرئيسي
        </a>
        
        <ThemeProvider defaultTheme="system" storageKey="smart-taxi-theme">
          <main id="main-content">
            {children}
          </main>
        </ThemeProvider>
        
        <Toaster />
      </body>
    </html>
  );
}
