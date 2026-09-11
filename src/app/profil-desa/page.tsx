"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  Home,
  CheckCircle2,
  Sparkles,
  MapPin,
  Award,
  BookOpen,
  Wheat,
  Leaf,
  Landmark,
  Shield,
  HeartHandshake,
  Quote,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfilData {
  nama_padukuhan: string;
  tagline: string;
  visi: string;
  misi: string[];
  sejarah: string;
  nama_dukuh: string;
  sambutan_dukuh: string;
}

const DEFAULT_PROFIL: ProfilData = {
  nama_padukuhan: "Padukuhan Wonosari",
  tagline: "Harmoni Gotong Royong, Alam Asri, dan Kemandirian Warga",
  visi: "Mewujudkan Padukuhan Wonosari yang mandiri, sejahtera, berdaya saing, dan berbudaya luhur berbasis potensi pertanian, UMKM, dan kearifan lokal.",
  misi: [
    "Meningkatkan produktivitas pertanian dan ketahanan pangan warga berwawasan lingkungan.",
    "Mendorong kemajuan UMKM lokal berbasis digital dan jejaring kolaborasi ekonomi kreatif.",
    "Menjaga kelestarian tradisi seni, upacara merti dusun, dan kerukunan guyub rukun warga.",
    "Mewujudkan pelayanan kesehatan ibu, anak, dan lansia yang prima serta bebas stunting.",
    "Membangun keterbukaan informasi publik dan tata kelola padukuhan yang akuntabel.",
  ],
  sejarah:
    "Padukuhan Wonosari merupakan bagian integral dari Kalurahan Wedomartani di Kapanewon Ngemplak, Sleman. Wilayah ini secara historis tersusun dari tiga kampung bersejarah yang hidup rukun berdampingan: Kampung Rejosari (RW 18), Kampung Wonosari (RW 17), dan Kampung Pajangan (RW 16). Nama Wonosari berakar dari kata Wono (hutan/alam yang hijau dan asri) dan Sari (keindahan atau inti kebaikan), mencerminkan tanah yang subur di lereng selatan Gunung Merapi.",
  nama_dukuh: "Bapak Kepala Dukuh Wonosari",
  sambutan_dukuh:
    "Sugeng rawuh wonten ing portal resmi Padukuhan Wonosari. Website menika dipun bangun minangka wujud keterbukaan informasi, media promosi produk UMKM warga, sarana edukasi kesehatan stunting, ugi sarana nyawiji paseduluran ing antawisipun warga Kampung Rejosari, Wonosari, lan Pajangan. Mugi Gusti Ingkang Murbeng Dumadi tansah paring berkah keslametan tumrap kitha sedaya.",
};

const KAMPUNG_HISTORIES = [
  {
    id: "rejosari",
    nama: "Kampung Rejosari",
    rw: "RW 18 (RT 04 & RT 05)",
    icon: <Wheat className="w-5 h-5 text-[#9DB368]" />,
    color: "from-[#9DB368]/20 to-[#FAF6F0] border-[#9DB368]/30",
    badgeColor: "bg-[#EBF2DC] text-[#4D6328]",
    desc: "Rejosari bermakna 'kemakmuran yang sejati'. Kampung ini dikenal dengan hamparan persawahan teknis yang subur dan menjadi pelopor gerakan lingkungan melalui Bank Sampah BASAH yang mengelola limbah daur ulang.",
    keunggulan: ["Sentra Pertanian Padi & Jagung", "Inovasi Bank Sampah BASAH", "Tradisi Sambatan Irigasi"],
  },
  {
    id: "wonosari",
    nama: "Kampung Wonosari",
    rw: "RW 17 (RT 02 & RT 03)",
    icon: <Home className="w-5 h-5 text-[#EF6C85]" />,
    color: "from-[#EF6C85]/20 to-[#FAF6F0] border-[#EF6C85]/30",
    badgeColor: "bg-[#FCE8EC] text-[#D64E68]",
    desc: "Wonosari merupakan pusat pemerintahan padukuhan. Di kampung ini berdiri Balai Padukuhan yang menjadi pusat musyawarah warga, kegiatan kebudayaan kenduri merti dusun, serta sentra UMKM peyek & aneka camilan gurih.",
    keunggulan: ["Pusat Administrasi & Balai Padukuhan", "Sentra Produksi Peyek Bu Siti", "Pentas Tradisi Seni Jawa"],
  },
  {
    id: "pajangan",
    nama: "Kampung Pajangan",
    rw: "RW 16 (RT 01)",
    icon: <Leaf className="w-5 h-5 text-[#E8A838]" />,
    color: "from-[#E8A838]/20 to-[#FAF6F0] border-[#E8A838]/30",
    badgeColor: "bg-[#FFF4DC] text-[#9A6B17]",
    desc: "Pajangan memiliki suasana pedesaan yang tenang dan asri di sisi barat. Terkenal dengan peternakan itik/bebek petelur penghasil telur asin masir gurih, serta budidaya lebah madu klanceng murni.",
    keunggulan: ["Peternakan Bebek & Telur Asin", "Budidaya Madu Klanceng Murni", "Kegiatan Pemuda Aktif"],
  },
];

const DEFAULT_APARATUR = [
  { id: "ap-1", nama: "Triswanto", jabatan: "Kepala Dukuh Wonosari", kategori: "Pemerintah Padukuhan", wilayah: "Seluruh Wilayah", nomor_hp: "6285729135249", foto_url: "/images/pakdukuh.png" },
  { id: "ap-2", nama: "Ketua RW 18 Rejosari", jabatan: "Ketua RW 18", kategori: "Pemerintah Padukuhan", wilayah: "Rejosari", nomor_hp: "6281234567818" },
  { id: "ap-3", nama: "Ketua RW 17 Wonosari", jabatan: "Ketua RW 17", kategori: "Pemerintah Padukuhan", wilayah: "Wonosari", nomor_hp: "6281234567817" },
  { id: "ap-4", nama: "Ketua RW 16 Pajangan", jabatan: "Ketua RW 16", kategori: "Pemerintah Padukuhan", wilayah: "Pajangan", nomor_hp: "6281234567816" },
  { id: "ap-5", nama: "Ketua RT 01 Pajangan", jabatan: "Ketua RT 01", kategori: "Pemerintah Padukuhan", wilayah: "Pajangan", nomor_hp: "6281234567801" },
  { id: "ap-6", nama: "Ketua RT 02 Wonosari", jabatan: "Ketua RT 02", kategori: "Pemerintah Padukuhan", wilayah: "Wonosari", nomor_hp: "6281234567802" },
  { id: "ap-7", nama: "Ketua RT 03 Wonosari", jabatan: "Ketua RT 03", kategori: "Pemerintah Padukuhan", wilayah: "Wonosari", nomor_hp: "6281234567803" },
  { id: "ap-8", nama: "Ketua RT 04 Rejosari", jabatan: "Ketua RT 04", kategori: "Pemerintah Padukuhan", wilayah: "Rejosari", nomor_hp: "6281234567804" },
  { id: "ap-9", nama: "Ketua RT 05 Rejosari", jabatan: "Ketua RT 05", kategori: "Pemerintah Padukuhan", wilayah: "Rejosari", nomor_hp: "6281234567805" },
  { id: "ap-10", nama: "Ketua TP-PKK Wonosari", jabatan: "Ketua Pemberdayaan Perempuan", kategori: "Kelembagaan Masyarakat", wilayah: "Seluruh Wilayah", nomor_hp: "6281234567820" },
  { id: "ap-11", nama: "Ketua Karang Taruna Padukuhan", jabatan: "Koordinator Pemuda & Olahraga", kategori: "Kelembagaan Masyarakat", wilayah: "Seluruh Wilayah", nomor_hp: "6281234567821" },
  { id: "ap-12", nama: "Komandan Linmas Wonosari", jabatan: "Ketenteraman & Ketertiban", kategori: "Kelembagaan Masyarakat", wilayah: "Seluruh Wilayah", nomor_hp: "6281234567822" },
  { id: "ap-13", nama: "Pengurus Karang Taruna Rejosari", jabatan: "Koordinator Pemuda Rejosari", kategori: "Kelembagaan Masyarakat", wilayah: "Rejosari", nomor_hp: "6281234567823" },
  { id: "ap-14", nama: "Pengurus Karang Taruna Pajangan", jabatan: "Koordinator Pemuda Pajangan", kategori: "Kelembagaan Masyarakat", wilayah: "Pajangan", nomor_hp: "6281234567824" },
  { id: "ap-15", nama: "Pengelola Bank Sampah BASAH", jabatan: "Koordinator Lingkungan Hidup", kategori: "Kelembagaan Masyarakat", wilayah: "Rejosari", nomor_hp: "6281234567825" },
];

export default function ProfilDesaPage() {
  const [profil, setProfil] = useState<ProfilData>(DEFAULT_PROFIL);
  const [activeKampung, setActiveKampung] = useState(KAMPUNG_HISTORIES[1].id);
  const [aparaturList, setAparaturList] = useState(DEFAULT_APARATUR);
  const [selectedWilayah, setSelectedWilayah] = useState<string>("ALL");

  useEffect(() => {
    async function loadProfil() {
      try {
        const { data } = await supabase.from("profil_padukuhan").select("*").limit(1).single();
        if (data) {
          setProfil({
            nama_padukuhan: data.nama_padukuhan || DEFAULT_PROFIL.nama_padukuhan,
            tagline: data.tagline || DEFAULT_PROFIL.tagline,
            visi: data.visi || DEFAULT_PROFIL.visi,
            misi: Array.isArray(data.misi) ? data.misi : DEFAULT_PROFIL.misi,
            sejarah: data.sejarah || DEFAULT_PROFIL.sejarah,
            nama_dukuh: data.nama_dukuh || DEFAULT_PROFIL.nama_dukuh,
            sambutan_dukuh: data.sambutan_dukuh || DEFAULT_PROFIL.sambutan_dukuh,
          });
        }

        const { data: dbAparatur } = await supabase.from("aparatur_desa").select("*").eq("is_active", true);
        if (dbAparatur && dbAparatur.length > 0) {
          setAparaturList(
            dbAparatur.map((a: any) => ({
              id: a.id,
              nama: a.nama,
              jabatan: a.jabatan,
              kategori: a.kategori_kelembagaan || "Kelembagaan Masyarakat",
              wilayah: a.wilayah_tugas || "Seluruh Wilayah",
              nomor_hp: a.nomor_hp,
              foto_url: a.foto_url,
            }))
          );
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem("wonosari_aparatur_custom");
        }
      } catch (err) {
        console.warn("Profil fetch notice:", err);
      }
    }
    loadProfil();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1E251E] pb-20">
      {/* 1. Header Hero */}
      <section className="relative py-6 sm:py-8 overflow-hidden border-b border-[#EF6C85]/15 bg-gradient-to-b from-[#FCE8EC]/40 via-[#FAF6F0] to-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#1E251E]/60 mb-3">
            <Link href="/" className="hover:text-[#EF6C85] transition-colors flex items-center gap-1 font-medium">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#EF6C85] font-semibold">Profil & Tata Kelola</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8EC] text-[#D64E68] text-xs font-bold mb-3 shadow-xs">
              <Landmark className="w-3.5 h-3.5" />
              <span>Pemerintahan & Sejarah Padukuhan</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1E251E] tracking-tight leading-tight mb-4">
              Profil Resmi <span className="gradient-text-coral">{profil.nama_padukuhan}</span>
            </h1>
            <p className="text-sm sm:text-base text-[#1E251E]/70 leading-relaxed">
              Kalurahan Wedomartani, Kapanewon Ngemplak, Kabupaten Sleman, D.I. Yogyakarta. Sebuah wilayah yang menjunjung tinggi kebersamaan, kearifan budaya Jawa, dan ketahanan ekonomi warga.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Sambutan Kepala Dukuh */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#EF6C85]/20 p-6 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar / Portrait Frame Full */}
              <div className="flex-shrink-0 text-center flex flex-col items-center">
                <div className="relative w-56 sm:w-64 h-80 sm:h-96 rounded-3xl bg-gradient-to-b from-[#FCE8EC] via-[#FFF8EE] to-[#FAF6F0] border-2 border-[#EF6C85]/25 p-3 shadow-md flex items-end justify-center overflow-hidden mb-3 group">
                  <div className="absolute inset-0 bg-[radial-gradient(#EF6C85_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/pakdukuh.png"
                      alt="Triswanto - Kepala Dukuh Wonosari"
                      fill
                      className="object-contain object-bottom drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#1E251E]">
                  {profil.nama_dukuh === "Bapak Kepala Dukuh Wonosari" ? "Triswanto" : profil.nama_dukuh}
                </h3>
                <p className="text-xs sm:text-sm text-[#EF6C85] font-bold">Kepala Padukuhan Wonosari</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-[#1E251E]/60 bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#1E251E]/10">
                  Pemerintah Padukuhan Wonosari
                </span>
              </div>

              {/* Teks Sambutan */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EF6C85] mb-3">
                  <Quote className="w-4 h-4" />
                  <span>Kata Sambutan Kepala Dukuh</span>
                </div>
                <p className="text-sm sm:text-base text-[#1E251E]/80 italic leading-relaxed mb-4">
                  "{profil.sambutan_dukuh}"
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-[#1E251E]/60">
                  <span className="px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#1E251E]/10">
                    🏛️ Kalurahan Wedomartani
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#1E251E]/10">
                    📍 Kapanewon Ngemplak, Sleman
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Visi & Misi Padukuhan */}
      <section className="py-10 border-t border-[#EF6C85]/10 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kartu Visi */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#1E251E] to-[#2E3B2E] rounded-3xl p-6 sm:p-8 text-white shadow-md">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-[#EF6C85]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#EF6C85]">Arah & Tujuan Bersama</span>
              <h2 className="text-2xl font-black text-white mt-1 mb-4">Visi Padukuhan</h2>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed italic border-l-2 border-[#EF6C85] pl-4">
                "{profil.visi}"
              </p>
            </div>

            {/* Kartu Misi */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EF6C85]/15 p-6 sm:p-8 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#EBF2DC] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#4D6328]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4D6328]">Langkah Nyata Pembangunan</span>
              <h2 className="text-2xl font-black text-[#1E251E] mt-1 mb-4">5 Poin Misi Utama</h2>

              <div className="space-y-3">
                {profil.misi.map((poin, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF6F0] border border-[#1E251E]/5">
                    <span className="w-6 h-6 rounded-full bg-[#EF6C85] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-[#1E251E]/80 leading-relaxed font-medium">
                      {poin}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sejarah & Keberagaman 3 Kampung */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCE8EC] text-[#D64E68] text-xs font-bold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Nilai Historis Wilayah</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E251E]">Sejarah Asal-Usul 3 Kampung</h2>
            <p className="text-xs text-[#1E251E]/65 mt-1">
              Kenali karakteristik unik dan warisan leluhur dari ketiga kampung yang membentuk Padukuhan Wonosari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KAMPUNG_HISTORIES.map((kampung) => (
              <div
                key={kampung.id}
                className={`bg-gradient-to-b ${kampung.color} rounded-3xl p-6 border shadow-xs flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-2xl bg-white shadow-xs">
                      {kampung.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${kampung.badgeColor}`}>
                      {kampung.rw}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#1E251E] mb-2">{kampung.nama}</h3>
                  <p className="text-xs text-[#1E251E]/75 leading-relaxed mb-4">{kampung.desc}</p>
                </div>

                <div className="pt-4 border-t border-[#1E251E]/10">
                  <div className="text-[10px] font-bold text-[#1E251E]/60 uppercase tracking-wider mb-2">
                    Ciri Khas & Keunggulan:
                  </div>
                  <ul className="space-y-1 text-xs text-[#1E251E]/80">
                    {kampung.keunggulan.map((k, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#9DB368]" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bagan SOTK & Struktur Organisasi */}
      <section className="py-12 border-t border-[#EF6C85]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2DC] text-[#4D6328] text-xs font-bold mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Struktur Organisasi Tata Kerja (SOTK)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E251E]">Pemerintahan & Lembaga Padukuhan</h2>
              <p className="text-xs text-[#1E251E]/65 mt-1">
                Bagan kepengurusan wilayah yang bertugas melayani dan mengayomi kebutuhan seluruh warga di 3 dusun dan tingkat padukuhan.
              </p>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-[#1E251E]/15 hover:border-[#EF6C85] text-xs font-bold text-[#1E251E] shadow-2xs transition-all self-start sm:self-auto"
            >
              <span>⚙️ Kelola Struktur (Pak Dukuh)</span>
            </Link>
          </div>

          {/* Filter Wilayah Dusun */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#FAF6F0] rounded-2xl border border-[#1E251E]/10 mb-8 shadow-2xs">
            <span className="text-[10px] font-bold text-[#1E251E]/50 px-2">Filter Wilayah:</span>
            <button
              onClick={() => setSelectedWilayah("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWilayah === "ALL" ? "bg-[#1E251E] text-white shadow-xs" : "text-[#1E251E]/60 hover:text-[#1E251E]"
              }`}
            >
              Semua Wilayah ({aparaturList.length})
            </button>
            <button
              onClick={() => setSelectedWilayah("Seluruh Wilayah")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWilayah === "Seluruh Wilayah" ? "bg-[#EF6C85] text-white shadow-xs" : "text-[#1E251E]/60 hover:text-[#1E251E]"
              }`}
            >
              Gabungan 3 Dusun ({aparaturList.filter((a) => a.wilayah === "Seluruh Wilayah").length})
            </button>
            <button
              onClick={() => setSelectedWilayah("Rejosari")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWilayah === "Rejosari" ? "bg-[#9DB368] text-white shadow-xs" : "text-[#1E251E]/60 hover:text-[#1E251E]"
              }`}
            >
              Kampung Rejosari ({aparaturList.filter((a) => a.wilayah === "Rejosari").length})
            </button>
            <button
              onClick={() => setSelectedWilayah("Wonosari")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWilayah === "Wonosari" ? "bg-[#E8A838] text-white shadow-xs" : "text-[#1E251E]/60 hover:text-[#1E251E]"
              }`}
            >
              Kampung Wonosari ({aparaturList.filter((a) => a.wilayah === "Wonosari").length})
            </button>
            <button
              onClick={() => setSelectedWilayah("Pajangan")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWilayah === "Pajangan" ? "bg-[#8B5CF6] text-white shadow-xs" : "text-[#1E251E]/60 hover:text-[#1E251E]"
              }`}
            >
              Kampung Pajangan ({aparaturList.filter((a) => a.wilayah === "Pajangan").length})
            </button>
          </div>

          <div className="space-y-8">
            {["Pemerintah Padukuhan", "Kelembagaan Masyarakat"].map((kat) => {
              const members = aparaturList.filter((m) => {
                const matchKategori = m.kategori === kat;
                const matchWilayah = selectedWilayah === "ALL" ? true : m.wilayah === selectedWilayah;
                return matchKategori && matchWilayah;
              });

              if (members.length === 0) return null;

              return (
                <div key={kat} className="bg-[#FAF6F0] rounded-3xl p-6 border border-[#1E251E]/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#EF6C85]">
                      {kat} ({members.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white rounded-2xl p-4 border border-[#1E251E]/10 flex items-center gap-3 shadow-2xs hover:shadow-sm transition-all"
                      >
                        {member.foto_url ? (
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-[#EF6C85]/20 bg-[#FAF6F0]">
                            <Image
                              src={member.foto_url}
                              alt={member.nama}
                              fill
                              className="object-cover object-top"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#FCE8EC] text-[#EF6C85] flex items-center justify-center font-black text-xs flex-shrink-0">
                            {member.jabatan.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-[#1E251E] truncate">{member.jabatan}</h4>
                          <p className="text-[11px] text-[#1E251E]/60 truncate">{member.nama}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                member.wilayah === "Seluruh Wilayah"
                                  ? "bg-[#FCE8EC] text-[#D64E68]"
                                  : member.wilayah === "Rejosari"
                                  ? "bg-[#EBF2DC] text-[#4D6328]"
                                  : member.wilayah === "Wonosari"
                                  ? "bg-[#FFF4DC] text-[#9A6B17]"
                                  : "bg-purple-50 text-purple-700"
                              }`}
                            >
                              {member.wilayah === "Seluruh Wilayah" ? "Gabungan 3 Dusun" : member.wilayah}
                            </span>
                            {member.nomor_hp && (
                              <span className="text-[10px] text-[#1E251E]/40 font-mono">
                                {member.nomor_hp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
