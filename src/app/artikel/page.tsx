"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Newspaper,
  ChevronRight,
  ChevronLeft,
  Home,
  Calendar,
  User,
  Clock,
  Sparkles,
  Camera,
  Search,
  MessageCircle,
  X,
  MapPin,
  Tag,
  ArrowRight,
  BookOpen,
  PlusCircle,
  Shield,
  CheckCircle2,
  Inbox,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ArticleItem {
  id: string | number;
  title: string;
  slug?: string;
  category: string;
  excerpt: string;
  content: string;
  author_name: string;
  created_at: string;
  views_count?: number;
  image_url?: string | null;
  images: string[];
}

interface GaleriItem {
  id: string | number;
  judul: string;
  kategori: string;
  dusun: string;
  caption: string;
  tanggal_kegiatan: string;
  media_url: string;
}

const KATEGORI_ARTIKEL = [
  "Semua Kategori",
  "Kabar Desa",
  "Kegiatan KKN",
  "Kesehatan & Posyandu",
  "Pertanian & UMKM",
  "Sosial & Gotong Royong",
];

export default function ArtikelPage() {
  const [activeTab, setActiveTab] = useState<"artikel" | "galeri">("artikel");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [galeri, setGaleri] = useState<GaleriItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState("Semua Kategori");
  const [searchQuery, setSearchQuery] = useState("");
  const [readModal, setReadModal] = useState<ArticleItem | null>(null);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);
  const [activePhotoModal, setActivePhotoModal] = useState<GaleriItem | null>(null);

  useEffect(() => {
    async function loadArticles() {
      setIsLoading(true);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("wonosari_approved_artikel");
        }

        // 100% Fetch Artikel APPROVED dari Supabase Database
        const { data: art, error: artErr } = await supabase
          .from("artikel")
          .select("*")
          .eq("status", "APPROVED")
          .order("created_at", { ascending: false });

        if (!artErr && art) {
          const mappedArticles = art.map((a: any) => {
            const rawCover = a.cover_image || a.image_url || a.foto_url || null;
            let images: string[] = [];
            if (rawCover) {
              const trimmed = typeof rawCover === "string" ? rawCover.trim() : "";
              if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                  const parsed = JSON.parse(trimmed);
                  if (Array.isArray(parsed)) images = parsed.filter(Boolean);
                } catch (e) {}
              }
              if (images.length === 0 && rawCover) {
                images = [rawCover];
              }
            }

            return {
              id: a.id,
              title: a.title || a.judul || "Warta Padukuhan",
              slug: a.slug || `artikel-${a.id}`,
              category: a.category || a.kategori || "Kabar Desa",
              excerpt: a.excerpt || (a.content ? a.content.substring(0, 160) + "..." : ""),
              content: a.content || a.isi || "",
              author_name: a.author_name || a.penulis || "Pengurus Padukuhan",
              created_at: a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Terbaru",
              views_count: a.views_count || 0,
              image_url: images[0] || null,
              images: images,
            };
          });
          setArticles(mappedArticles);
        } else {
          setArticles([]);
        }

        // Fetch Galeri Foto dari Supabase Database
        const { data: gal, error: galErr } = await supabase
          .from("galeri_desa")
          .select("*")
          .order("created_at", { ascending: false });

        if (!galErr && gal) {
          const mappedGaleri = gal.map((g: any) => ({
            id: g.id,
            judul: g.judul || "Dokumentasi Kegiatan",
            kategori: g.kategori || "Kegiatan",
            dusun: g.dusun || "Wonosari",
            caption: g.caption || g.deskripsi || "",
            tanggal_kegiatan: g.tanggal_kegiatan || (g.created_at ? new Date(g.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : ""),
            media_url: g.media_url || g.foto_url || "",
          }));
          setGaleri(mappedGaleri);
        } else {
          setGaleri([]);
        }
      } catch (err) {
        console.warn("Articles fetch notice:", err);
        setArticles([]);
        setGaleri([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKategori =
        selectedKategori === "Semua Kategori"
          ? true
          : selectedKategori === "Sosial & Gotong Royong"
          ? item.category === "Sosial & Gotong Royong" || item.category === "Gotong Royong"
          : item.category === selectedKategori;
      return matchSearch && matchKategori;
    });
  }, [articles, searchQuery, selectedKategori]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1E251E] pb-20">
      {/* 1. Header Hero */}
      <section className="relative py-8 sm:py-12 overflow-hidden border-b border-[#EF6C85]/15 bg-gradient-to-b from-[#FCE8EC]/30 via-[#FAF6F0] to-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#1E251E]/60 mb-3">
            <Link href="/" className="hover:text-[#EF6C85] transition-colors flex items-center gap-1 font-medium">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#EF6C85] font-semibold">Kabar Berita & Galeri</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8EC] text-[#D64E68] text-xs font-bold mb-3 shadow-xs">
                <Newspaper className="w-3.5 h-3.5" />
                <span>Warta & Visual Dokumentasi Desa</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1E251E] tracking-tight leading-tight mb-4">
                Warta & Dokumentasi <span className="gradient-text-coral">Padukuhan</span>
              </h1>
              <p className="text-sm sm:text-base text-[#1E251E]/70 leading-relaxed">
                Kumpulan kabar berita kegiatan warga, informasi pembangunan padukuhan, serta arsip foto kebersamaan masyarakat di Dusun Rejosari, Wonosari, dan Pajangan.
              </p>
            </div>

            {/* Tab Switcher & Tombol Ajukan Warta */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#EF6C85]/20 shadow-xs">
                <button
                  onClick={() => setActiveTab("artikel")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "artikel"
                      ? "bg-[#EF6C85] text-white shadow-xs"
                      : "text-[#1E251E]/70 hover:text-[#1E251E]"
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  <span>Kabar Berita ({articles.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("galeri")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "galeri"
                      ? "bg-[#9DB368] text-white shadow-xs"
                      : "text-[#1E251E]/70 hover:text-[#1E251E]"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Galeri Foto ({galeri.length})</span>
                </button>
              </div>

              <Link
                href="/admin"
                className="px-4 py-2.5 rounded-2xl bg-[#1E251E] hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-[#EF6C85]" />
                <span>+ Usulkan Warta / Foto</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Konten Tab ARTIKEL BERGAMBAR */}
      {activeTab === "artikel" && (
        <>
          <section className="sticky top-16 z-30 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#EF6C85]/10 py-3.5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {KATEGORI_ARTIKEL.map((kat) => (
                    <button
                      key={kat}
                      onClick={() => setSelectedKategori(kat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedKategori === kat
                          ? "bg-[#1E251E] text-white shadow-xs"
                          : "bg-white text-[#1E251E]/70 border border-[#1E251E]/10 hover:bg-neutral-50"
                      }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari warta berita..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3.5 py-1.5 pl-8 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#1E251E]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </section>

          <section className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-[#EF6C85] mb-3" />
                  <p className="text-xs font-semibold text-[#1E251E]/70">Memuat warta dari database...</p>
                </div>
              )}

              {/* Empty State jika Belum Ada Artikel Sama Sekali di Database */}
              {!isLoading && articles.length === 0 && (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300 shadow-xs max-w-2xl mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-[#FCE8EC] flex items-center justify-center mx-auto mb-4 text-[#EF6C85]">
                    <Inbox className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E251E] mb-2">Belum Ada Warta Berita</h3>
                  <p className="text-xs text-[#1E251E]/60 max-w-md mx-auto mb-6 leading-relaxed">
                    Saat ini belum ada artikel warta berita yang dimasukkan atau disetujui di database. Warga atau kader dapat berkontribusi menerbitkan warta kegiatan padukuhan.
                  </p>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 bg-[#EF6C85] hover:bg-[#D9556E] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Usulkan Warta Berita</span>
                  </Link>
                </div>
              )}

              {/* Empty State jika Pencarian/Kategori Tidak Ditemukan */}
              {!isLoading && articles.length > 0 && filteredArticles.length === 0 && (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-stone-200 shadow-xs max-w-md mx-auto">
                  <Search className="w-8 h-8 text-stone-400 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-[#1E251E] mb-1">Tidak Ada Warta yang Cocok</h4>
                  <p className="text-xs text-[#1E251E]/60 mb-4">
                    Tidak ditemukan warta dengan kata kunci atau filter kategori yang dipilih.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedKategori("Semua Kategori");
                    }}
                    className="text-xs font-bold text-[#EF6C85] hover:underline"
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              )}

              {/* Data List Artikel */}
              {!isLoading && filteredArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredArticles.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="group bg-white rounded-3xl border border-[#EF6C85]/15 hover:border-[#EF6C85]/40 p-4 sm:p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        {/* GAMBAR COVER ARTIKEL */}
                        {item.image_url ? (
                          <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden mb-4 bg-neutral-100">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                              <span className="px-3 py-1 rounded-full bg-[#EF6C85] text-white text-[10px] font-extrabold shadow-xs">
                                {item.category}
                              </span>
                              {item.images && item.images.length > 1 && (
                                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                                  <Camera className="w-3 h-3 text-[#EF6C85]" />
                                  <span>{item.images.length} Foto</span>
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-[11px] text-white/90 font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                              <Calendar className="w-3 h-3" />
                              <span>{item.created_at}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-[#FCE8EC]/50 to-[#FAF6F0] flex items-center justify-center p-4 border border-[#EF6C85]/20">
                            <Newspaper className="w-12 h-12 text-[#EF6C85]/40" />
                            <div className="absolute top-3 left-3 z-10">
                              <span className="px-3 py-1 rounded-full bg-[#EF6C85] text-white text-[10px] font-extrabold shadow-xs">
                                {item.category}
                              </span>
                            </div>
                            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-[11px] text-stone-600 font-medium bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-stone-200">
                              <Calendar className="w-3 h-3 text-[#EF6C85]" />
                              <span>{item.created_at}</span>
                            </div>
                          </div>
                        )}

                        <h3 className="text-lg font-black text-[#1E251E] group-hover:text-[#EF6C85] transition-colors leading-snug mb-2">
                          {item.title}
                        </h3>

                        <p className="text-xs text-[#1E251E]/70 leading-relaxed line-clamp-3 mb-6">
                          {item.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#1E251E]/5 flex items-center justify-between">
                        <div className="text-[11px] text-[#1E251E]/60 font-medium flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#9DB368]" />
                          <span>{item.author_name}</span>
                        </div>

                        <button
                          onClick={() => {
                            setReadModal(item);
                            setModalPhotoIdx(0);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FCE8EC] text-[#EF6C85] text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <span>Baca Warta</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* 3. Konten Tab GALERI FOTO */}
      {activeTab === "galeri" && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-[#9DB368] mb-3" />
                <p className="text-xs font-semibold text-[#1E251E]/70">Memuat galeri foto dari database...</p>
              </div>
            )}

            {/* Empty State Galeri */}
            {!isLoading && galeri.length === 0 && (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300 shadow-xs max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#EBF2DC] flex items-center justify-center mx-auto mb-4 text-[#4D6328]">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1E251E] mb-2">Belum Ada Foto Dokumentasi di Galeri</h3>
                <p className="text-xs text-[#1E251E]/60 max-w-md mx-auto mb-6 leading-relaxed">
                  Arsip visual dan foto kegiatan warga Padukuhan Wonosari belum ditambahkan ke database. Anda dapat mengusulkan foto kegiatan via portal admin.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-[#9DB368] hover:bg-[#7B904A] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Unggah Foto Dokumentasi</span>
                </Link>
              </div>
            )}

            {/* List Galeri Foto */}
            {!isLoading && galeri.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galeri.map((g) => (
                  <motion.div
                    key={g.id}
                    whileHover={{ y: -4 }}
                    className="group bg-white rounded-3xl border border-[#9DB368]/30 p-4 shadow-xs flex flex-col justify-between hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                    onClick={() => setActivePhotoModal(g)}
                  >
                    <div>
                      <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-3 bg-neutral-100">
                        <img
                          src={g.media_url}
                          alt={g.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EBF2DC] text-[#4D6328] text-[10px] font-bold border border-[#9DB368]/30 shadow-2xs">
                            {g.kategori}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 z-10 text-[10px] text-white font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#EF6C85]" />
                          <span>{g.dusun}</span>
                        </div>
                      </div>

                      <h4 className="text-base font-extrabold text-[#1E251E] group-hover:text-[#9DB368] transition-colors mb-1.5 line-clamp-1">
                        {g.judul}
                      </h4>
                      <p className="text-xs text-[#1E251E]/70 leading-relaxed line-clamp-2 mb-3">
                        {g.caption}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[#1E251E]/5 text-[10px] text-[#1E251E]/50 flex items-center justify-between font-medium">
                      <span>{g.tanggal_kegiatan}</span>
                      <span className="text-[#9DB368] font-bold group-hover:underline flex items-center gap-0.5">
                        Lihat Foto Lengkap →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Modal Baca Lengkap Artikel */}
      <AnimatePresence>
        {readModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EF6C85]/20 max-h-[85vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setReadModal(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Galeri Gambar di dalam Modal (Mendukung Multi-Foto) */}
              {readModal.images && readModal.images.length > 0 && (
                <div className="mb-6">
                  {/* Foto Utama Aktif dengan Navigasi Carousel */}
                  <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-black/5 border border-[#1E251E]/10 group">
                    <img
                      src={readModal.images[modalPhotoIdx] || readModal.images[0]}
                      alt={`${readModal.title} - Foto ${modalPhotoIdx + 1}`}
                      className="w-full h-full object-contain bg-black/90"
                    />

                    {/* Badge Indikator Foto */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Camera className="w-3.5 h-3.5 text-[#EF6C85]" />
                      <span>Foto {modalPhotoIdx + 1} dari {readModal.images.length}</span>
                    </div>

                    {/* Tombol Navigasi Prev/Next jika > 1 foto */}
                    {readModal.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalPhotoIdx((prev) => (prev > 0 ? prev - 1 : readModal.images.length - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-md cursor-pointer"
                          title="Foto Sebelumnya"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalPhotoIdx((prev) => (prev < readModal.images.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 shadow-md cursor-pointer"
                          title="Foto Berikutnya"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row jika lebih dari 1 foto */}
                  {readModal.images.length > 1 && (
                    <div className="flex items-center gap-2.5 mt-3 overflow-x-auto pb-1 max-w-full">
                      {readModal.images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setModalPhotoIdx(i)}
                          className={`relative w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                            modalPhotoIdx === i
                              ? "border-[#EF6C85] ring-2 ring-[#EF6C85]/30 scale-105 shadow-sm"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-[#1E251E]/50 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-[#FCE8EC] text-[#D64E68] font-bold text-[10px]">
                  {readModal.category}
                </span>
                <span>•</span>
                <span>{readModal.created_at}</span>
              </div>

              <h2 className="text-2xl font-black text-[#1E251E] leading-snug mb-2">
                {readModal.title}
              </h2>

              <p className="text-xs font-bold text-[#9DB368] mb-6 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Penulis: {readModal.author_name}</span>
              </p>

              <div className="prose prose-sm text-xs sm:text-sm text-[#1E251E]/80 leading-relaxed space-y-4 border-t border-[#1E251E]/10 pt-4">
                {readModal.content ? (
                  readModal.content.split("\n\n").map((paragraf, pIdx) => (
                    <p key={pIdx}>{paragraf}</p>
                  ))
                ) : (
                  <p>{readModal.excerpt}</p>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-[#1E251E]/10 flex justify-end">
                <button
                  onClick={() => setReadModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#1E251E] text-white text-xs font-bold hover:bg-[#1E251E]/90"
                >
                  Tutup Warta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Modal Lightbox Foto Galeri */}
      <AnimatePresence>
        {activePhotoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full h-72 sm:h-80 bg-black">
                <img
                  src={activePhotoModal.media_url}
                  alt={activePhotoModal.judul}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF2DC] text-[#4D6328]">
                    {activePhotoModal.kategori}
                  </span>
                  <span className="text-xs text-[#1E251E]/50 font-medium">{activePhotoModal.tanggal_kegiatan}</span>
                </div>
                <h3 className="text-lg font-black text-[#1E251E] mb-2">{activePhotoModal.judul}</h3>
                <p className="text-xs text-[#1E251E]/70 leading-relaxed mb-4">{activePhotoModal.caption}</p>
                <div className="text-xs text-[#EF6C85] font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activePhotoModal.dusun}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
