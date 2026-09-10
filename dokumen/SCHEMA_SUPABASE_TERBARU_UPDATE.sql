-- ==============================================================================
-- SKEMA & SEED LENGKAP TERBARU: PORTAL DATABASE RESMI PADUKUHAN WONOSARI
-- Kalurahan Wedomartani, Kapanewon Ngemplak, Kabupaten Sleman, D.I. Yogyakarta
-- Versi: Terintegrasi 100% dengan Next.js App (Tanpa Mock Data)
-- Instruksi: Buka Supabase Dashboard -> SQL Editor -> Tempelkan seluruh isi skrip ini -> Klik RUN (Ctrl+Enter)
-- ==============================================================================

-- 1. EKSTENSI DATABASE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPE ENUM (ENUMERASI)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('padukuh', 'admin', 'kontributor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dusun_enum AS ENUM ('Rejosari', 'Wonosari', 'Pajangan', 'Seluruh Wilayah');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE jenis_kelamin_enum AS ENUM ('L', 'P');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_gizi_enum AS ENUM ('Gizi Buruk / Sangat Pendek', 'Pendek (Stunting)', 'Normal', 'Tinggi / Gizi Lebih');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABEL PENGGUNA & HAK AKSES (USERS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role DEFAULT 'kontributor',
    phone_number VARCHAR(25),
    dusun dusun_enum DEFAULT 'Seluruh Wilayah',
    rt VARCHAR(10),
    rw VARCHAR(10),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. TABEL IDENTITAS & PROFIL PADUKUHAN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profil_padukuhan (
    id INT PRIMARY KEY DEFAULT 1,
    nama_padukuhan VARCHAR(100) DEFAULT 'Padukuhan Wonosari',
    kalurahan VARCHAR(100) DEFAULT 'Wedomartani',
    kapanewon VARCHAR(100) DEFAULT 'Ngemplak',
    kabupaten VARCHAR(100) DEFAULT 'Sleman',
    provinsi VARCHAR(100) DEFAULT 'D.I. Yogyakarta',
    tagline TEXT DEFAULT 'Harmoni Gotong Royong, Alam Asri, dan Kemandirian Warga',
    visi TEXT NOT NULL,
    misi JSONB NOT NULL,
    sejarah TEXT NOT NULL,
    sejarah_rejosari TEXT,
    sejarah_wonosari TEXT,
    sejarah_pajangan TEXT,
    nama_dukuh VARCHAR(150) DEFAULT 'Kepala Dukuh Wonosari',
    sambutan_dukuh TEXT,
    foto_dukuh_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. TABEL PENGATURAN WEB & KONTAK RESMI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pengaturan_web (
    id INT PRIMARY KEY DEFAULT 1,
    alamat_balai TEXT DEFAULT 'Balai Padukuhan Wonosari, Kalurahan Wedomartani, Ngemplak, Sleman',
    gmaps_embed_url TEXT,
    gmaps_direct_link TEXT,
    latitude NUMERIC(10, 7) DEFAULT -7.7325000,
    longitude NUMERIC(10, 7) DEFAULT 110.4285000,
    whatsapp_resmi VARCHAR(25) DEFAULT '6281234567890',
    email_resmi VARCHAR(100) DEFAULT 'padukuhan.wonosari.sleman@gmail.com',
    instagram_url TEXT,
    youtube_url TEXT,
    jam_pelayanan TEXT DEFAULT 'Senin - Jumat: 08.00 - 15.00 WIB',
    banner_pengumuman_aktif BOOLEAN DEFAULT FALSE,
    banner_pengumuman_teks TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. TABEL APARATUR PADUKUHAN & KELEMBAGAAN MASYARAKAT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS aparatur_desa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    kategori_kelembagaan VARCHAR(50) DEFAULT 'Pemerintah Padukuhan',
    wilayah_tugas dusun_enum DEFAULT 'Seluruh Wilayah',
    nomor_hp VARCHAR(25),
    foto_url TEXT,
    urutan INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pastikan kolom wilayah_tugas ada
DO $$ BEGIN
    ALTER TABLE aparatur_desa ADD COLUMN IF NOT EXISTS wilayah_tugas dusun_enum DEFAULT 'Seluruh Wilayah';
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- ==============================================================================
-- 7. TABEL DATA DEMOGRAFI & MONOGRAFI WILAYAH (PER RW & RT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS demografi_wilayah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dusun dusun_enum NOT NULL,
    rw VARCHAR(10) NOT NULL,
    rt VARCHAR(10) NOT NULL,
    nama_ketua_rt VARCHAR(150),
    jumlah_kk INT DEFAULT 0,
    jumlah_jiwa INT DEFAULT 0,
    jumlah_pria INT DEFAULT 0,
    jumlah_wanita INT DEFAULT 0,
    balita_0_5 INT DEFAULT 0,
    usia_sekolah_6_18 INT DEFAULT 0,
    usia_produktif_19_59 INT DEFAULT 0,
    lansia_60_plus INT DEFAULT 0,
    petani INT DEFAULT 0,
    wiraswasta_pedagang INT DEFAULT 0,
    karyawan_swasta INT DEFAULT 0,
    pns_tni_polri INT DEFAULT 0,
    buruh_harian INT DEFAULT 0,
    lainnya INT DEFAULT 0,
    luas_wilayah_m2 NUMERIC(12, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pastikan kolom rt & rw dapat menampung teks yang lebih fleksibel
DO $$ BEGIN
    ALTER TABLE demografi_wilayah ALTER COLUMN rt TYPE VARCHAR(50);
    ALTER TABLE demografi_wilayah ALTER COLUMN rw TYPE VARCHAR(50);
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- ==============================================================================
-- 8. TABEL ARTIKEL, BERITA & KABAR DESA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS artikel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    cover_image TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,
    status content_status DEFAULT 'APPROVED',
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. TABEL KATALOG UMKM & PRODUK WARGA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS umkm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_produk VARCHAR(150) NOT NULL,
    nama_usaha VARCHAR(150),
    nama_pemilik VARCHAR(150) NOT NULL,
    dusun dusun_enum NOT NULL,
    rt_rw VARCHAR(30),
    kategori VARCHAR(50) NOT NULL,
    harga NUMERIC(12, 2) NOT NULL,
    satuan VARCHAR(50) DEFAULT 'Pcs',
    deskripsi TEXT NOT NULL,
    foto_url TEXT,
    whatsapp_owner VARCHAR(25) NOT NULL,
    alamat_usaha TEXT,
    lokasi_gmaps_link TEXT,
    status content_status DEFAULT 'APPROVED',
    is_featured BOOLEAN DEFAULT FALSE,
    rejection_reason TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pastikan kolom lokasi_gmaps_link ada di tabel umkm
DO $$ BEGIN
    ALTER TABLE umkm ADD COLUMN IF NOT EXISTS lokasi_gmaps_link TEXT;
EXCEPTION WHEN OTHERS THEN null;
END $$;


-- ==============================================================================
-- 10. TABEL DESTINASI WISATA & SPOT LOKAL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS destinasi_wisata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_destinasi VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    dusun dusun_enum NOT NULL,
    deskripsi TEXT NOT NULL,
    htm_tiket NUMERIC(10, 2) DEFAULT 0,
    jam_buka VARCHAR(100) DEFAULT 'Setiap Hari, 06.00 - 18.00 WIB',
    fasilitas JSONB DEFAULT '["Area Parkir", "Spot Foto", "Gazebo"]'::JSONB,
    lokasi_gmaps_link TEXT,
    foto_url TEXT,
    foto_urls JSONB DEFAULT '[]'::JSONB,
    status content_status DEFAULT 'APPROVED',
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pastikan kolom foto_url, foto_urls, lokasi_gmaps_link, dan rejection_reason ada jika tabel sudah pernah dibuat sebelumnya
DO $$ BEGIN
    ALTER TABLE destinasi_wisata ADD COLUMN IF NOT EXISTS foto_url TEXT;
    ALTER TABLE destinasi_wisata ADD COLUMN IF NOT EXISTS foto_urls JSONB DEFAULT '[]'::JSONB;
    ALTER TABLE destinasi_wisata ADD COLUMN IF NOT EXISTS lokasi_gmaps_link TEXT;
    ALTER TABLE destinasi_wisata ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- ==============================================================================
-- 11. TABEL AGENDA & EVENT TRADISI BUDAYA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS agenda_budaya (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_agenda VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    waktu_kegiatan VARCHAR(50) DEFAULT '08.00 WIB - Selesai',
    lokasi TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    penanggung_jawab VARCHAR(150),
    foto_cover TEXT,
    is_selesai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 12. TABEL JADWAL POSYANDU & LAYANAN KESEHATAN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS jadwal_posyandu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_posyandu VARCHAR(100) NOT NULL,
    dusun dusun_enum NOT NULL,
    rw VARCHAR(10) NOT NULL,
    lokasi_kegiatan VARCHAR(150) NOT NULL,
    jadwal_rutin VARCHAR(100) NOT NULL,
    layanan JSONB DEFAULT '["Penimbangan BB", "Pengukuran TB", "Pemberian PMT", "Konseling Gizi", "Imunisasi"]'::JSONB,
    keterangan TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 13. TABEL KADER KESEHATAN & BIDAN DESA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS kader_kesehatan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap VARCHAR(150) NOT NULL,
    peran VARCHAR(100) NOT NULL,
    wilayah dusun_enum NOT NULL,
    whatsapp_number VARCHAR(25) NOT NULL,
    foto_url TEXT,
    is_konsultasi_aktif BOOLEAN DEFAULT TRUE,
    urutan INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 14. TABEL GALERI MEDIA DOKUMENTASI KEGIATAN DESA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS galeri_desa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    dusun dusun_enum DEFAULT 'Seluruh Wilayah',
    media_url TEXT NOT NULL,
    caption TEXT,
    tanggal_kegiatan DATE,
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status content_status DEFAULT 'APPROVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 15. TABEL REKAP SKRINING STUNTING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS stunting_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_anak_inisial VARCHAR(50) DEFAULT 'Anonim',
    nama_orang_tua VARCHAR(100),
    dusun dusun_enum DEFAULT 'Seluruh Wilayah',
    jenis_kelamin jenis_kelamin_enum NOT NULL,
    usia_bulan INT NOT NULL,
    tinggi_cm NUMERIC(5, 2) NOT NULL,
    berat_kg NUMERIC(5, 2) NOT NULL,
    z_score_tb_u NUMERIC(5, 2),
    z_score_bb_u NUMERIC(5, 2),
    status_gizi status_gizi_enum NOT NULL,
    catatan_rekomendasi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 15B. TABEL RIWAYAT MODERASI & AUDIT LOG (KONTEN DITOLAK / DISETUJUI)
-- ==============================================================================
-- Tabel ini menyimpan catatan permanen konten yang ditolak agar dapat dihapus dari tabel utama
CREATE TABLE IF NOT EXISTS riwayat_moderasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id VARCHAR(100),
    tipe VARCHAR(50) NOT NULL, -- 'umkm', 'wisata', 'artikel'
    judul VARCHAR(255) NOT NULL,
    pengusul VARCHAR(150),
    dusun VARCHAR(100),
    excerpt TEXT,
    foto_url TEXT,
    lokasi_gmaps_link TEXT,
    status VARCHAR(50) NOT NULL, -- 'APPROVED' atau 'REJECTED'
    catatan_penolakan TEXT,
    dimoderasi_oleh VARCHAR(150),
    raw_payload JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 16. PENGATURAN ROW LEVEL SECURITY (RLS) - PERMISIF UNTUK KLIEN WEB RESMI
-- ==============================================================================
-- Mengaktifkan RLS
ALTER TABLE profil_padukuhan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan_web ENABLE ROW LEVEL SECURITY;
ALTER TABLE aparatur_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE demografi_wilayah ENABLE ROW LEVEL SECURITY;
ALTER TABLE artikel ENABLE ROW LEVEL SECURITY;
ALTER TABLE umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinasi_wisata ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_budaya ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_posyandu ENABLE ROW LEVEL SECURITY;
ALTER TABLE kader_kesehatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE stunting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeri_desa ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_moderasi ENABLE ROW LEVEL SECURITY;

-- Reset dan buat policy terbuka agar aplikasi web frontend dapat membaca & menulis data dengan lancar
DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profil_padukuhan', 'pengaturan_web', 'aparatur_desa', 'demografi_wilayah',
        'artikel', 'umkm', 'destinasi_wisata', 'agenda_budaya', 'jadwal_posyandu',
        'kader_kesehatan', 'stunting_records', 'galeri_desa', 'users', 'riwayat_moderasi'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "policy_all_access_%s" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "policy_all_access_%s" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- 17. SEED DATA LENGKAP & RIIL PADUKUHAN WONOSARI (DENGAN GAMBAR ASLI)
-- ==============================================================================

-- 17.1. DATA PENGGUNA AWAL (Pak Dukuh, Admin KKN, Kontributor)
INSERT INTO users (email, full_name, role, phone_number, dusun, rt, rw) VALUES
('dukuh.wonosari@wedomartani.desa.id', 'Bapak Kepala Dukuh Wonosari', 'padukuh', '6281234567890', 'Seluruh Wilayah', '-', '-'),
('admin.kkn57@uii.ac.id', 'Admin Sistem & KKN UII Unit 57', 'admin', '6281234567899', 'Seluruh Wilayah', '-', '-'),
('kontributor.warga@wonosari.id', 'Kontributor Warga / Karang Taruna', 'kontributor', '6281234567898', 'Wonosari', 'RT 02', 'RW 17')
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 17.2. PROFIL RESMI PADUKUHAN
INSERT INTO profil_padukuhan (
    id, nama_padukuhan, kalurahan, kapanewon, kabupaten, provinsi,
    tagline, visi, misi, sejarah, nama_dukuh, sambutan_dukuh
) VALUES (
    1,
    'Padukuhan Wonosari',
    'Wedomartani',
    'Ngemplak',
    'Sleman',
    'D.I. Yogyakarta',
    'Harmoni Gotong Royong, Alam Asri, dan Kemandirian Warga',
    'Mewujudkan Padukuhan Wonosari yang mandiri, sejahtera, berdaya saing, dan berbudaya luhur berbasis potensi pertanian, UMKM, dan kearifan lokal.',
    '["Meningkatkan produktivitas pertanian dan ketahanan pangan warga", "Mendorong kemajuan UMKM lokal berbasis digital dan jejaring kolaborasi", "Menjaga kelestarian tradisi seni, merti dusun, dan kerukunan warga", "Mewujudkan pelayanan kesehatan ibu, anak, dan lansia yang prima dan bebas stunting", "Membangun keterbukaan informasi dan tata kelola padukuhan yang akuntabel"]'::JSONB,
    'Padukuhan Wonosari merupakan bagian integral dari Kalurahan Wedomartani di Kapanewon Ngemplak, Sleman. Wilayah ini secara historis tersusun dari tiga kampung bersejarah: Kampung Rejosari (RW 18), Kampung Wonosari (RW 17), dan Kampung Pajangan (RW 16). Nama Wonosari berakar dari kata Wono (hutan/alam yang hijau dan asri) dan Sari (keindahan atau inti kebaikan), mencerminkan tanah yang subur di lereng selatan Gunung Merapi.',
    'Bapak Kepala Dukuh Wonosari',
    'Sugeng rawuh wonten ing website resmi Padukuhan Wonosari. Portal digital punika minangka sarana paseduluran, transparansi tata kelola, ugi media promosi potensi ageng para warga. Mugi website menika mupangati tumrap sedaya masyarakat.'
) ON CONFLICT (id) DO UPDATE SET 
    visi = EXCLUDED.visi, misi = EXCLUDED.misi, sejarah = EXCLUDED.sejarah, sambutan_dukuh = EXCLUDED.sambutan_dukuh;

-- 17.3. PENGATURAN WEB & KONTAK
INSERT INTO pengaturan_web (
    id, alamat_balai, whatsapp_resmi, email_resmi, jam_pelayanan,
    banner_pengumuman_aktif, banner_pengumuman_teks
) VALUES (
    1,
    'Padukuhan Wonosari, Kalurahan Wedomartani, Kapanewon Ngemplak, Kabupaten Sleman, D.I. Yogyakarta 55584',
    '6281234567890',
    'padukuhan.wonosari.sleman@gmail.com',
    'Senin - Jumat: 08.00 - 15.00 WIB',
    TRUE,
    'Selamat Datang di Portal Resmi Padukuhan Wonosari — KKN UII Angkatan 73 Unit 57'
) ON CONFLICT (id) DO UPDATE SET alamat_balai = EXCLUDED.alamat_balai, whatsapp_resmi = EXCLUDED.whatsapp_resmi;

-- 17.4. APARATUR & KELEMBAGAAN DESA LENGKAP 3 DUSUN & GABUNGAN
DELETE FROM aparatur_desa;
INSERT INTO aparatur_desa (nama, jabatan, kategori_kelembagaan, wilayah_tugas, nomor_hp, urutan) VALUES
('Bapak Kepala Dukuh Wonosari', 'Kepala Dukuh Wonosari', 'Pemerintah Padukuhan', 'Seluruh Wilayah', '6281234567890', 1),
('Ketua RW 18 Rejosari', 'Ketua RW 18', 'Pemerintah Padukuhan', 'Rejosari', '6281234567818', 2),
('Ketua RW 17 Wonosari', 'Ketua RW 17', 'Pemerintah Padukuhan', 'Wonosari', '6281234567817', 3),
('Ketua RW 16 Pajangan', 'Ketua RW 16', 'Pemerintah Padukuhan', 'Pajangan', '6281234567816', 4),
('Ketua RT 01 Pajangan', 'Ketua RT 01', 'Pemerintah Padukuhan', 'Pajangan', '6281234567801', 5),
('Ketua RT 02 Wonosari', 'Ketua RT 02', 'Pemerintah Padukuhan', 'Wonosari', '6281234567802', 6),
('Ketua RT 03 Wonosari', 'Ketua RT 03', 'Pemerintah Padukuhan', 'Wonosari', '6281234567803', 7),
('Ketua RT 04 Rejosari', 'Ketua RT 04', 'Pemerintah Padukuhan', 'Rejosari', '6281234567804', 8),
('Ketua RT 05 Rejosari', 'Ketua RT 05', 'Pemerintah Padukuhan', 'Rejosari', '6281234567805', 9),
('Ketua TP-PKK Wonosari', 'Ketua Pemberdayaan Perempuan', 'Kelembagaan Masyarakat', 'Seluruh Wilayah', '6281234567820', 10),
('Ketua Karang Taruna Padukuhan', 'Koordinator Pemuda & Olahraga', 'Kelembagaan Masyarakat', 'Seluruh Wilayah', '6281234567821', 11),
('Komandan Linmas Wonosari', 'Ketenteraman & Ketertiban', 'Kelembagaan Masyarakat', 'Seluruh Wilayah', '6281234567822', 12),
('Pengurus Karang Taruna Rejosari', 'Koordinator Pemuda Rejosari', 'Kelembagaan Masyarakat', 'Rejosari', '6281234567823', 13),
('Pengurus Karang Taruna Pajangan', 'Koordinator Pemuda Pajangan', 'Kelembagaan Masyarakat', 'Pajangan', '6281234567824', 14),
('Pengelola Bank Sampah BASAH', 'Koordinator Lingkungan Hidup', 'Kelembagaan Masyarakat', 'Rejosari', '6281234567825', 15);

-- 17.5. DEMOGRAFI WILAYAH (5 RT LENGKAP)
DELETE FROM demografi_wilayah;
INSERT INTO demografi_wilayah (dusun, rw, rt, nama_ketua_rt, jumlah_kk, jumlah_jiwa, jumlah_pria, jumlah_wanita, balita_0_5, usia_sekolah_6_18, usia_produktif_19_59, lansia_60_plus, petani, wiraswasta_pedagang, karyawan_swasta, pns_tni_polri, buruh_harian, lainnya) VALUES
('Rejosari', 'RW 18', 'RT 04', 'Ketua RT 04 Rejosari', 42, 148, 73, 75, 12, 34, 88, 14, 25, 18, 32, 8, 12, 10),
('Rejosari', 'RW 18', 'RT 05', 'Ketua RT 05 Rejosari', 39, 136, 67, 69, 10, 28, 82, 16, 22, 15, 30, 6, 14, 8),
('Wonosari', 'RW 17', 'RT 02', 'Ketua RT 02 Wonosari', 46, 162, 80, 82, 14, 38, 94, 16, 20, 24, 38, 10, 8, 12),
('Wonosari', 'RW 17', 'RT 03', 'Ketua RT 03 Wonosari', 44, 155, 76, 79, 13, 35, 91, 16, 18, 22, 36, 12, 10, 11),
('Pajangan', 'RW 16', 'RT 01', 'Ketua RT 01 Pajangan', 41, 143, 70, 73, 11, 31, 86, 15, 26, 16, 28, 5, 15, 9);

-- 17.6. KATALOG UMKM WARGA DENGAN FOTO PRODUK ASLI
DELETE FROM umkm;
INSERT INTO umkm (nama_produk, nama_usaha, nama_pemilik, dusun, rt_rw, kategori, harga, satuan, deskripsi, foto_url, whatsapp_owner, lokasi_gmaps_link, status, is_featured) VALUES
(
    'Peyek Kacang & Peyek Teri Renyah',
    'Peyek Berkah Bu Siti',
    'Ibu Siti',
    'Rejosari',
    'RT 04 / RW 18',
    'Olahan Pangan & Keripik',
    15000,
    'Bungkus 250gr',
    'Peyek gurih renyah dengan racikan bumbu rempah tradisional daun jeruk purut, tanpa bahan pengawet. Tersedia varian kacang tanah dan teri gurih.',
    'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=800&auto=format&fit=crop',
    '6281234567801',
    'https://maps.google.com/?q=Rejosari+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    TRUE
),
(
    'Keripik Pisang Rasa Manis & Asin',
    'Snack Barokah Wonosari',
    'Bapak Hartono',
    'Wonosari',
    'RT 02 / RW 17',
    'Olahan Pangan & Keripik',
    12000,
    'Bungkus 200gr',
    'Dibuat dari pisang kepok pilihan kebun sendiri di Padukuhan Wonosari. Renyah, gurih, dan higienis diproduksi langsung dari dapur warga.',
    'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?q=80&w=800&auto=format&fit=crop',
    '6281234567802',
    'https://maps.google.com/?q=Wonosari+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    TRUE
),
(
    'Telur Bebek & Telur Asin Masir',
    'Ternak Bebek Makmur Pajangan',
    'Bapak Sukirman',
    'Pajangan',
    'RT 01 / RW 16',
    'Pertanian & Bibit',
    3500,
    'Butir',
    'Telur asin berkualitas kuning berminyak dan masir dari pakan alami dedak dan keong sawah di lereng persawahan Pajangan.',
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=800&auto=format&fit=crop',
    '6281234567803',
    'https://maps.google.com/?q=Pajangan+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    TRUE
),
(
    'Kerajinan Anyaman Bambu & Kriya Rumah',
    'Kriya Asri Rejosari',
    'Ibu Mursinah',
    'Rejosari',
    'RT 05 / RW 18',
    'Kerajinan Tangan',
    35000,
    'Pcs',
    'Keranjang hias, wadah serbaguna, dan tempat bumbu dapur anyaman bambu petung alami karya tangan terampil lansia dan ibu-ibu Rejosari.',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    '6281234567804',
    'https://maps.google.com/?q=Rejosari+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    FALSE
),
(
    'Madu Klanceng Murni Trigona',
    'Lebah Sejahtera Pajangan',
    'Mas Danang',
    'Pajangan',
    'RT 01 / RW 16',
    'Olahan Pangan & Keripik',
    85000,
    'Botol 250ml',
    'Madu lebah tanpa sengat (Trigona) asli hasil budidaya vegetasi bunga pekarangan Pajangan. Berkhasiat tinggi untuk daya tahan tubuh dan lambung.',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop',
    '6281234567805',
    'https://maps.google.com/?q=Pajangan+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    TRUE
),
(
    'Jamu Tradisional Kunir Asam & Beras Kencur',
    'Jamu Gendong Bu Warsiti',
    'Ibu Warsiti',
    'Wonosari',
    'RT 03 / RW 17',
    'Kuliner Tradisional',
    8000,
    'Botol 500ml',
    'Diracik dari rimpang kunyit, asam jawa kawak, kencur wangi, dan gula aren asli. Segar berkhasiat melancarkan peredaran darah.',
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800&auto=format&fit=crop',
    '6281234567806',
    'https://maps.google.com/?q=Wonosari+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    FALSE
);

-- 17.7. DESTINASI WISATA LENGKAP DENGAN FOTO ASLI
DELETE FROM destinasi_wisata;
INSERT INTO destinasi_wisata (nama_destinasi, kategori, dusun, deskripsi, htm_tiket, fasilitas, foto_url, foto_urls, lokasi_gmaps_link, status, is_featured) VALUES
(
    'Agrowisata Jalur Persawahan Hijau View Merapi',
    'Wisata Alam & Pertanian',
    'Rejosari',
    'Hamparan sawah beririgasi teknis nan hijau dengan latar panorama megah Gunung Merapi di pagi hari. Lokasi favorit warga dan pelari santai untuk bersepeda, jogging, serta edukasi bertani.',
    0,
    '["Pematang Sawah Lebar", "Spot Sunrise Merapi", "Udara Bersih Sejuk", "Akses Sepeda Santai"]'::JSONB,
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop"]'::JSONB,
    'https://maps.google.com/?q=Agrowisata+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    TRUE
),
(
    'Wisata Edukasi Lingkungan Bank Sampah BASAH',
    'Wisata Edukasi Lingkungan',
    'Rejosari',
    'Pusat pembelajaran kelestarian lingkungan berbasis pemberdayaan warga mandiri. Pengunjung dapat melihat pemilahan sampah anorganik, pembuatan ecobrick, budidaya maggot, hingga pupuk kompos alami.',
    0,
    '["Ruang Edukasi Warga", "Timbangan Digital", "Rumah Kompos Organik", "Galeri Tas Anyaman Daur Ulang"]'::JSONB,
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop"]'::JSONB,
    'https://maps.google.com/?q=Bank+Sampah+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    TRUE
),
(
    'Pendopo Budaya & Kenduri Padukuhan Wonosari',
    'Wisata Seni & Tradisi',
    'Wonosari',
    'Jantung perhelatan kebudayaan Jawa. Tempat berkumpulnya para sesepuh dan warga untuk upacara Merti Dusun, doa bersama Nyadran, dan latihan karawitan gamelan tradisional.',
    0,
    '["Pendopo Jawa Asri", "Perangkat Gamelan Lengkap", "Halaman Parkir Luas", "Toilet & Balai Pertemuan"]'::JSONB,
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop"]'::JSONB,
    'https://maps.google.com/?q=Balai+Padukuhan+Wonosari+Wedomartani',
    'APPROVED',
    FALSE
),
(
    'Sentra Edukasi Madu Klanceng & Peternakan Bebek Pajangan',
    'Wisata Alam & Pertanian',
    'Pajangan',
    'Wisata peternakan edukatif bagi keluarga dan anak sekolah untuk mengenal siklus lebah klanceng tanpa sengat dan cara pembuatan telur asin masir alami.',
    0,
    '["Kebun Bunga Lebah", "Icip Madu Langsung Sedot", "Area Parkir Teduh"]'::JSONB,
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop"]'::JSONB,
    'https://maps.google.com/?q=Pajangan+Wedomartani+Ngemplak+Sleman',
    'APPROVED',
    TRUE
);

-- 17.8. ARTIKEL & WARTA BERITA DESA LENGKAP DENGAN COVER ASLI
DELETE FROM artikel;
INSERT INTO artikel (title, slug, category, cover_image, excerpt, content, author_name, status, is_featured) VALUES
(
    'Pelatihan Desain Kemasan Standing Pouch bagi UMKM oleh Tim KKN UII 57',
    'pelatihan-desain-kemasan-standing-pouch-umkm-kkn-uii-57',
    'Kegiatan KKN',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop',
    'Tim KKN UII Unit 57 menggelar bimbingan teknis pembuatan label kemasan kedap udara dan strategi pemasaran digital untuk meningkatkan nilai jual produk unggulan warga Wonosari.',
    'Menindaklanjuti potensi UMKM olahan pangan di Padukuhan Wonosari seperti Peyek Bu Siti dan Keripik Barokah, Tim KKN UII Angkatan 73 Unit 57 menyelenggarakan lokakarya pengemasan produk. Pelatihan berfokus pada teknik perancangan label stiker tahan minyak, penggunaan standing pouch klip tebal, serta pencantuman informasi komposisi dan tanggal kedaluwarsa sesuai regulasi P-IRT. Diharapkan produk warga dapat menembus pasar oleh-oleh modern di Yogyakarta.',
    'Tim KKN UII Unit 57',
    'APPROVED',
    TRUE
),
(
    'Guyub Rukun Kerja Bakti Sambatan Saluran Irigasi Teknis Jelang Musim Tanam',
    'guyub-rukun-kerja-bakti-sambatan-saluran-irigasi-teknis',
    'Kabar Desa',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop',
    'Ratusan warga Kampung Rejosari dan Pajangan bahu-membahu membersihkan endapan lumpur dan gulma di sepanjang saluran tersier persawahan demi kelancaran pasokan air sawah.',
    'Kegiatan gotong royong sambatan irigasi kembali digalakkan warga Padukuhan Wonosari menyambut awal musim tanam padi. Dimulai sejak pukul 06.30 WIB, warga membawa cangkul dan sabit untuk mengeruk sedimentasi tanah di saluran tersier. Tradisi gotong royong ini tidak hanya memastikan pembagian air irigasi yang merata ke petak sawah, namun juga menjadi ruang silaturahmi antarwarga tiga kampung.',
    'Pengurus RT 04 Rejosari',
    'APPROVED',
    TRUE
),
(
    'Skrining Tumbuh Kembang & Edukasi MP-ASI Bergizi di Posyandu Balita Dahlia',
    'skrining-tumbuh-kembang-edukasi-mpasi-posyandu-dahlia',
    'Kesehatan & Posyandu',
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop',
    'Kader Kesehatan Padukuhan Wonosari bersama Bidan Desa melaksanakan penimbangan berat badan balita, pengukuran tinggi badan, serta pembagian makanan tambahan (PMT) berbahan pangan lokal.',
    'Upaya pencegahan stunting terus diprioritaskan oleh Pemerintah Padukuhan Wonosari. Dalam penimbangan rutin bulanan di Posyandu Balita Dahlia, tercatat puluhan balita hadir didampingi orang tua. Selain pemeriksaan fisik, kader kesehatan memberikan demonstrasi resep MP-ASI bergizi seimbang berbahan telur bebek dan sayuran pekarangan desa.',
    'Kader Posyandu Rejosari',
    'APPROVED',
    FALSE
),
(
    'Merti Dusun Wonosari: Melestarikan Adat Luhur & Mensyukuri Kelimpahan Hasil Bumi',
    'merti-dusun-wonosari-melestarikan-adat-luhur',
    'Seni & Budaya',
    'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop',
    'Rangkaian upacara adat Merti Dusun dimeriahkan dengan kirab gunungan hasil bumi dan doa bersama kenduri lintas kampung sebagai wujud syukur atas rezeki dan kerukunan.',
    'Sebagai padukuhan yang menjunjung tinggi kebudayaan Jawa, Merti Dusun menjadi tradisi sakral tahunan di Padukuhan Wonosari. Tiga kampung berpadu menyusun gunungan hasil pertanian seperti padi, sayur-mayur, dan buah-buahan sebelum diarak menuju Balai Padukuhan untuk kenduri doa bersama para sesepuh desa.',
    'Karang Taruna Padukuhan',
    'APPROVED',
    TRUE
);

-- 17.9. GALERI DOKUMENTASI DESA
DELETE FROM galeri_desa;
INSERT INTO galeri_desa (judul, kategori, dusun, media_url, caption, tanggal_kegiatan, status) VALUES
(
    'Pawai Gunungan Hasil Bumi Merti Dusun',
    'Adat & Budaya',
    'Wonosari',
    'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800&auto=format&fit=crop',
    'Warga mengarak gunungan hasil bumi di jalan utama kampung menuju Balai Padukuhan.',
    '2026-08-17',
    'APPROVED'
),
(
    'Kerja Bakti Saluran Irigasi Sambatan',
    'Gotong Royong',
    'Rejosari',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop',
    'Bapak-bapak warga membersihkan sedimentasi saluran air sawah.',
    '2026-09-01',
    'APPROVED'
),
(
    'Pelatihan Kemasan UMKM Tim KKN 57',
    'Pendidikan',
    'Wonosari',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop',
    'Sesi praktik desain kemasan stiker dan standing pouch bersama ibu-ibu pelaku UMKM.',
    '2026-09-05',
    'APPROVED'
),
(
    'Pemilahan Sampah Organik di Bank Sampah BASAH',
    'Lingkungan',
    'Rejosari',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800&auto=format&fit=crop',
    'Edukasi daur ulang sampah dan pembuatan kompos pekarangan.',
    '2026-08-28',
    'APPROVED'
),
(
    'Penimbangan Balita di Posyandu Dahlia',
    'Posyandu',
    'Pajangan',
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop',
    'Pemeriksaan rutin status gizi dan tumbuh kembang balita oleh kader posyandu.',
    '2026-09-02',
    'APPROVED'
),
(
    'Panorama Sawah Hijau Lereng Merapi',
    'Pertanian',
    'Rejosari',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
    'Keasrian alam persawahan terasering berlatar Gunung Merapi saat pagi hari.',
    '2026-09-04',
    'APPROVED'
);

-- 17.10. AGENDA BUDAYA
DELETE FROM agenda_budaya;
INSERT INTO agenda_budaya (nama_agenda, kategori, tanggal_mulai, waktu_kegiatan, lokasi, deskripsi, penanggung_jawab) VALUES
('Upacara Tradisi Merti Dusun Wonosari', 'Tradisi Adat', '2026-10-15', '07.30 WIB - Selesai', 'Balai Padukuhan & Keliling 3 Kampung', 'Pawai gunungan hasil bumi, kenduri akbar warga Rejosari, Wonosari, dan Pajangan sebagai wujud syukur atas rezeki panen.', 'Pengurus Padukuhan Wonosari'),
('Kerja Bakti Bersih Saluran Irigasi Sambatan', 'Kerja Bakti', '2026-09-20', '06.30 WIB - 10.00 WIB', 'Saluran Irigasi Rejosari & Pajangan', 'Gotong royong membersihkan sedimentasi saluran irigasi sawah menyambut musim tanam padi.', 'Kelompok Tani Padukuhan');

-- 17.11. JADWAL POSYANDU & KADER
DELETE FROM jadwal_posyandu;
INSERT INTO jadwal_posyandu (nama_posyandu, dusun, rw, lokasi_kegiatan, jadwal_rutin, keterangan) VALUES
('Posyandu Balita Dahlia (Rejosari)', 'Rejosari', 'RW 18', 'Balai Warga RT 04', 'Setiap Tanggal 10, Pukul 08.30 WIB', 'Penimbangan balita, pemantauan status stunting, dan PMT gizi lokal.'),
('Posyandu Balita Melati (Wonosari)', 'Wonosari', 'RW 17', 'Rumah Ibu Dukuh / Balai RW 17', 'Setiap Tanggal 15, Pukul 09.00 WIB', 'Skrining tumbuh kembang, imunisasi dasar lengkap, dan edukasi MP-ASI.'),
('Posyandu Balita Kenanga (Pajangan)', 'Pajangan', 'RW 16', 'Balai RT 01 Pajangan', 'Setiap Tanggal 20, Pukul 08.30 WIB', 'Layanan balita & pemantauan gizi ibu hamil.');

DELETE FROM kader_kesehatan;
INSERT INTO kader_kesehatan (nama_lengkap, peran, wilayah, whatsapp_number, urutan) VALUES
('Bidan Desa Wedomartani', 'Bidan Pembina Wilayah Padukuhan Wonosari', 'Seluruh Wilayah', '6281234567900', 1),
('Ibu Ketua Kader Posyandu Rejosari', 'Kader Pembangunan Manusia (KPM)', 'Rejosari', '6281234567901', 2),
('Ibu Kader Posyandu Wonosari', 'Koordinator Gizi & Balita RW 17', 'Wonosari', '6281234567902', 3),
('Ibu Kader Posyandu Pajangan', 'Koordinator Balita RW 16', 'Pajangan', '6281234567903', 4);

-- Refresh otomatis schema cache Supabase agar seluruh tabel & kolom langsung terdeteksi
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- SELESAI: SELURUH SKEMA & DATA TERPADU DALAM 1 FILE SQL INI
-- ==============================================================================
