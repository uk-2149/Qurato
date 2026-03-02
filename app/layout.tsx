import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import TitleWatcher from "../components/TitleWatcher";
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qurato",
  description: "Learn without mess",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white`}
      >
        <AppProviders>
          <TitleWatcher />
          {children}
          <Toaster position="top-center" expand={true} richColors />
          <Analytics />
        </AppProviders>
      </body>
    </html>
  );
}