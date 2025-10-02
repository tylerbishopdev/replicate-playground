import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Wave from "@/components/wave";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tiposka = localFont({
  src: "../public/fonts/ATK-Studio-Tiposka.woff2",
  variable: "--font-tiposka",
  display: "swap",
});

const diatype = localFont({
  src: "../public/fonts/Diatype.woff2",
  variable: "--font-diatype",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-Medium.woff",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tylers.wtf",
  description: "Art is whatever you want it to be",
  icons: {
    icon: "/favicon.ico",
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tiposka.variable} ${diatype.variable} ${satoshi.variable} antialiased`}
      >
        <Wave>
          <div className="w-full h-full backdrop-blur-sm">
            {children}
          </div>
        </Wave>
      </body>
    </html>
  );
}
