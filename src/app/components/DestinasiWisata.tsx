"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";
import Link from "next/link";
import { MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight, Camera, Wheat, Tractor, HeartHandshake, Recycle } from "lucide-react";

const destinasiData = [
  {
    title: "Tradisi Merti Dusun & Nyadran",
    icon: Wheat,
    category: "Budaya & Tradisi",
    description:
      "Upacara syukuran panen raya dan doa bersama untuk para leluhur desa. Diselenggarakan setahun sekali dengan kirab gunungan tumpeng, pertunjukan seni Jawa, dan kenduri bersama warga.",
    activities: ["Kirab Gunungan", "Kenduri Warga", "Doa Bersama"],
    distance: "Di pusat padukuhan",
    color: "sage",
  },
  {
    title: "Agrowisata Persawahan Hijau",
    icon: Tractor,
    category: "Alam & Agrowisata",
    description:
      "Jalur jalan santai menelusuri pematang sawah dengan pemandangan panorama Gunung Merapi dan Merbabu di pagi hari yang sejuk. Cocok untuk fotografi, bersepeda, dan wisata edukasi pertanian.",
    activities: ["Jalan Pagi", "Fotografi Lanskap", "Edukasi Tani"],
    distance: "Area Rejosari (RW 18)",
    color: "coral",
  },
  {
    title: "Kearifan Lokal Gotong Royong",
    icon: HeartHandshake,
    category: "Kehidupan Sosial",
    description:
      "Budaya sambatan dan kerja bakti dalam membersihkan saluran irigasi, pembangunan fasilitas warga, dan kegiatan pos ronda malam yang senantiasa menjaga keamanan lingkungan.",
    activities: ["Kerja Bakti", "Sambatan Warga", "Ronda Malam"],
    distance: "Seluruh wilayah",
    color: "sage",
  },
  {
    title: "Wisata Edukasi Bank Sampah BASAH",
    icon: Recycle,
    category: "Eco-Tourism",
    description:
      "Program pengelolaan sampah warga yang bisa menjadi destinasi wisata edukasi lingkungan. Belajar langsung proses pemilahan, pencatatan, dan pemanfaatan ulang limbah rumah tangga.",
    activities: ["Edukasi Sampah", "Workshop Daur Ulang", "Tour Lingkungan"],
    distance: "Kampung Rejosari",
    color: "coral",
  },
];

export default function DestinasiWisata() {
  const [activeIdx, setActiveIdx] = useState(0);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? destinasiData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === destinasiData.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative py-20 sm:py-28 bg-[#FAF6F0] overflow-hidden">
      {/* Decorative */}
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#FCE8EC]/30 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <AnimatedSection animation="fadeUp" className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9DB368]">
            Destinasi & Alam
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E251E] mt-3 mb-4">
            Wisata & Kebudayaan{" "}
            <span className="gradient-text-coral">Lokal</span>
          </h2>
          <p className="text-sm sm:text-base text-[#1E251E]/65">
            Jelajahi kekayaan tradisi dan panorama alam Padukuhan Wonosari yang
            memikat untuk dikunjungi.
          </p>
        </AnimatedSection>

        {/* Carousel + Featured Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative bg-white rounded-3xl border border-[#1E251E]/8 overflow-hidden shadow-sm h-full"
              >
                {/* Image placeholder / Icon Hero */}
                <div
                  className={`h-48 sm:h-56 flex items-center justify-center relative overflow-hidden ${
                    destinasiData[activeIdx].color === "coral"
                      ? "bg-gradient-to-br from-[#FCE8EC] via-[#FAF6F0] to-[#FCE8EC]"
                      : "bg-gradient-to-br from-[#EBF2DC] via-[#FAF6F0] to-[#EBF2DC]"
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center shadow-lg border backdrop-blur-md ${
                      destinasiData[activeIdx].color === "coral"
                        ? "bg-white/95 border-[#EF6C85]/20 text-[#EF6C85]"
                        : "bg-white/95 border-[#9DB368]/20 text-[#7B904A]"
                    }`}
                  >
                    {React.createElement(destinasiData[activeIdx].icon, { className: "w-12 h-12 sm:w-14 sm:h-14" })}
                  </motion.div>
                </div>

                <div className="p-6 sm:p-8">
                  <span
                    className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-3 ${
                      destinasiData[activeIdx].color === "coral"
                        ? "bg-[#FCE8EC] text-[#D64E68]"
                        : "bg-[#EBF2DC] text-[#7B904A]"
                    }`}
                  >
                    {destinasiData[activeIdx].category}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E251E] mb-3">
                    {destinasiData[activeIdx].title}
                  </h3>

                  <p className="text-sm text-[#1E251E]/70 leading-relaxed mb-5">
                    {destinasiData[activeIdx].description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {destinasiData[activeIdx].activities.map((act, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAF6F0] text-[#1E251E]/70 border border-[#1E251E]/8"
                      >
                        <Camera className="w-3 h-3" />
                        {act}
                      </motion.span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#1E251E]/55">
                    <MapPin className="w-3.5 h-3.5 text-[#EF6C85]" />
                    <span>{destinasiData[activeIdx].distance}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                {destinasiData.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeIdx
                        ? "bg-[#EF6C85] w-8"
                        : "bg-[#1E251E]/15 hover:bg-[#1E251E]/30"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-xl bg-white border border-[#1E251E]/10 flex items-center justify-center hover:bg-[#FCE8EC] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-xl bg-[#EF6C85] text-white flex items-center justify-center hover:bg-[#D64E68] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Side Cards */}
          <div className="lg:col-span-5">
            <StaggerContainer className="space-y-4" staggerDelay={0.12}>
              {destinasiData.map((item, idx) => (
                <StaggerItem key={idx}>
                  <motion.button
                    onClick={() => setActiveIdx(idx)}
                    whileHover={{ x: 6 }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      idx === activeIdx
                        ? "bg-white border-[#EF6C85]/40 shadow-md"
                        : "bg-white/50 border-[#1E251E]/8 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          idx === activeIdx
                            ? item.color === "coral"
                              ? "bg-[#FCE8EC] text-[#EF6C85]"
                              : "bg-[#EBF2DC] text-[#7B904A]"
                            : "bg-[#FAF6F0] text-[#1E251E]/60 group-hover:bg-[#EBF2DC]/50"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-bold transition-colors ${
                            idx === activeIdx ? "text-[#EF6C85]" : "text-[#1E251E]"
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#1E251E]/50 truncate">
                          {item.category} • {item.distance}
                        </div>
                      </div>
                      {idx === activeIdx && (
                        <motion.div
                          layoutId="active-wisata"
                          className="w-1.5 h-8 bg-[#EF6C85] rounded-full"
                        />
                      )}
                    </div>
                  </motion.button>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <AnimatedSection animation="fadeUp" delay={0.6} className="mt-6">
              <Link
                href="/wisata"
                className="group flex items-center justify-center gap-2 w-full bg-white border border-[#9DB368]/30 text-[#7B904A] font-semibold py-3.5 rounded-xl hover:bg-[#EBF2DC] transition-all"
              >
                <span>Lihat Semua Destinasi</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
