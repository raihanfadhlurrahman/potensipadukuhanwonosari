"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const welcomeTexts = [
  "Sugeng Rawuh...",
  "Selamat Datang...",
  "Welcome...",
];

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);
  const [currentTextIdx, setCurrentTextIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setShow(false), 300);
          return 100;
        }
        return prev + 3;
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Cycle welcome texts
  useEffect(() => {
    const textTimer = setInterval(() => {
      setCurrentTextIdx((prev) => (prev + 1) % welcomeTexts.length);
    }, 600);
    return () => clearInterval(textTimer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAF6F0]"
        >
          {/* Decorative background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -40, 20, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-[#FCE8EC]/60 to-[#EBF2DC]/40 blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -30, 20, 0],
                y: [0, 30, -30, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-[#EBF2DC]/50 to-[#FCE8EC]/30 blur-3xl"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
            {/* Logo with pulse */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
              className="relative w-28 h-28 mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-[#EF6C85]/10 blur-xl"
              />
              <Image
                src="/images/logounit_Warna.PNG"
                alt="Logo Unit 57"
                fill
                className="object-contain relative z-10"
                priority
              />
            </motion.div>

            {/* Title with stagger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1E251E] mb-1">
                {"PADUKUHAN WONOSARI".split("").map((char, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.03, duration: 0.3 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-[#9DB368] font-medium mb-2"
            >
              Wedomartani, Ngemplak, Sleman
            </motion.p>

            {/* Rotating welcome text */}
            <div className="h-6 mb-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTextIdx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-[#1E251E]/50 italic"
                >
                  {welcomeTexts[currentTextIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EFE7DC] h-1.5 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#EF6C85] to-[#9DB368]"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="flex justify-between w-full text-xs text-[#1E251E]/60">
              <span className="font-medium">Memuat Pengalaman Visual...</span>
              <span className="font-mono font-bold text-[#EF6C85] preloader-counter">
                {progress}%
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-[10px] text-[#1E251E]/40"
            >
              Dikembangkan oleh Raihan Fadhlurrahman • KKN UII 73 Unit 57
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
