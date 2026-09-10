"use client";

import React from "react";
import HeroSection from "./components/HeroSection";
import ProfilNarasi from "./components/ProfilNarasi";
import StatistikCounter from "./components/StatistikCounter";
import PotensiUnggulan from "./components/PotensiUnggulan";
import LokasiPeta from "./components/LokasiPeta";

export default function Home() {
  return (
    <>
      {/* 1. Hero Section — First Impression */}
      <HeroSection />

      {/* 2. Profil & Narasi Sejarah */}
      <ProfilNarasi />

      {/* 3. Data Statistik Interaktif */}
      <StatistikCounter />

      {/* 4. Potensi Unggulan & Komoditas (Bergambar) */}
      <PotensiUnggulan />

      {/* 5. Lokasi & Navigasi Interaktif */}
      <LokasiPeta />

      {/* Footer — handled by layout.tsx */}
    </>
  );
}
