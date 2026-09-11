"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";
import { Leaf, ShoppingBag, Wheat, Trees, ArrowRight, CheckCircle2, Sparkles, Sprout } from "lucide-react";
import Link from "next/link";

const potensiData = [
  {
    image: "/images/pertanian2.jpeg",
    icon: <Wheat className="w-5 h-5 text-emerald-700" />,
    category: "Sektor Agraris Utama",
    title: "Pertanian Padi & Palawija",
    description:
      "Lahan persawahan beririgasi teknis yang subur membentang di wilayah Padukuhan Wonosari. Menghasilkan panen padi unggul, jagung, serta aneka palawija sebagai penopang utama ketahanan pangan warga.",
    highlights: ["Panen 2–3x / Tahun", "Irigasi Teknis Subur", "Kelompok Tani Guyub"],
    link: "/monografis",
    linkText: "Lihat Statistik Pertanian",
    color: "sage",
  },
  {
    image: "/images/kandangternak.jpeg",
    icon: <Trees className="w-5 h-5 text-emerald-700" />,
    category: "Peternakan & Pekarangan",
    title: "Peternakan dan Pekarangan",
    description:
      "Pengelolaan kandang ternak sapi kelompok terpadu dan unggas warga yang dikelola secara mandiri dan guyub, didukung kebun pekarangan produktif serta pemanfaatan pupuk kompos organik.",
    highlights: ["Kandang Sapi Terpadu", "Peternakan Unggas Mandiri", "Pupuk Kompos Alami", "Pekarangan Produktif"],
    link: "/monografis",
    linkText: "Lihat Potensi Peternakan",
    color: "sage",
  },
  {
    image: "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?q=80&w=800&auto=format&fit=crop",
    icon: <ShoppingBag className="w-5 h-5 text-[#EF6C85]" />,
    category: "UMKM & Olahan Pangan",
    title: "UMKM Keripik & Kuliner Tradisional",
    description:
      "Industri olahan rumahan warga yang memproduksi aneka keripik renyah, peyek kacang gurih, jajanan tradisional, dan telur bebek berkualitas yang siap dipasarkan ke berbagai wilayah.",
    highlights: ["Keripik Aneka Rasa", "Pembuatan Jasa", "Peyek Tradisional", "Ekonomi Mandiri"],
    link: "/umkm",
    linkText: "Buka Katalog UMKM",
    color: "coral",
  },
  {
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop",
    icon: <Leaf className="w-5 h-5 text-emerald-700" />,
    category: "Lingkungan Berkelanjutan",
    title: "SODAKOH Sampah",
    description:
      "Program pengelolaan sampah berbasis pemberdayaan masyarakat yang mengedepankan prinsip 3R (Reduce, Reuse, Recycle) sebagai upaya menjaga kebersihan dan kelestarian lingkungan padukuhan.",
    highlights: ["3R (Reduce, Reuse, Recycle)", "Edukasi Lingkungan", "Pemberdayaan Bersama"],
    link: "/profil-desa",
    linkText: "Lihat Profil Lingkungan",
    color: "sage",
  },
];

export default function PotensiUnggulan() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-[#162016]" id="potensi">
      {/* 1. BACKGROUND SCENIC PHOTOGRAPHY (pemandangan.jpg) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/pemandangan.jpg"
          alt="Lanskap Pemandangan Persawahan & Gunung Padukuhan Wonosari"
          fill
          sizes="100vw"
          className="object-cover object-center brightness-[0.78] contrast-[1.08]"
        />

        {/* Seamless Vignette: Smooth transition from neighbouring sections with deep cinematic clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF6F0] via-black/55 to-[#FAF6F0] z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(10,20,10,0.65)_100%)] z-10 pointer-events-none" />

        {/* Ambient colored lighting */}
        <div className="absolute top-1/3 left-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-[#EF6C85]/20 blur-[120px] pointer-events-none z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header */}
        <AnimatedSection animation="fadeUp" className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/60 text-xs font-extrabold text-[#2C4119] mb-3.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#EF6C85]" />
            <span className="uppercase tracking-wider">Komoditas & Ekonomi Desa</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4 drop-shadow-xl">
            Potensi Unggulan{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-lime-200 to-amber-200 bg-clip-text text-transparent drop-shadow-md">
              Padukuhan Wonosari
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
            Keunggulan komoditas pertanian, olahan pangan lokal, serta inovasi lingkungan yang menjadi penggerak kesejahteraan masyarakat di tiga dusun.
          </p>
        </AnimatedSection>

        {/* Visual Cards Grid (Kotak-kotak keliatan jelas dan nyatu dengan backdrop-blur) */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8" staggerDelay={0.15}>
          {potensiData.map((item, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group flex flex-col bg-white/90 hover:bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/70 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:shadow-[0_25px_60px_rgba(0,35,12,0.35)] hover:border-emerald-400/50 transition-all duration-300 h-full"
              >
                {/* 1. Gambar Banner Ilustrasi Potensi */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-neutral-200">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Gradient Overlay on banner for Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  {/* Kategori Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold text-xs shadow-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Icon Badge */}
                  <div className="absolute top-4 right-4 z-10 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md">
                    {item.icon}
                  </div>

                  {/* Title Preview on Image */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* 2. Isi Narasi & Sorotan */}
                <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-xs sm:text-sm text-[#1E251E]/80 leading-relaxed mb-5 font-normal">
                      {item.description}
                    </p>

                    {/* Highlights List */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {item.highlights.map((hl, hIdx) => (
                        <span
                          key={hIdx}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#1E251E]/10 text-[#1E251E] shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{hl}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Link */}
                  <div className="pt-4 border-t border-[#1E251E]/10 flex items-center justify-between">
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#EF6C85] hover:text-[#D64E68] transition-colors group/link"
                    >
                      <span>{item.linkText}</span>
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Global CTA Button to UMKM */}
        <AnimatedSection animation="fadeUp" delay={0.4} className="text-center mt-14">
          <Link
            href="/umkm"
            className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-[#EF6C85] to-[#D64E68] hover:from-[#e65a75] hover:to-[#c43e58] text-white font-extrabold px-8 py-4 rounded-full shadow-2xl shadow-rose-950/40 hover:scale-105 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Kunjungi Katalog Produk Lengkap UMKM</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
