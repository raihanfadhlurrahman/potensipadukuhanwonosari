"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";
import { Heart, Eye, X, Wheat, HeartHandshake, Theater, Baby, Landmark, PartyPopper, MapPin } from "lucide-react";

const galleryItems = [
  {
    icon: Wheat,
    title: "Panen Raya Padi",
    subtitle: "Dusun Rejosari (RW 18)",
    description: "Warga bergotong-royong memanen padi di sawah irigasi yang subur.",
    category: "Pertanian",
    color: "sage",
  },
  {
    icon: HeartHandshake,
    title: "Kerja Bakti Warga",
    subtitle: "Seluruh Padukuhan",
    description: "Semangat gotong royong membersihkan lingkungan dan saluran irigasi.",
    category: "Gotong Royong",
    color: "coral",
  },
  {
    icon: Theater,
    title: "Kesenian Jawa Tradisional",
    subtitle: "Balai Padukuhan",
    description: "Pertunjukan seni karawitan dan tari Jawa dalam acara merti dusun.",
    category: "Budaya",
    color: "sage",
  },
  {
    icon: Baby,
    title: "Posyandu Balita Aktif",
    subtitle: "Dusun Wonosari (RW 17)",
    description: "Kegiatan penimbangan dan pemantauan tumbuh kembang balita tiap bulan.",
    category: "Kesehatan",
    color: "coral",
  },
  {
    icon: Landmark,
    title: "Kegiatan Keagamaan",
    subtitle: "Masjid & Mushola Padukuhan",
    description: "Pengajian rutin, yasinan bersama, dan kegiatan TPA anak-anak.",
    category: "Keagamaan",
    color: "sage",
  },
  {
    icon: PartyPopper,
    title: "Kenduri & Syukuran",
    subtitle: "Dusun Pajangan (RW 16)",
    description: "Tradisi kenduri nasi tumpeng dalam merayakan kebersamaan warga.",
    category: "Tradisi",
    color: "coral",
  },
];

export default function KehidupanBudaya() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
      {/* Decorative parallax-like background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#FCE8EC]/40 blur-[60px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[#EBF2DC]/40 blur-[60px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <AnimatedSection animation="fadeUp" className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#EF6C85]">
            Human Interest
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E251E] mt-3 mb-4">
            Kehidupan Warga &{" "}
            <span className="gradient-text-mixed">Budaya Lokal</span>
          </h2>
          <p className="text-sm sm:text-base text-[#1E251E]/65">
            Dokumentasi keseharian, tradisi adat, dan momen kebersamaan warga
            Padukuhan Wonosari yang penuh kehangatan.
          </p>
        </AnimatedSection>

        {/* Masonry-style Gallery Grid */}
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          staggerDelay={0.1}
        >
          {galleryItems.map((item, idx) => (
            <StaggerItem key={idx}>
              <motion.div
                whileHover={{ y: -6 }}
                onClick={() => setSelectedItem(idx)}
                className={`cursor-pointer group relative rounded-2xl overflow-hidden border border-[#1E251E]/8 transition-all duration-300 hover:shadow-xl ${
                  idx === 0 || idx === 5 ? "sm:row-span-1" : ""
                }`}
              >
                {/* Image placeholder with gradient */}
                <div
                  className={`h-48 sm:h-56 flex items-center justify-center relative overflow-hidden ${
                    item.color === "coral"
                      ? "bg-gradient-to-br from-[#FCE8EC] via-[#FAF6F0] to-[#FCE8EC]"
                      : "bg-gradient-to-br from-[#EBF2DC] via-[#FAF6F0] to-[#EBF2DC]"
                  }`}
                >
                  <motion.div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md ${
                      item.color === "coral"
                        ? "bg-white text-[#EF6C85]"
                        : "bg-white text-[#7B904A]"
                    }`}
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <item.icon className="w-10 h-10" />
                  </motion.div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#1E251E]/0 group-hover:bg-[#1E251E]/40 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-[#1E251E]" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                        item.color === "coral"
                          ? "bg-[#EF6C85]/80 text-white"
                          : "bg-[#9DB368]/80 text-white"
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white p-4">
                  <h4 className="text-sm font-bold text-[#1E251E] mb-1 group-hover:text-[#EF6C85] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#1E251E]/55">{item.subtitle}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedItem !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E251E]/80 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`h-52 sm:h-64 flex items-center justify-center ${
                    galleryItems[selectedItem].color === "coral"
                      ? "bg-gradient-to-br from-[#FCE8EC] to-[#FAF6F0]"
                      : "bg-gradient-to-br from-[#EBF2DC] to-[#FAF6F0]"
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-xl ${
                      galleryItems[selectedItem].color === "coral"
                        ? "bg-white text-[#EF6C85]"
                        : "bg-white text-[#7B904A]"
                    }`}
                  >
                    {React.createElement(galleryItems[selectedItem].icon, { className: "w-14 h-14" })}
                  </motion.div>
                </div>
                <div className="p-6 sm:p-8">
                  <span
                    className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-3 ${
                      galleryItems[selectedItem].color === "coral"
                        ? "bg-[#FCE8EC] text-[#D64E68]"
                        : "bg-[#EBF2DC] text-[#7B904A]"
                    }`}
                  >
                    {galleryItems[selectedItem].category}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#1E251E] mb-2">
                    {galleryItems[selectedItem].title}
                  </h3>
                  <p className="text-xs text-[#9DB368] font-semibold mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#9DB368]" />
                    <span>{galleryItems[selectedItem].subtitle}</span>
                  </p>
                  <p className="text-sm text-[#1E251E]/70 leading-relaxed">
                    {galleryItems[selectedItem].description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#1E251E]" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
