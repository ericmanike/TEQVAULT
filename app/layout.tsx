import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/components/toastProvider";
import { AuthProvider } from "@/components/AuthContext";
import { FirstVisitPopup } from "@/components/FirstVisitAlert";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://teqvault.app"),
  title: "TEQVAULT - Your Trusted Plug for Quality Gadgets",
  description: "Buy quality and trusted gadgets on TEQVAULT - your trusted platform for all phones, laptop and accessories - gadgets.",
  twitter: {
    card: "summary_large_image",
    title: "TEQVAULT - Your Trusted Plug for Quality Gadgets",
    description: "Buy quality and trusted gadgets on TEQVAULT - your trusted platform for all phones, laptops and accessories.",
    images: "https://res.cloudinary.com/dzj8q4qtf/image/upload/v1700000000/recyco-twitter-card_ojl5n9.png",
  },
  openGraph: {
    title: "TEQVAULT - Your Trusted Plug for Quality Gadgets",
    description: "Buy quality and trusted gadgets on TEQVAULT - your trusted platform for all phones, laptop and accessories - gadgets.",
    url: "https://teqvault.app",
    siteName: "TEQVAULT",
    images: [
      {
        url: "https://res.cloudinary.com/dzj8q4qtf/image/upload/v1700000000/recyco-og-image_ajh7xk.png",
        width: 1200,
        height: 630,
        alt: "TEQVAULT - Your Trusted Plug for Quality Gadgets",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${outfit.variable} font-sans bg-slate-50 overflow-x-hidden min-h-screen`}>
        <AuthProvider>
          <ToastProvider>
          <CartProvider>
            <WishlistProvider>
                <ScrollToTop />
                {children}
                <FirstVisitPopup />
            </WishlistProvider>
          </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
