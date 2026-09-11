"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  HeartPulse,
  Sparkles,
  ChevronDown,
  Wheat,
  Home,
  Leaf,
  Compass,
  Store,
  Layers,
  Users,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#162016]"
    >
      {/* 1. BACKGROUND PHOTOGRAPHY LAYER (Fix: Pendopo & Sawah Wonosari) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgroundpadukuhan.jpeg"
          alt="Balai Pertemuan Pendopo & Hamparan Sawah Wonosari"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.78] contrast-[1.08]"
        />

        {/* Cinematic Vignette & Deep Contrast Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-[#162016]/95 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10 pointer-events-none" />

        {/* Ambient Decorative Glow Lights */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-1/3 right-10 w-96 h-96 rounded-full bg-[#EF6C85]/20 blur-[120px] pointer-events-none z-10" />
      </div>

      {/* 2. MAIN HERO CONTENT */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 flex-1 flex flex-col justify-center items-center text-center">
        {/* Location Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/95 shadow-lg mb-5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <MapPin className="w-4 h-4 text-emerald-300" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            Kalurahan Wedomartani, Kapanewon Ngemplak, Sleman, D.I. Yogyakarta
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.14] mb-4 drop-shadow-xl max-w-4xl"
        >
          <span className="block">Pesona Keasrian &</span>
          <span className="block">Potensi Mandiri</span>
          <span className="block bg-gradient-to-r from-emerald-300 via-lime-200 to-amber-200 bg-clip-text text-transparent drop-shadow-md pb-0.5">
            Padukuhan Wonosari
          </span>
        </motion.h1>

        {/* Tagline Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed mb-6 max-w-2xl mx-auto drop-shadow-sm font-normal"
        >
          Harmoni kehidupan agraris, kebersamaan gotong-royong, serta geliat komoditas
          lokal dan ekonomi warga di tiga dusun berdaya:{" "}
          <strong className="text-emerald-300 font-bold">Rejosari</strong>,{" "}
          <strong className="text-rose-300 font-bold">Wonosari</strong>, dan{" "}
          <strong className="text-emerald-300 font-bold">Pajangan</strong>.
        </motion.p>

        {/* 3 Dusun Badges with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-5"
        >
          {[
            { icon: Wheat, name: "Dusun Rejosari", rw: "RW 18", color: "border-emerald-400/40 text-emerald-200" },
            { icon: Home, name: "Dusun Wonosari", rw: "RW 17", color: "border-rose-400/40 text-rose-200" },
            { icon: Leaf, name: "Dusun Pajangan", rw: "RW 16", color: "border-emerald-400/40 text-emerald-200" },
          ].map((dusun) => {
            const IconComp = dusun.icon;
            return (
              <div
                key={dusun.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border ${dusun.color} shadow-sm hover:bg-white/25 transition-all`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{dusun.name} ({dusun.rw})</span>
              </div>
            );
          })}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2.5 mb-5 w-full max-w-2xl"
        >
          <Link
            href="/profil-desa"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#EF6C85] to-[#D64E68] hover:from-[#e65a75] hover:to-[#c43e58] text-white font-extrabold px-5 py-2.5 rounded-full shadow-xl shadow-rose-950/40 hover:scale-105 transition-all text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4 text-rose-100" />
            <span>Jelajahi Profil Desa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/wisata"
            className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-bold px-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all text-xs sm:text-sm"
          >
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>Destinasi Wisata</span>
          </Link>

          <Link
            href="/umkm"
            className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-bold px-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all text-xs sm:text-sm"
          >
            <Store className="w-4 h-4 text-amber-300" />
            <span>Katalog UMKM</span>
          </Link>

          <Link
            href="/stunting"
            className="inline-flex items-center justify-center gap-2 bg-black/40 hover:bg-black/55 backdrop-blur-md text-white/90 border border-white/25 font-semibold px-4 py-2.5 rounded-full shadow-md hover:scale-105 transition-all text-xs"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Skrining Gizi</span>
          </Link>
        </motion.div>

        {/* 4 Bottom Highlight Cards (Glassmorphism stats) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-4xl"
        >
          <div className="bg-black/35 backdrop-blur-md border border-white/15 p-3 rounded-2xl text-left">
            <div className="flex items-center gap-2 text-emerald-300 mb-0.5">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">3 Dusun Berdaya</span>
            </div>
            <p className="text-xs text-white/80 font-medium">Rejosari, Wonosari & Pajangan</p>
          </div>

          <div className="bg-black/35 backdrop-blur-md border border-white/15 p-3 rounded-2xl text-left">
            <div className="flex items-center gap-2 text-lime-300 mb-0.5">
              <Home className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">5 Rukun Tetangga</span>
            </div>
            <p className="text-xs text-white/80 font-medium">RT 01 s.d RT 05 Guyub Rukun</p>
          </div>

          <div className="bg-black/35 backdrop-blur-md border border-white/15 p-3 rounded-2xl text-left">
            <div className="flex items-center gap-2 text-rose-300 mb-0.5">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">700+ Jiwa Warga</span>
            </div>
            <p className="text-xs text-white/80 font-medium">Masyarakat Gotong Royong</p>
          </div>

          <div className="bg-black/35 backdrop-blur-md border border-white/15 p-3 rounded-2xl text-left">
            <div className="flex items-center gap-2 text-amber-300 mb-0.5">
              <Wheat className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Agraris & Pangan</span>
            </div>
            <p className="text-xs text-white/80 font-medium">Sawah, Jagung, & UMKM Lokal</p>
          </div>
        </motion.div>
      </div>

      {/* 3. FOOTER BAR OF HERO: SCROLL INDICATOR (CLEAN, CENTERED, NO OVERLAP) */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-5 pt-3 flex items-center justify-center text-white/70">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-white/60 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-xs">
          <span>Scroll untuk Menjelajahi</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4 text-emerald-300" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
