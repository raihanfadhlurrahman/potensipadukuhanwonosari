"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Compass,
  ChevronRight,
  Home,
  MapPin,
  Calendar,
  Sparkles,
  TreePine,
  Clock,
  ExternalLink,
  Wheat,
  Recycle,
  Landmark,
  CheckCircle2,
  Navigation,
  Inbox,
  PlusCircle,
  Loader2,
  Camera,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DestinasiItem {
  id: string | number;
  nama_destinasi: string;
  kategori: string;
  dusun: string;
  deskripsi: string;
  htm_tiket: number;
  fasilitas: string[];
  foto_url?: string;
  lokasi_gmaps_link?: string | null;
  is_featured?: boolean;
}

interface KebudayaanItem {
  id: string | number;
  nama_agenda: string;
  kategori: string;
  deskripsi: string;
  foto_cover?: string;
  lokasi?: string;
  penanggung_jawab?: string;
}

export default function WisataPage() {
  const [destinasiList, setDestinasiList] = useState<DestinasiItem[]>([]);
  const [kebudayaanList, setKebudayaanList] = useState<KebudayaanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("wonosari_approved_wisata");
        }

        // 100% Fetch Destinasi dari Supabase Database
        const { data: dest, error: destErr } = await supabase
          .from("destinasi_wisata")
          .select("*")
          .eq("status", "APPROVED")
          .order("created_at", { ascending: false });

        if (!destErr && dest) {
          const mappedDest: DestinasiItem[] = dest.map((d: any) => {
            let parsedFasilitas: string[] = [];
            if (Array.isArray(d.fasilitas)) {
              parsedFasilitas = d.fasilitas;
            } else if (typeof d.fasilitas === "string") {
              try {
                parsedFasilitas = JSON.parse(d.fasilitas);
              } catch {
                parsedFasilitas = d.fasilitas.split(",").map((s: string) => s.trim()).filter(Boolean);
              }
            }

            return {
              id: d.id,
              nama_destinasi: d.nama_destinasi,
              kategori: d.kategori || "Wisata Desa",
              dusun: d.dusun || "Wonosari",
              deskripsi: d.deskripsi || "",
              htm_tiket: Number(d.htm_tiket) || 0,
              fasilitas: parsedFasilitas,
              foto_url: (d.foto_urls && Array.isArray(d.foto_urls) && d.foto_urls.length > 0 ? d.foto_urls[0] : null) || d.foto_url || null,
              lokasi_gmaps_link: d.lokasi_gmaps_link || null,
              is_featured: Boolean(d.is_featured),
            };
          });
          setDestinasiList(mappedDest);
        } else {
          setDestinasiList([]);
        }

        // 100% Fetch Kebudayaan Padukuhan dari Supabase Database
        const { data: ag, error: agErr } = await supabase
          .from("agenda_budaya")
          .select("*")
          .order("created_at", { ascending: false });

        if (!agErr && ag) {
          setKebudayaanList(ag);
        } else {
          setKebudayaanList([]);
        }
      } catch (err) {
        console.warn("Wisata data fetch notice:", err);
        setDestinasiList([]);
        setKebudayaanList([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1E251E] pb-20">
      {/* 1. Hero Header */}
      <section className="relative py-8 sm:py-12 overflow-hidden border-b border-[#EF6C85]/15 bg-gradient-to-b from-[#EBF2DC]/40 via-[#FAF6F0] to-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#1E251E]/60 mb-3">
            <Link href="/" className="hover:text-[#EF6C85] transition-colors flex items-center gap-1 font-medium">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#9DB368] font-semibold">Destinasi & Kebudayaan</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2DC] text-[#4D6328] text-xs font-bold mb-3 shadow-xs">
                <Compass className="w-3.5 h-3.5" />
                <span>Potensi Alam & Kearifan Lokal</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1E251E] tracking-tight leading-tight mb-4">
                Destinasi Wisata & <span className="gradient-text-sage">Tradisi Budaya</span>
              </h1>
              <p className="text-sm sm:text-base text-[#1E251E]/70 leading-relaxed">
                Jelajahi keasrian alam dan kearifan lokal Padukuhan Wonosari (Dusun Rejosari RW 18, Dusun Wonosari RW 17, Dusun Pajangan RW 16).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#1E251E] hover:bg-neutral-800 px-4 py-2.5 rounded-2xl shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-[#9DB368]" />
                <span>+ Usulkan Spot Wisata</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid Destinasi Unggulan */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E251E]">Spot Daya Tarik Desa</h2>
              <p className="text-xs sm:text-sm text-[#1E251E]/60 mt-1">
                Eksplorasi titik-titik kunjungan alam, edukasi, dan budaya lokal warga 3 dusun.
              </p>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#4D6328] font-bold bg-[#EBF2DC] px-3.5 py-2 rounded-2xl border border-[#9DB368]/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Akses Ramah Pengunjung</span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#9DB368] mb-3" />
              <p className="text-xs font-semibold text-[#1E251E]/70">Memuat data destinasi dari database...</p>
            </div>
          )}

          {/* Empty State jika Kosong */}
          {!isLoading && destinasiList.length === 0 && (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300 shadow-xs max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF6F0] flex items-center justify-center mx-auto mb-4 text-[#9DB368]">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1E251E] mb-2">Belum Ada Data Destinasi Wisata</h3>
              <p className="text-xs text-[#1E251E]/60 max-w-md mx-auto mb-6 leading-relaxed">
                Saat ini belum ada data destinasi wisata yang dimasukkan atau disetujui di database. Anda dapat mengusulkan spot wisata baru untuk Padukuhan Wonosari.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 bg-[#9DB368] hover:bg-[#7B904A] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Usulkan Spot Wisata Sekarang</span>
              </Link>
            </div>
          )}

          {/* Data List */}
          {!isLoading && destinasiList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {destinasiList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-[#9DB368]/30 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {item.foto_url ? (
                      <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                        <img
                          src={item.foto_url}
                          alt={item.nama_destinasi}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-emerald-700 shadow-xs">
                            Tiket: {item.htm_tiket === 0 ? "Gratis" : `Rp ${item.htm_tiket.toLocaleString("id-ID")}`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 w-full bg-gradient-to-br from-[#FAF6F0] to-[#EBF2DC] flex items-center justify-center text-[#9DB368] p-4 relative">
                        <Compass className="w-10 h-10 opacity-40" />
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-emerald-700 shadow-xs">
                            Tiket: {item.htm_tiket === 0 ? "Gratis" : `Rp ${item.htm_tiket.toLocaleString("id-ID")}`}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF6F0] text-[10px] font-bold border border-[#1E251E]/10 flex items-center gap-1 text-[#1E251E]/70">
                          <MapPin className="w-3 h-3 text-[#EF6C85]" />
                          {item.dusun}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#1E251E] mb-1.5 leading-snug">{item.nama_destinasi}</h3>
                      <span className="inline-block text-[11px] font-bold text-[#4D6328] bg-[#EBF2DC] px-2.5 py-0.5 rounded-md mb-3">
                        {item.kategori}
                      </span>
                      <p className="text-xs text-[#1E251E]/70 leading-relaxed mb-4">{item.deskripsi}</p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-0 border-t border-[#1E251E]/5 mt-auto space-y-3.5">
                    {item.fasilitas && item.fasilitas.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-[#1E251E]/60 uppercase tracking-wider mb-2 pt-3">
                          Fasilitas Kunjungan:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.fasilitas.map((f, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] text-[10px] font-medium text-[#1E251E]/80 border border-[#1E251E]/5">
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tombol Klik Buka Google Maps */}
                    <a
                      href={
                        item.lokasi_gmaps_link ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.nama_destinasi + " Wonosari Wedomartani Ngemplak Sleman")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#9DB368] to-[#4D6328] hover:brightness-105 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-95"
                      title="Buka rute titik lokasi di Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Buka Rute di Google Maps</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Kebudayaan Padukuhan Wonosari (Cukup Gambar & Judul) */}
      <section className="py-14 border-t border-[#EF6C85]/10 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCE8EC] text-[#D64E68] text-xs font-bold mb-2">
                <Landmark className="w-3.5 h-3.5" />
                <span>Kekayaan Adat & Tradisi Leluhur</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1E251E]">
                Kebudayaan <span className="gradient-text-coral">Padukuhan Wonosari</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#1E251E]/65 mt-1.5 max-w-xl">
                Ragam tradisi, seni adat, dan guyub rukun warga Padukuhan Wonosari yang dilestarikan secara turun-temurun.
              </p>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#1E251E] hover:bg-neutral-800 px-4 py-2.5 rounded-2xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#EF6C85]" />
              <span>+ Kelola Kebudayaan</span>
            </Link>
          </div>

          {/* Loading Kebudayaan */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#EF6C85] mx-auto mb-2" />
              <p className="text-xs text-stone-500">Memuat data kebudayaan...</p>
            </div>
          )}

          {/* Empty State Kebudayaan */}
          {!isLoading && kebudayaanList.length === 0 && (
            <div className="text-center py-14 px-4 bg-[#FAF6F0] rounded-3xl border border-dashed border-stone-300 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FCE8EC] flex items-center justify-center mx-auto mb-3 text-[#EF6C85]">
                <Landmark className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[#1E251E] mb-1">Belum Ada Kebudayaan yang Ditambahkan</h4>
              <p className="text-xs text-[#1E251E]/60 max-w-md mx-auto mb-5 leading-relaxed">
                Dokumentasi tradisi, adat istiadat, dan kesenian warga Padukuhan Wonosari dapat ditambahkan langsung oleh Bapak Kepala Dukuh atau Admin via panel kendali.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 bg-[#EF6C85] hover:bg-[#D9556E] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Kebudayaan Sekarang</span>
              </Link>
            </div>
          )}

          {/* List Kebudayaan (Cukup Gambar & Judul Saja) */}
          {!isLoading && kebudayaanList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {kebudayaanList.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl border border-[#EF6C85]/20 bg-white transition-all duration-300 flex flex-col"
                >
                  {/* GAMBAR KEBUDAYAAN */}
                  <div className="relative h-64 w-full overflow-hidden bg-neutral-100">
                    {item.foto_cover ? (
                      <img
                        src={item.foto_cover}
                        alt={item.nama_agenda}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FAF6F0] via-[#FCE8EC]/50 to-[#EBF2DC] flex items-center justify-center text-[#EF6C85]/40">
                        <Landmark className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                    {/* JUDUL & KATEGORI DI ATAS GAMBAR */}
                    <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                      {item.kategori && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold mb-2 border border-white/30">
                          {item.kategori}
                        </span>
                      )}
                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-md">
                        {item.nama_agenda}
                      </h3>
                      {item.deskripsi && (
                        <p className="text-xs text-white/80 line-clamp-2 mt-1.5 leading-relaxed drop-shadow-sm font-normal">
                          {item.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Petunjuk Arah & Google Maps */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1E251E] to-[#2B352B] rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9DB368]">Petunjuk Akses Wisata</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-3">
                Kunjungi Padukuhan Wonosari
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4">
                Berlokasi di Kalurahan Wedomartani, Kapanewon Ngemplak, Sleman. Akses jalan aspal mulus, dapat dijangkau roda dua maupun roda empat dengan mudah dari Stadion Maguwoharjo atau Ring Road Utara Yogyakarta.
              </p>
              <div className="text-xs text-white/60">
                📍 7CCM+RCV, Wonosari, RT.02/RW.17, Pokoh, Wedomartani, Kec. Ngemplak, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55584
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <a
                href="https://www.google.com/maps/search/?api=1&query=7CCM%2BRCV,+Wonosari,+RT.02/RW.17,+Pokoh,+Wedomartani,+Kec.+Ngemplak,+Kabupaten+Sleman,+Daerah+Istimewa+Yogyakarta+55584"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#EF6C85] to-[#D64E68] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Buka Petunjuk Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
