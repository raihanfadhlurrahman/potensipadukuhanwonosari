"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  FileText,
  Camera,
  Store,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MapPin,
  Tag,
  Phone,
  AlertCircle,
  Upload,
  TreePine,
  Trash2,
  Edit,
  History,
  Check,
  X,
  Compass,
  Landmark,
  UserCheck,
  LogOut,
  Filter,
  User,
  Settings,
  Image as ImageIcon,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getStoredUser, signOutUser, UserProfile, UserRole } from "@/lib/auth";

export interface PendingItem {
  id: string;
  type: "artikel" | "galeri" | "umkm" | "wisata";
  title: string;
  submitter: string;
  date: string;
  excerpt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  lokasi_gmaps_link?: string;
  rawUmkm?: any;
  rawWisata?: any;
  rawArtikel?: any;
  foto_url?: string | null;
  foto_urls?: string[];
  rejection_reason?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export function parseArticlePhotos(rawCover: any): string[] {
  if (!rawCover) return [];
  if (Array.isArray(rawCover)) return rawCover.filter(Boolean);
  if (typeof rawCover === "string") {
    const trimmed = rawCover.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {}
    }
    return [trimmed];
  }
  return [];
}

export interface AparaturItem {
  id: string;
  nama: string;
  jabatan: string;
  kategori: "Pemerintah Padukuhan" | "Kelembagaan Masyarakat";
  wilayah: "Rejosari" | "Wonosari" | "Pajangan" | "Seluruh Wilayah";
  nomor_hp?: string;
  foto_url?: string;
}

export interface DemografiItem {
  id: string;
  dusun: "Rejosari" | "Wonosari" | "Pajangan";
  rw: string;
  rt: string;
  nama_ketua_rt: string | null;
  jumlah_kk: number;
  jumlah_jiwa: number;
  jumlah_pria: number;
  jumlah_wanita: number;
  balita_0_5: number;
  usia_sekolah_6_18: number;
  usia_produktif_19_59: number;
  lansia_60_plus: number;
  petani: number;
  wiraswasta_pedagang: number;
  karyawan_swasta: number;
  pns_tni_polri: number;
  buruh_harian: number;
  lainnya: number;
  luas_wilayah_m2: number;
  updated_at?: string;
}

const SAMPLE_PHOTO_OPTIONS = [
  { label: "Makanan / Keripik", url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=800&auto=format&fit=crop" },
  { label: "Camilan Pisang", url: "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?q=80&w=800&auto=format&fit=crop" },
  { label: "Telur / Peternakan", url: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=800&auto=format&fit=crop" },
  { label: "Wisata Sawah", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop" },
  { label: "Bank Sampah", url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop" },
];

const DEFAULT_REJECTION_TEMPLATE =
  "Belum memenuhi kriteria publikasi konten Padukuhan Wonosari. Silakan periksa kembali kelengkapan data atau unggah informasi yang lebih valid.";

const REJECTION_PRESETS = [
  "Format atau kualitas foto belum memenuhi standar ketajaman.",
  "Tautan Google Maps atau nomor kontak WhatsApp belum valid.",
  "Deskripsi dan informasi produk/wisata perlu dirinci lebih jelas.",
  "Kategori usulan belum sesuai dengan ketentuan padukuhan.",
];

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("padukuh");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Data 100% dari Supabase Database (Tanpa LocalStorage mock)
  const [queue, setQueue] = useState<PendingItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "moderasi" | "riwayat" | "lembaga" | "demografi" | "kebudayaan" | "tambah-wisata" | "tambah-umkm" | "tulis" | "master"
  >("moderasi");

  // Moderation history log dari database
  const [moderationHistory, setModerationHistory] = useState<PendingItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "APPROVED" | "REJECTED">("ALL");

  // State notifikasi persetujuan
  const [accNotification, setAccNotification] = useState<string | null>(null);

  // State modal pop-up penolakan konten (opsional catatan)
  const [rejectModalItem, setRejectModalItem] = useState<PendingItem | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // State Kelembagaan & Pemerintahan dari Supabase aparatur_desa
  const [aparaturList, setAparaturList] = useState<AparaturItem[]>([]);
  const [filterLembagaWilayah, setFilterLembagaWilayah] = useState<string>("ALL");
  const [showAddLembagaModal, setShowAddLembagaModal] = useState(false);
  const [editingLembagaId, setEditingLembagaId] = useState<string | null>(null);
  const [lembagaNama, setLembagaNama] = useState("");
  const [lembagaJabatan, setLembagaJabatan] = useState("");
  const [lembagaKategori, setLembagaKategori] = useState<"Pemerintah Padukuhan" | "Kelembagaan Masyarakat">("Kelembagaan Masyarakat");
  const [lembagaWilayah, setLembagaWilayah] = useState<"Rejosari" | "Wonosari" | "Pajangan" | "Seluruh Wilayah">("Wonosari");
  const [lembagaHp, setLembagaHp] = useState("");
  const [lembagaFotoUrl, setLembagaFotoUrl] = useState<string | undefined>(undefined);
  const [lembagaPreviewImage, setLembagaPreviewImage] = useState<string | null>(null);

  // State Demografi Wilayah dari Supabase demografi_wilayah
  const [demografiList, setDemografiList] = useState<DemografiItem[]>([]);
  const [filterDemografiDusun, setFilterDemografiDusun] = useState<string>("ALL");
  const [showAddDemografiModal, setShowAddDemografiModal] = useState(false);
  const [editingDemografiId, setEditingDemografiId] = useState<string | null>(null);

  // Form states untuk Demografi RT
  const [demoDusun, setDemoDusun] = useState<"Rejosari" | "Wonosari" | "Pajangan">("Wonosari");
  const [demoRw, setDemoRw] = useState("RW 17");
  const [demoRt, setDemoRt] = useState("RT 01");
  const [demoKetuaRt, setDemoKetuaRt] = useState("");
  const [demoJumlahKk, setDemoJumlahKk] = useState<number | "">(0);
  const [demoJumlahJiwa, setDemoJumlahJiwa] = useState<number | "">(0);
  const [demoJumlahPria, setDemoJumlahPria] = useState<number | "">(0);
  const [demoJumlahWanita, setDemoJumlahWanita] = useState<number | "">(0);
  const [demoBalita, setDemoBalita] = useState<number | "">(0);
  const [demoSekolah, setDemoSekolah] = useState<number | "">(0);
  const [demoProduktif, setDemoProduktif] = useState<number | "">(0);
  const [demoLansia, setDemoLansia] = useState<number | "">(0);
  const [demoPetani, setDemoPetani] = useState<number | "">(0);
  const [demoWiraswasta, setDemoWiraswasta] = useState<number | "">(0);
  const [demoSwasta, setDemoSwasta] = useState<number | "">(0);
  const [demoPns, setDemoPns] = useState<number | "">(0);
  const [demoBuruh, setDemoBuruh] = useState<number | "">(0);
  const [demoLainnya, setDemoLainnya] = useState<number | "">(0);
  const [demoLuas, setDemoLuas] = useState<number | "">(0);

  // Form states usulan UMKM
  const [umkmNamaProduk, setUmkmNamaProduk] = useState("");
  const [umkmNamaUsaha, setUmkmNamaUsaha] = useState("");
  const [umkmNamaPemilik, setUmkmNamaPemilik] = useState("");
  const [umkmDusun, setUmkmDusun] = useState<"Rejosari" | "Wonosari" | "Pajangan">("Wonosari");
  const [umkmKategori, setUmkmKategori] = useState("Olahan Pangan & Keripik");
  const [umkmHarga, setUmkmHarga] = useState<number | "">("");
  const [umkmSatuan, setUmkmSatuan] = useState("Bungkus 250gr");
  const [umkmDeskripsi, setUmkmDeskripsi] = useState("");
  const [umkmWhatsApp, setUmkmWhatsApp] = useState("");
  const [umkmGmapsLink, setUmkmGmapsLink] = useState("");
  const [umkmFotoUrl, setUmkmFotoUrl] = useState(SAMPLE_PHOTO_OPTIONS[0].url);
  const [adminPreviewImage, setAdminPreviewImage] = useState<string | null>(null);
  const [submitUmkmSuccess, setSubmitUmkmSuccess] = useState(false);
  const [submitUmkmError, setSubmitUmkmError] = useState<string | null>(null);

  // State Kebudayaan dari Supabase agenda_budaya (Pak Dukuh & Admin)
  const [kebudayaanList, setKebudayaanList] = useState<any[]>([]);
  const [showAddKebudayaanModal, setShowAddKebudayaanModal] = useState(false);
  const [kebudayaanJudul, setKebudayaanJudul] = useState("");
  const [kebudayaanKategori, setKebudayaanKategori] = useState("Tradisi & Adat");
  const [kebudayaanDusun, setKebudayaanDusun] = useState<"Wonosari" | "Rejosari" | "Pajangan" | "Seluruh Wilayah">("Wonosari");
  const [kebudayaanDeskripsi, setKebudayaanDeskripsi] = useState("");
  const [kebudayaanFotoUrl, setKebudayaanFotoUrl] = useState("");
  const [kebudayaanPreviewImage, setKebudayaanPreviewImage] = useState<string | null>(null);
  const [isSubmittingKebudayaan, setIsSubmittingKebudayaan] = useState(false);

  // Form states usulan Wisata
  const [wisataNama, setWisataNama] = useState("");
  const [wisataKategori, setWisataKategori] = useState("Wisata Alam & Pertanian");
  const [wisataDusun, setWisataDusun] = useState<"Rejosari" | "Wonosari" | "Pajangan" | "Seluruh Wilayah">("Rejosari");
  const [wisataHtm, setWisataHtm] = useState<number | "">(0);
  const [wisataGmapsLink, setWisataGmapsLink] = useState("");
  const [wisataDeskripsi, setWisataDeskripsi] = useState("");
  const [wisataFasilitas, setWisataFasilitas] = useState("Spot Foto Sunrise Merapi, Pematang Cor Mulus, Udara Bersih");
  const [wisataFotoUrl, setWisataFotoUrl] = useState(SAMPLE_PHOTO_OPTIONS[3].url);
  const [wisataPreviewImage, setWisataPreviewImage] = useState<string | null>(null);
  const [submitWisataSuccess, setSubmitWisataSuccess] = useState(false);
  const [submitWisataError, setSubmitWisataError] = useState<string | null>(null);

  // Form states usulan warta berita (Dukungan Lebih Dari 1 Foto)
  const [judulArtikel, setJudulArtikel] = useState("");
  const [kategoriArtikel, setKategoriArtikel] = useState("Kabar Desa");
  const [penulis, setPenulis] = useState("");
  const [isiArtikel, setIsiArtikel] = useState("");
  const [artikelFotoList, setArtikelFotoList] = useState<string[]>([
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
  ]);
  const [artikelUrlInput, setArtikelUrlInput] = useState("");
  const [isUploadingArtikel, setIsUploadingArtikel] = useState(false);
  const [submitArticleSuccess, setSubmitArticleSuccess] = useState(false);
  const [submitArticleError, setSubmitArticleError] = useState<string | null>(null);

  // 1. Validasi Autentikasi Pengguna & Kunci Peran (RBAC)
  useEffect(() => {
    // Hapus seluruh jejak cache mock lama di localStorage agar full dari database
    if (typeof window !== "undefined") {
      localStorage.removeItem("wonosari_pending_queue");
      localStorage.removeItem("wonosari_moderation_history");
      localStorage.removeItem("wonosari_aparatur_custom");
      localStorage.removeItem("wonosari_approved_umkm");
      localStorage.removeItem("wonosari_approved_wisata");
      localStorage.removeItem("wonosari_approved_artikel");
      localStorage.removeItem("wonosari_registered_users");
    }

    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsLoadingAuth(false);

    if (user.role === "kontributor") {
      setActiveTab("tambah-wisata");
    } else {
      setActiveTab("moderasi");
    }
  }, [router]);

  // 2. Fetch Antrean PENDING langsung dari Database Supabase (umkm, destinasi_wisata, artikel)
  const fetchQueueFromDB = useCallback(async () => {
    try {
      const items: PendingItem[] = [];

      // A. Ambil usulan UMKM berstatus PENDING
      const { data: umkmData } = await supabase
        .from("umkm")
        .select("*")
        .eq("status", "PENDING")
        .order("created_at", { ascending: false });

      if (umkmData) {
        umkmData.forEach((u: any) => {
          items.push({
            id: u.id,
            type: "umkm",
            title: u.nama_produk,
            submitter: `${u.nama_pemilik} (Kampung ${u.dusun || "Wonosari"})`,
            date: u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "Hari Ini",
            excerpt: `Harga: Rp ${Number(u.harga).toLocaleString("id-ID")}/${u.satuan || "Pcs"} • WA: ${u.whatsapp_owner}. ${u.deskripsi}`,
            foto_url: u.foto_url,
            lokasi_gmaps_link: u.lokasi_gmaps_link || (u.alamat_usaha && u.alamat_usaha.startsWith("http") ? u.alamat_usaha : undefined),
            rawUmkm: u,
            status: "PENDING",
          });
        });
      }

      // B. Ambil usulan Wisata berstatus PENDING
      const { data: wisataData } = await supabase
        .from("destinasi_wisata")
        .select("*")
        .eq("status", "PENDING")
        .order("created_at", { ascending: false });

      if (wisataData) {
        wisataData.forEach((w: any) => {
          items.push({
            id: w.id,
            type: "wisata",
            title: w.nama_destinasi,
            submitter: `Warga Kampung ${w.dusun || "Padukuhan"}`,
            date: w.created_at ? new Date(w.created_at).toLocaleDateString("id-ID") : "Hari Ini",
            excerpt: `${w.kategori} • Dusun ${w.dusun}. ${w.deskripsi}`,
            foto_url: (w.foto_urls && Array.isArray(w.foto_urls) && w.foto_urls.length > 0 ? w.foto_urls[0] : null) || w.foto_url,
            lokasi_gmaps_link: w.lokasi_gmaps_link || undefined,
            rawWisata: w,
            status: "PENDING",
          });
        });
      }

      // C. Ambil usulan Warta Berita berstatus PENDING
      const { data: artikelData } = await supabase
        .from("artikel")
        .select("*")
        .eq("status", "PENDING")
        .order("created_at", { ascending: false });

      if (artikelData) {
        artikelData.forEach((a: any) => {
          const parsedPhotos = parseArticlePhotos(a.cover_image);
          items.push({
            id: a.id,
            type: "artikel",
            title: a.title,
            submitter: a.author_name || "Kontributor Warga",
            date: a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID") : "Hari Ini",
            excerpt: a.excerpt || a.content.slice(0, 100),
            foto_url: parsedPhotos[0] || null,
            foto_urls: parsedPhotos,
            rawArtikel: a,
            status: "PENDING",
          });
        });
      }

      setQueue(items);
    } catch (err) {
      console.warn("Fetch queue from DB error:", err);
    }
  }, []);

  // 3. Fetch Riwayat Moderasi (APPROVED & REJECTED) langsung dari Database Supabase
  const fetchHistoryFromDB = useCallback(async () => {
    try {
      const historyList: PendingItem[] = [];
      const seenIds = new Set<string>();

      // 1. Ambil data arsip dari tabel khusus riwayat_moderasi (mencakup usulan yang DITOLAK & DIHAPUS dari tabel operasional)
      try {
        const { data: auditLogs, error: auditErr } = await supabase
          .from("riwayat_moderasi")
          .select("*")
          .order("created_at", { ascending: false });

        if (!auditErr && auditLogs && auditLogs.length > 0) {
          auditLogs.forEach((log: any) => {
            const keyId = log.item_id || log.id;
            seenIds.add(String(keyId));
            historyList.push({
              id: keyId,
              type: log.tipe,
              title: log.judul,
              submitter: log.pengusul || "Warga Padukuhan",
              date: log.created_at ? new Date(log.created_at).toLocaleDateString("id-ID") : "Hari Ini",
              excerpt: log.excerpt || "",
              foto_url: log.foto_url,
              lokasi_gmaps_link: log.lokasi_gmaps_link || undefined,
              status: log.status,
              rejection_reason: log.catatan_penolakan,
              reviewed_by: log.dimoderasi_oleh || "Bapak Kepala Dukuh Wonosari",
              reviewed_at: log.created_at ? new Date(log.created_at).toLocaleDateString("id-ID") : undefined,
            });
          });
        }
      } catch (logErr) {
        console.warn("Table riwayat_moderasi notice:", logErr);
      }

      // 2. Ambil data dari tabel operasional utama (UMKM, Wisata, Artikel yang disetujui / sisa)
      // A. History UMKM
      const { data: umkmHist } = await supabase
        .from("umkm")
        .select("*")
        .in("status", ["APPROVED", "REJECTED"])
        .order("created_at", { ascending: false });

      if (umkmHist) {
        umkmHist.forEach((u: any) => {
          if (!seenIds.has(String(u.id))) {
            seenIds.add(String(u.id));
            historyList.push({
              id: u.id,
              type: "umkm",
              title: u.nama_produk,
              submitter: `${u.nama_pemilik} (${u.dusun || "Wonosari"})`,
              date: u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "September 2026",
              excerpt: `Harga: Rp ${Number(u.harga).toLocaleString("id-ID")}/${u.satuan || "Pcs"}. ${u.deskripsi}`,
              foto_url: u.foto_url,
              lokasi_gmaps_link: u.lokasi_gmaps_link || (u.alamat_usaha && u.alamat_usaha.startsWith("http") ? u.alamat_usaha : undefined),
              status: u.status,
              rejection_reason: u.rejection_reason,
              reviewed_at: u.approved_at ? new Date(u.approved_at).toLocaleDateString("id-ID") : undefined,
              reviewed_by: "Bapak Kepala Dukuh Wonosari",
            });
          }
        });
      }

      // B. History Wisata
      const { data: wisataHist } = await supabase
        .from("destinasi_wisata")
        .select("*")
        .in("status", ["APPROVED", "REJECTED"])
        .order("created_at", { ascending: false });

      if (wisataHist) {
        wisataHist.forEach((w: any) => {
          if (!seenIds.has(String(w.id))) {
            seenIds.add(String(w.id));
            historyList.push({
              id: w.id,
              type: "wisata",
              title: w.nama_destinasi,
              submitter: `Warga Kampung ${w.dusun || "Padukuhan"}`,
              date: w.created_at ? new Date(w.created_at).toLocaleDateString("id-ID") : "September 2026",
              excerpt: `${w.kategori} • Dusun ${w.dusun}. ${w.deskripsi}`,
              foto_url: (w.foto_urls && Array.isArray(w.foto_urls) && w.foto_urls.length > 0 ? w.foto_urls[0] : null) || w.foto_url,
              lokasi_gmaps_link: w.lokasi_gmaps_link || undefined,
              status: w.status,
              rejection_reason: (w as any).rejection_reason,
              reviewed_by: "Bapak Kepala Dukuh Wonosari",
            });
          }
        });
      }

      // C. History Warta Berita
      const { data: artikelHist } = await supabase
        .from("artikel")
        .select("*")
        .in("status", ["APPROVED", "REJECTED"])
        .order("created_at", { ascending: false });

      if (artikelHist) {
        artikelHist.forEach((a: any) => {
          if (!seenIds.has(String(a.id))) {
            seenIds.add(String(a.id));
            const parsedPhotos = parseArticlePhotos(a.cover_image);
            historyList.push({
              id: a.id,
              type: "artikel",
              title: a.title,
              submitter: a.author_name || "Pemerintah Padukuhan",
              date: a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID") : "September 2026",
              excerpt: a.excerpt || a.content.slice(0, 100),
              foto_url: parsedPhotos[0] || null,
              foto_urls: parsedPhotos,
              status: a.status,
              rejection_reason: a.rejection_reason,
              reviewed_at: a.approved_at ? new Date(a.approved_at).toLocaleDateString("id-ID") : undefined,
              reviewed_by: "Bapak Kepala Dukuh Wonosari",
            });
          }
        });
      }

      setModerationHistory(historyList);
    } catch (err) {
      console.warn("Fetch history from DB notice:", err);
    }
  }, []);

  // 4. Fetch Aparatur & SOTK langsung dari Database Supabase (aparatur_desa)
  const fetchAparaturFromDB = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("aparatur_desa")
        .select("*")
        .order("urutan", { ascending: true });

      if (data && data.length > 0) {
        setAparaturList(
          data.map((a: any) => ({
            id: a.id,
            nama: a.nama,
            jabatan: a.jabatan,
            kategori: a.kategori_kelembagaan || "Pemerintah Padukuhan",
            wilayah: a.wilayah_tugas || "Seluruh Wilayah",
            nomor_hp: a.nomor_hp,
            foto_url: a.foto_url,
          }))
        );
      } else {
        setAparaturList([]);
      }
    } catch (err) {
      console.warn("Fetch aparatur from DB error:", err);
    }
  }, []);

  // 5. Fetch Demografi & Monografi Wilayah langsung dari Database Supabase (demografi_wilayah)
  const fetchDemografiFromDB = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("demografi_wilayah")
        .select("*")
        .order("dusun", { ascending: true })
        .order("rt", { ascending: true });

      if (data && data.length > 0) {
        setDemografiList(data);
      } else {
        setDemografiList([]);
      }
    } catch (err) {
      console.warn("Fetch demografi from DB notice:", err);
    }
  }, []);

  // 6. Fetch Kebudayaan langsung dari Database Supabase (agenda_budaya)
  const fetchKebudayaanFromDB = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("agenda_budaya")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setKebudayaanList(data);
      } else {
        setKebudayaanList([]);
      }
    } catch (err) {
      console.warn("Fetch kebudayaan from DB notice:", err);
    }
  }, []);

  // Muat data awal dari Supabase saat masuk portal
  useEffect(() => {
    fetchQueueFromDB();
    fetchHistoryFromDB();
    fetchAparaturFromDB();
    fetchDemografiFromDB();
    fetchKebudayaanFromDB();
  }, [fetchQueueFromDB, fetchHistoryFromDB, fetchAparaturFromDB, fetchDemografiFromDB, fetchKebudayaanFromDB]);

  // Handlers CRUD Kebudayaan (Pak Dukuh & Admin KKN)
  const handleOpenAddKebudayaan = () => {
    setKebudayaanJudul("");
    setKebudayaanKategori("Tradisi & Adat");
    setKebudayaanDusun("Wonosari");
    setKebudayaanDeskripsi("");
    setKebudayaanFotoUrl(SAMPLE_PHOTO_OPTIONS[2]?.url || "/images/backgroundpadukuhan2.jpeg");
    setKebudayaanPreviewImage(null);
    setShowAddKebudayaanModal(true);
  };

  const handleKebudayaanFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setKebudayaanPreviewImage(localUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      setKebudayaanFotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `kebudayaan-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("media-padukuhan")
        .upload(`kebudayaan/${fileName}`, file, { cacheControl: "3600", upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("media-padukuhan")
          .getPublicUrl(`kebudayaan/${fileName}`);
        if (publicUrlData?.publicUrl) {
          setKebudayaanFotoUrl(publicUrlData.publicUrl);
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload notice (using fallback base64):", storageErr);
    }
  };

  const handleSubmitKebudayaan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kebudayaanJudul.trim()) return;

    setIsSubmittingKebudayaan(true);
    try {
      const payload = {
        nama_agenda: kebudayaanJudul.trim(),
        kategori: kebudayaanKategori,
        tanggal_mulai: new Date().toISOString().split("T")[0],
        lokasi: `Dusun ${kebudayaanDusun}`,
        deskripsi: kebudayaanDeskripsi.trim() || `Kebudayaan dan kearifan lokal Padukuhan Wonosari di Dusun ${kebudayaanDusun}.`,
        penanggung_jawab: currentRole === "padukuh" ? "Pak Dukuh Triswanto" : "Admin Pengelola",
        foto_cover: kebudayaanFotoUrl || "/images/backgroundpadukuhan2.jpeg",
        is_selesai: false,
      };

      const { error } = await supabase.from("agenda_budaya").insert([payload]);
      if (error) throw error;

      await fetchKebudayaanFromDB();
      setShowAddKebudayaanModal(false);
      setKebudayaanJudul("");
      setKebudayaanDeskripsi("");
      setKebudayaanFotoUrl("");
      setKebudayaanPreviewImage(null);
      setAccNotification("Data kebudayaan berhasil ditambahkan dan langsung tayang di Halaman Destinasi & Budaya!");
      setTimeout(() => setAccNotification(null), 4000);
    } catch (err: any) {
      console.error("Submit kebudayaan error:", err);
      alert("Gagal menambahkan kebudayaan: " + (err.message || "Periksa koneksi database."));
    } finally {
      setIsSubmittingKebudayaan(false);
    }
  };

  const handleDeleteKebudayaan = async (id: string, judul: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus agenda kebudayaan '${judul}'?`)) return;
    try {
      const { error } = await supabase.from("agenda_budaya").delete().eq("id", id);
      if (error) throw error;
      await fetchKebudayaanFromDB();
      setAccNotification(`Agenda kebudayaan '${judul}' berhasil dihapus.`);
      setTimeout(() => setAccNotification(null), 3000);
    } catch (err: any) {
      console.error("Delete kebudayaan error:", err);
      alert("Gagal menghapus: " + (err.message || "Periksa koneksi database."));
    }
  };

  // Handlers CRUD Demografi RT
  const handleOpenAddDemografi = () => {
    setEditingDemografiId(null);
    setDemoDusun("Wonosari");
    setDemoRw("RW 17");
    setDemoRt("RT 01");
    setDemoKetuaRt("");
    setDemoJumlahKk(0);
    setDemoJumlahJiwa(0);
    setDemoJumlahPria(0);
    setDemoJumlahWanita(0);
    setDemoBalita(0);
    setDemoSekolah(0);
    setDemoProduktif(0);
    setDemoLansia(0);
    setDemoPetani(0);
    setDemoWiraswasta(0);
    setDemoSwasta(0);
    setDemoPns(0);
    setDemoBuruh(0);
    setDemoLainnya(0);
    setDemoLuas(0);
    setShowAddDemografiModal(true);
  };

  const handleOpenEditDemografi = (item: DemografiItem) => {
    setEditingDemografiId(item.id);
    setDemoDusun(item.dusun);
    setDemoRw(item.rw);
    setDemoRt(item.rt);
    setDemoKetuaRt(item.nama_ketua_rt || "");
    setDemoJumlahKk(item.jumlah_kk);
    setDemoJumlahJiwa(item.jumlah_jiwa);
    setDemoJumlahPria(item.jumlah_pria);
    setDemoJumlahWanita(item.jumlah_wanita);
    setDemoBalita(item.balita_0_5);
    setDemoSekolah(item.usia_sekolah_6_18);
    setDemoProduktif(item.usia_produktif_19_59);
    setDemoLansia(item.lansia_60_plus);
    setDemoPetani(item.petani);
    setDemoWiraswasta(item.wiraswasta_pedagang);
    setDemoSwasta(item.karyawan_swasta);
    setDemoPns(item.pns_tni_polri);
    setDemoBuruh(item.buruh_harian);
    setDemoLainnya(item.lainnya);
    setDemoLuas(item.luas_wilayah_m2 || 0);
    setShowAddDemografiModal(true);
  };

  const handleSaveDemografi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoRt || !demoRw) return;

    const payload = {
      dusun: demoDusun,
      rw: demoRw,
      rt: demoRt,
      nama_ketua_rt: demoKetuaRt.trim() || null,
      jumlah_kk: Number(demoJumlahKk) || 0,
      jumlah_jiwa: Number(demoJumlahJiwa) || 0,
      jumlah_pria: Number(demoJumlahPria) || 0,
      jumlah_wanita: Number(demoJumlahWanita) || 0,
      balita_0_5: Number(demoBalita) || 0,
      usia_sekolah_6_18: Number(demoSekolah) || 0,
      usia_produktif_19_59: Number(demoProduktif) || 0,
      lansia_60_plus: Number(demoLansia) || 0,
      petani: Number(demoPetani) || 0,
      wiraswasta_pedagang: Number(demoWiraswasta) || 0,
      karyawan_swasta: Number(demoSwasta) || 0,
      pns_tni_polri: Number(demoPns) || 0,
      buruh_harian: Number(demoBuruh) || 0,
      lainnya: Number(demoLainnya) || 0,
      luas_wilayah_m2: Number(demoLuas) || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingDemografiId) {
        await supabase.from("demografi_wilayah").update(payload).eq("id", editingDemografiId);
      } else {
        await supabase.from("demografi_wilayah").insert([payload]);
      }
    } catch (err) {
      console.warn("Save demografi error:", err);
    }

    await fetchDemografiFromDB();
    setShowAddDemografiModal(false);
    setEditingDemografiId(null);
    setAccNotification(
      editingDemografiId
        ? "Data demografi RT berhasil diperbarui di database!"
        : "Data RT baru berhasil ditambahkan ke database!"
    );
    setTimeout(() => setAccNotification(null), 3500);
  };

  const handleDeleteDemografi = async (id: string, rtLabel: string, dusunLabel: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data '${rtLabel} Kampung ${dusunLabel}' dari database?`)) return;
    try {
      await supabase.from("demografi_wilayah").delete().eq("id", id);
      await fetchDemografiFromDB();
      setAccNotification(`Data demografi ${rtLabel} berhasil dihapus dari database.`);
      setTimeout(() => setAccNotification(null), 3000);
    } catch (err) {
      console.warn("Delete demografi error:", err);
    }
  };

  // Upload file handler UMKM
  const handleAdminFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setAdminPreviewImage(localUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUmkmFotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

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
          setUmkmFotoUrl(publicUrlData.publicUrl);
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload notice:", storageErr);
    }
  };

  // Upload file handler Wisata
  const handleWisataFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setWisataPreviewImage(localUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      setWisataFotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `wisata-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("media-padukuhan")
        .upload(`wisata/${fileName}`, file, { cacheControl: "3600", upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("media-padukuhan")
          .getPublicUrl(`wisata/${fileName}`);
        if (publicUrlData?.publicUrl) {
          setWisataFotoUrl(publicUrlData.publicUrl);
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload notice:", storageErr);
    }
  };

  // Upload file handler Warta Berita (Mendukung Lebih Dari 1 Foto)
  const handleArtikelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingArtikel(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Convert ke base64 sebagai fallback instan
      const base64Promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      let finalUrl = await base64Promise;

      // Coba upload ke Supabase Storage media-padukuhan
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `artikel-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("media-padukuhan")
          .upload(`artikel/${fileName}`, file, { cacheControl: "3600", upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from("media-padukuhan")
            .getPublicUrl(`artikel/${fileName}`);
          if (publicUrlData?.publicUrl) {
            finalUrl = publicUrlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn("Storage upload notice (using fallback base64):", storageErr);
      }

      newUrls.push(finalUrl);
    }

    setArtikelFotoList((prev) => {
      // Jika sebelumnya hanya berisi default unsplash placeholder, gantikan dengan file asli baru
      const isDefault = prev.length === 1 && prev[0].includes("unsplash.com");
      return isDefault ? newUrls : [...prev, ...newUrls];
    });

    setIsUploadingArtikel(false);
    e.target.value = "";
  };

  const handleRemoveArtikelFoto = (indexToRemove: number) => {
    setArtikelFotoList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetCoverArtikel = (indexToCover: number) => {
    setArtikelFotoList((prev) => {
      if (indexToCover <= 0 || indexToCover >= prev.length) return prev;
      const target = prev[indexToCover];
      const rest = prev.filter((_, idx) => idx !== indexToCover);
      return [target, ...rest];
    });
  };

  const handleAddArtikelUrl = () => {
    if (!artikelUrlInput.trim()) return;
    setArtikelFotoList((prev) => {
      const isDefault = prev.length === 1 && prev[0].includes("unsplash.com");
      return isDefault ? [artikelUrlInput.trim()] : [...prev, artikelUrlInput.trim()];
    });
    setArtikelUrlInput("");
  };

  // Upload file handler Aparatur / Lembaga SOTK
  const handleLembagaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setLembagaPreviewImage(localUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLembagaFotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `aparatur-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("media-padukuhan")
        .upload(`aparatur/${fileName}`, file, { cacheControl: "3600", upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("media-padukuhan")
          .getPublicUrl(`aparatur/${fileName}`);
        if (publicUrlData?.publicUrl) {
          setLembagaFotoUrl(publicUrlData.publicUrl);
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload notice:", storageErr);
    }
  };

  // Quick moderation action (ACC atau TOLAK oleh Pak Dukuh / Admin KKN) -> Update langsung ke Supabase
  const handleModerate = async (id: string, newStatus: "APPROVED" | "REJECTED", reason?: string) => {
    const targetItem = queue.find((item) => item.id === id);
    if (!targetItem) return;

    const finalReason = reason?.trim() || (newStatus === "REJECTED" ? DEFAULT_REJECTION_TEMPLATE : null);

    // 1. Eksekusi Moderasi ke Supabase
    try {
      if (newStatus === "REJECTED") {
        // Alur TOLAK: Simpan catatan lengkap ke tabel arsip 'riwayat_moderasi', lalu HAPUS dari tabel operasional utama
        const auditLogPayload = {
          item_id: String(targetItem.id),
          tipe: targetItem.type,
          judul: targetItem.title,
          pengusul: targetItem.submitter,
          dusun: targetItem.rawWisata?.dusun || (targetItem as any).dusun || "Wonosari",
          excerpt: targetItem.excerpt,
          foto_url: targetItem.foto_url || null,
          lokasi_gmaps_link: targetItem.lokasi_gmaps_link || null,
          status: "REJECTED",
          catatan_penolakan: finalReason,
          dimoderasi_oleh: currentUser?.full_name || (currentRole === "padukuh" ? "Bapak Kepala Dukuh Wonosari" : "Admin Sistem"),
          raw_payload: targetItem,
        };

        const { error: archiveErr } = await supabase
          .from("riwayat_moderasi")
          .insert([auditLogPayload]);

        if (!archiveErr) {
          // Jika berhasil tercatat di riwayat_moderasi, hapus baris dari tabel utama agar bersih
          if (targetItem.type === "umkm") {
            await supabase.from("umkm").delete().eq("id", id);
          } else if (targetItem.type === "wisata") {
            await supabase.from("destinasi_wisata").delete().eq("id", id);
          } else if (targetItem.type === "artikel") {
            await supabase.from("artikel").delete().eq("id", id);
          }
        } else {
          // Fallback aman jika tabel riwayat_moderasi belum dibuat di Supabase
          console.warn("Tabel riwayat_moderasi belum tersedia, menggunakan fallback status update:", archiveErr);
          if (targetItem.type === "umkm") {
            await supabase.from("umkm").update({
              status: "REJECTED",
              rejection_reason: finalReason,
            }).eq("id", id);
          } else if (targetItem.type === "wisata") {
            const updateWisataPayload: any = {
              status: "REJECTED",
              updated_at: new Date().toISOString(),
              rejection_reason: finalReason,
            };
            const { error: wErr } = await supabase.from("destinasi_wisata").update(updateWisataPayload).eq("id", id);
            if (wErr && (wErr.code === "PGRST204" || wErr.code === "42703")) {
              await supabase.from("destinasi_wisata").update({
                status: "REJECTED",
                updated_at: new Date().toISOString(),
              }).eq("id", id);
            }
          } else if (targetItem.type === "artikel") {
            await supabase.from("artikel").update({
              status: "REJECTED",
              rejection_reason: finalReason,
            }).eq("id", id);
          }
        }
      } else {
        // Alur SETUJUI (ACC): Update status menjadi APPROVED pada tabel utama agar tampil di web publik
        if (targetItem.type === "umkm") {
          await supabase.from("umkm").update({
            status: "APPROVED",
            approved_at: new Date().toISOString(),
          }).eq("id", id);
        } else if (targetItem.type === "wisata") {
          await supabase.from("destinasi_wisata").update({
            status: "APPROVED",
            updated_at: new Date().toISOString(),
          }).eq("id", id);
        } else if (targetItem.type === "artikel") {
          await supabase.from("artikel").update({
            status: "APPROVED",
            approved_at: new Date().toISOString(),
          }).eq("id", id);
        }

        // Catat juga ke riwayat_moderasi jika tabel tersedia
        try {
          await supabase.from("riwayat_moderasi").insert([{
            item_id: String(targetItem.id),
            tipe: targetItem.type,
            judul: targetItem.title,
            pengusul: targetItem.submitter,
            dusun: targetItem.rawWisata?.dusun || (targetItem as any).dusun || "Wonosari",
            excerpt: targetItem.excerpt,
            foto_url: targetItem.foto_url || null,
            lokasi_gmaps_link: targetItem.lokasi_gmaps_link || null,
            status: "APPROVED",
            catatan_penolakan: null,
            dimoderasi_oleh: currentUser?.full_name || (currentRole === "padukuh" ? "Bapak Kepala Dukuh Wonosari" : "Admin Sistem"),
            raw_payload: targetItem,
          }]);
        } catch {
          // ignore
        }
      }
    } catch (dbErr) {
      console.warn("Supabase moderate execution notice:", dbErr);
    }

    // 2. Hapus langsung dari antrean aktif dan refresh riwayat
    setQueue((prev) => prev.filter((item) => item.id !== id));
    await fetchHistoryFromDB();

    if (newStatus === "APPROVED") {
      setAccNotification(`Konten "${targetItem.title}" berhasil disetujui (ACC) dan langsung tayang resmi ke publik!`);
      setTimeout(() => setAccNotification(null), 4500);
    } else if (newStatus === "REJECTED") {
      setAccNotification(`Usulan "${targetItem.title}" telah ditolak dan dicatat pada Riwayat Moderasi.`);
      setTimeout(() => setAccNotification(null), 3500);
    }
  };

  // Konfirmasi tolak usulan dari modal pop-up
  const handleConfirmReject = async () => {
    if (!rejectModalItem) return;
    setIsSubmittingReject(true);
    const reasonToSave = rejectReasonInput.trim() || DEFAULT_REJECTION_TEMPLATE;
    await handleModerate(rejectModalItem.id, "REJECTED", reasonToSave);
    setIsSubmittingReject(false);
    setRejectModalItem(null);
    setRejectReasonInput("");
  };

  // Submit usulan destinasi wisata -> Tulis langsung ke Supabase (Pak Dukuh langsung APPROVED, Kontributor PENDING)
  const handleSubmitWisata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wisataNama || !wisataDeskripsi) return;

    const fasilArray = wisataFasilitas
      ? wisataFasilitas.split(",").map((f) => f.trim()).filter(Boolean)
      : ["Spot Foto", "Akses Nyaman"];

    const isDirectPublish = currentRole === "padukuh" || currentRole === "admin";
    const statusVal = isDirectPublish ? "APPROVED" : "PENDING";
    const cleanWisataMaps = wisataGmapsLink.trim();

    setSubmitWisataError(null);
    try {
      // Prioritas 1: Gunakan kolom 'foto_urls' (array JSONB) sesuai skema remote Supabase
      const payloadWisataUrls: any = {
        nama_destinasi: wisataNama,
        kategori: wisataKategori,
        dusun: wisataDusun,
        deskripsi: wisataDeskripsi,
        htm_tiket: wisataHtm === "" ? 0 : Number(wisataHtm),
        fasilitas: fasilArray,
        foto_urls: wisataFotoUrl ? [wisataFotoUrl] : [],
        lokasi_gmaps_link: cleanWisataMaps || null,
        status: statusVal,
      };

      let { error } = await supabase.from("destinasi_wisata").insert([payloadWisataUrls]);

      // Fallback 1: Jika kolom foto_urls tidak dikenali, coba dengan foto_url (singular)
      if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("foto_urls"))) {
        const payloadSingle: any = {
          nama_destinasi: wisataNama,
          kategori: wisataKategori,
          dusun: wisataDusun,
          deskripsi: wisataDeskripsi,
          htm_tiket: wisataHtm === "" ? 0 : Number(wisataHtm),
          fasilitas: fasilArray,
          foto_url: wisataFotoUrl || null,
          lokasi_gmaps_link: cleanWisataMaps || null,
          status: statusVal,
        };
        const resSingle = await supabase.from("destinasi_wisata").insert([payloadSingle]);
        error = resSingle.error;
      }

      // Fallback 2: Jika lokasi_gmaps_link belum ada di skema remote
      if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("lokasi_gmaps_link"))) {
        const payloadNoMaps: any = {
          nama_destinasi: wisataNama,
          kategori: wisataKategori,
          dusun: wisataDusun,
          deskripsi: wisataDeskripsi,
          htm_tiket: wisataHtm === "" ? 0 : Number(wisataHtm),
          fasilitas: fasilArray,
          foto_urls: wisataFotoUrl ? [wisataFotoUrl] : [],
          status: statusVal,
        };
        const resNoMaps = await supabase.from("destinasi_wisata").insert([payloadNoMaps]);
        error = resNoMaps.error;
      }

      if (error) {
        console.warn("Insert wisata error:", error);
        setSubmitWisataError(error.message || "Gagal menyimpan usulan wisata ke database Supabase.");
        return;
      }
    } catch (err: any) {
      console.warn("Supabase wisata error:", err);
      setSubmitWisataError(err?.message || "Terjadi kesalahan koneksi saat menyimpan wisata.");
      return;
    }

    if (isDirectPublish) {
      await fetchHistoryFromDB();
      setAccNotification(`Destinasi wisata "${wisataNama}" berhasil diterbitkan langsung oleh ${currentRole === "padukuh" ? "Pak Dukuh" : "Admin"} dan tersimpan ke database!`);
      setTimeout(() => setAccNotification(null), 4500);
    } else {
      await fetchQueueFromDB();
    }

    setSubmitWisataSuccess(true);
    setWisataNama("");
    setWisataDeskripsi("");
    setWisataGmapsLink("");
    setWisataPreviewImage(null);
    setTimeout(() => setSubmitWisataSuccess(false), 4500);
  };

  // Submit usulan UMKM -> Tulis langsung ke Supabase (Pak Dukuh langsung APPROVED, Kontributor PENDING)
  const handleSubmitUMKM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!umkmNamaProduk || !umkmHarga || !umkmDeskripsi) return;

    const isDirectPublish = currentRole === "padukuh" || currentRole === "admin";
    const statusVal = isDirectPublish ? "APPROVED" : "PENDING";
    const cleanUmkmMaps = umkmGmapsLink.trim();

    const basePayload: any = {
      nama_produk: umkmNamaProduk,
      nama_usaha: umkmNamaUsaha || umkmNamaProduk,
      nama_pemilik: umkmNamaPemilik || (isDirectPublish ? "Warga Binaan Dukuh" : currentUser?.full_name || "Warga"),
      dusun: umkmDusun,
      kategori: umkmKategori,
      harga: Number(umkmHarga),
      satuan: umkmSatuan,
      deskripsi: umkmDeskripsi,
      whatsapp_owner: umkmWhatsApp.replace(/[^0-9]/g, "") || "6281234567890",
      foto_url: umkmFotoUrl,
      alamat_usaha: cleanUmkmMaps || null,
      status: statusVal,
      rejection_reason: isDirectPublish ? "Ditambahkan langsung oleh Pak Dukuh" : null,
      approved_at: isDirectPublish ? new Date().toISOString() : null,
    };

    setSubmitUmkmError(null);
    try {
      const { error } = await supabase.from("umkm").insert([
        {
          ...basePayload,
          lokasi_gmaps_link: cleanUmkmMaps || null,
        },
      ]);

      if (error && error.code === "42703") {
        // Fallback jika kolom lokasi_gmaps_link belum ada di remote DB
        const { error: fallbackErr } = await supabase.from("umkm").insert([basePayload]);
        if (fallbackErr) {
          console.warn("Insert umkm fallback error:", fallbackErr);
          setSubmitUmkmError(fallbackErr.message || "Gagal menyimpan usulan UMKM ke database Supabase.");
          return;
        }
      } else if (error) {
        console.warn("Insert umkm error:", error);
        setSubmitUmkmError(error.message || "Gagal menyimpan usulan UMKM ke database Supabase.");
        return;
      }
    } catch (err: any) {
      console.warn("Supabase umkm error:", err);
      setSubmitUmkmError(err?.message || "Terjadi kesalahan koneksi saat menyimpan produk.");
      return;
    }

    if (isDirectPublish) {
      await fetchHistoryFromDB();
      setAccNotification(`Produk UMKM "${umkmNamaProduk}" berhasil diterbitkan langsung oleh ${currentRole === "padukuh" ? "Pak Dukuh" : "Admin"} dan tersimpan ke database!`);
      setTimeout(() => setAccNotification(null), 4500);
    } else {
      await fetchQueueFromDB();
    }

    setSubmitUmkmSuccess(true);
    setUmkmNamaProduk("");
    setUmkmDeskripsi("");
    setUmkmGmapsLink("");
    setAdminPreviewImage(null);
    setTimeout(() => setSubmitUmkmSuccess(false), 4500);
  };

  // Submit warta berita -> Tulis langsung ke Supabase (Pak Dukuh langsung APPROVED, Kontributor PENDING)
  const handleSubmitArtikel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulArtikel || !isiArtikel) return;

    const isDirectPublish = currentRole === "padukuh" || currentRole === "admin";
    const statusVal = isDirectPublish ? "APPROVED" : "PENDING";
    const slug = `${judulArtikel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;

    const finalPhotos = artikelFotoList.filter(Boolean);
    const coverImagePayload = finalPhotos.length === 1
      ? finalPhotos[0]
      : finalPhotos.length > 1
      ? JSON.stringify(finalPhotos)
      : null;

    setSubmitArticleError(null);
    try {
      const { error } = await supabase.from("artikel").insert([
        {
          title: judulArtikel,
          slug,
          category: kategoriArtikel,
          excerpt: isiArtikel.slice(0, 120) + "...",
          content: isiArtikel,
          author_name: penulis || (currentRole === "padukuh" ? "Bapak Kepala Dukuh Wonosari" : currentUser?.full_name || "Pemerintah Padukuhan Wonosari"),
          cover_image: coverImagePayload,
          status: statusVal,
          rejection_reason: isDirectPublish ? "Ditambahkan langsung oleh Pak Dukuh" : null,
          approved_at: isDirectPublish ? new Date().toISOString() : null,
        },
      ]);

      if (error) {
        console.warn("Insert artikel error:", error);
        setSubmitArticleError(error.message || "Gagal menyimpan warta ke database.");
        return;
      }
    } catch (err: any) {
      console.warn("Supabase artikel error:", err);
      setSubmitArticleError(err?.message || "Terjadi kesalahan koneksi saat menyimpan warta.");
      return;
    }

    if (isDirectPublish) {
      await fetchHistoryFromDB();
      setAccNotification(`Warta berita "${judulArtikel}" berhasil diterbitkan langsung oleh ${currentRole === "padukuh" ? "Pak Dukuh" : "Admin"} dan tersimpan ke database!`);
      setTimeout(() => setAccNotification(null), 4500);
    } else {
      await fetchQueueFromDB();
    }

    setSubmitArticleSuccess(true);
    setJudulArtikel("");
    setIsiArtikel("");
    setArtikelFotoList([
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
    ]);
    setArtikelUrlInput("");
    setTimeout(() => setSubmitArticleSuccess(false), 4500);
  };

  // CRUD Pemerintahan & Kelembagaan -> Operasi langsung ke Supabase aparatur_desa
  const handleSaveLembaga = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lembagaNama || !lembagaJabatan) return;

    try {
      if (editingLembagaId) {
        // Update data ke Supabase
        await supabase.from("aparatur_desa").update({
          nama: lembagaNama,
          jabatan: lembagaJabatan,
          kategori_kelembagaan: lembagaKategori,
          wilayah_tugas: lembagaWilayah,
          nomor_hp: lembagaHp,
          foto_url: lembagaFotoUrl,
          updated_at: new Date().toISOString(),
        }).eq("id", editingLembagaId);
      } else {
        // Insert data baru ke Supabase
        await supabase.from("aparatur_desa").insert([
          {
            nama: lembagaNama,
            jabatan: lembagaJabatan,
            kategori_kelembagaan: lembagaKategori,
            wilayah_tugas: lembagaWilayah,
            nomor_hp: lembagaHp,
            foto_url: lembagaFotoUrl,
          },
        ]);
      }
    } catch (err) {
      console.warn("Supabase aparatur save error:", err);
    }

    // Refresh data dari database
    await fetchAparaturFromDB();

    setShowAddLembagaModal(false);
    setEditingLembagaId(null);
    setLembagaNama("");
    setLembagaJabatan("");
    setLembagaHp("");
    setLembagaFotoUrl(undefined);
    setLembagaPreviewImage(null);
    setAccNotification(editingLembagaId ? "Data pengurus lembaga berhasil diperbarui di database!" : "Pengurus lembaga baru berhasil ditambahkan ke database!");
    setTimeout(() => setAccNotification(null), 3000);
  };

  const handleDeleteLembaga = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus '${nama}' dari daftar pengurus di database?`)) return;

    try {
      await supabase.from("aparatur_desa").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete aparatur error:", err);
    }

    await fetchAparaturFromDB();
    setAccNotification(`Pengurus '${nama}' telah berhasil dihapus dari database.`);
    setTimeout(() => setAccNotification(null), 3000);
  };

  const handleEditLembaga = (item: AparaturItem) => {
    setEditingLembagaId(item.id);
    setLembagaNama(item.nama);
    setLembagaJabatan(item.jabatan);
    setLembagaKategori(item.kategori);
    setLembagaWilayah(item.wilayah);
    setLembagaHp(item.nomor_hp || "");
    setLembagaFotoUrl(item.foto_url);
    setLembagaPreviewImage(null);
    setShowAddLembagaModal(true);
  };

  // Logout handler
  const handleLogout = async () => {
    await signOutUser();
    router.push("/login");
  };

  // Filtered aparatur list
  const filteredAparatur = aparaturList.filter((item) => {
    if (filterLembagaWilayah === "ALL") return true;
    return item.wilayah === filterLembagaWilayah;
  });

  // Filtered history list
  const filteredHistory = moderationHistory.filter((item) => {
    if (historyFilter === "ALL") return true;
    return item.status === historyFilter;
  });

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center text-xs font-bold text-[#1E251E]/60">
        Memeriksa hak akses portal & menyinkronkan database...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1E251E] pb-20">
      {/* 1. Header Bar Admin - Clean, Professional, No Emojis */}
      <section className="relative py-5 sm:py-6 border-b border-[#1E251E]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#1E251E]/50 mb-1.5">
                <Link href="/" className="hover:text-[#EF6C85] flex items-center gap-1 font-medium">
                  <Home className="w-3.5 h-3.5" /> Beranda
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#1E251E] font-bold">Portal Tata Kelola & Moderasi (Database Live)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1E251E] flex items-center gap-2.5">
                <Shield className="w-7 h-7 text-[#EF6C85]" />
                <span>Panel Kendali Padukuhan Wonosari</span>
              </h1>
              <p className="text-xs text-[#1E251E]/60 mt-1">
                Seluruh data tersinkronisasi <strong>100% langsung dengan database Supabase PostgreSQL</strong> tanpa penyimpanan lokal.
              </p>
            </div>

            {/* Authenticated User Identity Card & Logout */}
            <div className="flex items-center gap-3 p-2 bg-[#FAF6F0] rounded-2xl border border-[#1E251E]/10 self-start md:self-auto shadow-2xs">
              <div className="flex items-center gap-2.5 px-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    currentRole === "padukuh"
                      ? "bg-[#EF6C85] text-white"
                      : currentRole === "admin"
                      ? "bg-[#1E251E] text-white"
                      : "bg-[#9DB368] text-white"
                  }`}
                >
                  {currentRole === "padukuh" ? (
                    <Shield className="w-4 h-4" />
                  ) : currentRole === "admin" ? (
                    <Settings className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#1E251E]">
                      {currentUser?.full_name || (currentRole === "padukuh" ? "Bapak Kepala Dukuh" : "Kontributor")}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        currentRole === "padukuh"
                          ? "bg-[#FCE8EC] text-[#D64E68] border border-[#EF6C85]/30"
                          : currentRole === "admin"
                          ? "bg-neutral-200 text-[#1E251E] border border-[#1E251E]/20"
                          : "bg-[#EBF2DC] text-[#4D6328] border border-[#9DB368]/30"
                      }`}
                    >
                      {currentRole === "padukuh"
                        ? "Kepala Dukuh"
                        : currentRole === "admin"
                        ? "Admin KKN"
                        : "Kontributor Warga"}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#1E251E]/50">
                    {currentUser?.email || ""} • {currentUser?.dusun || "Padukuhan Wonosari"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                title="Keluar dari Panel Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Navigasi Tab Dashboard Berdasarkan Hak Akses Resmi */}
      <section className="bg-white/90 backdrop-blur-md border-b border-[#1E251E]/5 py-3 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tab 1: Antrean Persetujuan (Hanya Pak Dukuh & Admin KKN) */}
            {(currentRole === "padukuh" || currentRole === "admin") && (
              <button
                onClick={() => setActiveTab("moderasi")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "moderasi"
                    ? "bg-[#1E251E] text-white shadow-xs"
                    : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Antrean Persetujuan ({queue.length})
                </span>
              </button>
            )}

            {/* Tab 2: Riwayat Moderasi (Hanya Pak Dukuh & Admin KKN) */}
            {(currentRole === "padukuh" || currentRole === "admin") && (
              <button
                onClick={() => setActiveTab("riwayat")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "riwayat"
                    ? "bg-[#1E251E] text-white shadow-xs"
                    : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
                }`}
              >
                <History className="w-3.5 h-3.5 text-[#EF6C85]" />
                <span>Riwayat Moderasi ({moderationHistory.length})</span>
              </button>
            )}

            {/* Tab 3: Kelola Lembaga & SOTK (Hanya Pak Dukuh & Admin KKN) */}
            {(currentRole === "padukuh" || currentRole === "admin") && (
              <button
                onClick={() => setActiveTab("lembaga")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "lembaga"
                    ? "bg-[#1E251E] text-white shadow-xs"
                    : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-[#9DB368]" />
                <span>Kelola Lembaga & SOTK ({aparaturList.length})</span>
              </button>
            )}

            {/* Tab 3B: Kelola Monografi & Demografi Wilayah (Pak Dukuh & Admin KKN) */}
            {(currentRole === "padukuh" || currentRole === "admin") && (
              <button
                onClick={() => setActiveTab("demografi")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "demografi"
                    ? "bg-[#1E251E] text-white shadow-xs"
                    : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kelola Monografi & Demografi ({demografiList.length})</span>
              </button>
            )}

            {/* Tab 3C: Kelola Kebudayaan Padukuhan (Pak Dukuh & Admin KKN) */}
            {(currentRole === "padukuh" || currentRole === "admin") && (
              <button
                onClick={() => setActiveTab("kebudayaan")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "kebudayaan"
                    ? "bg-[#1E251E] text-white shadow-xs"
                    : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Kelola Kebudayaan ({kebudayaanList.length})</span>
              </button>
            )}

            {/* Tab 4: Destinasi Wisata */}
            <button
              onClick={() => setActiveTab("tambah-wisata")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "tambah-wisata"
                  ? "bg-[#1E251E] text-white shadow-xs"
                  : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#9DB368]" />
              <span>
                {currentRole === "padukuh" ? "Tambah Destinasi Wisata" : currentRole === "admin" ? "Kelola / Tambah Wisata" : "Usulkan Destinasi Wisata"}
              </span>
            </button>

            {/* Tab 5: Produk UMKM */}
            <button
              onClick={() => setActiveTab("tambah-umkm")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "tambah-umkm"
                  ? "bg-[#1E251E] text-white shadow-xs"
                  : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#EF6C85]" />
              <span>
                {currentRole === "padukuh" ? "Tambah Produk UMKM" : currentRole === "admin" ? "Kelola / Tambah UMKM" : "Usulkan Produk UMKM"}
              </span>
            </button>

            {/* Tab 6: Warta Berita */}
            <button
              onClick={() => setActiveTab("tulis")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "tulis"
                  ? "bg-[#1E251E] text-white shadow-xs"
                  : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>
                {currentRole === "padukuh" ? "Tambah Warta Berita" : currentRole === "admin" ? "Kelola / Tambah Warta" : "Usulkan Warta Berita"}
              </span>
            </button>

            {/* Tab 7: Master Data (Hanya Admin KKN) */}
            {currentRole === "admin" && (
              <button
                onClick={() => setActiveTab("master")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "master"
                    ? "bg-[#1E251E] text-white shadow-xs"
                    : "text-[#1E251E]/60 hover:text-[#1E251E] hover:bg-neutral-100"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#EF6C85]" />
                <span>Manajemen Master Data</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Banner Notifikasi Aksi */}
      <AnimatePresence>
        {accNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4"
          >
            <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{accNotification}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Area Konten Berdasarkan Tab */}
      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TAB 1: MODERASI (UNTUK PAK DUKUH & ADMIN KKN) */}
          {activeTab === "moderasi" && (currentRole === "padukuh" || currentRole === "admin") && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#1E251E] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>Antrean Moderasi Konten, UMKM & Wisata (Database Live)</span>
                    {currentRole === "padukuh" && (
                      <span className="text-[10px] font-extrabold bg-[#FCE8EC] text-[#D64E68] px-2.5 py-0.5 rounded-full">
                        Hak Otoritas Kepala Dukuh
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#1E251E]/60 mt-0.5">
                    Data antrean dibaca langsung secara live dari Supabase PostgreSQL. Tekan tombol <strong>Setujui (ACC)</strong> agar konten langsung berstatus APPROVED di database dan tampil resmi di website.
                  </p>
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-10 sm:p-14 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#1E251E] mb-1.5">
                    Antrean Persetujuan Bersih
                  </h3>
                  <p className="text-xs text-[#1E251E]/60 max-w-md mx-auto leading-relaxed">
                    Tidak ada usulan berstatus PENDING di database saat ini. Semua usulan warga telah selesai ditinjau. Usulan baru dari kontributor akan otomatis muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-[#1E251E]/10 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4 max-w-2xl">
                        {item.foto_url && (
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-[#1E251E]/10">
                            <img src={item.foto_url} alt={item.title} className="w-full h-full object-cover" />
                            {item.foto_urls && item.foto_urls.length > 1 && (
                              <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Camera className="w-2.5 h-2.5" />
                                <span>{item.foto_urls.length}</span>
                              </span>
                            )}
                          </div>
                        )}

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF6F0] text-[#1E251E]/70 border border-[#1E251E]/10">
                              {item.type === "umkm" ? (
                                <>
                                  <Store className="w-3 h-3 text-[#EF6C85]" />
                                  <span>Produk UMKM</span>
                                </>
                              ) : item.type === "wisata" ? (
                                <>
                                  <Compass className="w-3 h-3 text-[#9DB368]" />
                                  <span>Destinasi Wisata</span>
                                </>
                              ) : item.type === "artikel" ? (
                                <>
                                  <FileText className="w-3 h-3 text-sky-600" />
                                  <span>Warta Berita</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-3 h-3 text-purple-600" />
                                  <span>Galeri Desa</span>
                                </>
                              )}
                            </span>
                            <span className="text-[11px] text-[#1E251E]/50">
                              Diajukan oleh: <strong>{item.submitter}</strong> • {item.date}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Menunggu Persetujuan
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-[#1E251E] mb-1">{item.title}</h3>
                          <p className="text-xs text-[#1E251E]/70 line-clamp-2 leading-relaxed mb-2">{item.excerpt}</p>
                          {item.lokasi_gmaps_link && (
                            <a
                              href={item.lokasi_gmaps_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all w-fit active:scale-95"
                              title="Buka titik lokasi di Google Maps untuk verifikasi"
                            >
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Cek Titik Lokasi di Google Maps</span>
                              <ExternalLink className="w-3 h-3 text-emerald-600 ml-0.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        <button
                          onClick={() => handleModerate(item.id, "APPROVED")}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                          title="Setujui dan Tayangkan ke Publik"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Setujui (ACC)</span>
                        </button>
                        <button
                          onClick={() => {
                            setRejectModalItem(item);
                            setRejectReasonInput("");
                          }}
                          className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                          title="Tolak Usulan"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODAL POP-UP CATATAN PENOLAKAN (OPSIONAL DENGAN TEMPLATE TEKS) */}
              <AnimatePresence>
                {rejectModalItem && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-3xl border border-[#1E251E]/10 p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 my-8"
                    >
                      {/* Header Modal */}
                      <div className="flex items-start justify-between pb-3 border-b border-[#1E251E]/10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                            <XCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-[#1E251E]">
                              Tolak Usulan Konten
                            </h3>
                            <p className="text-xs text-[#1E251E]/60">
                              Usulan akan dipindahkan ke Riwayat Moderasi
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (!isSubmittingReject) {
                              setRejectModalItem(null);
                              setRejectReasonInput("");
                            }
                          }}
                          className="p-1.5 rounded-full hover:bg-neutral-100 text-[#1E251E]/50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Info Kartu Usulan */}
                      <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#1E251E]/10 space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-[#1E251E]/70 uppercase tracking-wider">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-[#1E251E]/10 text-[#EF6C85]">
                            {rejectModalItem.type.toUpperCase()}
                          </span>
                          <span>Oleh {rejectModalItem.submitter}</span>
                        </div>
                        <h4 className="font-black text-sm text-[#1E251E] line-clamp-1">
                          {rejectModalItem.title}
                        </h4>
                      </div>

                      {/* Form Catatan Penolakan (Opsional) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#1E251E] flex items-center gap-1.5">
                            <span>Catatan / Alasan Penolakan</span>
                            <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold">
                              Opsional
                            </span>
                          </label>
                          {rejectReasonInput && (
                            <button
                              type="button"
                              onClick={() => setRejectReasonInput("")}
                              className="text-[11px] text-[#EF6C85] hover:underline"
                            >
                              Kosongkan
                            </button>
                          )}
                        </div>

                        <textarea
                          rows={3}
                          value={rejectReasonInput}
                          onChange={(e) => setRejectReasonInput(e.target.value)}
                          placeholder={`Catatan bersifat opsional. Boleh dikosongkan (akan otomatis memakai template standar).`}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] placeholder:text-[#1E251E]/40 focus:outline-none focus:border-[#EF6C85] transition-all resize-none"
                        />

                        {/* Banner Info Template Otomatis */}
                        <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/70 text-[11px] text-amber-950 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>Template Otomatis Jika Dikosongkan:</span>
                          </div>
                          <p className="italic text-amber-900/90 pl-5">
                            &ldquo;{DEFAULT_REJECTION_TEMPLATE}&rdquo;
                          </p>
                        </div>

                        {/* Chips Pilihan Cepat */}
                        <div className="pt-1">
                          <p className="text-[11px] font-bold text-[#1E251E]/60 mb-1.5">
                            Pilihan cepat (klik untuk mengisi):
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {REJECTION_PRESETS.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setRejectReasonInput(preset)}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF6F0] border border-[#1E251E]/15 text-[11px] text-[#1E251E]/80 text-left transition-colors"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tombol Aksi Modal */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E251E]/10">
                        <button
                          type="button"
                          disabled={isSubmittingReject}
                          onClick={() => {
                            setRejectModalItem(null);
                            setRejectReasonInput("");
                          }}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#1E251E]/70 hover:bg-neutral-100 transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isSubmittingReject}
                          onClick={handleConfirmReject}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>
                            {isSubmittingReject ? "Memproses..." : "Konfirmasi Tolak Usulan"}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 2: RIWAYAT MODERASI (AUDIT LOG UNTUK ADMIN & PAK DUKUH) */}
          {activeTab === "riwayat" && (currentRole === "padukuh" || currentRole === "admin") && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-[#1E251E] flex items-center gap-2">
                    <History className="w-5 h-5 text-[#EF6C85]" />
                    <span>Riwayat Keputusan Moderasi & Publikasi (Database Live)</span>
                  </h2>
                  <p className="text-xs text-[#1E251E]/60 mt-0.5">
                    Data riwayat dimuat langsung dari tabel database PostgreSQL Supabase.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#1E251E]/10 text-xs">
                  <button
                    onClick={() => setHistoryFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      historyFilter === "ALL" ? "bg-[#1E251E] text-white" : "text-[#1E251E]/60 hover:text-[#1E251E]"
                    }`}
                  >
                    Semua ({moderationHistory.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter("APPROVED")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      historyFilter === "APPROVED" ? "bg-emerald-600 text-white" : "text-[#1E251E]/60 hover:text-[#1E251E]"
                    }`}
                  >
                    Disetujui ({moderationHistory.filter((h) => h.status === "APPROVED").length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter("REJECTED")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      historyFilter === "REJECTED" ? "bg-rose-600 text-white" : "text-[#1E251E]/60 hover:text-[#1E251E]"
                    }`}
                  >
                    Ditolak ({moderationHistory.filter((h) => h.status === "REJECTED").length})
                  </button>
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-[#1E251E]/10 p-8 text-xs text-[#1E251E]/50">
                  Belum ada catatan riwayat moderasi untuk filter ini di database.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredHistory.map((item) => {
                    const isDirectByDukuh =
                      item.rejection_reason === "Ditambahkan langsung oleh Pak Dukuh" ||
                      item.submitter === "Bapak Kepala Dukuh Wonosari";

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-[#1E251E]/10 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          {item.foto_url && (
                            <img src={item.foto_url} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-[#1E251E]/10 flex-shrink-0" />
                          )}
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                  item.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                              >
                                {item.status === "APPROVED" ? "DISETUJUI (ACC)" : "DITOLAK"}
                              </span>
                              <span className="text-[10px] font-bold text-[#1E251E]/50 uppercase">
                                {item.type}
                              </span>
                              <span className="text-[10px] text-[#1E251E]/40">
                                Tanggal: {item.date}
                              </span>
                            </div>

                            <h4 className="text-sm font-extrabold text-[#1E251E]">{item.title}</h4>
                            <p className="text-xs text-[#1E251E]/60 mt-0.5">
                              Pengusul / Penerbit: <strong>{item.submitter}</strong>
                            </p>

                            {/* Info Keterangan Khusus dari Akun Pak Dukuh */}
                            {isDirectByDukuh ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold mt-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span>Ditambahkan langsung oleh Pak Dukuh</span>
                              </div>
                            ) : item.rejection_reason ? (
                              <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg mt-2 border border-rose-200">
                                <strong>Catatan Penolakan:</strong> {item.rejection_reason}
                              </p>
                            ) : null}

                            {/* Link Google Maps */}
                            {item.lokasi_gmaps_link && (
                              <div className="mt-2">
                                <a
                                  href={item.lokasi_gmaps_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#FCE8EC] text-[#1E251E]/70 hover:text-[#EF6C85] border border-[#1E251E]/10 text-xs font-semibold transition-all w-fit"
                                  title="Lihat titik lokasi di Google Maps"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-[#EF6C85]" />
                                  <span>Buka Google Maps</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right sm:self-center">
                          <span className="text-[11px] font-semibold text-[#1E251E]/50 block">
                            Penanggung Jawab:
                          </span>
                          <span className="text-xs font-bold text-[#EF6C85]">
                            {item.reviewed_by || "Bapak Kepala Dukuh Wonosari"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KELOLA PEMERINTAHAN & KELEMBAGAAN PADUKUHAN (PAK DUKUH & ADMIN KKN) */}
          {activeTab === "lembaga" && (currentRole === "padukuh" || currentRole === "admin") && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#1E251E] flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-[#9DB368]" />
                    <span>Pemerintahan & Kelembagaan SOTK Padukuhan (Database Live)</span>
                  </h2>
                  <p className="text-xs text-[#1E251E]/60 mt-0.5">
                    Data aparatur desa dibaca dan dimodifikasi langsung pada tabel <strong>aparatur_desa</strong> di Supabase PostgreSQL.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingLembagaId(null);
                    setLembagaNama("");
                    setLembagaJabatan("");
                    setLembagaHp("");
                    setLembagaFotoUrl(undefined);
                    setLembagaPreviewImage(null);
                    setShowAddLembagaModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#EF6C85] hover:bg-[#D64E68] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tambah Pengurus Baru</span>
                </button>
              </div>

              {/* Filter Wilayah Dusun */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#1E251E]/10 shadow-2xs">
                <span className="text-[10px] font-bold text-[#1E251E]/50 px-2 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Wilayah:
                </span>
                <button
                  onClick={() => setFilterLembagaWilayah("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterLembagaWilayah === "ALL" ? "bg-[#1E251E] text-white" : "text-[#1E251E]/60 hover:text-[#1E251E]"
                  }`}
                >
                  Semua Wilayah ({aparaturList.length})
                </button>
                <button
                  onClick={() => setFilterLembagaWilayah("Seluruh Wilayah")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterLembagaWilayah === "Seluruh Wilayah" ? "bg-[#EF6C85] text-white" : "text-[#1E251E]/60 hover:text-[#1E251E]"
                  }`}
                >
                  Tingkat Padukuhan ({aparaturList.filter((a) => a.wilayah === "Seluruh Wilayah").length})
                </button>
                <button
                  onClick={() => setFilterLembagaWilayah("Rejosari")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterLembagaWilayah === "Rejosari" ? "bg-[#9DB368] text-white" : "text-[#1E251E]/60 hover:text-[#1E251E]"
                  }`}
                >
                  Kampung Rejosari ({aparaturList.filter((a) => a.wilayah === "Rejosari").length})
                </button>
                <button
                  onClick={() => setFilterLembagaWilayah("Wonosari")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterLembagaWilayah === "Wonosari" ? "bg-[#E8A838] text-white" : "text-[#1E251E]/60 hover:text-[#1E251E]"
                  }`}
                >
                  Kampung Wonosari ({aparaturList.filter((a) => a.wilayah === "Wonosari").length})
                </button>
                <button
                  onClick={() => setFilterLembagaWilayah("Pajangan")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterLembagaWilayah === "Pajangan" ? "bg-[#8B5CF6] text-white" : "text-[#1E251E]/60 hover:text-[#1E251E]"
                  }`}
                >
                  Kampung Pajangan ({aparaturList.filter((a) => a.wilayah === "Pajangan").length})
                </button>
              </div>

              {/* Grid Kartu Pengurus Lembaga */}
              {filteredAparatur.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-[#1E251E]/10 p-8 text-xs text-[#1E251E]/50">
                  Belum ada data pengurus aparatur di database. Silakan klik <strong>Tambah Pengurus Baru</strong> di atas untuk menambahkan data.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAparatur.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-[#1E251E]/10 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              item.wilayah === "Seluruh Wilayah"
                                ? "bg-[#FCE8EC] text-[#D64E68]"
                                : item.wilayah === "Rejosari"
                                ? "bg-[#EBF2DC] text-[#4D6328]"
                                : item.wilayah === "Wonosari"
                                ? "bg-[#FFF4DC] text-[#9A6B17]"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {item.wilayah === "Seluruh Wilayah" ? "Tingkat Padukuhan" : `Kampung ${item.wilayah}`}
                          </span>
                          <span className="text-[10px] text-[#1E251E]/40 font-medium">
                            {item.kategori}
                          </span>
                        </div>

                        <div className="flex items-start gap-3 my-2">
                          {item.foto_url ? (
                            <img src={item.foto_url} alt={item.nama} className="w-12 h-12 rounded-xl object-cover border border-[#1E251E]/10 flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 flex items-center justify-center text-[#1E251E]/40 flex-shrink-0">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-black text-[#1E251E] mb-0.5">{item.nama}</h3>
                            <p className="text-xs font-bold text-[#EF6C85]">{item.jabatan}</p>
                          </div>
                        </div>

                        {item.nomor_hp && (
                          <p className="text-[11px] text-[#1E251E]/60 flex items-center gap-1 mb-3">
                            <Phone className="w-3 h-3 text-[#9DB368]" />
                            <span>{item.nomor_hp}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#1E251E]/10 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditLembaga(item)}
                          className="p-1.5 rounded-lg text-[#1E251E]/70 hover:text-[#EF6C85] hover:bg-[#FCE8EC]/50 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Edit Data"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLembaga(item.id, item.nama)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Form Tambah / Edit Lembaga */}
              <AnimatePresence>
                {showAddLembagaModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-3xl border border-[#1E251E]/10 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 my-8"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[#1E251E]/10">
                        <h3 className="text-base font-black text-[#1E251E]">
                          {editingLembagaId ? "Edit Data Pengurus Lembaga (Database)" : "Tambah Pengurus Baru ke Database"}
                        </h3>
                        <button
                          onClick={() => setShowAddLembagaModal(false)}
                          className="p-1.5 rounded-full hover:bg-neutral-100 text-[#1E251E]/50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveLembaga} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-[#1E251E] mb-1">
                            Nama Lengkap Pengurus / Pejabat *
                          </label>
                          <input
                            type="text"
                            required
                            value={lembagaNama}
                            onChange={(e) => setLembagaNama(e.target.value)}
                            placeholder="Contoh: Bapak H. Suyatno / Ibu Rahayu"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E251E] mb-1">
                            Jabatan *
                          </label>
                          <input
                            type="text"
                            required
                            value={lembagaJabatan}
                            onChange={(e) => setLembagaJabatan(e.target.value)}
                            placeholder="Contoh: Ketua Karang Taruna / Ketua RW 18 / Ketua TP-PKK"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#1E251E] mb-1">
                              Klasifikasi Kategori
                            </label>
                            <select
                              value={lembagaKategori}
                              onChange={(e) => setLembagaKategori(e.target.value as any)}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                            >
                              <option value="Pemerintah Padukuhan">Pemerintah Padukuhan (Dukuh/RW/RT)</option>
                              <option value="Kelembagaan Masyarakat">Kelembagaan Masyarakat (PKK/Karang Taruna/Linmas)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#1E251E] mb-1">
                              Wilayah Tugas
                            </label>
                            <select
                              value={lembagaWilayah}
                              onChange={(e) => setLembagaWilayah(e.target.value as any)}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                            >
                              <option value="Seluruh Wilayah">Seluruh Wilayah (Tingkat Padukuhan)</option>
                              <option value="Rejosari">Kampung Rejosari (RW 18)</option>
                              <option value="Wonosari">Kampung Wonosari (RW 17)</option>
                              <option value="Pajangan">Kampung Pajangan (RW 16)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E251E] mb-1">
                            Nomor WhatsApp / Telepon
                          </label>
                          <input
                            type="text"
                            value={lembagaHp}
                            onChange={(e) => setLembagaHp(e.target.value)}
                            placeholder="Contoh: 628123456789"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                          />
                        </div>

                        {/* Upload Foto Pengurus dari File/Galeri */}
                        <div>
                          <label className="block text-xs font-bold text-[#1E251E] mb-1">
                            Foto Profil Pengurus (Opsional dari File/Galeri)
                          </label>
                          <div className="p-3 rounded-xl bg-[#FAF6F0] border border-dashed border-[#1E251E]/20 text-center relative cursor-pointer hover:border-[#EF6C85] transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLembagaFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {lembagaPreviewImage || lembagaFotoUrl ? (
                              <div className="flex items-center justify-center gap-3">
                                <img
                                  src={lembagaPreviewImage || lembagaFotoUrl}
                                  alt="Preview Aparatur"
                                  className="w-12 h-12 rounded-xl object-cover border border-[#1E251E]/10"
                                />
                                <span className="text-xs font-bold text-[#EF6C85]">Ganti Foto Profil</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-[#1E251E]/60 text-xs">
                                <Upload className="w-4 h-4 text-[#EF6C85]" />
                                <span>Pilih foto dari berkas perangkat</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#1E251E]/10 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddLembagaModal(false)}
                            className="px-4 py-2 rounded-xl border border-[#1E251E]/15 text-xs font-bold text-[#1E251E]/70 hover:bg-neutral-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-[#EF6C85] hover:bg-[#D64E68] text-white text-xs font-bold shadow-sm"
                          >
                            Simpan ke Database
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 3B: KELOLA DEMOGRAFI WILAYAH (KHUSUS PAK DUKUH & ADMIN KKN) */}
          {activeTab === "demografi" && (currentRole === "padukuh" || currentRole === "admin") && (
            <div className="space-y-6">
              {/* Header & Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#1E251E]/10 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#1E251E]">
                      Kelola Data Monografi & Demografi Wilayah Kependudukan RT
                    </h2>
                    <p className="text-xs text-[#1E251E]/60 mt-0.5">
                      Sinkronisasi langsung dengan tabel <code className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[11px] text-neutral-800">demografi_wilayah</code> di Supabase. Pak Dukuh dan Admin dapat leluasa mengatur, menambah, atau memperbarui monografi kependudukan per RT yang langsung tayang pada halaman Monografi Publik.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleOpenAddDemografi}
                  className="px-5 py-2.5 rounded-xl bg-[#1E251E] hover:bg-neutral-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <PlusCircle className="w-4 h-4 text-[#9DB368]" />
                  <span>Tambah Data RT Baru</span>
                </button>
              </div>

              {/* Stat Ringkasan Kependudukan */}
              {(() => {
                const totalRt = demografiList.length;
                const totalJiwa = demografiList.reduce((acc, curr) => acc + (Number(curr.jumlah_jiwa) || 0), 0);
                const totalKk = demografiList.reduce((acc, curr) => acc + (Number(curr.jumlah_kk) || 0), 0);
                const totalPria = demografiList.reduce((acc, curr) => acc + (Number(curr.jumlah_pria) || 0), 0);
                const totalWanita = demografiList.reduce((acc, curr) => acc + (Number(curr.jumlah_wanita) || 0), 0);
                const totalProduktif = demografiList.reduce((acc, curr) => acc + (Number(curr.usia_produktif_19_59) || 0), 0);

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1E251E]/10 shadow-xs">
                      <span className="text-[11px] font-bold text-[#1E251E]/60 block uppercase tracking-wider">Total RT Terdaftar</span>
                      <div className="text-2xl font-black text-[#1E251E] mt-1">{totalRt} <span className="text-xs font-semibold text-[#1E251E]/50">RT</span></div>
                      <span className="text-[10px] text-[#1E251E]/50 mt-0.5 block">Rejosari, Wonosari, Pajangan</span>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1E251E]/10 shadow-xs">
                      <span className="text-[11px] font-bold text-[#1E251E]/60 block uppercase tracking-wider">Total Jiwa</span>
                      <div className="text-2xl font-black text-indigo-600 mt-1">{totalJiwa.toLocaleString("id-ID")} <span className="text-xs font-semibold text-[#1E251E]/50">Orang</span></div>
                      <span className="text-[10px] text-[#1E251E]/60 mt-0.5 block">{totalPria.toLocaleString("id-ID")} L / {totalWanita.toLocaleString("id-ID")} P</span>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1E251E]/10 shadow-xs">
                      <span className="text-[11px] font-bold text-[#1E251E]/60 block uppercase tracking-wider">Total Kepala Keluarga</span>
                      <div className="text-2xl font-black text-[#4D6328] mt-1">{totalKk.toLocaleString("id-ID")} <span className="text-xs font-semibold text-[#1E251E]/50">KK</span></div>
                      <span className="text-[10px] text-[#1E251E]/50 mt-0.5 block">Kartu Keluarga terdaftar</span>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1E251E]/10 shadow-xs">
                      <span className="text-[11px] font-bold text-[#1E251E]/60 block uppercase tracking-wider">Usia Produktif (19-59)</span>
                      <div className="text-2xl font-black text-[#EF6C85] mt-1">{totalProduktif.toLocaleString("id-ID")} <span className="text-xs font-semibold text-[#1E251E]/50">Jiwa</span></div>
                      <span className="text-[10px] text-[#1E251E]/50 mt-0.5 block">Potensi tenaga kerja aktif</span>
                    </div>
                  </div>
                );
              })()}

              {/* Filter Berdasarkan Dusun */}
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-[#1E251E]/10">
                <span className="text-xs font-bold text-[#1E251E]/60 px-2">Filter Dusun:</span>
                {[
                  { label: "Semua Dusun", value: "ALL" },
                  { label: "Dusun Rejosari", value: "Rejosari" },
                  { label: "Dusun Wonosari", value: "Wonosari" },
                  { label: "Dusun Pajangan", value: "Pajangan" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilterDemografiDusun(f.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterDemografiDusun === f.value
                        ? "bg-[#1E251E] text-white"
                        : "bg-neutral-100 text-[#1E251E]/70 hover:bg-neutral-200"
                    }`}
                  >
                    {f.label} ({f.value === "ALL" ? demografiList.length : demografiList.filter((d) => d.dusun === f.value).length})
                  </button>
                ))}
              </div>

              {/* Grid Daftar RT */}
              {(() => {
                const filtered = filterDemografiDusun === "ALL"
                  ? demografiList
                  : demografiList.filter((d) => d.dusun === filterDemografiDusun);

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-[#1E251E]">Belum Ada Data Demografi RT</p>
                      <p className="text-xs text-[#1E251E]/50 max-w-sm mx-auto mt-1 mb-4">
                        Data demografi kependudukan untuk dusun ini belum diisi di database Supabase.
                      </p>
                      <button
                        onClick={handleOpenAddDemografi}
                        className="px-4 py-2 rounded-xl bg-[#1E251E] text-white text-xs font-bold inline-flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 text-[#9DB368]" />
                        <span>Tambah Data RT Sekarang</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-[#1E251E]/10 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors"
                      >
                        <div>
                          {/* Header Card */}
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1E251E]/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                                  {item.rt} / {item.rw}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 font-semibold text-xs">
                                  Dusun {item.dusun}
                                </span>
                              </div>
                              <h3 className="text-sm font-extrabold text-[#1E251E] mt-1.5">
                                Ketua RT: <span className="font-medium text-[#1E251E]/80">{item.nama_ketua_rt || "Belum ditentukan"}</span>
                              </h3>
                              {item.luas_wilayah_m2 > 0 && (
                                <span className="text-[11px] text-[#1E251E]/50 block mt-0.5">
                                  Luas Wilayah: {item.luas_wilayah_m2.toLocaleString("id-ID")} m²
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleOpenEditDemografi(item)}
                                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1E251E] text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="Edit Data RT"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                                <span className="hidden sm:inline text-[11px]">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteDemografi(item.id, item.rt, item.dusun)}
                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="Hapus Data RT"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline text-[11px]">Hapus</span>
                              </button>
                            </div>
                          </div>

                          {/* Data Kependudukan Grid */}
                          <div className="grid grid-cols-3 gap-2 py-3 border-b border-[#1E251E]/10">
                            <div className="bg-[#FAF6F0] p-2 rounded-xl text-center">
                              <span className="text-[10px] font-bold text-[#1E251E]/50 block uppercase">Jumlah KK</span>
                              <span className="text-base font-black text-[#1E251E]">{item.jumlah_kk}</span>
                            </div>
                            <div className="bg-[#FAF6F0] p-2 rounded-xl text-center">
                              <span className="text-[10px] font-bold text-[#1E251E]/50 block uppercase">Total Jiwa</span>
                              <span className="text-base font-black text-indigo-600">{item.jumlah_jiwa}</span>
                            </div>
                            <div className="bg-[#FAF6F0] p-2 rounded-xl text-center">
                              <span className="text-[10px] font-bold text-[#1E251E]/50 block uppercase">L / P</span>
                              <span className="text-sm font-extrabold text-[#1E251E]">{item.jumlah_pria} / {item.jumlah_wanita}</span>
                            </div>
                          </div>

                          {/* Detail Kelompok Usia */}
                          <div className="py-2.5 border-b border-[#1E251E]/10">
                            <span className="text-[10px] font-bold text-[#1E251E]/60 uppercase tracking-wider block mb-1.5">
                              Kelompok Usia
                            </span>
                            <div className="grid grid-cols-4 gap-1 text-[11px]">
                              <div className="bg-neutral-50 px-2 py-1 rounded-lg">
                                <span className="text-[10px] text-[#1E251E]/50 block">Balita (0-5)</span>
                                <span className="font-bold text-[#1E251E]">{item.balita_0_5}</span>
                              </div>
                              <div className="bg-neutral-50 px-2 py-1 rounded-lg">
                                <span className="text-[10px] text-[#1E251E]/50 block">Sekolah (6-18)</span>
                                <span className="font-bold text-[#1E251E]">{item.usia_sekolah_6_18}</span>
                              </div>
                              <div className="bg-neutral-50 px-2 py-1 rounded-lg">
                                <span className="text-[10px] text-[#1E251E]/50 block">Produktif (19-59)</span>
                                <span className="font-bold text-[#4D6328]">{item.usia_produktif_19_59}</span>
                              </div>
                              <div className="bg-neutral-50 px-2 py-1 rounded-lg">
                                <span className="text-[10px] text-[#1E251E]/50 block">Lansia (60+)</span>
                                <span className="font-bold text-[#EF6C85]">{item.lansia_60_plus}</span>
                              </div>
                            </div>
                          </div>

                          {/* Detail Mata Pencaharian */}
                          <div className="pt-2.5">
                            <span className="text-[10px] font-bold text-[#1E251E]/60 uppercase tracking-wider block mb-1.5">
                              Mata Pencaharian
                            </span>
                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                              <span className="px-2 py-0.5 rounded bg-neutral-100 text-[#1E251E]">Petani: <b>{item.petani}</b></span>
                              <span className="px-2 py-0.5 rounded bg-neutral-100 text-[#1E251E]">Wiraswasta: <b>{item.wiraswasta_pedagang}</b></span>
                              <span className="px-2 py-0.5 rounded bg-neutral-100 text-[#1E251E]">Karyawan Swasta: <b>{item.karyawan_swasta}</b></span>
                              <span className="px-2 py-0.5 rounded bg-neutral-100 text-[#1E251E]">PNS/TNI/Polri: <b>{item.pns_tni_polri}</b></span>
                              <span className="px-2 py-0.5 rounded bg-neutral-100 text-[#1E251E]">Buruh: <b>{item.buruh_harian}</b></span>
                              <span className="px-2 py-0.5 rounded bg-neutral-100 text-[#1E251E]">Lainnya: <b>{item.lainnya}</b></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Modal Tambah / Edit Demografi RT */}
              <AnimatePresence>
                {showAddDemografiModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#1E251E]/10 my-8"
                    >
                      <div className="flex items-center justify-between pb-4 border-b border-[#1E251E]/10 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-[#1E251E]">
                              {editingDemografiId ? "Edit Data Demografi RT" : "Tambah Data RT Baru"}
                            </h3>
                            <p className="text-[11px] text-[#1E251E]/50">
                              Disimpan langsung ke tabel <code className="font-mono">demografi_wilayah</code> Supabase
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddDemografiModal(false)}
                          className="p-1.5 rounded-lg text-[#1E251E]/50 hover:text-[#1E251E] hover:bg-neutral-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveDemografi} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                        {/* 1. Lokasi & Identitas RT */}
                        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-[#1E251E]/5 space-y-3">
                          <span className="text-xs font-bold text-[#1E251E] block">Identitas Wilayah RT</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-[#1E251E]/70 mb-1">Dusun / Padukuhan *</label>
                              <select
                                value={demoDusun}
                                onChange={(e) => setDemoDusun(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs font-medium text-[#1E251E] focus:outline-none focus:border-indigo-500"
                              >
                                <option value="Rejosari">Dusun Rejosari</option>
                                <option value="Wonosari">Dusun Wonosari</option>
                                <option value="Pajangan">Dusun Pajangan</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#1E251E]/70 mb-1">Nomor RW *</label>
                              <input
                                type="text"
                                required
                                placeholder="Contoh: RW 12"
                                value={demoRw}
                                onChange={(e) => setDemoRw(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#1E251E]/70 mb-1">Nomor RT *</label>
                              <input
                                type="text"
                                required
                                placeholder="Contoh: RT 04"
                                value={demoRt}
                                onChange={(e) => setDemoRt(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-bold text-[#1E251E]/70 mb-1">Nama Ketua RT</label>
                              <input
                                type="text"
                                placeholder="Contoh: Bpk. Budi Santoso"
                                value={demoKetuaRt}
                                onChange={(e) => setDemoKetuaRt(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-[#1E251E]/70 mb-1">Luas Wilayah (m²)</label>
                              <input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={demoLuas || ""}
                                onChange={(e) => setDemoLuas(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Jumlah Penduduk Utama */}
                        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                          <span className="text-xs font-bold text-indigo-900 block">Jumlah Kependudukan Utama</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Jumlah KK *</label>
                              <input
                                type="number"
                                min={0}
                                required
                                value={demoJumlahKk || ""}
                                onChange={(e) => setDemoJumlahKk(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs font-bold text-[#1E251E] focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Total Jiwa *</label>
                              <input
                                type="number"
                                min={0}
                                required
                                value={demoJumlahJiwa || ""}
                                onChange={(e) => setDemoJumlahJiwa(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs font-bold text-indigo-600 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Laki-laki</label>
                              <input
                                type="number"
                                min={0}
                                value={demoJumlahPria || ""}
                                onChange={(e) => setDemoJumlahPria(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Perempuan</label>
                              <input
                                type="number"
                                min={0}
                                value={demoJumlahWanita || ""}
                                onChange={(e) => setDemoJumlahWanita(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Kelompok Usia */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                          <span className="text-xs font-bold text-emerald-900 block">Kelompok Usia Penduduk</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Balita (0-5 Thn)</label>
                              <input
                                type="number"
                                min={0}
                                value={demoBalita || ""}
                                onChange={(e) => setDemoBalita(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Sekolah (6-18 Thn)</label>
                              <input
                                type="number"
                                min={0}
                                value={demoSekolah || ""}
                                onChange={(e) => setDemoSekolah(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Produktif (19-59 Thn)</label>
                              <input
                                type="number"
                                min={0}
                                value={demoProduktif || ""}
                                onChange={(e) => setDemoProduktif(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs font-bold text-emerald-800 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Lansia (60+ Thn)</label>
                              <input
                                type="number"
                                min={0}
                                value={demoLansia || ""}
                                onChange={(e) => setDemoLansia(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4. Mata Pencaharian */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
                          <span className="text-xs font-bold text-amber-900 block">Mata Pencaharian Penduduk</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Petani</label>
                              <input
                                type="number"
                                min={0}
                                value={demoPetani || ""}
                                onChange={(e) => setDemoPetani(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Wiraswasta / Dagang</label>
                              <input
                                type="number"
                                min={0}
                                value={demoWiraswasta || ""}
                                onChange={(e) => setDemoWiraswasta(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Karyawan Swasta</label>
                              <input
                                type="number"
                                min={0}
                                value={demoSwasta || ""}
                                onChange={(e) => setDemoSwasta(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">PNS / TNI / Polri</label>
                              <input
                                type="number"
                                min={0}
                                value={demoPns || ""}
                                onChange={(e) => setDemoPns(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Buruh Harian Lepas</label>
                              <input
                                type="number"
                                min={0}
                                value={demoBuruh || ""}
                                onChange={(e) => setDemoBuruh(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-[#1E251E]/70 mb-1">Lainnya / Tidak Bekerja</label>
                              <input
                                type="number"
                                min={0}
                                value={demoLainnya || ""}
                                onChange={(e) => setDemoLainnya(Number(e.target.value) || 0)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-3 border-t border-[#1E251E]/10 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddDemografiModal(false)}
                            className="px-4 py-2 rounded-xl border border-[#1E251E]/15 text-xs font-bold text-[#1E251E]/70 hover:bg-neutral-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                          >
                            Simpan ke Database
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 3C: KELOLA KEBUDAYAAN PADUKUHAN (KHUSUS PAK DUKUH & ADMIN KKN) */}
          {activeTab === "kebudayaan" && (currentRole === "padukuh" || currentRole === "admin") && (
            <div className="space-y-6">
              {/* Header & Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#1E251E]/10 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#1E251E]">
                      Kelola Kebudayaan & Tradisi Padukuhan Wonosari
                    </h2>
                    <p className="text-xs text-[#1E251E]/60 mt-0.5">
                      Sinkronisasi langsung dengan tabel <code className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[11px] text-neutral-800">agenda_budaya</code> di Supabase. Data kebudayaan ini otomatis tayang pada bagian Kebudayaan di Halaman Destinasi & Wisata.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleOpenAddKebudayaan}
                  className="px-5 py-2.5 rounded-xl bg-[#1E251E] hover:bg-neutral-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <PlusCircle className="w-4 h-4 text-[#9DB368]" />
                  <span>Tambah Kebudayaan Baru</span>
                </button>
              </div>

              {/* Grid Daftar Kebudayaan */}
              {kebudayaanList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[#1E251E]">Belum Ada Agenda / Tradisi Kebudayaan</p>
                  <p className="text-xs text-[#1E251E]/50 max-w-sm mx-auto mt-1 mb-4">
                    Tabel <code className="font-mono">agenda_budaya</code> masih kosong. Tambahkan tradisi seperti Merti Dusun, Kirab Budaya, atau Kesenian Rakyat sekarang.
                  </p>
                  <button
                    onClick={handleOpenAddKebudayaan}
                    className="px-4 py-2 rounded-xl bg-[#1E251E] text-white text-xs font-bold inline-flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 text-[#9DB368]" />
                    <span>Tambah Kebudayaan Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {kebudayaanList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#1E251E]/10 overflow-hidden shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all group"
                    >
                      <div>
                        {/* Foto Cover */}
                        <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                          <img
                            src={item.foto_cover || "/images/backgroundpadukuhan2.jpeg"}
                            alt={item.nama_agenda}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/backgroundpadukuhan2.jpeg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                              {item.kategori || "Tradisi & Adat"}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold">
                              {item.lokasi || "Padukuhan Wonosari"}
                            </span>
                          </div>
                        </div>

                        {/* Konten Judul & Info */}
                        <div className="p-4">
                          <h3 className="text-sm font-extrabold text-[#1E251E] line-clamp-2 leading-snug">
                            {item.nama_agenda}
                          </h3>
                          <p className="text-xs text-[#1E251E]/60 mt-2 line-clamp-3 leading-relaxed">
                            {item.deskripsi || "Tidak ada deskripsi rinci."}
                          </p>
                        </div>
                      </div>

                      {/* Footer Aksi */}
                      <div className="px-4 py-3 bg-neutral-50/60 border-t border-[#1E251E]/5 flex items-center justify-between">
                        <span className="text-[10px] text-[#1E251E]/50 font-medium">
                          Oleh: {item.penanggung_jawab || "Pak Dukuh"}
                        </span>
                        <button
                          onClick={() => handleDeleteKebudayaan(item.id, item.nama_agenda)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Hapus Kebudayaan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Tambah Kebudayaan Baru */}
              <AnimatePresence>
                {showAddKebudayaanModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#1E251E]/10 my-8"
                    >
                      <div className="flex items-center justify-between pb-4 border-b border-[#1E251E]/10 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-[#1E251E]">
                              Tambah Kebudayaan Baru
                            </h3>
                            <p className="text-[11px] text-[#1E251E]/50">
                              Disimpan langsung ke tabel <code className="font-mono">agenda_budaya</code> Supabase
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddKebudayaanModal(false)}
                          className="p-1.5 rounded-lg text-[#1E251E]/50 hover:text-[#1E251E] hover:bg-neutral-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSubmitKebudayaan} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                        {/* Judul Agenda Kebudayaan */}
                        <div>
                          <label className="block text-xs font-bold text-[#1E251E] mb-1">
                            Judul Kebudayaan / Tradisi *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Merti Dusun & Kirab Pusaka Padukuhan Wonosari"
                            value={kebudayaanJudul}
                            onChange={(e) => setKebudayaanJudul(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1E251E]/15 text-xs text-[#1E251E] font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
                          />
                        </div>

                        {/* Kategori & Dusun */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#1E251E] mb-1">
                              Kategori Tradisi *
                            </label>
                            <select
                              value={kebudayaanKategori}
                              onChange={(e) => setKebudayaanKategori(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#1E251E]/15 text-xs font-medium text-[#1E251E] focus:outline-none focus:border-amber-500"
                            >
                              <option value="Tradisi & Adat">Tradisi & Adat</option>
                              <option value="Kesenian Rakyat">Kesenian Rakyat</option>
                              <option value="Upacara Bersih Dusun">Upacara Bersih Dusun</option>
                              <option value="Festival Budaya">Festival Budaya</option>
                              <option value="Kearifan Lokal">Kearifan Lokal</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#1E251E] mb-1">
                              Wilayah Dusun *
                            </label>
                            <select
                              value={kebudayaanDusun}
                              onChange={(e) => setKebudayaanDusun(e.target.value as any)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#1E251E]/15 text-xs font-medium text-[#1E251E] focus:outline-none focus:border-amber-500"
                            >
                              <option value="Wonosari">Dusun Wonosari</option>
                              <option value="Rejosari">Dusun Rejosari</option>
                              <option value="Pajangan">Dusun Pajangan</option>
                              <option value="Seluruh Wilayah">Seluruh Padukuhan</option>
                            </select>
                          </div>
                        </div>

                        {/* Foto Cover */}
                        <div>
                          <label className="block text-xs font-bold text-[#1E251E] mb-1">
                            Foto Dokumentasi / Cover *
                          </label>
                          <div className="space-y-2.5">
                            <label className="border-2 border-dashed border-[#1E251E]/15 hover:border-amber-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-amber-50/20">
                              <Upload className="w-5 h-5 text-amber-600 mb-1" />
                              <span className="text-xs font-bold text-[#1E251E]">Unggah Foto dari Perangkat</span>
                              <span className="text-[10px] text-[#1E251E]/50">Format JPG, PNG, atau WEBP</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleKebudayaanFileChange}
                                className="hidden"
                              />
                            </label>

                            {/* Preview Image */}
                            {(kebudayaanPreviewImage || kebudayaanFotoUrl) && (
                              <div className="relative h-32 rounded-xl overflow-hidden border border-[#1E251E]/10">
                                <img
                                  src={kebudayaanPreviewImage || kebudayaanFotoUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setKebudayaanPreviewImage(null);
                                    setKebudayaanFotoUrl("");
                                  }}
                                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* URL Input Cadangan */}
                            <input
                              type="text"
                              placeholder="Atau tempel URL gambar di sini (opsional)"
                              value={kebudayaanFotoUrl}
                              onChange={(e) => setKebudayaanFotoUrl(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        {/* Deskripsi Kebudayaan */}
                        <div>
                          <label className="block text-xs font-bold text-[#1E251E] mb-1">
                            Deskripsi Tradisi & Makna Budaya
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Ceritakan sejarah, filosofi, makna tradisi, atau rangkaian acara kebudayaan ini..."
                            value={kebudayaanDeskripsi}
                            onChange={(e) => setKebudayaanDeskripsi(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-amber-500 resize-none shadow-2xs"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-3 border-t border-[#1E251E]/10 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddKebudayaanModal(false)}
                            className="px-4 py-2 rounded-xl border border-[#1E251E]/15 text-xs font-bold text-[#1E251E]/70 hover:bg-neutral-50"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingKebudayaan}
                            className="px-5 py-2.5 rounded-xl bg-[#1E251E] hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {isSubmittingKebudayaan ? "Menyimpan..." : "Publikasikan ke Halaman Budaya"}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 4: FORM DESTINASI WISATA */}
          {activeTab === "tambah-wisata" && (
            <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#9DB368]/30 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1E251E]/10">
                <div className="w-10 h-10 rounded-xl bg-[#EBF2DC] text-[#4D6328] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#1E251E]">
                    {currentRole === "padukuh" ? "Tambah Destinasi Wisata Desa (Publikasi Langsung ke Database)" : "Usulkan Spot Destinasi Wisata Desa"}
                  </h2>
                  <p className="text-xs text-[#1E251E]/60">
                    {currentRole === "padukuh"
                      ? "Sebagai Bapak Kepala Dukuh, destinasi yang ditambahkan akan langsung berstatus APPROVED di database dan tayang resmi di halaman publik."
                      : "Setiap spot wisata yang diusulkan akan tersimpan di database dengan status PENDING dan ditinjau terlebih dahulu oleh Pak Dukuh."}
                  </p>
                </div>
              </div>

              {submitWisataError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <div>
                    <strong className="block font-bold">Gagal Menyimpan ke Database:</strong>
                    <span>{submitWisataError}</span>
                  </div>
                </div>
              )}

              {submitWisataSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {currentRole === "padukuh"
                        ? "Berhasil! Destinasi wisata telah tersimpan langsung di database dan tayang resmi ke publik."
                        : "Berhasil! Usulan spot wisata Anda telah masuk ke database antrean moderasi Pak Dukuh."}
                    </span>
                    {currentRole === "kontributor" && (
                      <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                        Catatan: Sebagai Kontributor, Anda tidak memiliki akses ke tab antrean persetujuan. Silakan login sebagai <strong>Pak Dukuh</strong> (<code className="bg-emerald-100/70 px-1 py-0.5 rounded">dukuh.wonosari@wedomartani.desa.id</code>) atau <strong>Admin KKN</strong> untuk melihat & menyetujui (ACC) usulan ini.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitWisata} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Nama Daya Tarik / Spot Wisata *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Spot Sunset Pematang Sawah Hijau"
                      value={wisataNama}
                      onChange={(e) => setWisataNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Kategori Wisata *
                    </label>
                    <select
                      value={wisataKategori}
                      onChange={(e) => setWisataKategori(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] font-medium focus:outline-none focus:border-[#EF6C85]"
                    >
                      <option value="Wisata Alam & Pertanian">Wisata Alam & Pertanian</option>
                      <option value="Wisata Edukasi Lingkungan">Wisata Edukasi Lingkungan (Bank Sampah dsb.)</option>
                      <option value="Wisata Seni & Tradisi">Wisata Seni & Tradisi Budaya (Pendopo/Kenduri)</option>
                      <option value="Wisata Kuliner & Santai">Wisata Kuliner & Santai</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Lokasi Dusun / Kampung *
                    </label>
                    <select
                      value={wisataDusun}
                      onChange={(e) => setWisataDusun(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] font-medium focus:outline-none focus:border-[#EF6C85]"
                    >
                      <option value="Rejosari">Kampung Rejosari (RW 18)</option>
                      <option value="Wonosari">Kampung Wonosari (RW 17)</option>
                      <option value="Pajangan">Kampung Pajangan (RW 16)</option>
                      <option value="Seluruh Wilayah">Gabungan Seluruh Padukuhan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Biaya Masuk / HTM Tiket (0 jika Gratis)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={wisataHtm}
                      onChange={(e) => setWisataHtm(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                    Fasilitas Kunjungan (Pisahkan dengan tanda koma)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pematang Sawah Lebar, Spot Foto Merapi, Udara Sejuk, Parkir Motor"
                    value={wisataFasilitas}
                    onChange={(e) => setWisataFasilitas(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9DB368]" />
                      <span>Link Google Maps Lokasi Wisata (Opsional)</span>
                    </span>
                    <span className="text-[10px] text-[#1E251E]/50 font-normal">Bisa di-klik pengunjung</span>
                  </label>
                  <input
                    type="url"
                    placeholder="Contoh: https://maps.app.goo.gl/... atau https://goo.gl/maps/..."
                    value={wisataGmapsLink}
                    onChange={(e) => setWisataGmapsLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                  />
                  <p className="text-[10px] text-[#1E251E]/50 mt-1">
                    Tautan Google Maps akan aktif di tombol "Buka Rute di Google Maps" pada kartu wisata sehingga pengunjung langsung diarahkan ke lokasi.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                    Deskripsi Keunggulan Spot *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ceritakan daya tarik utama, pemandangan, rute akses, dan keramahan warga sekitar..."
                    value={wisataDeskripsi}
                    onChange={(e) => setWisataDeskripsi(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85] leading-relaxed"
                  />
                </div>

                {/* Upload Foto Galeri */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                    Unggah Foto Spot Wisata dari Berkas / Galeri Perangkat *
                  </label>
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border-2 border-dashed border-[#9DB368]/40 hover:border-[#9DB368] transition-colors flex flex-col items-center justify-center text-center relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWisataFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {wisataPreviewImage || wisataFotoUrl ? (
                      <div className="flex flex-col items-center">
                        <div className="w-40 h-28 rounded-xl overflow-hidden mb-2 border border-[#1E251E]/10 shadow-xs">
                          <img src={wisataPreviewImage || wisataFotoUrl} alt="Preview Spot" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-bold text-[#4D6328]">Foto Terpilih (Klik untuk mengganti)</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#9DB368] mb-2" />
                        <span className="text-xs font-bold text-[#1E251E]">Pilih foto dari Galeri HP / Komputer</span>
                        <span className="text-[10px] text-[#1E251E]/50 mt-0.5">Format JPG, PNG, atau WebP</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9DB368] to-[#4D6328] text-white font-extrabold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {currentRole === "padukuh"
                      ? "Terbitkan Wisata Langsung ke Database (Akses Kepala Dukuh)"
                      : currentRole === "admin"
                      ? "Terbitkan Wisata Langsung ke Database (Akses Admin KKN)"
                      : "Kirimkan Usulan Wisata ke Database (Menunggu ACC Pak Dukuh)"}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: FORM PRODUK UMKM */}
          {activeTab === "tambah-umkm" && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#EF6C85]/30 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1E251E]/10">
                <div className="w-10 h-10 rounded-xl bg-[#FCE8EC] text-[#D64E68] flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#1E251E]">
                    {currentRole === "padukuh" ? "Tambah Produk UMKM Warga (Publikasi Langsung ke Database)" : "Formulir Usulan Produk UMKM Warga"}
                  </h2>
                  <p className="text-xs text-[#1E251E]/60">
                    {currentRole === "padukuh"
                      ? "Sebagai Kepala Dukuh, produk UMKM warga yang ditambahkan akan langsung berstatus APPROVED di database dan tampil di katalog publik."
                      : "Produk warga yang diusulkan akan tersimpan di database dengan status PENDING sebelum disetujui Pak Dukuh."}
                  </p>
                </div>
              </div>

              {submitUmkmError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <div>
                    <strong className="block font-bold">Gagal Menyimpan ke Database:</strong>
                    <span>{submitUmkmError}</span>
                  </div>
                </div>
              )}

              {submitUmkmSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {currentRole === "padukuh"
                        ? "Berhasil! Produk UMKM telah tersimpan langsung di database dan tayang resmi ke publik."
                        : "Berhasil! Usulan produk UMKM telah masuk ke database antrean moderasi Pak Dukuh."}
                    </span>
                    {currentRole === "kontributor" && (
                      <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                        Catatan: Sebagai Kontributor, Anda tidak memiliki akses ke tab antrean persetujuan. Silakan login sebagai <strong>Pak Dukuh</strong> (<code className="bg-emerald-100/70 px-1 py-0.5 rounded">dukuh.wonosari@wedomartani.desa.id</code>) atau <strong>Admin KKN</strong> untuk melihat & menyetujui (ACC) usulan ini.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitUMKM} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Peyek Kacang Daun Jeruk"
                      value={umkmNamaProduk}
                      onChange={(e) => setUmkmNamaProduk(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Nama Usaha / Merek
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Peyek Berkah Bu Siti"
                      value={umkmNamaUsaha}
                      onChange={(e) => setUmkmNamaUsaha(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Nama Pemilik Usaha *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Siti"
                      value={umkmNamaPemilik}
                      onChange={(e) => setUmkmNamaPemilik(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Asal Dusun / Kampung *
                    </label>
                    <select
                      value={umkmDusun}
                      onChange={(e) => setUmkmDusun(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] font-medium focus:outline-none focus:border-[#EF6C85]"
                    >
                      <option value="Rejosari">Kampung Rejosari (RW 18)</option>
                      <option value="Wonosari">Kampung Wonosari (RW 17)</option>
                      <option value="Pajangan">Kampung Pajangan (RW 16)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Kategori Produk *
                    </label>
                    <select
                      value={umkmKategori}
                      onChange={(e) => setUmkmKategori(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] font-medium focus:outline-none focus:border-[#EF6C85]"
                    >
                      <option value="Olahan Pangan & Keripik">Olahan Pangan & Keripik</option>
                      <option value="Kuliner Tradisional">Kuliner Tradisional</option>
                      <option value="Pertanian & Bibit">Pertanian & Bibit</option>
                      <option value="Kerajinan Tangan">Kerajinan Tangan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="15000"
                      value={umkmHarga}
                      onChange={(e) => setUmkmHarga(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Satuan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Bungkus 250gr"
                      value={umkmSatuan}
                      onChange={(e) => setUmkmSatuan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                    Nomor WhatsApp Pemilik (Untuk Pemesanan) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 6281234567890"
                    value={umkmWhatsApp}
                    onChange={(e) => setUmkmWhatsApp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#EF6C85]" />
                      <span>Link Google Maps Lokasi Usaha (Opsional)</span>
                    </span>
                    <span className="text-[10px] text-[#1E251E]/50 font-normal">Bisa di-klik pembeli</span>
                  </label>
                  <input
                    type="url"
                    placeholder="Contoh: https://maps.app.goo.gl/... atau https://goo.gl/maps/..."
                    value={umkmGmapsLink}
                    onChange={(e) => setUmkmGmapsLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                  />
                  <p className="text-[10px] text-[#1E251E]/50 mt-1">
                    Tautan Google Maps akan muncul di kartu produk UMKM agar pembeli dapat langsung membuka petunjuk arah/rute ke rumah/tempat usaha.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                    Deskripsi Singkat Produk *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Jelaskan keunikan rasa, bahan baku lokal, atau keunggulan produk..."
                    value={umkmDeskripsi}
                    onChange={(e) => setUmkmDeskripsi(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85] leading-relaxed"
                  />
                </div>

                {/* Upload Foto Galeri */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                    Unggah Foto Produk Asli dari Berkas / Galeri Perangkat *
                  </label>
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border-2 border-dashed border-[#EF6C85]/40 hover:border-[#EF6C85] transition-colors flex flex-col items-center justify-center text-center relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {adminPreviewImage || umkmFotoUrl ? (
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-24 rounded-xl overflow-hidden mb-2 border border-[#1E251E]/10 shadow-xs">
                          <img src={adminPreviewImage || umkmFotoUrl} alt="Preview Produk" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-bold text-[#D64E68]">Foto Terpilih (Klik untuk mengganti)</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#EF6C85] mb-2" />
                        <span className="text-xs font-bold text-[#1E251E]">Pilih foto dari Galeri HP / Komputer</span>
                        <span className="text-[10px] text-[#1E251E]/50 mt-0.5">Format JPG, PNG, atau WebP</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#EF6C85] to-[#D64E68] text-white font-extrabold text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {currentRole === "padukuh"
                      ? "Terbitkan Produk Langsung ke Database (Akses Kepala Dukuh)"
                      : currentRole === "admin"
                      ? "Terbitkan Produk Langsung ke Database (Akses Admin KKN)"
                      : "Kirimkan Usulan Produk ke Database (Menunggu ACC Pak Dukuh)"}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: FORM WARTA BERITA */}
          {activeTab === "tulis" && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-sky-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1E251E]/10">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E251E]">
                    {currentRole === "padukuh" ? "Tambah Warta Berita Desa (Publikasi Langsung ke Database)" : "Formulir Usulan Kabar Desa"}
                  </h2>
                  <p className="text-xs text-[#1E251E]/60">
                    {currentRole === "padukuh"
                      ? "Sebagai Kepala Dukuh, kabar berita yang ditulis akan langsung berstatus APPROVED di database dan tampil di halaman publik."
                      : "Tulisan Anda akan tersimpan di database berstatus PENDING dan ditinjau oleh Pak Dukuh sebelum tayang ke publik."}
                  </p>
                </div>
              </div>

              {submitArticleSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                  <span>
                    {currentRole === "padukuh"
                      ? "Berhasil! Warta berita telah tersimpan langsung di database dan tayang ke publik."
                      : "Berhasil! Usulan warta Anda telah tersimpan di database antrean moderasi Pak Dukuh."}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmitArtikel} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                    Judul Kabar / Kegiatan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kerja Bakti Pembersihan Lingkungan RT 04 Rejosari"
                    value={judulArtikel}
                    onChange={(e) => setJudulArtikel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Kategori Warta *
                    </label>
                    <select
                      value={kategoriArtikel}
                      onChange={(e) => setKategoriArtikel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] font-medium focus:outline-none focus:border-[#EF6C85]"
                    >
                      <option value="Kabar Desa">Kabar Desa</option>
                      <option value="Kegiatan KKN">Kegiatan KKN UII 57</option>
                      <option value="Kesehatan & Posyandu">Kesehatan & Posyandu</option>
                      <option value="Pertanian & UMKM">Pertanian & UMKM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Nama Penulis / Lembaga Pengirim *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Karang Taruna Wonosari / Ibu Kader"
                      value={penulis}
                      onChange={(e) => setPenulis(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                    Isi Narasi Warta Lengkap *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Ceritakan detail kegiatan, waktu pelaksanaan, hasil kegiatan, dan manfaatnya bagi warga sekitar..."
                    value={isiArtikel}
                    onChange={(e) => setIsiArtikel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85] leading-relaxed"
                  />
                </div>

                {/* Upload Foto Dokumentasi Berita (Lebih Dari 1 Foto) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#1E251E]">
                      Dokumentasi Foto Warta (Bisa Lebih Dari 1 Foto) *
                    </label>
                    <span className="text-[11px] font-semibold text-sky-700">
                      {artikelFotoList.length} Foto Terpilih
                    </span>
                  </div>

                  {/* Dropzone Upload Multiple */}
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border-2 border-dashed border-sky-300 hover:border-sky-500 transition-colors flex flex-col items-center justify-center text-center relative cursor-pointer mb-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleArtikelFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-8 h-8 text-sky-500 mb-2" />
                    <span className="text-xs font-bold text-[#1E251E]">
                      {isUploadingArtikel ? "Sedang memproses & mengunggah foto..." : "Pilih Satu atau Beberapa Foto Sekaligus dari Perangkat"}
                    </span>
                    <span className="text-[10px] text-[#1E251E]/60 mt-0.5">
                      Dapat memilih lebih dari 1 foto (Format JPG, PNG, WebP) • Klik lagi untuk menambah foto lain
                    </span>
                  </div>

                  {/* Input URL Foto Tambahan */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar online di sini..."
                      value={artikelUrlInput}
                      onChange={(e) => setArtikelUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddArtikelUrl();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddArtikelUrl}
                      className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors shrink-0"
                    >
                      + Tambah URL
                    </button>
                  </div>

                  {/* Galeri Preview Foto-foto Terpilih */}
                  {artikelFotoList.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-[#1E251E]/60">
                        Foto yang akan terbit (Foto pertama menjadi Sampul Utama):
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {artikelFotoList.map((foto, idx) => (
                          <div
                            key={idx}
                            className={`relative rounded-xl overflow-hidden border-2 bg-neutral-100 shadow-2xs group flex flex-col justify-between ${
                              idx === 0 ? "border-sky-600 ring-2 ring-sky-300/50" : "border-[#1E251E]/10"
                            }`}
                          >
                            <div className="h-24 w-full relative overflow-hidden">
                              <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                              {idx === 0 && (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-sky-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                                  ★ Sampul Utama
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveArtikelFoto(idx)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
                                title="Hapus foto ini"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="p-1.5 bg-white flex items-center justify-between gap-1 text-[10px]">
                              <span className="font-semibold text-[#1E251E]/70 truncate">Foto {idx + 1}</span>
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverArtikel(idx)}
                                  className="text-sky-600 font-bold hover:underline shrink-0 text-[10px]"
                                >
                                  Jadikan Sampul
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#1E251E] hover:bg-neutral-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#EF6C85]" />
                  <span>
                    {currentRole === "padukuh"
                      ? "Terbitkan Warta Langsung ke Database (Akses Kepala Dukuh)"
                      : currentRole === "admin"
                      ? "Terbitkan Warta Langsung ke Database (Akses Admin KKN)"
                      : "Kirim Usulan Warta ke Database (Menunggu ACC Pak Dukuh)"}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: MASTER DATA (KHUSUS ADMIN KKN - AKSES PENUH) */}
          {activeTab === "master" && currentRole === "admin" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#EBF2DC] text-[#4D6328] flex items-center justify-center mb-4">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1E251E] mb-1">Katalog UMKM</h3>
                <p className="text-xs text-[#1E251E]/60 mb-4">
                  Data produk langsung dari database Supabase PostgreSQL.
                </p>
                <Link
                  href="/umkm"
                  className="text-xs font-bold text-[#EF6C85] flex items-center gap-1 hover:underline"
                >
                  <span>Buka Halaman UMKM</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FCE8EC] text-[#EF6C85] flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1E251E] mb-1">Monografi Demografi</h3>
                <p className="text-xs text-[#1E251E]/60 mb-3">
                  Data kependudukan 5 RT dari tabel demografi_wilayah di Supabase.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab("demografi")}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline text-left cursor-pointer"
                  >
                    <span>Kelola & Edit Data RT (CRUD)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/monografis"
                    className="text-xs font-semibold text-[#1E251E]/60 flex items-center gap-1 hover:underline"
                  >
                    <span>Lihat Halaman Publik Monografi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] text-[#1E251E] flex items-center justify-center mb-4 border border-[#1E251E]/10">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1E251E] mb-1">Profil & SOTK Desa</h3>
                <p className="text-xs text-[#1E251E]/60 mb-4">
                  Struktur aparatur padukuhan dari tabel aparatur_desa di Supabase.
                </p>
                <Link
                  href="/profil-desa"
                  className="text-xs font-bold text-[#EF6C85] flex items-center gap-1 hover:underline"
                >
                  <span>Buka Profil Padukuhan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
