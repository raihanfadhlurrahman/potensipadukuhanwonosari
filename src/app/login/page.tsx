"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Home,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Users,
  ChevronRight,
  Store,
  Compass,
} from "lucide-react";
import {
  signInUser,
  registerUser,
  registerKontributor,
  PRESET_ACCOUNTS,
  getStoredUser,
  UserRole,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDusun, setRegDusun] = useState<"Rejosari" | "Wonosari" | "Pajangan" | "Seluruh Wilayah">("Wonosari");
  const [regRole, setRegRole] = useState<UserRole>("kontributor");
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Jika sudah login, bisa langsung redirect ke admin
  useEffect(() => {
    const current = getStoredUser();
    if (current) {
      // User sudah login
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const res = await signInUser(loginEmail, loginPassword);
    setLoginLoading(false);

    if (res.error) {
      setLoginError(res.error);
    } else {
      router.push("/admin");
    }
  };

  const handleQuickLogin = async (role: "padukuh" | "admin" | "kontributor") => {
    const target = PRESET_ACCOUNTS[role];
    setLoginEmail(target.email);
    setLoginPassword(target.password);
    setLoginLoading(true);

    const res = await signInUser(target.email, target.password);
    setLoginLoading(false);

    if (res.user) {
      router.push("/admin");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName || !regEmail || !regPassword || !regPhone) {
      setRegError("Harap lengkapi semua kolom pendaftaran.");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Kata sandi minimal 6 karakter.");
      return;
    }

    setRegLoading(true);
    const res = await registerUser({
      full_name: regFullName,
      email: regEmail,
      password: regPassword,
      phone_number: regPhone,
      dusun: regDusun,
      role: regRole,
    });
    setRegLoading(false);

    if (res.error) {
      setRegError(res.error);
    } else {
      setRegSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1E251E] pb-20">
      {/* Header Bar */}
      <section className="relative py-6 sm:py-8 border-b border-[#EF6C85]/15 bg-gradient-to-b from-[#FCE8EC]/40 via-[#FAF6F0] to-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-[#1E251E]/60 mb-3">
            <Link href="/" className="hover:text-[#EF6C85] transition-colors flex items-center gap-1 font-medium">
              <Home className="w-3.5 h-3.5" /> Beranda
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#EF6C85] font-semibold">Autentikasi & Masuk Portal</span>
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCE8EC] text-[#D64E68] text-xs font-bold mb-3 shadow-xs">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Pusat Akses Tata Kelola Padukuhan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E251E] tracking-tight leading-tight mb-2">
              Masuk ke Portal <span className="gradient-text-coral">Padukuhan Wonosari</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#1E251E]/70 leading-relaxed">
              Autentikasi resmi untuk <strong>Kepala Dukuh</strong> (validasi & kelola kelembagaan), <strong>Admin KKN</strong> (master data), serta <strong>Kontributor Warga</strong> (usulan UMKM, wisata, dan warta berita).
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Form */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Box */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#1E251E]/10 p-6 sm:p-8 shadow-sm">
              {/* Tab Switcher */}
              <div className="flex items-center p-1.5 bg-[#FAF6F0] rounded-2xl border border-[#1E251E]/10 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setLoginError(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "login"
                      ? "bg-[#1E251E] text-white shadow-xs"
                      : "text-[#1E251E]/60 hover:text-[#1E251E]"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Masuk (Login)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setRegError(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === "register"
                      ? "bg-[#EF6C85] text-white shadow-xs"
                      : "text-[#1E251E]/60 hover:text-[#1E251E]"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Daftar Akun Baru</span>
                </button>
              </div>

              {/* TAB 1: FORM LOGIN */}
              {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="contoh: dukuh.wonosari@wedomartani.desa.id"
                        className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                      />
                      <Mail className="w-4 h-4 text-[#1E251E]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#1E251E]">
                        Kata Sandi (Password)
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                      />
                      <Lock className="w-4 h-4 text-[#1E251E]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{loginError}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 rounded-xl bg-[#1E251E] hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loginLoading ? (
                      <span>Memverifikasi...</span>
                    ) : (
                      <>
                        <span>Masuk ke Panel Kendali</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: FORM REGISTER PENGGUNA BARU */}
              {activeTab === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Banner Informasi Hak Akses Peran */}
                  <div className={`p-3.5 rounded-xl border text-xs transition-all ${
                    regRole === "padukuh"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : regRole === "admin"
                      ? "bg-sky-50 border-sky-200 text-sky-900"
                      : "bg-[#EBF2DC] border-[#9DB368]/30 text-[#4D6328]"
                  }`}>
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        Pendaftaran Akun: {regRole === "padukuh" ? "Pemerintah Padukuhan (Dukuh)" : regRole === "admin" ? "Admin Sistem & KKN" : "Kontributor Warga / Pemuda"}
                      </span>
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {regRole === "padukuh"
                        ? "Hak akses verifikasi/ACC usulan UMKM & warta warga, catatan moderasi penolakan, serta data kependudukan padukuhan."
                        : regRole === "admin"
                        ? "Hak akses penuh pengelolaan data, demografi monografi kependudukan per RT, moderasi konten, artikel, dan kurasi potensi desa."
                        : "Hak akses warga untuk mengusulkan etalase produk UMKM, destinasi wisata desa, dan publikasi warta kegiatan padukuhan."}
                    </p>
                  </div>

                  {/* Pilihan Peran (Role) */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Pilih Peran Akun (Role)
                    </label>
                    <div className="relative">
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] font-semibold focus:outline-none focus:border-[#EF6C85]"
                      >
                        <option value="kontributor">Kontributor Warga / Karang Taruna</option>
                        <option value="admin">Admin Sistem & KKN UII Unit 57</option>
                        <option value="padukuh">Pemerintah Padukuhan / Kepala Dukuh</option>
                      </select>
                      <Shield className="w-4 h-4 text-[#EF6C85] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="contoh: Muhammad Rizki atau Nama Pengurus"
                        className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                      />
                      <User className="w-4 h-4 text-[#1E251E]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="contoh: akun.anda@gmail.com"
                        className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                      />
                      <Mail className="w-4 h-4 text-[#1E251E]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                        Nomor WhatsApp
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="contoh: 628123456789"
                          className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                        />
                        <Phone className="w-4 h-4 text-[#1E251E]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                        Wilayah Dusun / Kampung
                      </label>
                      <div className="relative">
                        <select
                          value={regDusun}
                          onChange={(e) => setRegDusun(e.target.value as any)}
                          className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                        >
                          <option value="Wonosari">Kampung Wonosari (RW 17)</option>
                          <option value="Rejosari">Kampung Rejosari (RW 18)</option>
                          <option value="Pajangan">Kampung Pajangan (RW 16)</option>
                          <option value="Seluruh Wilayah">Seluruh Wilayah Padukuhan</option>
                        </select>
                        <MapPin className="w-4 h-4 text-[#1E251E]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E251E] mb-1.5">
                      Buat Kata Sandi (Password)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#FAF6F0] border border-[#1E251E]/15 text-xs text-[#1E251E] focus:outline-none focus:border-[#EF6C85]"
                      />
                      <Lock className="w-4 h-4 text-[#1E251E]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {regError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{regError}</span>
                    </motion.div>
                  )}

                  {regSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>Akun berhasil didaftarkan ke database! Mengalihkan ke panel kendali...</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={regLoading || regSuccess}
                    className="w-full py-3 rounded-xl bg-[#EF6C85] hover:bg-[#D64E68] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {regLoading ? (
                      <span>Mendaftarkan ke Database...</span>
                    ) : (
                      <>
                        <span>
                          Daftar Sebagai {regRole === "padukuh" ? "Pemerintah Padukuhan" : regRole === "admin" ? "Admin KKN" : "Kontributor Warga"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick 1-Click Demo Login Box (Sangat berguna saat demonstrasi & sidang KKN) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl border border-[#1E251E]/10 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#E8A838]" />
                  <h3 className="text-sm font-black text-[#1E251E]">Akses Cepat Pengujian (1-Klik)</h3>
                </div>
                <p className="text-xs text-[#1E251E]/60 mb-4 leading-relaxed">
                  Gunakan kartu di bawah ini untuk langsung login tanpa harus mengetik manual saat presentasi demonstrasi website:
                </p>

                <div className="space-y-3">
                  {/* Akun 1: Pak Dukuh */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("padukuh")}
                    className="w-full text-left p-3.5 rounded-2xl border border-[#EF6C85]/25 hover:border-[#EF6C85] bg-[#FCE8EC]/30 hover:bg-[#FCE8EC]/60 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#1E251E]">Bapak Kepala Dukuh</span>
                        <span className="text-[9px] font-extrabold bg-[#EF6C85] text-white px-2 py-0.5 rounded-full">
                          Hak Penuh
                        </span>
                      </div>
                      <p className="text-[11px] text-[#1E251E]/60 mt-0.5">
                        Bisa ACC/Tolak usulan, publikasi langsung, & kelola kelembagaan SOTK.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#EF6C85] group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Akun 2: Admin KKN */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin")}
                    className="w-full text-left p-3.5 rounded-2xl border border-[#1E251E]/15 hover:border-[#1E251E] bg-[#FAF6F0] hover:bg-neutral-100 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#1E251E]">Admin KKN Unit 57</span>
                        <span className="text-[9px] font-extrabold bg-[#1E251E] text-white px-2 py-0.5 rounded-full">
                          Akses Penuh
                        </span>
                      </div>
                      <p className="text-[11px] text-[#1E251E]/60 mt-0.5">
                        Kelola master data, riwayat moderasi, antrean, & konfigurasi website.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#1E251E] group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Akun 3: Kontributor */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("kontributor")}
                    className="w-full text-left p-3.5 rounded-2xl border border-[#9DB368]/30 hover:border-[#9DB368] bg-[#EBF2DC]/30 hover:bg-[#EBF2DC]/70 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#1E251E]">Kontributor Warga</span>
                        <span className="text-[9px] font-extrabold bg-[#4D6328] text-white px-2 py-0.5 rounded-full">
                          Usulan Konten
                        </span>
                      </div>
                      <p className="text-[11px] text-[#1E251E]/60 mt-0.5">
                        Mengusulkan produk UMKM, spot wisata, dan artikel warta.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9DB368] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Info Box Keamanan */}
              <div className="p-4 rounded-2xl bg-white border border-[#1E251E]/10 text-xs text-[#1E251E]/60 space-y-1.5">
                <p className="font-bold text-[#1E251E] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#EF6C85]" /> Keamanan Akses Terpusat
                </p>
                <p className="text-[11px] leading-relaxed">
                  Setiap aksi persetujuan (*ACC*) dan perubahan data kelembagaan tersimpan dengan jejak digital penanggung jawab dan terenkripsi menggunakan protokol Supabase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
