"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Preloader from "./Preloader";

export default function SplashHandler() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Cek apakah load ini berasal dari browser reload / refresh (F5 / Ctrl+R / tombol refresh)
    let isReload = false;
    try {
      const navEntries = window.performance?.getEntriesByType?.("navigation");
      if (navEntries && navEntries.length > 0) {
        isReload = (navEntries[0] as PerformanceNavigationTiming).type === "reload";
      } else if (window.performance && "navigation" in window.performance) {
        // Fallback untuk browser lawas (type 1 = TYPE_RELOAD)
        isReload = (window.performance as unknown as { navigation: { type: number } }).navigation.type === 1;
      }
    } catch {
      isReload = false;
    }

    const hasVisited = sessionStorage.getItem("wonosari_session_visited");

    // Splash screen HANYA muncul saat refresh browser atau saat pertama kali membuka web
    if (isReload || !hasVisited) {
      sessionStorage.setItem("wonosari_session_visited", "true");
      setShowSplash(true);

      // Jika di-refresh dari halaman mana pun, otomatis kembali ke Beranda (/)
      if (window.location.pathname !== "/") {
        window.history.replaceState(null, "", "/");
        router.replace("/");
      }
    }
  }, [router]);

  if (!showSplash) return null;

  return <Preloader onComplete={() => setShowSplash(false)} />;
}
