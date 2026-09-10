import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kutfzveeukwmairsfqdy.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_Esw6sfgBf2uwX_nT0kg0cA_ELe-JyVT";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
);

if (!isSupabaseConfigured && process.env.NODE_ENV === "development") {
  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL atau Anon/Publishable Key belum terkonfigurasi di .env.local, menggunakan nilai default."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

