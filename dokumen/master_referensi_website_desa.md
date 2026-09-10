# Master Blueprint & Panduan Lengkap Pengembangan Website Profil Potensi Desa

> **Ringkasan Master:** Dokumen ini merupakan konsolidasi dari seluruh 9 dokumen referensi teknis dan konten untuk pembuatan website profil potensi desa interaktif berbasis modern web stack.

---

## 1. Arsitektur Teknologi & Panduan Pembuatan (`tech.md`)

Website dirancang dengan konsep modern, interaktif, dan *immersive* (mengusung pendekatan *digital storytelling* visual).

### A. Core Tech Stack
* **Framework Utama:** Next.js (React) — Menggunakan SSR/SSG untuk performa tinggi dan SEO optimal.
* **Styling & UI:** Tailwind CSS + Shadcn UI / Radix UI + Modul Notifikasi (Sonner).
* **Tipografi Editorial:**
  * **Sentient:** Font Serif elegan untuk judul, *branding*, dan kesan editorial premium.
  * **Geist & Geist Mono:** Font Sans-serif buatan Vercel untuk keterbacaan tinggi.
* **Animasi & Interaktivitas:** Framer Motion, GSAP (ScrollTrigger), atau Three.js / React Three Fiber.
* **Infrastruktur:** Domain `.id`, hosting VPS/Vercel dengan integrasi Cloudflare CDN.

### B. Langkah-Langkah Pembuatan (Developer Guide)
```bash
# 1. Setup Proyek Next.js & Tailwind CSS
npx create-next-app@latest laiyolobaru-clone --typescript --tailwind --app

# 2. Instalasi Library Animasi & Komponen UI
npm install framer-motion lucide-react clsx tailwind-merge sonner
```
* **Font Setup:** Konfigurasi font lokal/Google (`Sentient` & `Geist`) pada `app/layout.tsx`.
* **Fitur Utama:** Preloader animasi, Hero reveal effect, Galeri interaktif dengan hover zoom, Infografis Recharts, integrasi WhatsApp & Google Maps.
* **Headless CMS & Backend:** Sanity.io / Strapi untuk manajemen berita oleh perangkat desa, serta Supabase untuk database formulir warga.

---

## 2. Halaman Utama / Landing Page (`landingpage.md`)

Menggunakan arsitektur narasi visual bertahap (*section-by-section*) untuk memamerkan identitas desa:

1. **Opening Experience (Preloader Screen):** Layar pembuka animasi persen loading (0% - 100%) dengan teks sambutan interaktif.
2. **Hero Section (First Impression):** Display Headline nama desa (Serif besar), tagline puitis, latar video sinematik / gambar lanskap drone, dan tombol CTA "Jelajahi Desa".
3. **Profil & Narasi Sejarah:** Cerita asal-usul desa, visi & karakter gotong-royong, serta sambutan Kepala Desa dengan potret editorial.
4. **Data Statistik Interaktif:** Counter animation untuk Luas Wilayah, Total Populasi, Jumlah Dusun, dan Mata Pencaharian Utama.
5. **Potensi Unggulan & Komoditas:** Pesisir/perikanan, perkebunan kelapa/kopra, dan hasil karya UMKM.
6. **Destinasi Wisata & Alam:** Carousel/grid pantai, karang, situs budaya, beserta rincian jarak tempuh dan aktivitas.
7. **Kehidupan Warga & Budaya:** Dokumentasi tradisi adat, pesta laut, dan galeri foto keseharian warga (*human interest*).
8. **Lokasi & Navigasi Interaktif:** Peta wilayah, rute transportasi dari pelabuhan/bandara/ibu kota.
9. **Footer & Kontak Resmi:** Alamat fisik balai desa, WhatsApp resmi, email, media sosial, dan identitas pengembang KKN.

---

## 3. Halaman Profil Desa (`/profil-desa` - `profildesa.md`)

Menyajikan legitimasi data tata kelola dan tata ruang wilayah desa secara estetis:

1. **Header & Lambang Resmi:** Judul halaman, tagline posisi administratif, dan lambang resmi kabupaten/desa.
2. **Visi & Misi Pembangunan:** Pernyataan visi jangka panjang dan misi poin strategis pelayanan & ekonomi.
3. **Asal-Usul & Garis Waktu Kepemimpinan:** Sejarah pemekaran/pendirian desa, makna nama desa, serta *timeline* riwayat Kepala Desa.
4. **Struktur Organisasi Aparatur Desa:** Bagan interaktif / grid kartu untuk Kepala Desa, Sekdes, Kaur, Kasi, Kadus, serta BPD, PKK, Karang Taruna.
5. **Kondisi Geografis & Batas Wilayah:** Batas administratif 4 arah mata angin, topografi (mdpl), dan peta batas wilayah interaktif.
6. **Infografis Demografi Kependudukan:** Metrik jumlah jiwa/KK, piramida gender, distribusi per dusun, dan tingkat pendidikan.
7. **Sarana & Prasarana Publik:** Daftar fasilitas Poskesdes/Posyandu, sekolah (TK/SD/Madrasah), masjid, dan akses jalan/dermaga.

---

## 4. Halaman Katalog Destinasi Wisata (`/wisata` - `wisata.md`)

Berfungsi sebagai katalog promosi pariwisata dan *travel guide*:

1. **Hero & Tagline Wisata:** Visual pembuka *aerial view* pantai dan narasi keasrian alam.
2. **Katalog Destinasi Unggulan:** Card grid/slider objek wisata pantai, spot *snorkeling*, area pemancingan, dan agrowisata perkebunan kelapa.
3. **Anatomi Detail Objek Wisata:** Foto galeri multi-sudut, deskripsi keunikan, daftar aktivitas, fasilitas (gazebo, toilet, parkir), serta retribusi/tiket.
4. **Cultural Experience & Wisata Tradisi:** Wisata kesenian adat, proses pembuatan kopra/nira tradisional.
5. **Panduan Rute & Tips Berkunjung:** Estimasi waktu perjalanan, rute laut/darat, peta lokasi, serta himbauan *eco-tourism*.
6. **Kontak Pemandu & Pokdarwis:** Narahubung sewa perahu nelayan, alat *snorkeling*, *homestay*, dan tombol kontak WhatsApp direct.

---

## 5. Halaman Katalog UMKM (`/umkm` - `umkm.md`)

Etalase digital produk lokal warga desa (direct-to-consumer):

1. **Hero & Filter Kategori:** Filter tab cepat (*Semua*, *Hasil Olahan Laut*, *Produk Kelapa*, *Kuliner*, *Kerajinan/Kriya*).
2. **Anatomi Kartu Produk:** Foto produk *clean*, badge kategori & dusun asal, nama produk, estimasi harga, nama pembuat, dan tombol *Order WhatsApp Direct*.
3. **Modal Pop-up Detail Produk:** Informasi komposisi/bahan alami, pilihan varian kemasan, masa kadaluarsa/simpan, serta label izin (Halal, P-IRT, NIB).
4. **Story Behind the Product:** Kisah emosional perajin/petani/ibu nelayan dan dampak ekonomi pembelian produk.
5. **Informasi Pengiriman & Pembayaran:** Layanan ekspedisi (J&T, JNE, POS, kapal feri), minimun order, dan opsi transfer bank/QRIS.
6. **Formulir Pendaftaran UMKM Warga:** Sarana pendaftaran produk baru gratis untuk warga desa.

---

## 6. Halaman Marketplace / E-Commerce BUMDes (`/laiyolo-ecommerce` - `ecommerce.md`)

Platform perdagangan digital terpadu untuk transaksi ritel dan grosir B2B:

1. **Header Navigation & Search Bar:** Brand toko BUMDes, *live search bar*, filter komoditas, dan *floating cart drawer*.
2. **Promotional Banner & Trust Badges:** Highlights panen segar, promo *bundling hampers*, serta garansi "100% Asli Produk Desa".
3. **Grid Kartu Produk Marketplace:** Foto multi-sudut, penanda stok (Tersedia/Pre-Order), rating ulasan, tombol *Add to Cart* & *One-Click WA Checkout*.
4. **Alur Pemesanan Double Track:**
   * **Ritel (WA Cart System):** Form ringkas alamat -> draf WhatsApp ke Admin BUMDes.
   * **Grosir B2B (Request Quote):** Form pesanan skala besar (tonase kopra/ikan kering) + negosiasi kargo laut.
5. **Integrasi Logistik Kepulauan:** Pilihan ekspedisi reguler drop-point Selayar, kargo feri Pelabuhan Pamatata-Bira, kalkulator estimasi ongkir.
6. **Pembayaran & Standar Segel:** Rekening resmi BUMDes, QRIS multi-e-wallet, serta standar kemasan *vacuum pack* dan *bubble wrap*.

---

## 7. Halaman Kesehatan & AI Skrining Stunting (`/stunting` - `aideteksistunting.md`)

Pusat informasi kesehatan publik, edukasi gizi, dan fitur interaktif pencegahan stunting:

1. **Hero Kampanye Kesadaran:** Slogan pencegahan stunting dan penegasan sasaran prioritas (Ibu Hamil, Baduta, Balita).
2. **Dashboard & Data Statistik:** Metrik balita terpantau, penerima PMT, rasio status gizi, dan grafik penurunan stunting tahunan.
3. **Fitur Interaktif (Kalkulator Skrining Stunting):**
   * **Input Data:** Jenis kelamin, usia (bulan), tinggi/panjang badan (cm), berat badan (kg).
   * **Output Analisis:** Kategori Z-Score (Standar WHO/Kemenkes: Sangat Pendek, Pendek, Normal, Tinggi) + tombol konsultasi WhatsApp Bidan Desa.
4. **Modul Edukasi 1.000 HPK:** Panduan fase kehamilan (270 hari), fase ASI Eksklusif (0-6 bulan), dan fase MP-ASI kaya protein hewani lokal (6-24 bulan).
5. **Program Kerja Pemerintah Desa:** Program PMT pangan lokal, Rembuk Stunting, Posyandu bulanan, dan sanitasi air bersih.
6. **Dokumentasi & Kontak Layanan:** Galeri kunjungan *door-to-door*, nama & WhatsApp Bidan Desa/Kader KPM, jadwal Posyandu per dusun.

---

## 8. Halaman Monografi Desa (`/monografis` - `monografis.md`)

Pusat data terbuka (*Open Data*) dan rekapitulasi statistik resmi desa:

1. **Header Data & Unduh Dokumen:** Informasi periode data (Semester/Tahun), metadata legalitas Kemendagri, dan tombol download PDF/XLSX.
2. **Rekapitulasi Wilayah & Lahan (Spasial):** Tabel peruntukan lahan (permukiman, perkebunan kelapa/cengkih, fasilitas umum, pesisir, hutan).
3. **Dinamika Kependudukan Rinci:** Komposisi kelompok usia, kategori ekonomi KK (prasejahtera/sejahtera), penerima bansos (PKH/BLT), tingkat pendidikan, dan agama.
4. **Perekonomian & Pekerjaan:** Jumlah nelayan ( armada perahu), petani kelapa (volume panen), usaha jasa/warung, dan profesi ASN/Guru/Medis.
5. **Peternakan & Sanitasi Rumah Tangga:** Data populasi sapi/kambing/unggas, persentase akses air bersih, jamban sehat leher angsa, dan elektrifikasi PLN.
6. **Pengesahan Petugas:** Catatan validator (Kaur Perencanaan/Sekdes), pengesahan Kepala Desa, dan arsip data tahun-tahun sebelumnya.

---

## 9. Halaman Kabar & Artikel Desa (`/artikel` - `artikel.md`)

Portal publikasi berita, edukasi, dan dokumentasi kegiatan desa:

1. **Header Navigasi & Filter:** Teks pengantar, filter kategori (*Semua*, *Kesehatan/Stunting*, *Pemerintahan*, *UMKM*, *Budaya/Wisata*), dan kotak cari berita.
2. **Featured Article (Sorotan Utama):** Kartu berita utama berukuran besar dengan foto *cover* HD, tag kategori, metadata penulis/waktu baca, dan ringkasan teaser.
3. **Grid Cards Artikel Reguler:** Layout 2-col/3-col kartu berita dengan thumbnail 16:9, judul kontras, cuplikan paragraf, dan tombol "Baca Selengkapnya →".
4. **Single Post Detail Layout:** Formatter artikel lengkap memuat header metadata, tombol share sosial (WA/FB), hero image + caption, rich text (blockquote & sisipan dokumentasi), serta artikel terkait (*related posts*).
5. **Pagination & Newsletter CTA:** Tombol "Muat Lebih Banyak" dan formulir langganan berita / tautan Saluran WhatsApp Desa.

---

*Dokumen ini dapat digunakan sebagai acuan utama (single source of truth) untuk perancangan UI/UX, pembentukan struktur folder Next.js, dan pengorganisasian konten website potensi desa.*
