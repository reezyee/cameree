"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

// ==================== 1. FUTURISTIC ANALOG SPLASH ====================
function FuturisticSplash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 5000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#153378] overflow-hidden"
    >
      {/* Dynamic Scanline & Grain - Efek Digital Analog */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://assets.codepen.io/605876/noise.png')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-2 w-full animate-scanline" />
      </div>

      {/* BACKGROUND STRIPS - Bergerak lebih subtle & futuristik */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="relative flex -space-x-40 rotate-[-25deg]">
          <motion.div
            animate={{ y: ["0%", "-50%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <FilmStripStream />
          </motion.div>
          <motion.div
            animate={{ y: ["-50%", "0%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <FilmStripStream />
          </motion.div>
        </div>
      </div>

      {/* CENTER REVEAL - "The Lens Shutter" */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Lingkaran Aperture Futuristik */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-64 h-64 md:w-96 md:h-96 border border-white/10 rounded-full"
        >
          <div className="absolute inset-0 border-t-2 border-white/40 rounded-full animate-spin-slow" />
        </motion.div>

        {/* Text Reveal dengan Efek Chromatic Aberration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative"
        >
          <h1 className="text-7xl md:text-[11rem] font-serif font-black text-[#d8d2c9] tracking-tighter mix-blend-difference">
            Caméree
          </h1>
          {/* Efek Shadow Biru yang nge-glow */}
          <div className="absolute inset-0 text-blue-500 opacity-50 blur-sm translate-x-1 animate-pulse">
            Caméree
          </div>
        </motion.div>

        {/* Loading Bar Futuristik */}
        <div className="w-48 h-[2px] bg-white/10 mt-8 relative overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-white/60"
          />
        </div>
      </div>

      {/* Shutter Flash di akhir animasi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 4.2, duration: 0.4 }}
        className="absolute inset-0 bg-white z-50 pointer-events-none"
      />
    </motion.div>
  );
}

// Sub-component untuk background film stream
function FilmStripStream() {
  return (
    <div className="flex flex-col gap-8 py-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="w-40 h-56 bg-white/5 border border-white/10 rounded-md backdrop-blur-sm"
        />
      ))}
    </div>
  );
}

// ==================== 2. MAIN LANDING PAGE ====================
export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <style jsx global>{`
        @keyframes scanline {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {showSplash && (
          <FuturisticSplash
            key="splash"
            onFinish={() => setShowSplash(false)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-[#c7c1b6] via-[#d8d2c9] to-[#c7c1b6] font-serif text-[#153378] overflow-x-hidden">
        {/* Decorative Top Grain */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] bg-[url('https://assets.codepen.io/605876/noise.png')] z-50" />

        <main className="container mx-auto px-6 flex flex-col justify-center min-h-screen">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto w-full">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={!showSplash ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-10 text-center lg:text-left order-2 lg:order-1"
            >
              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={!showSplash ? { opacity: 1 } : {}}
                  transition={{ delay: 0.5 }}
                  className="opacity-60 text-sm font-light tracking-[3px] font-[#637398] italic"
                >
                  © 2025 Caméree • Crafted with Soul by{" "}
                  <a
                    href="https://reezyee.github.io"
                    className="underline hover:opacity-100 transition-opacity"
                  >
                    Reezyee
                  </a>
                </motion.h2>
                <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter">
                  Caméree
                </h1>
              </div>

              <p className="text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-light opacity-80">
                Experience the soul of vintage photobooth. Real-time filters,
                classic film overlays, and instant digital strips designed for
                your best memories.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/camera">
                  <Button className="group relative overflow-hidden px-10 py-8 text-xl font-bold rounded-2xl bg-[#153378] text-[#d8d2c9] transition-all shadow-xl hover:shadow-[#153378]/20 hover:scale-[1.02] active:scale-95">
                    <span className="relative z-10 flex items-center">
                      <Camera className="mr-3 size-6 group-hover:rotate-12 transition-transform" />
                      Start Capturing
                    </span>
                    <motion.div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                  </Button>
                </Link>

                {/* Secondary Button / Info */}
                <div className="flex items-center justify-center px-6 opacity-60 text-sm italic font-light">
                  No account needed. Just smile.
                </div>
              </div>
            </motion.div>

            {/* Right Content: Visual Decor */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={!showSplash ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative order-1 lg:order-2 hidden lg:flex justify-center"
            >
              <div className="relative w-64 md:w-80 aspect-[1/2] rotate-3 hover:rotate-0 transition-transform duration-700">
                {/* Stacked Film Strip Look */}
                <div className="absolute inset-0 bg-[#2C1B18] rounded-xl shadow-2xl transform translate-x-4 translate-y-4 -z-10 opacity-20" />
                <div className="absolute inset-0 bg-[#2C1B18] rounded-xl shadow-2xl transform translate-x-2 translate-y-2 -z-10 opacity-50" />

                {/* Primary Preview Strip */}
                <div className="h-full bg-[#2C1B18] p-4 rounded-xl shadow-2xl flex flex-col gap-4 border-x-4 border-dashed border-white/5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#d4c4a0] rounded-sm relative overflow-hidden grayscale contrast-125 opacity-90"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Floating Element */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-[#153378] rounded-full blur-[80px] opacity-20"
              />
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
