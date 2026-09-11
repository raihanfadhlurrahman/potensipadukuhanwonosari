-- ==============================================================================
-- MIGRASI TABEL SARANA & PRASARANA PADUKUHAN WONOSARI
-- Idempoten: Aman dijalankan berulang kali baik jika tabel sudah ada maupun baru dibuat
-- ==============================================================================

-- 1. Buat tabel sarana_prasarana jika belum ada
CREATE TABLE IF NOT EXISTS sarana_prasarana (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'Fasilitas Umum',
    lokasi TEXT,
    kondisi TEXT DEFAULT 'Baik',
    deskripsi TEXT,
    foto_url TEXT,
    gmaps_url TEXT,
    status TEXT DEFAULT 'APPROVED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Pastikan semua kolom yang dibutuhkan tersedia jika tabel sebelumnya sudah dibuat
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS nama TEXT;
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS nama_sarana TEXT;

-- Hilangkan constraint NOT NULL pada nama_sarana jika tabel lama memilikinya
DO $$ 
BEGIN
    ALTER TABLE sarana_prasarana ALTER COLUMN nama_sarana DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN null;
END $$;
DO $$ 
BEGIN
    ALTER TABLE sarana_prasarana ALTER COLUMN nama DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN null;
END $$;
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS kategori TEXT DEFAULT 'Fasilitas Umum';
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS lokasi TEXT;
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS lokasi_dusun TEXT;

-- Hilangkan constraint NOT NULL pada lokasi_dusun jika tabel lama memilikinya
DO $$ 
BEGIN
    ALTER TABLE sarana_prasarana ALTER COLUMN lokasi_dusun DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN null;
END $$;
DO $$ 
BEGIN
    ALTER TABLE sarana_prasarana ALTER COLUMN lokasi DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN null;
END $$;
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS kondisi TEXT DEFAULT 'Baik';
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS deskripsi TEXT;
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS gmaps_url TEXT;
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'APPROVED';
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sarana_prasarana ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE sarana_prasarana ENABLE ROW LEVEL SECURITY;

-- 4. Buat Kebijakan Akses (Policy) Terbuka agar Frontend dapat membaca, menambah, mengedit, dan menghapus
DROP POLICY IF EXISTS "policy_all_access_sarana_prasarana" ON sarana_prasarana;
CREATE POLICY "policy_all_access_sarana_prasarana" 
ON sarana_prasarana 
FOR ALL 
USING (true) 
WITH CHECK (true);