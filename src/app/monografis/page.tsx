"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Home,
  Users,
  Building,
  Briefcase,
  Layers,
  MapPin,
  TrendingUp,
  Landmark,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RTDemografi {
  id: string | number;
  dusun: string;
  rw: string;
  rt: string;
  nama_ketua_rt: string;
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
}

const DEFAULT_DEMOGRAFI: RTDemografi[] = [
  {
    id: "rt-01",
    dusun: "Pajangan",
    rw: "RW 16",
    rt: "RT 01",
    nama_ketua_rt: "Ketua RT 01 Pajangan",
    jumlah_kk: 41,
    jumlah_jiwa: 143,
    jumlah_pria: 70,
    jumlah_wanita: 73,
    balita_0_5: 11,
    usia_sekolah_6_18: 31,
    usia_produktif_19_59: 86,
    lansia_60_plus: 15,
    petani: 26,
    wiraswasta_pedagang: 16,
    karyawan_swasta: 28,
    pns_tni_polri: 5,
    buruh_harian: 15,
    lainnya: 9,
  },
  {
    id: "rt-02",
    dusun: "Wonosari",
    rw: "RW 17",
    rt: "RT 02",
    nama_ketua_rt: "Ketua RT 02 Wonosari",
    jumlah_kk: 46,
    jumlah_jiwa: 162,
    jumlah_pria: 80,
    jumlah_wanita: 82,
    balita_0_5: 14,
    usia_sekolah_6_18: 38,
    usia_produktif_19_59: 94,
    lansia_60_plus: 16,
    petani: 20,
    wiraswasta_pedagang: 24,
    karyawan_swasta: 38,
    pns_tni_polri: 10,
    buruh_harian: 8,
    lainnya: 12,
  },
  {
    id: "rt-03",
    dusun: "Wonosari",
    rw: "RW 17",
    rt: "RT 03",
    nama_ketua_rt: "Ketua RT 03 Wonosari",
    jumlah_kk: 44,
    jumlah_jiwa: 155,
    jumlah_pria: 76,
    jumlah_wanita: 79,
    balita_0_5: 13,
    usia_sekolah_6_18: 35,
    usia_produktif_19_59: 91,
    lansia_60_plus: 16,
    petani: 18,
    wiraswasta_pedagang: 22,
    karyawan_swasta: 36,
    pns_tni_polri: 12,
    buruh_harian: 10,
    lainnya: 11,
  },
  {
    id: "rt-04",
    dusun: "Rejosari",
    rw: "RW 18",
    rt: "RT 04",
    nama_ketua_rt: "Ketua RT 04 Rejosari",
    jumlah_kk: 42,
    jumlah_jiwa: 148,
    jumlah_pria: 73,
    jumlah_wanita: 75,
    balita_0_5: 12,
    usia_sekolah_6_18: 34,
    usia_produktif_19_59: 88,
    lansia_60_plus: 14,
    petani: 25,
    wiraswasta_pedagang: 18,
    karyawan_swasta: 32,
    pns_tni_polri: 8,
    buruh_harian: 12,
    lainnya: 10,
  },
  {
    id: "rt-05",
    dusun: "Rejosari",
    rw: "RW 18",
    rt: "RT 05",
    nama_ketua_rt: "Ketua RT 05 Rejosari",
    jumlah_kk: 39,
    jumlah_jiwa: 136,
    jumlah_pria: 67,
    jumlah_wanita: 69,
    balita_0_5: 10,
    usia_sekolah_6_18: 28,
    usia_produktif_19_59: 82,
    lansia_60_plus: 16,
    petani: 22,
    wiraswasta_pedagang: 15,
    karyawan_swasta: 30,
    pns_tni_polri: 6,
    buruh_harian: 14,
    lainnya: 8,
  },
];

export interface SaranaPrasaranaItem {
  id?: string;
  nama?: string;
  nama_sarana?: string;
  kategori: string;
  lokasi?: string;
  lokasi_dusun?: string;
  kondisi: string;
  deskripsi?: string;
  foto_url?: string;
  gmaps_url?: string;
}

export default function MonografisPage() {
  const [dataRT, setDataRT] = useState<RTDemografi[]>(DEFAULT_DEMOGRAFI);
  const [saranaList, setSaranaList] = useState<SaranaPrasaranaItem[]>([]);
  const [isLoadingSarana, setIsLoadingSarana] = useState(true);
  const [activeDusunFilter, setActiveDusunFilter] = useState("Semua");

  useEffect(() => {
    async function loadData() {
      // 1. Muat Demografi RT
      try {
        const { data } = await supabase.from("demografi_wilayah").select("*").order("rt", { ascending: true });
        if (data && data.length > 0) {
          setDataRT(data);
        }
      } catch (err) {
        console.warn("Demografi fetch notice:", err);
      }

      // 2. Muat Sarana & Prasarana 100% dari Supabase
      try {
        setIsLoadingSarana(true);
        const { data: prasaranaData, error: prasaranaErr } = await supabase
          .from("sarana_prasarana")
          .select("*")
          .order("created_at", { ascending: false });

        if (!prasaranaErr && prasaranaData) {
          setSaranaList(prasaranaData);
        } else {
          setSaranaList([]);
        }
      } catch (err) {
        console.warn("Sarana prasarana fetch notice:", err);
        setSaranaList([]);
      } finally {
        setIsLoadingSarana(false);
      }
    }
    loadData();
  }, []);

  // Agregat perhitungan statistik
  const totals = useMemo(() => {
    return dataRT.reduce(
      (acc, curr) => {
        acc.kk += curr.jumlah_kk;
        acc.jiwa += curr.jumlah_jiwa;
        acc.pria += curr.jumlah_pria;
        acc.wanita += curr.jumlah_wanita;
        acc.balita += curr.balita_0_5;
        acc.pelajar += curr.usia_sekolah_6_18;
        acc.produktif += curr.usia_produktif_19_59;
        acc.lansia += curr.lansia_60_plus;
        acc.petani += curr.petani;
        acc.wiraswasta += curr.wiraswasta_pedagang;
        acc.swasta += curr.karyawan_swasta;
        acc.pns += curr.pns_tni_polri;
        acc.buruh += curr.buruh_harian;
        acc.lainnya += curr.lainnya;
        return acc;
      },
      {
        kk: 0,
        jiwa: 0,
        pria: 0,
        wanita: 0,
        balita: 0,
        pelajar: 0,
        produktif: 0,
        lansia: 0,
        petani: 0,
        wiraswasta: 0,
        swasta: 0,
        pns: 0,
        buruh: 0,
        lainnya: 0,
      }
    );
  }, [dataRT]);

  const filteredRT = useMemo(() => {
    if (activeDusunFilter === "Semua") return dataRT;
    return dataRT.filter((r) => r.dusun.toLowerCase().includes(activeDusunFilter.toLowerCase()));
  }, [dataRT, activeDusunFilter]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1E251E] pb-20">
      {/* 1. Hero Header */}
      <section className="relative py-6 sm:py-8 overflow-hidden border-b border-[#EF6C85]/15 bg-gradient-to-b from-[#EBF2DC]/40 via-[#FAF6F0] to-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#1E251E]/60 mb-3">
            <Link href="/" className="hover:text-[#EF6C85] transition-colors flex items-center gap-1 font-medium">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#9DB368] font-semibold">Monografi & Statistik</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2DC] text-[#4D6328] text-xs font-bold mb-3 shadow-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Transparansi Data Terbuka (Open Data)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1E251E] tracking-tight leading-tight mb-4">
              Monografi & Statistik <span className="gradient-text-sage">Kependudukan</span>
            </h1>
            <p className="text-sm sm:text-base text-[#1E251E]/70 leading-relaxed">
              Portal infografis dan rekapitulasi agregat demografi Padukuhan Wonosari: distribusi Kepala Keluarga (KK), penduduk per RT/RW, klasifikasi usia produktif, mata pencaharian, dan inventaris fasilitas desa.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Kartu Indikator Utama */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-3xl border border-[#EF6C85]/20 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#1E251E]/60">Total Penduduk</span>
                <Users className="w-5 h-5 text-[#EF6C85]" />
              </div>
              <div className="text-2xl sm:text-4xl font-black text-[#1E251E]">{totals.jiwa}</div>
              <p className="text-[11px] text-[#1E251E]/60 mt-1">Jiwa terdaftar di 5 RT</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#9DB368]/30 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#1E251E]/60">Kepala Keluarga (KK)</span>
                <Building className="w-5 h-5 text-[#9DB368]" />
              </div>
              <div className="text-2xl sm:text-4xl font-black text-[#1E251E]">{totals.kk}</div>
              <p className="text-[11px] text-[#1E251E]/60 mt-1">Kepala Keluarga aktif</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8A838]/30 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#1E251E]/60">Gender (L / P)</span>
                <TrendingUp className="w-5 h-5 text-[#E8A838]" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-[#1E251E]">
                {totals.pria} <span className="text-xs text-[#1E251E]/40 font-normal">/</span> {totals.wanita}
              </div>
              <p className="text-[11px] text-[#1E251E]/60 mt-1">Laki-laki & Perempuan</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#1E251E]/60">Luas Wilayah</span>
                <MapPin className="w-5 h-5 text-[#1E251E]" />
              </div>
              <div className="text-2xl sm:text-4xl font-black text-[#1E251E]">45 <span className="text-sm font-normal">Ha</span></div>
              <p className="text-[11px] text-[#1E251E]/60 mt-1">Sawah teknis & pemukiman</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tabel Demografi per RT */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#1E251E]">Data Kependudukan per RT</h2>
                <p className="text-xs text-[#1E251E]/60">Rekapitulasi warga berdasarkan wilayah RT 01 s/d RT 05.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#FAF6F0] p-1 rounded-xl border border-[#1E251E]/5">
                {["Semua", "Rejosari", "Wonosari", "Pajangan"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDusunFilter(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeDusunFilter === d ? "bg-[#1E251E] text-white shadow-2xs" : "text-[#1E251E]/70 hover:text-[#1E251E]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabel Responsif */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1E251E]">
                <thead>
                  <tr className="border-b border-[#1E251E]/10 text-[#1E251E]/60 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Wilayah</th>
                    <th className="py-3 px-3">Kampung</th>
                    <th className="py-3 px-3">Penanggung Jawab</th>
                    <th className="py-3 px-3 text-right">KK</th>
                    <th className="py-3 px-3 text-right">Pria</th>
                    <th className="py-3 px-3 text-right">Wanita</th>
                    <th className="py-3 px-3 text-right font-extrabold text-[#EF6C85]">Total Jiwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E251E]/5 font-medium">
                  {filteredRT.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                      <td className="py-3 px-3 font-bold">{item.rt} / {item.rw}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[10px] font-bold border border-[#1E251E]/10">
                          {item.dusun}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#1E251E]/70">{item.nama_ketua_rt}</td>
                      <td className="py-3 px-3 text-right">{item.jumlah_kk}</td>
                      <td className="py-3 px-3 text-right text-blue-700">{item.jumlah_pria}</td>
                      <td className="py-3 px-3 text-right text-rose-700">{item.jumlah_wanita}</td>
                      <td className="py-3 px-3 text-right font-black text-sm text-[#1E251E]">{item.jumlah_jiwa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Infografis: Kelompok Usia & Mata Pencaharian */}
      <section className="py-10 border-t border-[#1E251E]/10 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Distribusi Usia */}
            <div className="bg-white rounded-3xl border border-[#EF6C85]/20 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-black text-[#1E251E] mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#EF6C85]" />
                Sebaran Kelompok Usia
              </h3>
              <p className="text-xs text-[#1E251E]/60 mb-6">Proporsi penduduk usia dini, sekolah, produktif, dan lansia.</p>

              <div className="space-y-4">
                {[
                  { label: "Balita (0 - 5 Tahun)", count: totals.balita, color: "bg-rose-500", percent: Math.round((totals.balita / totals.jiwa) * 100) },
                  { label: "Anak & Pelajar (6 - 18 Tahun)", count: totals.pelajar, color: "bg-amber-500", percent: Math.round((totals.pelajar / totals.jiwa) * 100) },
                  { label: "Usia Produktif (19 - 59 Tahun)", count: totals.produktif, color: "bg-emerald-600", percent: Math.round((totals.produktif / totals.jiwa) * 100) },
                  { label: "Lanjut Usia (60+ Tahun)", count: totals.lansia, color: "bg-purple-600", percent: Math.round((totals.lansia / totals.jiwa) * 100) },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{item.label}</span>
                      <span>{item.count} Jiwa ({item.percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#FAF6F0] overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mata Pencaharian */}
            <div className="bg-white rounded-3xl border border-[#9DB368]/30 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-black text-[#1E251E] mb-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#9DB368]" />
                Mata Pencaharian Utama Warga
              </h3>
              <p className="text-xs text-[#1E251E]/60 mb-6">Sebaran profesi dan aktivitas ekonomi masyarakat Padukuhan Wonosari.</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { profesi: "Petani & Pekebun", count: totals.petani, icon: "🌾" },
                  { profesi: "Wiraswasta & Pedagang", count: totals.wiraswasta, icon: "🏪" },
                  { profesi: "Karyawan Swasta", count: totals.swasta, icon: "💼" },
                  { profesi: "Buruh Harian Lepas", count: totals.buruh, icon: "🛠️" },
                  { profesi: "PNS / TNI / Polri", count: totals.pns, icon: "🏛️" },
                  { profesi: "Lainnya / Pensiunan", count: totals.lainnya, icon: "✨" },
                ].map((prof, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#1E251E]/5 flex items-center gap-2.5">
                    <span className="text-lg">{prof.icon}</span>
                    <div>
                      <div className="text-[11px] text-[#1E251E]/60">{prof.profesi}</div>
                      <div className="text-sm font-black text-[#1E251E]">{prof.count} Orang</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Inventaris Fasilitas Umum */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2DC] text-[#4D6328] text-xs font-bold mb-2">
              <Landmark className="w-3.5 h-3.5" />
              <span>Sarana & Prasarana</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E251E]">Fasilitas Umum Padukuhan</h2>
            <p className="text-xs text-[#1E251E]/65 mt-1">
              Inventaris infrastruktur pendukung ibadah, pertemuan, keamanan, dan sanitasi lingkungan warga.
            </p>
          </div>

          {isLoadingSarana ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#1E251E]/10 p-8 text-xs text-[#1E251E]/50">
              Memuat inventaris sarana & prasarana dari database Supabase...
            </div>
          ) : saranaList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#1E251E]/10 p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF2DC] text-[#4D6328] flex items-center justify-center mx-auto mb-3">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#1E251E] mb-1">Belum Ada Sarana & Prasarana</h3>
              <p className="text-xs text-[#1E251E]/60 max-w-sm mx-auto">
                Data fasilitas umum belum ditambahkan di database Supabase. Pengurus padukuhan atau kontributor dapat menambahkannya melalui panel admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saranaList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-3xl border border-[#1E251E]/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Foto Fasilitas (100% Dari Database Supabase) */}
                    <div className="relative h-44 w-full bg-[#FAF6F0] overflow-hidden border-b border-[#1E251E]/5 flex items-center justify-center">
                      {item.foto_url ? (
                        <img
                          src={item.foto_url}
                          alt={item.nama || item.nama_sarana || "Sarana Prasarana"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#1E251E]/30 gap-1.5 p-4 text-center">
                          <Landmark className="w-8 h-8 text-[#1E251E]/20" />
                          <span className="text-[10px] font-bold">Tanpa Foto</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1E251E] shadow-xs border border-white/50">
                          {item.kategori}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-emerald-200">
                          {item.kondisi}
                        </span>
                      </div>
                    </div>

                    {/* Info Konten */}
                    <div className="p-5">
                      <h4 className="text-base font-extrabold text-[#1E251E] mb-2 group-hover:text-[#EF6C85] transition-colors line-clamp-1">
                        {item.nama || item.nama_sarana || "Fasilitas Umum"}
                      </h4>
                      {item.deskripsi && (
                        <p className="text-xs text-[#1E251E]/70 leading-relaxed line-clamp-3 mb-4">
                          {item.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer: Lokasi & Tombol Gmaps */}
                  <div className="px-5 pb-5 pt-3 border-t border-[#1E251E]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold text-[#1E251E]/60 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#EF6C85] shrink-0" />
                      <span className="truncate">
                        {item.lokasi === "Rejosari" || item.lokasi_dusun === "Rejosari"
                          ? "Rejosari (RW 18)"
                          : item.lokasi === "Pajangan" || item.lokasi_dusun === "Pajangan"
                          ? "Pajangan (RW 16)"
                          : item.lokasi === "Wonosari" || item.lokasi_dusun === "Wonosari"
                          ? "Wonosari (RW 17)"
                          : item.lokasi === "Seluruh Wilayah" || item.lokasi_dusun === "Seluruh Wilayah"
                          ? "Ketiga Dusun (Seluruh Wilayah)"
                          : item.lokasi || item.lokasi_dusun || "Padukuhan Wonosari"}
                      </span>
                    </div>

                    {item.gmaps_url && (
                      <a
                        href={item.gmaps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#FCE8EC] text-[#1E251E] hover:text-[#EF6C85] border border-[#1E251E]/10 text-xs font-bold transition-all shrink-0"
                        title={`Buka peta ${item.nama || item.nama_sarana || "Fasilitas"}`}
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
