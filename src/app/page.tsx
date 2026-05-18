"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";

export default function Home() {
  const containerRef = useRef(null);
  const accentRef = useRef(null);
  const contentRef = useRef(null);
  const copyRight = useRef(null);
  const mainTitleRef = useRef(null);
  const mainTitleRef1 = useRef(null);
  const mainTitleRef2 = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(accentRef.current, { y: -300, autoAlpha: 0 });
      gsap.set(
        [
          copyRight.current,
          mainTitleRef.current,
          mainTitleRef1.current,
          mainTitleRef2.current,
          contentRef.current,
        ],
        { autoAlpha: 0, y: 20 },
      );

      tl.to(accentRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "back.out(1.7)",
      })
      .to(mainTitleRef1.current, {
        autoAlpha: 1,
        duration: 1,
        y: 0,
        ease: "power4.out",
      }, "-=0.2")
      .to([mainTitleRef.current, mainTitleRef2.current], {
        autoAlpha: 1,
        duration: 1.5,
        y: 0,
        ease: "back.inOut(1, 0.5)",
      }, "-=0.8")
      .to([contentRef.current, copyRight.current], {
        autoAlpha: 1,
        duration: 1.2,
        y: 0,
        ease: "power3.out",
      }, "-=1");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#d8d2c9] font-serif text-[#153378] relative overflow-x-hidden flex items-center justify-center selection:bg-[#153378] selection:text-white"
    >
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] bg-orange-400/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://assets.codepen.io/605876/noise.png')] z-50" />

      {/* --- STRIPS (Responsive Positioning) --- */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotate: 12 }}
        animate={{ opacity: 1, y: 0, rotate: 8 }}
        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
        className="fixed -bottom-32 -right-20 lg:-bottom-20 lg:-right-10 z-10 select-none pointer-events-none scale-50 sm:scale-75 lg:scale-100 origin-bottom-right"
      >
        <div className="w-[300px] h-[650px] bg-[#153378]/5 border-x-[12px] border-dashed border-[#153378]/10 shadow-2xl backdrop-blur-[2px]">
          <div className="flex flex-col gap-6 p-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <Image
              src="/images/tes.png"
              alt="Film Strip Sample"
              width={300}
              height={700}
              className="object-cover rounded-sm"
              priority
            />
          </div>
        </div>
      </motion.div>

      {/* --- MAIN CONTENT --- */}
      <main className="relative flex items-center justify-center z-20 w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12">
          
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-10">
            
            {/* Header / Copyright */}
            <h2
              ref={copyRight}
              className="text-[10px] gsap-reveal md:text-xs font-medium tracking-[3px] md:tracking-[5px] text-[#153378]/50 italic"
            >
              © 2025 Caméree • Crafted with Soul by{" "}
              <a href="#" className="underline decoration-1 underline-offset-4 hover:text-[#153378] transition-colors">
                Reezyee
              </a>
            </h2>

            {/* Main Title */}
            <div className="space-y-2">
              <h1 className="text-[16vw] leading-[0.85] sm:text-[14vw] md:text-[9rem] lg:text-[9rem] font-black tracking-tighter flex items-baseline justify-center lg:justify-start">
                <span ref={mainTitleRef} className="gsap-reveal">Cam</span>
                <span className="relative flex flex-col items-center">
                  <span
                    ref={accentRef}
                    className="absolute inline-block gsap-reveal"
                    style={{ left: "0.1em", top: "-0.01em" }}
                  >
                    ´
                  </span>
                  <span ref={mainTitleRef1} className="gsap-reveal">
                    e
                  </span>
                </span>
                <span ref={mainTitleRef2} className="gsap-reveal">
                  ree
                </span>
              </h1>
            </div>

            {/* Paragraph & Buttons */}
            <div ref={contentRef} className="space-y-8 md:space-y-10 gsap-reveal">
              <p className="text-base sm:text-md md:text-lg lg:text-xl max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-4xl mx-auto lg:mx-0 leading-relaxed font-light opacity-70">
                Experience the soul of vintage photobooth. Real-time filters,
                classic film overlays, and instant digital strips designed for
                your best memories.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center">
                <Link href="/camera" className="w-full sm:w-auto">
                  <Button className="group relative w-full sm:w-auto overflow-hidden px-8 py-5 md:px-12 md:py-7 text-lg md:text-xl font-bold cursor-pointer rounded-2xl bg-[#153378] text-[#d8d2c9] transition-all shadow-2xl hover:shadow-[#153378]/40 hover:scale-[1.05] active:scale-95">
                    <span className="relative z-10 flex items-center justify-center">
                      <Camera className="mr-3 size-5 md:size-6 group-hover:rotate-5 transition-transform" />
                      Snap Now
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Button>
                </Link>
                
                <div className="text-[10px] md:text-xs italic font-medium opacity-40 uppercase tracking-widest text-center sm:text-left sm:max-w-[180px] leading-tight">
                  No account needed. <br className="hidden sm:block" /> Just smile.
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer / */}
      <div className="fixed bottom-6 left-6 hidden md:block">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase opacity-30">
          <span>Digital Strip</span>
          <div className="w-8 h-[1px] bg-[#153378]" />
          <span>Analog Filter</span>
        </div>
      </div>
    </div>
  );
}