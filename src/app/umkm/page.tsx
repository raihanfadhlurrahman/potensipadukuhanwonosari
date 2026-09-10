"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Store,
  ChevronRight,
  Home,
  Search,
  MapPin,
  MessageCircle,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  Filter,
  CheckCircle2,
  X,
  Upload,
  Image as ImageIcon,
  Clock,
  Shield,
  Tag,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface UMKMItem {
  id: string | number;
  nama_produk: string;
  nama_usaha: string;
  nama_pemilik: string;
  dusun: "Rejosari" | "Wonosari" | "Pajangan" | string;
  rt_rw?: string;
  kategori: string;
  harga: number;
  satuan: string;
  deskripsi: string;
  whatsapp_owner: string;
  foto_url?: string | null;
  lokasi_gmaps_link?: string | null;
  status?: "APPROVED" | "PENDING" | "REJECTED";
  is_featured?: boolean;
}

const DUSUN_TABS = [
  { id: "Semua", label: "Semua Wilayah" },
  { id: "Rejosari", label: "Rejosari (RW 18)" },
  { id: "Wonosari", label: "Wonosari (RW 17)" },
  { id: "Pajangan", label: "Pajangan (RW 16)" },
];

const KATEGORI_OPTIONS = [
  "Semua Kategori",
  "Olahan Pangan & Keripik",
  "Pertanian & Bibit",
  "Kerajinan & Kreatif",
];

const SAMPLE_PHOTO_OPTIONS = [
  { label: "Makanan / Keripik", url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=800&auto=format&fit=crop" },
  { label: "Camilan Pisang", url: "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?q=80&w=800&auto=format&fit=crop" },
  { label: "Telur / Peternakan", url: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=800&auto=format&fit=crop" },
  { label: "Kerajinan Kriya", url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop" },
  { label: "Minuman Herbal", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800&auto=format&fit=crop" },
];

export default function UmkmPage() {
  // Data 100% langsung dari database Supabase (tanpa data mock/dummy lokal)
  const [umkmList, setUmkmList] = useState<UMKMItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDusun, setSelectedDusun] = useState<string>("Semua");
  const [selectedKategori, setSelectedKategori] = useState<string>("Semua Kategori");
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  // Form states for new product (Kontributor submission)
  const [formNamaProduk, setFormNamaProduk] = useState("");
  const [formNamaUsaha, setFormNamaUsaha] = useState("");
  const [formNamaPemilik, setFormNamaPemilik] = useState("");
  const [formDusun, setFormDusun] = useState<"Rejosari" | "Wonosari" | "Pajangan">("Wonosari");
  const [formKategori, setFormKategori] = useState("Olahan Pangan & Keripik");
  const [formHarga, setFormHarga] = useState<number | "">("");
  const [formSatuan, setFormSatuan] = useState("Bungkus 250gr");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formWhatsApp, setFormWhatsApp] = useState("");
  const [formGmapsLink, setFormGmapsLink] = useState("");
  const [formFotoUrl, setFormFotoUrl] = useState(SAMPLE_PHOTO_OPTIONS[0].url);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview lokal instan
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setIsUploading(true);

    // Konversi ke base64 agar langsung tersimpan & tampil di galeri lokal
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormFotoUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);

    // Coba upload ke Supabase Storage bucket 'media-padukuhan' jika sudah dibuat
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `umkm-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("media-padukuhan")
        .upload(`umkm/${fileName}`, file, { cacheControl: "3600", upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("media-padukuhan")
          .getPublicUrl(`umkm/${fileName}`);
        if (publicUrlData?.publicUrl) {
          setFormFotoUrl(publicUrlData.publicUrl);
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload notice (menggunakan base64 data):", storageErr);
    }
  };

  // Load items 100% dari Supabase Database
  useEffect(() => {
    async function fetchUMKM() {
      setIsLoading(true);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("wonosari_approved_umkm");
        }
        const { data, error } = await supabase
          .from("umkm")
          .select("*")
          .eq("status", "APPROVED")
          .order("is_featured", { ascending: false });

        if (!error && data) {
          const mapped = data.map((u: any) => ({
            ...u,
            lokasi_gmaps_link: u.lokasi_gmaps_link || (u.alamat_usaha && u.alamat_usaha.startsWith("http") ? u.alamat_usaha : null),
          }));
          setUmkmList(mapped);
        } else {
          setUmkmList([]);
        }
      } catch (err) {
        console.warn("Fetch UMKM notice:", err);
        setUmkmList([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUMKM();
  }, []);

  const filteredItems = useMemo(() => {
    return umkmList.filter((item) => {
      const matchSearch =
        item.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nama_usaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nama_pemilik.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDusun =
        selectedDusun === "Semua" ? true : item.dusun.toLowerCase().includes(selectedDusun.toLowerCase());

      const matchKategori =
        selectedKategori === "Semua Kategori" ? true : item.kategori === selectedKategori;

      return matchSearch && matchDusun && matchKategori;
    });
  }, [umkmList, searchQuery, selectedDusun, selectedKategori]);

  const handleOrderWhatsApp = (item: UMKMItem) => {
    const cleanPhone = item.whatsapp_owner.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Halo ${item.nama_pemilik} (${item.nama_usaha}), salam hangat! Saya melihat produk "${item.nama_produk}" di Website Resmi Padukuhan Wonosari dan tertarik untuk memesan. Boleh info ketersediaan stoknya? Terima kasih.`
    );
    const waUrl = `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}?text=${message}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleAjukanProduk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaProduk || !formNamaUsaha || !formNamaPemilik || !formHarga || !formWhatsApp) return;

    const cleanGmaps = formGmapsLink.trim();
    const newItem: UMKMItem = {
      id: `pending-${Date.now()}`,
      nama_produk: formNamaProduk,
      nama_usaha: formNamaUsaha,
      nama_pemilik: formNamaPemilik,
      dusun: formDusun,
      kategori: formKategori,
      harga: Number(formHarga),
      satuan: formSatuan,
      deskripsi: formDeskripsi || "Produk lokal berkualitas warga Padukuhan Wonosari.",
      whatsapp_owner: formWhatsApp,
      foto_url: formFotoUrl || SAMPLE_PHOTO_OPTIONS[0].url,
      lokasi_gmaps_link: cleanGmaps || null,
      status: "PENDING",
      is_featured: false,
    };

    // 1. Simpan ke database Supabase (status PENDING agar di-review Pak Dukuh)
    try {
      const basePayload: any = {
        nama_produk: newItem.nama_produk,
        nama_usaha: newItem.nama_usaha,
        nama_pemilik: newItem.nama_pemilik,
        dusun: newItem.dusun,
        kategori: newItem.kategori,
        harga: newItem.harga,
        satuan: newItem.satuan,
        deskripsi: newItem.deskripsi,
        whatsapp_owner: newItem.whatsapp_owner,
        foto_url: newItem.foto_url,
        alamat_usaha: cleanGmaps || null,
        status: "PENDING",
      };

      const { error: insertErr } = await supabase.from("umkm").insert({
        ...basePayload,
        lokasi_gmaps_link: cleanGmaps || null,
      });

      if (insertErr && insertErr.code === "42703") {
        // Fallback jika kolom lokasi_gmaps_link belum ada di server remote
        await supabase.from("umkm").insert(basePayload);
      }
    } catch (err) {
      console.warn("Supabase insert notice:", err);
    }

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowRegisterModal(false);
      // Reset form
      setFormNamaProduk("");
      setFormNamaUsaha("");
      setFormNamaPemilik("");
      setFormHarga("");
      setFormDeskripsi("");
      setFormWhatsApp("");
      setFormGmapsLink("");
    }, 2500);
  };

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
            <span className="text-[#EF6C85] font-semibold">Etalase UMKM Warga</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8EC] text-[#D64E68] text-xs font-bold mb-3 shadow-xs">
                <Store className="w-3.5 h-3.5" />
                <span>Pemberdayaan Ekonomi Kerakyatan</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1E251E] tracking-tight leading-tight mb-4">
                Katalog Produk & Usaha{" "}
                <span className="gradient-text-coral">Warga Wonosari</span>
              </h1>
              <p className="text-sm sm:text-base text-[#1E251E]/70 leading-relaxed">
                Dukung kemandirian para pelaku usaha lokal di 3 kampung bersejarah:
                <strong> Rejosari (RW 18)</strong>, <strong>Wonosari (RW 17)</strong>, dan <strong>Pajangan (RW 16)</strong>. Pesan produk asli buatan warga langsung ke nomor WhatsApp pemilik!
              </p>
            </div>

            {/* Tombol Ajukan Usaha Warga (Kontributor) */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#EF6C85] to-[#D64E68] text-white font-bold text-sm shadow-md hover:shadow-lg hover:brightness-105 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Daftarkan Usaha Anda</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter & Pencarian Bar */}
      <section className="sticky top-16 z-30 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#EF6C85]/10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Tab Dusun */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {DUSUN_TABS.map((tab) => {
                const isActive = selectedDusun === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedDusun(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#1E251E] text-white shadow-sm"
                        : "bg-white/80 hover:bg-white text-[#1E251E]/70 border border-[#1E251E]/10"
                    }`}
                  >
                    <MapPin className={`w-3 h-3 ${isActive ? "text-[#EF6C85]" : "text-[#1E251E]/40"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Kolom Search & Kategori */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative">
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="px-3 py-2 pr-8 rounded-xl bg-white border border-[#1E251E]/10 text-xs font-semibold text-[#1E251E] focus:outline-none focus:border-[#EF6C85] appearance-none shadow-2xs"
                >
                  {KATEGORI_OPTIONS.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
                <Filter className="w-3 h-3 text-[#1E251E]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Cari produk atau usaha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] placeholder-[#1E251E]/40 focus:outline-none focus:border-[#EF6C85] shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-[#1E251E]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1E251E]/40 hover:text-[#1E251E]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Grid Produk UMKM BERGAMBAR */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-[#1E251E]/60 font-medium">
              Menampilkan <span className="font-bold text-[#1E251E]">{filteredItems.length}</span> produk unggulan
              {selectedDusun !== "Semua" && ` di Kampung ${selectedDusun}`}
              {selectedKategori !== "Semua Kategori" && ` • ${selectedKategori}`}
            </p>
          </div>          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  className="bg-white rounded-3xl border border-[#EF6C85]/15 p-5 shadow-xs animate-pulse space-y-4"
                >
                  <div className="w-full h-48 rounded-2xl bg-neutral-200/70" />
                  <div className="space-y-2">
                    <div className="w-20 h-4 rounded-full bg-neutral-200/70" />
                    <div className="w-3/4 h-5 rounded-lg bg-neutral-200/70" />
                    <div className="w-1/2 h-3.5 rounded-lg bg-neutral-200/70" />
                  </div>
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div className="w-24 h-5 rounded-lg bg-neutral-200/70" />
                    <div className="w-20 h-8 rounded-xl bg-neutral-200/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            umkmList.length === 0 ? (
              <div className="py-16 px-4 text-center max-w-lg mx-auto bg-white rounded-3xl border border-[#1E251E]/10 shadow-xs space-y-4 my-4">
                <div className="w-16 h-16 rounded-3xl bg-[#FAF6F0] text-[#EF6C85] border border-[#1E251E]/10 flex items-center justify-center mx-auto shadow-inner">
                  <Store className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-[#1E251E]">
                    Belum Ada Data Produk UMKM di Database
                  </h3>
                  <p className="text-xs text-[#1E251E]/60 leading-relaxed max-w-md mx-auto">
                    Saat ini belum ada produk UMKM yang tersimpan atau disetujui (APPROVED) di tabel <code>umkm</code> database Supabase. Seluruh data dimuat 100% langsung dari database secara live.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#EF6C85] hover:bg-[#D64E68] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Daftarkan Produk Pertama</span>
                  </button>
                  <Link
                    href="/admin"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-neutral-200/60 text-[#1E251E] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#1E251E]/10"
                  >
                    <Shield className="w-4 h-4 text-[#EF6C85]" />
                    <span>Buka Portal Admin</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center max-w-md mx-auto bg-white rounded-3xl border border-[#1E251E]/10 shadow-xs space-y-3 my-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#1E251E]/50 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-[#1E251E]">
                  Tidak Ada Produk yang Cocok
                </h3>
                <p className="text-xs text-[#1E251E]/60">
                  Tidak ditemukan produk dengan kriteria pencarian &ldquo;{searchQuery}&rdquo; pada filter yang aktif.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDusun("Semua");
                    setSelectedKategori("Semua Kategori");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#FCE8EC] text-xs font-bold text-[#EF6C85] transition-colors border border-[#EF6C85]/20"
                >
                  Reset Semua Filter
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, idx) => {
                const dusunBadgeColor =
                  item.dusun === "Rejosari"
                    ? "bg-[#EBF2DC] text-[#4D6328] border-[#9DB368]/30"
                    : item.dusun === "Wonosari"
                    ? "bg-[#FCE8EC] text-[#D64E68] border-[#EF6C85]/30"
                    : "bg-[#FFF4DC] text-[#9A6B17] border-[#E8A838]/30";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group bg-white rounded-3xl border border-[#EF6C85]/15 hover:border-[#EF6C85]/40 p-4 sm:p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      {/* GAMBAR PRODUK NYATA */}
                      <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden mb-4 bg-neutral-100">
                        <img
                          src={item.foto_url || SAMPLE_PHOTO_OPTIONS[0].url}
                          alt={item.nama_produk}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {/* Highlight Badge */}
                        {item.is_featured && (
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#EF6C85] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Unggulan</span>
                          </div>
                        )}

                        {/* Dusun Badge di pojok gambar */}
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs ${dusunBadgeColor}`}>
                            Kampung {item.dusun}
                          </span>
                        </div>
                      </div>

                      {/* Kategori & Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-[#1E251E]/50 font-medium bg-[#FAF6F0] px-2.5 py-0.5 rounded-full">
                          {item.kategori}
                        </span>
                        {item.rt_rw && (
                          <span className="text-[10px] text-[#1E251E]/40 font-medium">
                            {item.rt_rw}
                          </span>
                        )}
                      </div>

                      {/* Nama Produk & Usaha */}
                      <h3 className="text-base font-extrabold text-[#1E251E] group-hover:text-[#EF6C85] transition-colors line-clamp-1 mb-1">
                        {item.nama_produk}
                      </h3>
                      <p className="text-xs font-semibold text-[#1E251E]/60 mb-2.5 flex items-center gap-1">
                        <span>{item.nama_usaha}</span>
                        <span className="text-[#1E251E]/30">•</span>
                        <span className="text-[#1E251E]/50">{item.nama_pemilik}</span>
                      </p>

                      {/* Tombol Link Google Maps Lokasi Usaha (Bisa di-klik) */}
                      <div className="mb-3">
                        {item.lokasi_gmaps_link ? (
                          <a
                            href={item.lokasi_gmaps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FCE8EC] hover:bg-[#EF6C85] text-[#D64E68] hover:text-white border border-[#EF6C85]/30 text-xs font-bold transition-all shadow-2xs hover:shadow-xs group/maps active:scale-95"
                            title="Klik untuk membuka titik rute lokasi Google Maps di tab baru"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#EF6C85] group-hover/maps:text-white transition-colors flex-shrink-0" />
                            <span>Titik Lokasi Google Maps</span>
                            <ExternalLink className="w-3 h-3 opacity-70 group-hover/maps:opacity-100 ml-0.5" />
                          </a>
                        ) : (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((item.nama_usaha || item.nama_produk) + " " + item.dusun + " Wedomartani")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF6F0] hover:bg-[#FCE8EC] text-[#1E251E]/70 hover:text-[#EF6C85] border border-[#1E251E]/10 hover:border-[#EF6C85]/30 text-xs font-semibold transition-all shadow-2xs active:scale-95"
                            title="Klik untuk melihat rute di Google Maps"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#EF6C85] flex-shrink-0" />
                            <span>Cek Lokasi Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-50 ml-0.5" />
                          </a>
                        )}
                      </div>

                      {/* Deskripsi */}
                      <p className="text-xs text-[#1E251E]/70 leading-relaxed line-clamp-2 mb-4">
                        {item.deskripsi}
                      </p>
                    </div>

                    {/* Footer Kartu: Harga & CTA Button */}
                    <div className="pt-3 border-t border-[#1E251E]/5 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-[#1E251E]/50 font-medium">Harga Jual</div>
                        <div className="text-base font-black text-[#1E251E]">
                          Rp {item.harga.toLocaleString("id-ID")}{" "}
                          <span className="text-[10px] font-normal text-[#1E251E]/60">/ {item.satuan}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOrderWhatsApp(item)}
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Pesan WA</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Modal Formulir Ajukan Usaha Warga (KONTRIBUTOR -> DI-ACC PAK DUKUH) */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#EF6C85]/20 max-h-[90vh] overflow-y-auto relative my-8"
            >
              <button
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FCE8EC] text-[#EF6C85] flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#1E251E]">Daftarkan Produk UMKM Anda</h2>
                  <p className="text-xs text-[#1E251E]/60">
                    Kirimkan usulan produk. Konten akan <strong>ditinjau dan disetujui (ACC) oleh Pak Dukuh</strong> sebelum tayang di katalog publik.
                  </p>
                </div>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold text-emerald-800">Usulan Berhasil Dikirim!</h3>
                  <p className="text-xs text-[#1E251E]/70 max-w-sm mx-auto leading-relaxed">
                    Data produk Anda sudah masuk ke <strong>Antrean Persetujuan Pak Dukuh</strong> di Portal Admin. Begitu Pak Dukuh menyetujui, produk Anda akan langsung muncul di katalog web!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAjukanProduk} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1">
                        Nama Produk *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="misal: Keripik Singkong Renyah"
                        value={formNamaProduk}
                        onChange={(e) => setFormNamaProduk(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1">
                        Nama Usaha / Merek *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="misal: Snack Berkah Wonosari"
                        value={formNamaUsaha}
                        onChange={(e) => setFormNamaUsaha(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1">
                        Nama Pemilik Usaha *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="misal: Ibu Endang"
                        value={formNamaPemilik}
                        onChange={(e) => setFormNamaPemilik(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1">
                        Asal Kampung Warga *
                      </label>
                      <select
                        value={formDusun}
                        onChange={(e) => setFormDusun(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs font-semibold focus:outline-none focus:border-[#EF6C85]"
                      >
                        <option value="Rejosari">Kampung Rejosari (RW 18)</option>
                        <option value="Wonosari">Kampung Wonosari (RW 17)</option>
                        <option value="Pajangan">Kampung Pajangan (RW 16)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1">
                        Kategori *
                      </label>
                      <select
                        value={formKategori}
                        onChange={(e) => setFormKategori(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                      >
                        <option value="Olahan Pangan & Keripik">Olahan Pangan</option>
                        <option value="Pertanian & Bibit">Pertanian / Ternak</option>
                        <option value="Kerajinan & Kreatif">Kerajinan Kriya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1">
                        Harga (Rp) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="misal: 15000"
                        value={formHarga}
                        onChange={(e) => setFormHarga(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1">
                        Satuan Penjualan *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Bungkus / Pcs / Botol"
                        value={formSatuan}
                        onChange={(e) => setFormSatuan(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1">
                      Nomor WhatsApp Pemilik (Untuk Pemesanan) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 081234567890"
                      value={formWhatsApp}
                      onChange={(e) => setFormWhatsApp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#EF6C85]" />
                        <span>Tautan Link Google Maps Lokasi Usaha (Opsional)</span>
                      </span>
                      <span className="text-[10px] text-[#1E251E]/50 font-normal">Bisa di-klik pembeli</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Contoh: https://maps.app.goo.gl/... atau https://goo.gl/maps/..."
                      value={formGmapsLink}
                      onChange={(e) => setFormGmapsLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                    />
                    <p className="text-[10px] text-[#1E251E]/50 mt-1">
                      Salin tautan dari fitur "Bagikan" di aplikasi Google Maps rumah/toko Anda agar pengunjung website bisa langsung klik membuka rute maps.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1">
                      Deskripsi Singkat Produk *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Jelaskan keunggulan rasa, bahan alami, atau cara pengolahan produk..."
                      value={formDeskripsi}
                      onChange={(e) => setFormDeskripsi(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  {/* Upload Foto via Galeri Perangkat (HP / Laptop) */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5 flex items-center justify-between">
                      <span>Unggah Foto Produk dari Galeri HP / Komputer *</span>
                      <span className="text-[10px] text-[#EF6C85] font-semibold">Bisa langsung dari Kamera/Galeri</span>
                    </label>

                    {/* Area Upload Galeri */}
                    <label className="border-2 border-dashed border-[#EF6C85]/30 hover:border-[#EF6C85] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#FAF6F0]/60 hover:bg-[#FCE8EC]/20 transition-all text-center group mb-2.5">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {previewImage ? (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-xs">
                          <img src={previewImage} alt="Preview Unggahan" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <Upload className="w-4 h-4" />
                            <span>Klik untuk ganti foto galeri</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-[#FCE8EC] text-[#EF6C85] flex items-center justify-center mb-2 shadow-2xs group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold text-[#1E251E] mb-0.5">
                            Pilih Foto dari Galeri / Ambil Foto
                          </span>
                          <span className="text-[10px] text-[#1E251E]/50">
                            Format JPG, PNG, WEBP (Buka Galeri Foto HP Anda)
                          </span>
                        </div>
                      )}
                    </label>

                    {/* Pilihan Cepat Alternatif */}
                    <div className="text-[10px] text-[#1E251E]/60 mb-1 font-semibold">
                      Atau pilih dari foto contoh produk:
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {SAMPLE_PHOTO_OPTIONS.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setFormFotoUrl(opt.url);
                            setPreviewImage(opt.url);
                          }}
                          className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all ${
                            formFotoUrl === opt.url
                              ? "border-[#EF6C85] scale-95 shadow-xs"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-[11px] text-[#1E251E]/70 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#EF6C85] flex-shrink-0" />
                    <span>
                      Usulan akan diverifikasi Pak Dukuh pada panel administrasi desa sebelum otomatis tayang di halaman utama katalog.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#EF6C85] to-[#D64E68] text-white font-black text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kirim Usulan Produk ke Pak Dukuh</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
