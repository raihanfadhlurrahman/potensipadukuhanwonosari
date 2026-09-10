"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import { MapPin, Navigation, Clock, Bus, Phone, ExternalLink, Copy, Check } from "lucide-react";

const ALAMAT_LENGKAP = "7CCM+RCV, Wonosari, RT.02/RW.17, Pokoh, Wedomartani, Kec. Ngemplak, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55584";
const GMAPS_URL = "https://www.google.com/maps/search/?api=1&query=7CCM%2BRCV,+Wonosari,+RT.02/RW.17,+Pokoh,+Wedomartani,+Kec.+Ngemplak,+Kabupaten+Sleman,+Daerah+Istimewa+Yogyakarta+55584";
const GMAPS_EMBED_URL = "https://maps.google.com/maps?q=7CCM%2BRCV,+Wonosari,+RT.02/RW.17,+Pokoh,+Wedomartani,+Kec.+Ngemplak,+Kabupaten+Sleman,+Daerah+Istimewa+Yogyakarta+55584&t=&z=15&ie=UTF8&iwloc=&output=embed";

const ruteData = [
  {
    from: "Stadion Maguwoharjo",
    distance: "4 km",
    time: "8 mnt",
    mode: "Motor / Mobil",
  },
  {
    from: "Tugu Yogyakarta",
    distance: "13 km",
    time: "30 mnt",
    mode: "Mobil / Motor",
  },
  {
    from: "Stasiun Tugu Yogyakarta & Malioboro",
    distance: "15 km",
    time: "40 mnt",
    mode: "Mobil / Motor / Trans Jogja",
  },
  {
    from: "Alun-Alun Kidul",
    distance: "16 km",
    time: "42 mnt",
    mode: "Mobil / Motor",
  },
];

export default function LokasiPeta() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ALAMAT_LENGKAP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="lokasi-padukuhan" className="relative py-20 sm:py-28 bg-[#FAF6F0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <AnimatedSection animation="fadeUp" className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9DB368]">
            Lokasi & Akses
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E251E] mt-3 mb-4">
            Navigasi Menuju{" "}
            <span className="gradient-text-coral">Padukuhan</span>
          </h2>
          <p className="text-sm sm:text-base text-[#1E251E]/65">
            Peta wilayah dan panduan estimasi rute perjalanan untuk menuju Padukuhan
            Wonosari, RT.02/RW.17, Pokoh, Wedomartani, Sleman.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map Column */}
          <AnimatedSection animation="slideLeft" delay={0.2} className="lg:col-span-7 flex flex-col gap-4">
            <motion.div
              whileHover={{ scale: 1.005 }}
              className="relative rounded-3xl overflow-hidden border border-[#1E251E]/10 shadow-lg h-[400px] sm:h-[480px] bg-white"
            >
              {/* Google Maps Embed */}
              <iframe
                src={GMAPS_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Peta Padukuhan Wonosari Sleman"
              />

              {/* Overlay pin badge */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg border border-[#EF6C85]/20 max-w-[280px] sm:max-w-xs"
              >
                <div className="flex items-start gap-2.5">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-1.5 rounded-xl bg-[#FCE8EC] text-[#EF6C85] mt-0.5 shrink-0"
                  >
                    <MapPin className="w-4 h-4" />
                  </motion.div>
                  <div>
                    <div className="text-xs font-bold text-[#1E251E] flex items-center gap-1.5">
                      Padukuhan Wonosari
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#9DB368]/20 text-[#5F7038] font-semibold">
                        RT 02 / RW 17
                      </span>
                    </div>
                    <div className="text-[11px] text-[#1E251E]/60 mt-0.5 line-clamp-2">
                      Pokoh, Wedomartani, Ngemplak, Sleman, DIY 55584
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Address Box & Google Maps Button */}
            <div className="bg-white rounded-2xl border border-[#1E251E]/10 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-stone-100 text-[#1E251E] shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-[#EF6C85]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9DB368]">
                    Alamat Lengkap & Plus Code
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[#1E251E] mt-0.5 leading-snug break-words">
                    {ALAMAT_LENGKAP}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleCopy}
                  title="Salin Alamat"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-[#1E251E] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>

                <a
                  href={GMAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#EF6C85] hover:bg-[#D9556E] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Buka di Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Route Info Column */}
          <AnimatedSection animation="slideRight" delay={0.3} className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-[#EF6C85]/20 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#EF6C85]" />
                  <h3 className="text-base font-bold text-[#1E251E]">Estimasi Rute Perjalanan</h3>
                </div>
                <span className="text-[11px] font-semibold text-[#9DB368] bg-[#9DB368]/10 px-2.5 py-1 rounded-full">
                  Akses Cepat
                </span>
              </div>

              <div className="space-y-3">
                {ruteData.map((rute, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/5 hover:border-[#EF6C85]/30 hover:bg-rose-50/20 transition-all cursor-default"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#FCE8EC] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bus className="w-4 h-4 text-[#EF6C85]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#1E251E] truncate">
                        {rute.from}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#1E251E]/65">
                        <span className="flex items-center gap-1 font-semibold text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-[#EF6C85]" />
                          {rute.distance}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {rute.time}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#7B904A] font-medium mt-1">
                        Transportasi: {rute.mode}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact & Help Card */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-[#1E251E] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden"
            >
              <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-[#EF6C85]/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-[#EF6C85]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#EF6C85]">
                  Butuh Bantuan Navigasi?
                </span>
              </div>
              <p className="text-xs text-white/70 mb-4 leading-relaxed">
                Hubungi Pak Dukuh Wonosari (Triswanto).
              </p>
              <a
                href="https://wa.me/6285729135249?text=Halo%20Pak%20Triswanto,%20apakah%20benar%20ini%20dengan%20Pak%20Dukuh%20Wonosari%3F%20Saya%20ingin%20menanyakan%20informasi%20tentang%20Padukuhan%20Wonosari."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#9DB368] hover:bg-[#7B904A] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                💬 Hubungi Pak Dukuh via WhatsApp
              </a>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
