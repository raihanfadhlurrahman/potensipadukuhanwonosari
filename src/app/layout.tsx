import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SplashHandler from "./components/SplashHandler";

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
    default: "Padukuhan Wonosari",
    template: "%s | Padukuhan Wonosari",
  },
  description:
    "Portal resmi profil potensi, UMKM, wisata & monografi Padukuhan Wonosari (Rejosari RW 18, Wonosari RW 17, Pajangan RW 16), Kalurahan Wedomartani, Ngemplak, Sleman. Dikembangkan oleh Raihan Fadhlurrahman | KKN UII 73 Unit 57.",
  icons: {
    icon: "/images/logoSleman.png",
    shortcut: "/images/logoSleman.png",
    apple: "/images/logoSleman.png",
  },
  keywords: [
    "Padukuhan Wonosari",
    "Wedomartani",
    "Ngemplak",
    "Sleman",
    "KKN UII",
    "UMKM Desa",
    "Profil Desa",
    "Wisata Sleman",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF6F0] text-[#1E251E]">
        <SplashHandler />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
