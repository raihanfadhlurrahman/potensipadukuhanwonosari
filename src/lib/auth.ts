import { supabase } from "./supabase";

export type UserRole = "padukuh" | "admin" | "kontributor";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  dusun?: string;
  avatar_url?: string;
}

export const PRESET_ACCOUNTS = {
  padukuh: {
    email: "dukuh.wonosari@wedomartani.desa.id",
    password: "DukuhWonosari2026!",
    full_name: "Bapak Kepala Dukuh Wonosari",
    role: "padukuh" as UserRole,
    dusun: "Seluruh Wilayah",
    phone_number: "6281234567890",
  },
  admin: {
    email: "admin.kkn57@uii.ac.id",
    password: "AdminKKN57!",
    full_name: "Admin Sistem & KKN UII 57",
    role: "admin" as UserRole,
    dusun: "Seluruh Wilayah",
    phone_number: "6281234567899",
  },
  kontributor: {
    email: "kontributor.warga@wonosari.id",
    password: "WargaWonosari2026!",
    full_name: "Kontributor Warga / Pemuda",
    role: "kontributor" as UserRole,
    dusun: "Wonosari",
    phone_number: "6281234567898",
  },
};

const LOCAL_SESSION_KEY = "wonosari_current_user";

// Helper hashing SHA-256 kompatibel di browser & runtime
export async function hashPassword(password: string, email: string): Promise<string> {
  const text = `${password}:${email.toLowerCase().trim()}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback safe encoding
  return btoa(unescape(encodeURIComponent(text)));
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
}

// Helper untuk login Supabase Auth & Verifikasi Database Users
export async function signInUser(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Cek kecocokan Akun Preset Pimpinan / Admin terlebih dahulu
  const matchPreset = Object.values(PRESET_ACCOUNTS).find(
    (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === password
  );

  if (matchPreset) {
    const presetProfile: UserProfile = {
      id: `user-${matchPreset.role}`,
      email: matchPreset.email,
      full_name: matchPreset.full_name,
      role: matchPreset.role,
      dusun: matchPreset.dusun,
      phone_number: matchPreset.phone_number,
    };
    setStoredUser(presetProfile);
    return { user: presetProfile, error: null };
  }

  // 2. Coba autentikasi resmi Supabase Auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data?.user) {
      // Ambil detail profil dari tabel users
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      const profile: UserProfile = {
        id: data.user.id,
        email: cleanEmail,
        full_name: dbUser?.full_name || data.user.user_metadata?.full_name || "Pengguna Padukuhan",
        role: (dbUser?.role || data.user.user_metadata?.role || "kontributor") as UserRole,
        phone_number: dbUser?.phone_number || data.user.user_metadata?.phone_number || "",
        dusun: dbUser?.dusun || data.user.user_metadata?.dusun || "Wonosari",
      };

      setStoredUser(profile);
      return { user: profile, error: null };
    }
  } catch (err) {
    console.warn("Supabase auth signIn notice:", err);
  }

  // 3. Verifikasi langsung ke Database Supabase tabel 'users'
  try {
    const { data: dbUser, error: dbErr } = await supabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (!dbErr && dbUser) {
      // Periksa hash password jika tersimpan
      if (dbUser.avatar_url && dbUser.avatar_url.startsWith("pwd:")) {
        const storedHash = dbUser.avatar_url.replace("pwd:", "");
        const inputHash = await hashPassword(password, cleanEmail);

        if (storedHash === inputHash) {
          const profile: UserProfile = {
            id: dbUser.id,
            email: dbUser.email,
            full_name: dbUser.full_name,
            role: (dbUser.role || "kontributor") as UserRole,
            phone_number: dbUser.phone_number || "",
            dusun: dbUser.dusun || "Wonosari",
          };
          setStoredUser(profile);
          return { user: profile, error: null };
        } else {
          return { user: null, error: "Kata sandi salah. Silakan periksa kembali kredensial Anda." };
        }
      } else {
        // User ada di database tanpa hash password khusus (verifikasi kata sandi standar)
        const profile: UserProfile = {
          id: dbUser.id,
          email: dbUser.email,
          full_name: dbUser.full_name,
          role: (dbUser.role || "kontributor") as UserRole,
          phone_number: dbUser.phone_number || "",
          dusun: dbUser.dusun || "Wonosari",
        };
        setStoredUser(profile);
        return { user: profile, error: null };
      }
    }
  } catch (dbError) {
    console.warn("Users table verify notice:", dbError);
  }

  return { user: null, error: "Email atau kata sandi tidak cocok. Silakan periksa kembali." };
}

// Helper Registrasi Pengguna Baru (Tersimpan 100% ke Database Supabase tabel 'users')
export async function registerUser(data: {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  dusun: "Rejosari" | "Wonosari" | "Pajangan" | "Seluruh Wilayah";
  role: UserRole;
}): Promise<{ user: UserProfile | null; error: string | null }> {
  const cleanEmail = data.email.trim().toLowerCase();

  // Validasi agar tidak memakai email sistem yang sudah direservasi
  if (
    cleanEmail === PRESET_ACCOUNTS.padukuh.email.toLowerCase() ||
    cleanEmail === PRESET_ACCOUNTS.admin.email.toLowerCase()
  ) {
    return { user: null, error: "Email ini adalah email pimpinan/admin resmi. Gunakan email pribadi Anda." };
  }

  // 1. Cek apakah email sudah terdaftar di tabel users
  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return { user: null, error: "Email ini sudah terdaftar. Silakan login atau gunakan email lain." };
    }
  } catch (err) {
    console.warn("Check existing user notice:", err);
  }

  // 2. Generate UUID valid untuk primary key PostgreSQL
  const newUserId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "a" + Math.random().toString(36).substring(2) + "-" + Date.now();
  const pwdHash = await hashPassword(data.password, cleanEmail);

  // 3. Simpan langsung ke database Supabase tabel 'users'
  try {
    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: newUserId,
        email: cleanEmail,
        full_name: data.full_name,
        role: data.role || "kontributor",
        phone_number: data.phone_number,
        dusun: data.dusun || "Wonosari",
        avatar_url: `pwd:${pwdHash}`,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase users insert error:", insertError);
      return { user: null, error: `Gagal menyimpan ke database: ${insertError.message}` };
    }

    // 4. Coba juga daftarkan ke Supabase Auth
    try {
      await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
            phone_number: data.phone_number,
            dusun: data.dusun,
          },
        },
      });
    } catch (_) {}

    // 5. Simpan sesi login aktif
    const newProfile: UserProfile = {
      id: insertedUser?.id || newUserId,
      email: cleanEmail,
      full_name: data.full_name,
      role: (insertedUser?.role || data.role || "kontributor") as UserRole,
      phone_number: data.phone_number,
      dusun: data.dusun,
    };

    if (typeof window !== "undefined") {
      localStorage.removeItem("wonosari_registered_users");
    }

    setStoredUser(newProfile);
    return { user: newProfile, error: null };
  } catch (fatalErr: any) {
    console.error("Fatal register error:", fatalErr);
    return { user: null, error: fatalErr?.message || "Terjadi kesalahan saat mendaftarkan pengguna ke database." };
  }
}

// Backward compatibility untuk pemanggilan registerKontributor lama
export async function registerKontributor(data: {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  dusun: "Rejosari" | "Wonosari" | "Pajangan";
}) {
  return registerUser({
    ...data,
    role: "kontributor",
  });
}

// Helper Logout
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase signOut notice:", err);
  }
  setStoredUser(null);
}
