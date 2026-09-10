"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Menu,
  X,
  Home,
  Users,
  TreePine,
  Store,
  HeartPulse,
  BarChart3,
  Newspaper,
  LogIn,
  LogOut,
  UserCheck,
} from "lucide-react";
import { getStoredUser, signOutUser, UserProfile } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/profil-desa", label: "Profil Desa", icon: Users },
  { href: "/wisata", label: "Wisata", icon: TreePine },
  { href: "/umkm", label: "UMKM", icon: Store },
  { href: "/stunting", label: "Stunting", icon: HeartPulse },
  { href: "/monografis", label: "Monografi", icon: BarChart3 },
  { href: "/artikel", label: "Artikel", icon: Newspaper },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Sync session state on load and pathname change
  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, [pathname]);

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "glass-panel border-b border-[#EF6C85]/20 shadow-md"
            : "bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#EF6C85]/10"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
            >
              <Image
                src="/images/logoSleman.png"
                alt="Logo Sleman"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
            <motion.div
              whileHover={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
              className="relative w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0"
            >
              <Image
                src="/images/logounit_Warna.PNG"
                alt="Logo KKN Unit 57"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
            <div className="border-l border-[#1E251E]/15 pl-3">
              <div className="text-xs sm:text-sm font-bold tracking-tight text-[#1E251E] uppercase group-hover:text-[#EF6C85] transition-colors">
                Padukuhan Wonosari
              </div>
              <div className="text-[10px] sm:text-xs text-[#9DB368] font-semibold">
                Kalurahan Wedomartani • KKN UII 73
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#EF6C85]"
                      : "text-[#1E251E]/70 hover:text-[#EF6C85] hover:bg-[#FCE8EC]/50"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#EF6C85] rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1E251E]/10 text-xs font-bold shadow-2xs hover:border-[#EF6C85] transition-all"
                  title="Buka Panel Kendali"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#EF6C85]" />
                  <span className="hidden md:inline">
                    {currentUser.role === "padukuh"
                      ? "Kepala Dukuh"
                      : currentUser.role === "admin"
                      ? "Admin KKN"
                      : currentUser.full_name.split(" ")[0]}
                  </span>
                  <span className="md:hidden">Panel</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 rounded-full text-[#1E251E]/60 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Keluar (Logout)"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E251E] hover:text-[#EF6C85] px-3.5 py-1.5 rounded-full border border-[#1E251E]/15 hover:border-[#EF6C85] bg-white shadow-2xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-[#EF6C85]" />
                <span>Masuk</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#FCE8EC]/50 transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-[#EF6C85]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-[#1E251E]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-30 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-30 lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-6 pt-24">
                <div className="space-y-1">
                  {navLinks.map((link, idx) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? "bg-[#FCE8EC] text-[#EF6C85]"
                              : "text-[#1E251E]/70 hover:bg-[#FAF6F0] hover:text-[#1E251E]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-[#EFE7DC] space-y-3">
                  {currentUser ? (
                    <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#1E251E]/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1E251E]">
                          {currentUser.role === "padukuh"
                            ? "Kepala Dukuh"
                            : currentUser.role === "admin"
                            ? "Admin KKN"
                            : "Kontributor Warga"}
                        </span>
                        <span className="text-[10px] text-[#1E251E]/50">{currentUser.dusun}</span>
                      </div>
                      <p className="text-xs text-[#1E251E]/70 font-medium truncate">{currentUser.full_name}</p>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 w-full bg-[#1E251E] hover:bg-neutral-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#EF6C85]" />
                      <span>Masuk ke Akun</span>
                    </Link>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] text-[#1E251E]/40">
                  <MapPin className="w-3 h-3" />
                  <span>Wedomartani, Ngemplak, Sleman</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
