"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

// ==================== SPLASH SCREEN ====================
function FilmStripSplash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 5200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#c7c1b6] overflow-hidden"
    >
      {/* Vintage grain + light leak */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-50 mix-blend-soft-light bg-[url('https://assets.codepen.io/605876/noise.png')] animate-pulse" />
        <motion.div
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-transparent to-red-800/20 blur-3xl"
        />
      </div>

      {/* DUA STRIP VERTIKAL — BERSAMPINGAN & MIRING 40° */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center -space-x-48 md:-space-x-64 lg:-space-x-80 rotate-[40deg] scale-90 md:scale-110 lg:scale-125">
          {/* STRIP KIRI */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: "-160vh" }}
            transition={{
              duration: 2.4,
              delay: 1.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <VintageFilmStrip half />
          </motion.div>

          {/* STRIP KANAN */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: "160vh" }}
            transition={{
              duration: 2.4,
              delay: 1.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <VintageFilmStrip half reverse />
          </motion.div>
        </div>
      </div>

      {/* TULISAN CAMÉREE — REVEAL GILA */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, filter: "blur(32px)" }}
        animate={{ scale: [0.6, 1.15, 1], opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 2.8, delay: 2.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center"
      >
        <motion.div
          animate={{ opacity: [0, 1, 0.5], scale: [1, 3, 2] }}
          transition={{ duration: 2.6, delay: 3.2 }}
          className="absolute -inset-40 -z-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #153378 8%, transparent 65%)" }}
        />

        <h1 className="text-7xl sm:text-9xl md:text-[14rem] lg:text-[16rem] font-serif font-black text-[#153378] tracking-tighter drop-shadow-2xl [text-shadow:0_40px_80px_rgba(0,0,0,0.7),_0_0_140px_#153378]">
          Caméree
        </h1>

          {/* <motion.p
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.4, duration: 1.4 }}
            className="mt-10 text-xl sm:text-3xl md:text-4xl text-[#153378]/80 font-light tracking-widest uppercase"
          >
            Timeless moments await
          </motion.p> */}
      </motion.div>
    </motion.div>
  );
}

// ==================== VINTAGE FILM STRIP VERTIKAL (2-3 FRAME) ====================
function VintageFilmStrip({ half = false }: { half?: boolean; reverse?: boolean }) {
  const frames = half ? 3 : 8;

  return (
    <div className="w-64 sm:w-80 md:w-96 lg:w-[28rem] relative">
      {/* Film base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C1B18]/98 via-[#3d2817] to-[#2C1B18]/98 rounded-xl shadow-2xl" />

      {/* Sprocket holes kiri & kanan */}
      <div className="absolute inset-y-8 left-4 right-4 flex justify-between pointer-events-none">
        {[...Array(2)].map((_, side) => (
          <div key={side} className="flex flex-col justify-between py-8">
            {[...Array(frames + 2)].map((_, i) => (
              <div
                key={i}
                className="w-10 h-14 bg-black/95 rounded-sm shadow-inner"
                style={{ clipPath: "polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)" }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Photo frames vertikal */}
      <div className="absolute inset-x-16 top-12 flex flex-col gap-12 md:gap-16">
        {[...Array(frames)].map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] bg-gradient-to-br from-[#f4e4bc] via-[#e8d9a6] to-[#d4c4a0] rounded-lg overflow-hidden shadow-2xl border-8 border-[#2C1B18]"
          >
            <div className="absolute inset-0 opacity-60 mix-blend-multiply">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#8B7355]/30 to-transparent" />
              <div className="absolute top-8 left-8 w-32 h-px bg-white/40 blur-md -rotate-45" />
              <div className="absolute bottom-12 right-10 w-28 h-px bg-black/50 blur-sm rotate-12" />
            </div>
            <div className="absolute inset-6 border-4 border-white/40 rounded-md shadow-inner" />
          </div>
        ))}
      </div>

      {/* Light leaks */}
      <div className="absolute inset-0 mix-blend-soft-light opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-orange-600/50 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-red-700/40 to-transparent blur-3xl" />
      </div>

      {/* Moving scratches */}
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-20 pointer-events-none"
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm -rotate-12 scale-y-[300%]" />
      </motion.div>
    </div>
  );
}

// ==================== MAIN PAGE ====================
export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showSplash && <FilmStripSplash onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-[#c7c1b6] via-[#d8d2c9] to-[#c7c1b6]">
        {/* Hero */}
        <section className="container mx-auto px-6 pt-20 pb-16 md:pt-32">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h1 className="text-7xl md:text-9xl font-serif font-bold text-[#153378] leading-none">
                  Caméree
                </h1>
                <p className="text-3xl md:text-5xl font-light text-[#153378]/90">
                  Capture Timeless Moments
                </p>
              </div>
              <p className="text-lg md:text-xl text-[#153378]/80 max-w-lg leading-relaxed font-light">
                A modern photo booth with vintage soul — real-time filters, retro overlays, and instant memories.
              </p>
              <Link href="/camera">
                <Button className="px-12 py-8 text-xl font-medium rounded-2xl bg-[#153378] text-[#c7c1b6] hover:bg-[#153378]/90 transition-all shadow-2xl hover:shadow-3xl hover:scale-105">
                  <Camera className="mr-3 size-7" />
                  Start Capturing
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features
        <section className="container mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {[
              { icon: Filter, title: "Live Vintage Filters", desc: "Real-time sepia, B&W, retro & infrared effects" },
              { icon: Camera, title: "Photo Booth Mode", desc: "4-shot strips or 2×2 grids with custom overlays" },
              { icon: Download, title: "Instant Save", desc: "Download your collage instantly — no waiting" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.9 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="bg-white/50 backdrop-blur-xl rounded-3xl p-10 text-center shadow-2xl border border-white/40 transition-all duration-500 hover:shadow-3xl"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#153378]/15 flex items-center justify-center">
                  <item.icon className="size-10 text-[#153378]" />
                </div>
                <h3 className="text-3xl font-serif text-[#153378] mb-4">{item.title}</h3>
                <p className="text-[#153378]/80 leading-relaxed text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section> */}

        <footer className="py-12 text-center text-[#153378]/70 text-sm">
          © {new Date().getFullYear()} Caméree by{" "}
          <a href="https://reezyee.github.io" className="underline decoration-[#153378]/40 hover:decoration-[#153378]">
            Reezyee
          </a>
          . All memories reserved.
        </footer>
      </div>
    </>
  );
}