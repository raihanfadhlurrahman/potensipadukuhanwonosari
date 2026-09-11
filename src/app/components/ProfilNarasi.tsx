"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import { Quote, Award, BookOpen } from "lucide-react";

export default function ProfilNarasi() {
  return (
    <section className="relative py-20 sm:py-32 bg-white overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#FCE8EC]/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#EBF2DC]/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <AnimatedSection animation="fadeUp" className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#EF6C85]">
            Tentang Kami
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E251E] mt-3 mb-4 leading-tight">
            Profil & Narasi{" "}
            <span className="gradient-text-mixed">Sejarah Desa</span>
          </h2>
          <p className="text-sm sm:text-base text-[#1E251E]/65 leading-relaxed">
            Menyelami asal-usul, filosofi gotong-royong, dan karakter unik
            masyarakat Padukuhan Wonosari yang telah mengakar kuat selama
            berpuluh-puluh tahun.
          </p>
        </AnimatedSection>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Left — Narrative */}
          <AnimatedSection animation="slideLeft" delay={0.2}>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF2DC] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#7B904A]" />
                </div>
                <h3 className="text-xl font-bold text-[#1E251E]">Asal-Usul Padukuhan</h3>
              </div>

              <p className="text-sm sm:text-base text-[#1E251E]/75 leading-relaxed">
                Padukuhan Wonosari merupakan salah satu padukuhan di Kalurahan
                Wedomartani, Kapanewon Ngemplak, Kabupaten Sleman, Daerah Istimewa
                Yogyakarta. Wilayah ini terdiri dari tiga dusun yang memiliki karakter
                unik masing-masing: Dusun Rejosari (RW 18), Dusun Wonosari (RW 17),
                dan Dusun Pajangan (RW 16).
              </p>

              <p className="text-sm sm:text-base text-[#1E251E]/75 leading-relaxed">
                Nama &ldquo;Wonosari&rdquo; berasal dari bahasa Jawa — <em>Wono</em>{" "}
                yang berarti hutan atau alam, dan <em>Sari</em> yang berarti sari
                pati atau keindahan. Masyarakat memaknainya sebagai tanah yang
                subur, hijau, dan penuh kebaikan alam.
              </p>

              <div className="flex gap-4 pt-2">
                <div className="flex-1 bg-[#FAF6F0] rounded-xl p-4 border border-[#9DB368]/20">
                  <div className="text-2xl font-extrabold text-[#EF6C85]">3</div>
                  <div className="text-xs font-semibold text-[#1E251E]/70">Dusun Berdaya</div>
                </div>
                <div className="flex-1 bg-[#FAF6F0] rounded-xl p-4 border border-[#EF6C85]/20">
                  <div className="text-2xl font-extrabold text-[#9DB368]">5 RT</div>
                  <div className="text-xs font-semibold text-[#1E251E]/70">Lingkungan Warga</div>
                </div>
                <div className="flex-1 bg-[#FAF6F0] rounded-xl p-4 border border-[#9DB368]/20">
                  <div className="text-2xl font-extrabold text-[#EF6C85]">100%</div>
                  <div className="text-xs font-semibold text-[#1E251E]/70">Gotong Royong</div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right — Visual Card */}
          <AnimatedSection animation="slideRight" delay={0.3}>
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02, rotate: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-[#FAF6F0] to-[#FCE8EC]/50 rounded-3xl p-8 border border-[#EF6C85]/20 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#EF6C85]/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#EF6C85]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1E251E]">
                      Visi Padukuhan Wonosari
                    </div>
                    <div className="text-xs text-[#1E251E]/50">
                      Cita-cita bersama warga
                    </div>
                  </div>
                </div>

                <blockquote className="text-sm sm:text-base text-[#1E251E]/80 leading-relaxed italic border-l-4 border-[#9DB368] pl-4 mb-6">
                  &ldquo;Mewujudkan Padukuhan Wonosari yang mandiri, sejahtera,
                  dan berbudaya melalui semangat gotong royong serta
                  pemanfaatan potensi lokal untuk kemajuan bersama.&rdquo;
                </blockquote>

                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase text-[#1E251E]/50 tracking-wider">
                    Misi Strategis
                  </div>
                  {[
                    "Meningkatkan kapasitas ekonomi melalui UMKM warga",
                    "Melestarikan tradisi budaya & kearifan lokal Jawa",
                    "Mengoptimalkan pelayanan kesehatan Posyandu",
                    "Membangun infrastruktur digital desa yang inklusif",
                  ].map((misi, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1E251E]/75"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#EBF2DC] text-[#7B904A] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{misi}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-white px-3 py-2 rounded-xl shadow-lg border border-[#9DB368]/30"
              >
                <span className="text-lg">🏡</span>
                <span className="text-[10px] font-bold text-[#1E251E] ml-1">Est. Turun Temurun</span>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>

        {/* Sambutan Kepala Dukuh */}
        <AnimatedSection animation="fadeUp" delay={0.1}>
          <div className="relative bg-[#1E251E] rounded-3xl p-8 sm:p-12 overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#EF6C85]/10 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#9DB368]/10 blur-[60px]" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative w-52 sm:w-60 h-72 sm:h-84 rounded-3xl bg-gradient-to-t from-white/15 via-white/5 to-transparent flex items-end justify-center border border-white/20 overflow-hidden p-3 shadow-2xl backdrop-blur-xs group"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/pakdukuh.png"
                      alt="Triswanto - Kepala Dukuh Wonosari"
                      fill
                      className="object-contain object-bottom drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                  </div>
                </motion.div>
              </div>
              <div className="md:col-span-8">
                <Quote className="w-8 h-8 text-[#EF6C85]/40 mb-3" />
                <blockquote className="text-sm sm:text-base text-white/85 leading-relaxed italic mb-4">
                  &ldquo;Padukuhan Wonosari adalah rumah bagi masyarakat yang menjunjung
                  tinggi nilai-nilai gotong royong dan kerukunan antar warga. Kami berharap
                  website ini mampu menjadi jendela digital untuk memperkenalkan
                  potensi dan keindahan padukuhan kami kepada dunia yang lebih luas.&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-0.5 bg-[#EF6C85]" />
                  <div>
                    <div className="text-sm sm:text-base font-black text-white">Triswanto</div>
                    <div className="text-xs text-[#9DB368] font-semibold">
                      Kepala Padukuhan Wonosari • Kalurahan Wedomartani
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
