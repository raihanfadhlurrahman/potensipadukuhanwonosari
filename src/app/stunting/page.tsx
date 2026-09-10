"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  HeartPulse,
  ChevronRight,
  Home,
  Calculator,
  Calendar,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Baby,
  User,
  MapPin,
  Clock,
  ArrowRight,
  Info,
  Apple,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PosyanduSchedule {
  id: string | number;
  nama_posyandu: string;
  dusun: string;
  rw: string;
  lokasi_kegiatan: string;
  jadwal_rutin: string;
  keterangan: string;
}

interface KaderItem {
  id: string | number;
  nama_lengkap: string;
  peran: string;
  wilayah: string;
  whatsapp_number: string;
}

const DEFAULT_SCHEDULES: PosyanduSchedule[] = [
  {
    id: "pos-1",
    nama_posyandu: "Posyandu Balita Dahlia",
    dusun: "Rejosari",
    rw: "RW 18",
    lokasi_kegiatan: "Balai Warga RT 04 Rejosari",
    jadwal_rutin: "Setiap Tanggal 10, Pukul 08.30 WIB",
    keterangan: "Penimbangan balita, pemantauan status stunting, PMT gizi lokal, & penyuluhan MP-ASI.",
  },
  {
    id: "pos-2",
    nama_posyandu: "Posyandu Balita Melati",
    dusun: "Wonosari",
    rw: "RW 17",
    lokasi_kegiatan: "Balai RW 17 / Rumah Ibu Dukuh",
    jadwal_rutin: "Setiap Tanggal 15, Pukul 09.00 WIB",
    keterangan: "Skrining tumbuh kembang, imunisasi dasar lengkap, pembagian vitamin A, & edukasi gizi.",
  },
  {
    id: "pos-3",
    nama_posyandu: "Posyandu Balita Kenanga",
    dusun: "Pajangan",
    rw: "RW 16",
    lokasi_kegiatan: "Balai Pertemuan RT 01 Pajangan",
    jadwal_rutin: "Setiap Tanggal 20, Pukul 08.30 WIB",
    keterangan: "Layanan penimbangan balita rutin, konsultasi ibu hamil, dan pemeriksaan tensi lansia.",
  },
];

const DEFAULT_KADERS: KaderItem[] = [
  {
    id: "kader-1",
    nama_lengkap: "Bidan Desa Pembina Wedomartani",
    peran: "Bidan Pembina Wilayah Wonosari",
    wilayah: "Seluruh Wilayah",
    whatsapp_number: "6281234567900",
  },
  {
    id: "kader-2",
    nama_lengkap: "Ibu Ketua Kader Posyandu Rejosari",
    peran: "Kader Pembangunan Manusia (KPM)",
    wilayah: "Kampung Rejosari (RW 18)",
    whatsapp_number: "6281234567901",
  },
  {
    id: "kader-3",
    nama_lengkap: "Ibu Kader Posyandu Wonosari",
    peran: "Koordinator Gizi & Balita",
    wilayah: "Kampung Wonosari (RW 17)",
    whatsapp_number: "6281234567902",
  },
  {
    id: "kader-4",
    nama_lengkap: "Ibu Kader Posyandu Pajangan",
    peran: "Koordinator Kesehatan Balita",
    wilayah: "Kampung Pajangan (RW 16)",
    whatsapp_number: "6281234567903",
  },
];

const PMT_RECIPES = [
  {
    title: "Bubur Sup Kelor & Telur Puyuh",
    benefit: "Kaya zat besi, kalsium, dan protein hewani mudah cerna untuk mencegah anemia balita.",
    ingredients: "Daun kelor muda lokal, 3 butir telur puyuh, kaldu ayam kampung, nasi lembek.",
  },
  {
    title: "Nugget Ikan Lele Sayur Wortel",
    benefit: "Asam lemak Omega-3 dan fosfor tinggi untuk stimulasi sel otak dan pertumbuhan tulang.",
    ingredients: "Fillet lele kolam sawah Wonosari, parutan wortel manis, telur, sedikit tepung jagung.",
  },
  {
    title: "Puding Pisang Kepok & Susu",
    benefit: "Kalium dan energi sehat ramah lambung balita sebagai camilan selingan padat gizi.",
    ingredients: "Pisang kepok matang pohon pekarangan, susu cair hangat, agar-agar plain tanpa pemanis buatan.",
  },
];

export default function StuntingPage() {
  // Form states
  const [namaAnak, setNamaAnak] = useState("");
  const [namaOrtu, setNamaOrtu] = useState("");
  const [dusun, setDusun] = useState<"Rejosari" | "Wonosari" | "Pajangan">("Wonosari");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [usiaBulan, setUsiaBulan] = useState<number | "">("");
  const [tinggiBadan, setTinggiBadan] = useState<number | "">("");
  const [beratBadan, setBeratBadan] = useState<number | "">("");

  // Result state
  const [result, setResult] = useState<{
    zScoreTB: number;
    zScoreBB: number;
    status: "Normal" | "Pendek (Stunting)" | "Gizi Buruk / Sangat Pendek" | "Tinggi / Gizi Lebih";
    color: string;
    advice: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Jadwal & Kader states
  const [schedules, setSchedules] = useState<PosyanduSchedule[]>(DEFAULT_SCHEDULES);
  const [kaders, setKaders] = useState<KaderItem[]>(DEFAULT_KADERS);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: posData } = await supabase.from("jadwal_posyandu").select("*");
        if (posData && posData.length > 0) setSchedules(posData);

        const { data: kaderData } = await supabase.from("kader_kesehatan").select("*");
        if (kaderData && kaderData.length > 0) setKaders(kaderData);
      } catch (err) {
        console.warn("Posyandu data fetch notice:", err);
      }
    }
    loadData();
  }, []);

  const calculateZScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usiaBulan || !tinggiBadan || !beratBadan) return;

    const u = Number(usiaBulan);
    const tb = Number(tinggiBadan);
    const bb = Number(beratBadan);

    // Standar WHO sederhana (aproksimasi TB ideal)
    // Laki-laki: TB ~ 50 + (u * 1.35) cm
    // Perempuan: TB ~ 49 + (u * 1.32) cm
    const medianTB = gender === "L" ? 50 + u * 1.35 : 49 + u * 1.32;
    const sdTB = 3.5; // Standar deviasi perkiraan
    const zTB = parseFloat(((tb - medianTB) / sdTB).toFixed(2));

    // Estimasi BB ideal: ~ 3.3 + (u * 0.45) kg
    const medianBB = gender === "L" ? 3.3 + u * 0.48 : 3.2 + u * 0.45;
    const sdBB = 1.2;
    const zBB = parseFloat(((bb - medianBB) / sdBB).toFixed(2));

    let status: "Normal" | "Pendek (Stunting)" | "Gizi Buruk / Sangat Pendek" | "Tinggi / Gizi Lebih" = "Normal";
    let color = "text-emerald-700 bg-emerald-50 border-emerald-200";
    let advice = "Pertumbuhan anak berada dalam batas normal dan ideal. Pertahankan asupan gizi seimbang serta rutin kunjungi Posyandu tiap bulan.";

    if (zTB < -3) {
      status = "Gizi Buruk / Sangat Pendek";
      color = "text-red-700 bg-red-50 border-red-200";
      advice = "Tinggi badan anak berada jauh di bawah kurva standar WHO. Sangat disarankan segera berkonsultasi langsung dengan Bidan Desa / Puskesmas Ngemplak untuk intervensi gizi intensif.";
    } else if (zTB < -2) {
      status = "Pendek (Stunting)";
      color = "text-amber-800 bg-amber-50 border-amber-200";
      advice = "Anak terindikasi mengalami perlambatan pertumbuhan tinggi badan (indikasi stunting ringan). Tingkatkan konsumsi protein hewani (telur, ikan, ayam) serta sanitasi lingkungan.";
    } else if (zTB > 2) {
      status = "Tinggi / Gizi Lebih";
      color = "text-blue-700 bg-blue-50 border-blue-200";
      advice = "Tinggi dan pertumbuhan fisik anak berada di atas rata-rata kelompok usianya. Tetap jaga pola makan aktif dan sehat.";
    }

    const calcResult = { zScoreTB: zTB, zScoreBB: zBB, status, color, advice };
    setResult(calcResult);

    // Simpan ke Supabase stunting_records
    try {
      setSaving(true);
      await supabase.from("stunting_records").insert({
        nama_anak_inisial: namaAnak || "Balita Anonim",
        nama_orang_tua: namaOrtu || "-",
        dusun,
        jenis_kelamin: gender,
        usia_bulan: u,
        tinggi_cm: tb,
        berat_kg: bb,
        z_score_tb_u: zTB,
        z_score_bb_u: zBB,
        status_gizi: status,
        catatan_rekomendasi: advice,
      });
      setSavedSuccess(true);
    } catch (err) {
      console.warn("Simpan riwayat skrining info:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1E251E] pb-20">
      {/* 1. Hero Header */}
      <section className="relative py-6 sm:py-8 overflow-hidden border-b border-[#EF6C85]/15 bg-gradient-to-b from-[#FCE8EC]/40 via-[#FAF6F0] to-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#1E251E]/60 mb-3">
            <Link href="/" className="hover:text-[#EF6C85] transition-colors flex items-center gap-1 font-medium">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#EF6C85] font-semibold">Pencegahan Stunting & Posyandu</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8EC] text-[#D64E68] text-xs font-bold mb-2.5 shadow-xs">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Program Unggulan KKN UII Angkatan 73 Unit 57</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1E251E] tracking-tight leading-tight mb-3">
              Kalkulator Gizi & Deteksi Dini{" "}
              <span className="gradient-text-coral">Stunting Balita</span>
            </h1>
            <p className="text-sm sm:text-base text-[#1E251E]/70 leading-relaxed">
              Mewujudkan generasi emas Padukuhan Wonosari yang sehat, cerdas, dan bebas stunting melalui pemantauan tumbuh kembang mandiri, jadwal Posyandu teratur, dan rujukan cepat ke Bidan Desa.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Grid Interaktif: Kalkulator + Hasil */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Kalkulator Antropometri */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EF6C85]/20 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1E251E]/10">
                <div className="w-10 h-10 rounded-xl bg-[#FCE8EC] text-[#EF6C85] flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E251E]">Kalkulator Antropometri WHO</h2>
                  <p className="text-xs text-[#1E251E]/60">Masukkan data fisik balita untuk mengetahui estimasi Z-Score TB/U.</p>
                </div>
              </div>

              <form onSubmit={calculateZScore} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Nama Inisial Anak (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ananda R."
                      value={namaAnak}
                      onChange={(e) => setNamaAnak(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Nama Orang Tua (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ibu Siti"
                      value={namaOrtu}
                      onChange={(e) => setNamaOrtu(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Asal Kampung Balita
                    </label>
                    <select
                      value={dusun}
                      onChange={(e) => setDusun(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] font-medium focus:outline-none focus:border-[#EF6C85]"
                    >
                      <option value="Rejosari">Kampung Rejosari (RW 18)</option>
                      <option value="Wonosari">Kampung Wonosari (RW 17)</option>
                      <option value="Pajangan">Kampung Pajangan (RW 16)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Jenis Kelamin
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender("L")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          gender === "L"
                            ? "bg-[#1E251E] text-white border-[#1E251E]"
                            : "bg-[#FAF6F0] text-[#1E251E]/70 border-[#1E251E]/10 hover:bg-neutral-100"
                        }`}
                      >
                        👦 Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("P")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          gender === "P"
                            ? "bg-[#EF6C85] text-white border-[#EF6C85]"
                            : "bg-[#FAF6F0] text-[#1E251E]/70 border-[#1E251E]/10 hover:bg-neutral-100"
                        }`}
                      >
                        👧 Perempuan
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Usia (Bulan) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      required
                      placeholder="0 - 60 bln"
                      value={usiaBulan}
                      onChange={(e) => setUsiaBulan(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Tinggi (cm) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="35"
                      max="130"
                      required
                      placeholder="misal: 75.5"
                      value={tinggiBadan}
                      onChange={(e) => setTinggiBadan(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Berat (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="2"
                      max="35"
                      required
                      placeholder="misal: 9.8"
                      value={beratBadan}
                      onChange={(e) => setBeratBadan(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/10 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#EF6C85] to-[#D64E68] text-white font-extrabold text-sm shadow-md hover:brightness-105 transition-all mt-2 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Hitung Status Tumbuh Kembang</span>
                </button>
              </form>
            </div>

            {/* Panel Hasil Perhitungan */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result-box"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-3xl border p-6 shadow-sm ${result.color}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/80 border border-current">
                        Hasil Analisis Gizi
                      </span>
                      {result.status === "Normal" ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      )}
                    </div>

                    <h3 className="text-xl font-black mb-1">{result.status}</h3>
                    <p className="text-xs opacity-80 mb-4">
                      Z-Score TB/U: <strong>{result.zScoreTB} SD</strong> • Z-Score BB/U: <strong>{result.zScoreBB} SD</strong>
                    </p>

                    <div className="bg-white/90 rounded-2xl p-4 text-xs leading-relaxed text-[#1E251E] shadow-2xs mb-4">
                      <div className="font-bold mb-1 flex items-center gap-1.5 text-neutral-800">
                        <Info className="w-4 h-4 text-[#EF6C85]" /> Rekomendasi Kader & Bidan:
                      </div>
                      {result.advice}
                    </div>

                    <a
                      href={`https://wa.me/6281234567900?text=Halo%20Ibu%20Bidan%20Desa,%20saya%20warga%20Padukuhan%20Wonosari%20ingin%20konsultasi%20gizi%20balita.%20Hasil%20kalkulator%20stunting:%20Usia%20${usiaBulan}%20bln,%20TB%20${tinggiBadan}cm,%20BB%20${beratBadan}kg,%20Status:%20${result.status}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Konsultasi Langsung ke WhatsApp Bidan</span>
                    </a>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-8 text-center shadow-sm">
                    <Baby className="w-12 h-12 text-[#EF6C85]/40 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-[#1E251E] mb-2">Belum Ada Perhitungan</h3>
                    <p className="text-xs text-[#1E251E]/60 leading-relaxed">
                      Silakan isi formulir di samping dengan usia, tinggi badan, dan berat badan balita untuk melihat hasil skrining gizi dan rekomendasi gizi lokal.
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {/* Box Rujukan Kontak Bidan & Kader */}
              <div className="bg-white rounded-3xl border border-[#EF6C85]/20 p-6 shadow-xs">
                <h3 className="text-sm font-extrabold text-[#1E251E] mb-3 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#EF6C85]" />
                  Kontak Bidan Desa & Kader Posyandu
                </h3>
                <div className="space-y-2.5">
                  {kaders.map((kader) => (
                    <div
                      key={kader.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF6F0] border border-[#1E251E]/5 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#1E251E]">{kader.nama_lengkap}</div>
                        <div className="text-[10px] text-[#1E251E]/60">{kader.peran} • {kader.wilayah}</div>
                      </div>
                      <a
                        href={`https://wa.me/${kader.whatsapp_number}?text=Halo%20${kader.nama_lengkap},%20saya%20warga%20Wonosari%20ingin%20berkonsultasi%20mengenai%20kesehatan%20dan%20posyandu.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1"
                      >
                        <PhoneCall className="w-2.5 h-2.5" />
                        Chat WA
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Jadwal Rutin Posyandu per RW */}
      <section className="py-10 border-t border-[#EF6C85]/10 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2DC] text-[#4D6328] text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Kalender Pelayanan Terpadu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E251E]">Jadwal Posyandu Tiap Bulan</h2>
            <p className="text-xs text-[#1E251E]/65 mt-1">
              Jangan lewatkan penimbangan rutin untuk memantau grafik tumbuh kembang anak Anda di balai warga terdekat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schedules.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#EF6C85]/20 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#FCE8EC] text-[#D64E68] text-[10px] font-bold">
                      {item.rw}
                    </span>
                    <span className="text-[10px] text-[#1E251E]/50 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#9DB368]" />
                      {item.dusun}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#1E251E] mb-2">{item.nama_posyandu}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#EF6C85] mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.jadwal_rutin}</span>
                  </div>
                  <p className="text-xs text-[#1E251E]/60 mb-2">
                    <strong>Lokasi:</strong> {item.lokasi_kegiatan}
                  </p>
                  <p className="text-xs text-[#1E251E]/70 leading-relaxed">{item.keterangan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Rekomendasi Menu PMT Lokal */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCE8EC] text-[#D64E68] text-xs font-bold mb-2">
              <Apple className="w-3.5 h-3.5" />
              <span>Gizi Berbasis Pangan Lokal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E251E]">Menu Sehat Rekomendasi PMT</h2>
            <p className="text-xs text-[#1E251E]/65 mt-1">
              Bahan pangan bergizi tinggi yang mudah didapatkan dari kebun dan peternakan warga Padukuhan Wonosari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PMT_RECIPES.map((recipe, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-[#9DB368]/30 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-extrabold text-[#1E251E] mb-2">{recipe.title}</h3>
                  <p className="text-xs text-[#1E251E]/75 leading-relaxed mb-4">{recipe.benefit}</p>
                </div>
                <div className="pt-3 border-t border-[#1E251E]/5 text-xs text-[#1E251E]/60">
                  <strong className="text-[#1E251E]">Bahan:</strong> {recipe.ingredients}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
