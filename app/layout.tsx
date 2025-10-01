import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    <html lang="en" className="dark">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><Wave>
          <div className="w-full h-full backdrop-blur-sm">
            {children}
          </div>
        </Wave>
      </body>
    </html>
  );
}
