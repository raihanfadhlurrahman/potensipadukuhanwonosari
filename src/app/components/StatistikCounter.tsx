"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, MapPin, Home, Briefcase } from "lucide-react";

interface CounterItemProps {
  end: number;
  suffix?: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function CounterItem({ end, suffix = "", label, sublabel, icon, color, delay = 0 }: CounterItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startDelay = setTimeout(() => {
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(startDelay);
  }, [isInView, end, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000, type: "spring" }}
      whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(30,37,30,0.1)" }}
      className="relative bg-white/90 rounded-2xl border border-[#1E251E]/8 p-6 sm:p-8 text-center group transition-all duration-300 overflow-hidden"
    >
      {/* Background accent on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          color === "coral"
            ? "bg-gradient-to-br from-[#FCE8EC]/30 to-transparent"
            : "bg-gradient-to-br from-[#EBF2DC]/30 to-transparent"
        }`}
      />

      <div className="relative z-10">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 ${
            color === "coral"
              ? "bg-[#FCE8EC] text-[#EF6C85]"
              : "bg-[#EBF2DC] text-[#7B904A]"
          }`}
        >
          {icon}
        </motion.div>

        <div className="preloader-counter">
          <span
            className={`text-3xl sm:text-5xl font-extrabold ${
              color === "coral" ? "text-[#EF6C85]" : "text-[#9DB368]"
            }`}
          >
            {count}
          </span>
          {suffix && (
            <span
              className={`text-lg sm:text-2xl font-bold ml-1 ${
                color === "coral" ? "text-[#EF6C85]" : "text-[#9DB368]"
              }`}
            >
              {suffix}
            </span>
          )}
        </div>

        <div className="text-sm font-bold text-[#1E251E] mt-2">{label}</div>
        <div className="text-[11px] text-[#1E251E]/55 mt-0.5">{sublabel}</div>

        {/* Progress bar decoration */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: delay / 1000 + 0.5, ease: "easeOut" }}
          className={`mt-4 h-1 rounded-full origin-left ${
            color === "coral"
              ? "bg-gradient-to-r from-[#EF6C85] to-[#FCE8EC]"
              : "bg-gradient-to-r from-[#9DB368] to-[#EBF2DC]"
          }`}
        />
      </div>
    </motion.div>
  );
}

export default function StatistikCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28 bg-[#FAF6F0] overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#FCE8EC]/30 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9DB368]">
            Data & Fakta
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E251E] mt-3 mb-4">
            Statistik Interaktif{" "}
            <span className="gradient-text-coral">Padukuhan</span>
          </h2>
          <p className="text-sm sm:text-base text-[#1E251E]/65">
            Angka-angka kunci yang menggambarkan potensi dan keunggulan wilayah
            Padukuhan Wonosari.
          </p>
        </motion.div>

        {/* Counter Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <CounterItem
            end={3}
            label="Dusun"
            sublabel="Rejosari, Wonosari, Pajangan"
            icon={<Home className="w-5 h-5" />}
            color="coral"
            delay={0}
          />
          <CounterItem
            end={5}
            suffix=" RT"
            label="Rukun Tetangga"
            sublabel="RT 01 s/d RT 05"
            icon={<MapPin className="w-5 h-5" />}
            color="sage"
            delay={200}
          />
          <CounterItem
            end={3}
            suffix=" RW"
            label="Rukun Warga"
            sublabel="RW 16, RW 17, RW 18"
            icon={<Users className="w-5 h-5" />}
            color="coral"
            delay={400}
          />
          <CounterItem
            end={45}
            suffix=" Hektar"
            label="Luas Wilayah"
            sublabel="Rejosari, Wonosari & Pajangan"
            icon={<Briefcase className="w-5 h-5" />}
            color="sage"
            delay={600}
          />
        </div>

        {/* KKN Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 bg-white rounded-2xl border border-[#EF6C85]/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#EF6C85] to-[#9DB368] flex items-center justify-center text-white font-extrabold text-lg shadow-md"
            >
              57
            </motion.div>
            <div>
              <div className="text-sm font-bold text-[#1E251E]">
                KKN UII Angkatan 73 — Unit 57
              </div>
              <div className="text-xs text-[#1E251E]/60">
                Kuliah Kerja Nyata, Universitas Islam Indonesia
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold text-[#9DB368] bg-[#EBF2DC] px-4 py-2 rounded-full">
            Pengabdian Masyarakat 2026
          </div>
        </motion.div>
      </div>
    </section>
  );
}
