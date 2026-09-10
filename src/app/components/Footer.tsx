"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

const quickLinks = [
  { href: "/", label: "Beranda" },
  { href: "/profil-desa", label: "Profil Desa" },
  { href: "/wisata", label: "Wisata & Budaya" },
  { href: "/umkm", label: "Katalog UMKM" },
  { href: "/stunting", label: "Skrining Stunting" },
  { href: "/monografis", label: "Data Monografi" },
  { href: "/artikel", label: "Kabar Desa" },
];

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <footer ref={ref} className="relative bg-[#1E251E] text-white pt-0 pb-12 overflow-hidden">
      {/* Wave Divider Top */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-16 sm:h-20"
          preserveAspectRatio="none"
        >
          <path
            fill="#FAF6F0"
            d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,0 L0,0 Z"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10"
        >
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/logoSleman.png"
                  alt="Logo Sleman"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative w-11 h-11">
                <Image
                  src="/images/logounit_Warna.PNG"
                  alt="Logo Unit 57"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="border-l border-white/20 pl-3">
                <div className="text-sm font-extrabold tracking-wide uppercase">
                  Padukuhan Wonosari
                </div>
                <div className="text-xs text-[#9DB368] font-medium">
                  Kalurahan Wedomartani, Ngemplak, Sleman
                </div>
              </div>
            </div>
            <p className="text-xs text-white/70 max-w-md leading-relaxed mb-4">
              Portal informasi publik dan etalase digital potensi desa yang dikembangkan untuk
              mempromosikan kemandirian UMKM, pariwisata lokal, serta keterbukaan informasi bagi
              warga Kampung Rejosari, Wonosari, dan Pajangan.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <MapPin className="w-3.5 h-3.5 text-[#EF6C85]" />
                <span>Balai Padukuhan Wonosari, Wedomartani, Ngemplak, Sleman, DIY</span>
              </div>
              <a
                href="https://wa.me/6285729135249?text=Halo%20Pak%20Triswanto,%20apakah%20benar%20ini%20dengan%20Pak%20Dukuh%20Wonosari%3F%20Saya%20ingin%20menanyakan%20informasi%20tentang%20Padukuhan%20Wonosari."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs text-white/60 hover:text-[#9DB368] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#9DB368]" />
                <span>WhatsApp Pak Dukuh Wonosari (Triswanto)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="mailto:padukuhanwonosari@gmail.com"
                className="flex items-center gap-2 text-xs text-white/60 hover:text-[#9DB368] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#9DB368]" />
                <span>padukuhanwonosari@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 md:col-start-7">
            <div className="text-xs font-bold uppercase tracking-wider text-[#EF6C85] mb-3">
              Navigasi Cepat
            </div>
            <ul className="space-y-2 text-xs text-white/70">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-white hover:pl-1 transition-all duration-200"
                  >
                    • {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Credit */}
          <div className="md:col-span-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9DB368] mb-3">
              Kolaborator Pengembang
            </div>
            <div className="text-xs text-white/80 space-y-1">
              <div className="font-bold text-white">KKN UII Angkatan 73 Unit 57</div>
              <div className="text-white/60">Pusat Kuliah Kerja Nyata</div>
              <div className="text-white/60">Universitas Islam Indonesia</div>
              <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-[#EF6C85]">
                Lead Developer: Raihan Fadhlurrahman
              </div>
            </div>

            {/* Social placeholder */}
            <div className="mt-4 flex gap-2">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#EF6C85]/30 flex items-center justify-center transition-colors text-white/70 hover:text-white text-xs font-bold"
              >
                IG
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#EF6C85]/30 flex items-center justify-center transition-colors text-white/70 hover:text-white text-xs font-bold"
              >
                YT
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#9DB368]/30 flex items-center justify-center transition-colors text-white/70 hover:text-white text-xs font-bold"
              >
                FB
              </a>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4"
        >
          <div>© 2026 Padukuhan Wonosari. Hak Cipta Dilindungi.</div>
          <div className="font-medium text-white/70 text-center sm:text-right">
            Designed & Developed by{" "}
            <span className="text-[#EF6C85] font-semibold">Raihan Fadhlurrahman</span> | KKN
            UII 73 Unit 57
          </div>
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-24 right-10 w-32 h-32 rounded-full bg-[#EF6C85]/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-[#9DB368]/5 blur-3xl" />
    </footer>
  );
}
