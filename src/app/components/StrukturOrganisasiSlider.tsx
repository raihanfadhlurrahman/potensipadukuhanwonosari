"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Pause,
  Play,
  Move,
  Info,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export interface StrukturData {
  id: string;
  title: string;
  namaLengkap: string;
  periode: string;
  wilayah: string;
  badge: string;
  image: string;
  pimpinan: string;
  deskripsi: string;
  tagColor: {
    badgeBg: string;
    badgeText: string;
    accentBorder: string;
    gradient: string;
  };
}

export const STRUKTUR_LIST: StrukturData[] = [
  {
    id: "lpmkal",
    title: "Struktur Pengurus Sub Unit LPMKal",
    namaLengkap: "Pengurus Sub Unit Lembaga Pemberdayaan Masyarakat Kalurahan (LPMKal) Padukuhan Wonosari",
    periode: "Masa Bakti 2024–2029",
    wilayah: "Padukuhan Wonosari (Seluruh Wilayah)",
    badge: "LPMKal Padukuhan",
    image: "/images/penguruslpmkal.png",
    pimpinan: "Ketua: H. Slamet • Wakil: Bangun Suryadi • Penasehat: H. Dakiri, S.Sos, M.Si",
    deskripsi:
      "Lembaga perencana & pelaksana pemberdayaan masyarakat, pembangunan infrastruktur, humas, serta perlindungan perempuan dan anak tingkat Padukuhan Wonosari.",
    tagColor: {
      badgeBg: "bg-sky-100",
      badgeText: "text-sky-800",
      accentBorder: "border-sky-200 hover:border-sky-400",
      gradient: "from-sky-500/10 to-blue-500/5",
    },
  },
  {
    id: "rw16",
    title: "Struktur Pengurus RW 016",
    namaLengkap: "Pengurus Rukun Warga RW 016 Padukuhan Wonosari Kalurahan Wedomartani",
    periode: "Masa Bakti 2024–2029",
    wilayah: "Kampung Pajangan (RT 001)",
    badge: "RW 016 Pajangan",
    image: "/images/pengurusrw16.png",
    pimpinan: "Ketua RW: Sumadi • Penasehat: Hariyanto • RT 001: Sudiyoko",
    deskripsi:
      "Struktur kepengurusan Rukun Warga 016 Kampung Pajangan yang menaungi seksi keamanan, hubungan masyarakat, dana sosial kemasyarakatan, dan pembangunan lingkungan.",
    tagColor: {
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-800",
      accentBorder: "border-purple-200 hover:border-purple-400",
      gradient: "from-purple-500/10 to-indigo-500/5",
    },
  },
  {
    id: "rw17",
    title: "Struktur Pengurus RW 017",
    namaLengkap: "Pengurus Rukun Warga RW 017 Padukuhan Wonosari Kalurahan Wedomartani",
    periode: "Masa Bakti 2022–2027",
    wilayah: "Kampung Wonosari (RT 002 & RT 003)",
    badge: "RW 017 Wonosari",
    image: "/images/pengurusrw17.png",
    pimpinan: "Ketua RW: Triyoko • RT 002: Sumardi • RT 003: Jumiran",
    deskripsi:
      "Struktur kepengurusan Rukun Warga 017 Kampung Wonosari membawahi seksi keagamaan, kesejahteraan sosial, pembangunan, perlengkapan, pemberdayaan perempuan & dasawisma, kepemudaan olahraga & seni, serta keamanan.",
    tagColor: {
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-800",
      accentBorder: "border-amber-200 hover:border-amber-400",
      gradient: "from-amber-500/10 to-orange-500/5",
    },
  },
  {
    id: "rw18",
    title: "Struktur Pengurus RW 018",
    namaLengkap: "Pengurus Rukun Warga RW 018 Padukuhan Wonosari Kalurahan Wedomartani",
    periode: "Masa Bakti 2024–2029",
    wilayah: "Kampung Rejosari (RT 004 & RT 005)",
    badge: "RW 018 Rejosari",
    image: "/images/pengurusrw18.png",
    pimpinan: "Ketua RW: Poniran • RT 004: Supendi • RT 005: Maryanta",
    deskripsi:
      "Struktur kepengurusan Rukun Warga 018 Kampung Rejosari menaungi bidang perlengkapan, keagamaan, pembangunan rukun warga, kepemudaan & olahraga, ketenteraman lingkungan, serta gerakan dasawisma.",
    tagColor: {
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-800",
      accentBorder: "border-emerald-200 hover:border-emerald-400",
      gradient: "from-emerald-500/10 to-teal-500/5",
    },
  },
  {
    id: "umkm",
    title: "Struktur Pengurus UMKM Usaha Makmur",
    namaLengkap: "Pengurus Kelompok Usaha Mikro, Kecil, dan Menengah Usaha Makmur Padukuhan Wonosari",
    periode: "Periode Aktif Berkelanjutan",
    wilayah: "Padukuhan Wonosari (Klaster Ekonomi)",
    badge: "UMKM Usaha Makmur",
    image: "/images/pengurusumkm.png",
    pimpinan: "Ketua 1: Jumiran • Ketua 2: Suyono • Pembina: Tris Wanto (Dukuh)",
    deskripsi:
      "Organisasi paguyuban pelaku UMKM Padukuhan Wonosari yang mengoordinasikan bidang sekretariat, permodalan/bendahara, dan keanggotaan puluhan produsen kuliner, olahan tani, dan kerajinan lokal.",
    tagColor: {
      badgeBg: "bg-rose-100",
      badgeText: "text-rose-800",
      accentBorder: "border-rose-200 hover:border-rose-400",
      gradient: "from-rose-500/10 to-pink-500/5",
    },
  },
];

export default function StrukturOrganisasiSlider() {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);

  // Auto-slide effect to scroll horizontally to the right continuously
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationFrameId: number;
    let lastTimestamp: number | null = null;
    const scrollSpeed = 0.65; // pixels per ms approx for ultra smooth scrolling

    const step = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Only auto-scroll when not paused, not hovered, and modal is closed
      if (!isHoveredRef.current && !isAutoScrollPaused && activeModalIndex === null) {
        container.scrollLeft += (scrollSpeed * delta) / 16;

        // Loop seamlessly back to start when reaching end
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 2) {
          container.scrollLeft = 0;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoScrollPaused, activeModalIndex]);

  // Manual scroll buttons
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  // Open modal and reset zoom
  const openModal = (index: number) => {
    setActiveModalIndex(index);
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const closeModal = () => {
    setActiveModalIndex(null);
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.35, 4));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom inside modal
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom in
      setZoomScale((prev) => Math.min(prev + 0.25, 4));
    } else {
      // Zoom out
      setZoomScale((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Drag & Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard controls for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalIndex === null) return;

      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        setActiveModalIndex((prev) =>
          prev !== null ? (prev === 0 ? STRUKTUR_LIST.length - 1 : prev - 1) : 0
        );
        handleResetZoom();
      } else if (e.key === "ArrowRight") {
        setActiveModalIndex((prev) =>
          prev !== null ? (prev === STRUKTUR_LIST.length - 1 ? 0 : prev + 1) : 0
        );
        handleResetZoom();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0" || e.key === "r" || e.key === "R") {
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalIndex]);

  const activeStruktur =
    activeModalIndex !== null ? STRUKTUR_LIST[activeModalIndex] : null;

  return (
    <div className="w-full my-8">
      {/* Sub-header & Controls bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2DC] text-[#4D6328] text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Galeri Bagan Bagan Struktur Resmi</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#1E251E] flex items-center gap-2">
            Bagan Visual Struktur Kepengurusan
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EF6C85]/10 text-[#EF6C85]">
              <Sparkles className="w-3 h-3" /> Klik & Zoom
            </span>
          </h3>
          <p className="text-xs text-[#1E251E]/70 mt-1 max-w-2xl">
            Diagram alur kepengurusan resmi LPMKal, Rukun Warga (RW 16, RW 17, RW 18), dan Paguyuban UMKM Padukuhan Wonosari. Geser kartu atau klik gambar untuk memperbesar dengan fitur zoom resolusi tinggi.
          </p>
        </div>

        {/* Action Controls: Auto-slide Toggle & Arrows */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Pause / Play Auto scroll */}
          <button
            type="button"
            onClick={() => setIsAutoScrollPaused((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isAutoScrollPaused
                ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            }`}
            title={isAutoScrollPaused ? "Lanjutkan auto geser" : "Jeda auto geser"}
          >
            {isAutoScrollPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto Geser: Jeda</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Auto Geser: Aktif</span>
              </>
            )}
          </button>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={handleScrollLeft}
            className="w-9 h-9 rounded-xl bg-white border border-[#1E251E]/15 hover:border-[#EF6C85] text-[#1E251E] hover:text-[#EF6C85] flex items-center justify-center shadow-2xs hover:shadow-xs transition-all"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleScrollRight}
            className="w-9 h-9 rounded-xl bg-white border border-[#1E251E]/15 hover:border-[#EF6C85] text-[#1E251E] hover:text-[#EF6C85] flex items-center justify-center shadow-2xs hover:shadow-xs transition-all"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        className="relative group"
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
        onTouchStart={() => {
          isHoveredRef.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isHoveredRef.current = false;
          }, 1500);
        }}
      >
        <div
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {STRUKTUR_LIST.map((item, index) => (
            <div
              key={item.id}
              onClick={() => openModal(index)}
              className={`flex-none w-[280px] sm:w-[340px] md:w-[380px] rounded-3xl bg-white border ${item.tagColor.accentBorder} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer group/card hover:-translate-y-1`}
            >
              {/* Card Image Container with hover zoom preview */}
              <div className="relative aspect-[16/10] bg-[#0A1E2F] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 300px, 400px"
                  className="object-contain p-2 group-hover/card:scale-105 transition-transform duration-500"
                />

                {/* Overlay prompt on hover */}
                <div className="absolute inset-0 bg-[#0A1E2F]/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 text-[#1E251E] text-xs font-black shadow-lg transform translate-y-2 group-hover/card:translate-y-0 transition-all duration-300">
                    <Maximize2 className="w-3.5 h-3.5 text-[#EF6C85]" />
                    Klik untuk Zoom
                  </span>
                </div>

                {/* Badge Wilayah */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs ${item.tagColor.badgeBg} ${item.tagColor.badgeText}`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Periode Badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                    {item.periode}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-[#FAF6F0]/40">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#1E251E]/60 mb-1">
                    <span>{item.wilayah}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#1E251E] group-hover/card:text-[#EF6C85] transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#1E251E]/70 line-clamp-2 mt-2 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1E251E]/10 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#1E251E]/80 truncate max-w-[70%]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{item.pimpinan}</span>
                  </div>
                  <span className="text-xs font-black text-[#EF6C85] flex items-center gap-0.5 group-hover/card:translate-x-1 transition-transform">
                    Buka <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel subtle hints */}
        <div className="flex items-center justify-between text-[11px] text-[#1E251E]/50 px-2 mt-2">
          <span>✨ Otomatis bergeser ke kanan (arahkan mouse / sentuh untuk berhenti sejenak)</span>
          <span className="hidden sm:inline">Klik kartu manapun untuk zoom & baca nama anggota</span>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX & INTERACTIVE ZOOM MODAL */}
      {activeStruktur && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200"
          onClick={(e) => {
            // Close if clicked on empty dark backdrop
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Top Bar Navigation & Controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/10 text-white z-20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 text-[#EF6C85]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${activeStruktur.tagColor.badgeBg} ${activeStruktur.tagColor.badgeText}`}
                  >
                    {activeStruktur.badge}
                  </span>
                  <span className="text-[11px] text-white/60 hidden sm:inline">
                    {activeStruktur.periode}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white truncate max-w-sm sm:max-w-xl">
                  {activeStruktur.namaLengkap}
                </h3>
              </div>
            </div>

            {/* Zoom Controls & Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Perkecil (Zoom Out / Tombol -)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-white/90 min-w-[50px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 4}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  title="Perbesar (Zoom In / Tombol +)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 h-8 rounded-lg flex items-center gap-1 text-xs text-white/80 hover:bg-white/15 hover:text-white transition-all ml-1"
                  title="Reset Zoom (Fit ke Layar)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              </div>

              {/* View Raw Image in New Tab */}
              <a
                href={activeStruktur.image}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                title="Buka gambar asli di tab baru"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-all"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Zoom Viewport */}
          <div
            className={`relative flex-1 overflow-hidden flex items-center justify-center select-none ${
              zoomScale > 1
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-zoom-in"
            }`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => {
              // Click to zoom in if at 100%
              if (zoomScale === 1) {
                setZoomScale(2);
              }
            }}
          >
            {/* Left Nav Arrow inside Lightbox */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveModalIndex((prev) =>
                  prev !== null
                    ? prev === 0
                      ? STRUKTUR_LIST.length - 1
                      : prev - 1
                    : 0
                );
                handleResetZoom();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl"
              title="Bagan sebelumnya (Panah Kiri)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Arrow inside Lightbox */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveModalIndex((prev) =>
                  prev !== null
                    ? prev === STRUKTUR_LIST.length - 1
                      ? 0
                      : prev + 1
                    : 0
                );
                handleResetZoom();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl"
              title="Bagan berikutnya (Panah Kanan)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* The Zoomable & Draggable Image Canvas */}
            <div
              className="transition-transform duration-75 ease-out max-w-full max-h-full flex items-center justify-center p-4"
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
                transformOrigin: "center center",
              }}
            >
              <img
                src={activeStruktur.image}
                alt={activeStruktur.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl pointer-events-none drop-shadow-2xl"
                draggable={false}
              />
            </div>

            {/* Floating Mobile Controls overlay */}
            <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/75 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={zoomScale <= 1}
                className="p-1 text-white disabled:opacity-30"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono text-white px-2">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={zoomScale >= 4}
                className="p-1 text-white disabled:opacity-30"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                className="p-1 text-white/80"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Bar: Thumbnails & Quick Switcher */}
          <div className="px-4 py-3 pb-8 sm:pb-3 bg-black/75 border-t border-white/10 text-white z-20 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
              <span className="text-[11px] font-bold text-white/50 whitespace-nowrap mr-1">
                Pilih Bagan:
              </span>
              {STRUKTUR_LIST.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveModalIndex(idx);
                    handleResetZoom();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeModalIndex === idx
                      ? "bg-[#EF6C85] text-white shadow-md scale-105"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <span>{item.badge}</span>
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4 text-[11px] text-white/60">
              <span className="flex items-center gap-1">
                <Move className="w-3.5 h-3.5 text-[#EF6C85]" /> Geser mouse untuk pan gambar saat di-zoom
              </span>
              <span>•</span>
              <span>Scroll roda mouse untuk zoom in/out</span>
              <span>•</span>
              <span className="font-mono">Esc untuk tutup</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
