import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, TWITTER_HANDLE } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const crimson = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Portrait & Documentary Photography`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION.en,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Portrait & Documentary Photography`,
    description: DEFAULT_DESCRIPTION.en,
    url: SITE_URL,
    locale: 'en_US',
    alternateLocale: ['es_ES'],
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Portrait & Documentary Photography`,
    description: DEFAULT_DESCRIPTION.en,
    creator: TWITTER_HANDLE,
    site: TWITTER_HANDLE,
    images: ['/og-default.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${crimson.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
