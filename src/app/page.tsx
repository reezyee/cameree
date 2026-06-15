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
        .to(
          mainTitleRef1.current,
          {
            autoAlpha: 1,
            duration: 1,
            y: 0,
            ease: "power4.out",
          },
          "-=0.2",
        )
        .to(
          [mainTitleRef.current, mainTitleRef2.current],
          {
            autoAlpha: 1,
            duration: 1.5,
            y: 0,
            ease: "back.inOut(1, 0.5)",
          },
          "-=0.8",
        )
        .to(
          [contentRef.current, copyRight.current],
          {
            autoAlpha: 1,
            duration: 1.2,
            y: 0,
            ease: "power3.out",
          },
          "-=1",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#d8d2c9] font-serif text-[#153378] relative overflow-x-hidden flex items-center justify-center selection:bg-[#153378] selection:text-white"
    >
      <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[50vw] h-[50vw] md:w-[30vw] md:h-[30vw] bg-orange-400/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://assets.codepen.io/605876/noise.png')] z-50" />

      <motion.div
        initial={{ opacity: 0, y: 100, rotate: 12 }}
        animate={{ opacity: 1, y: 0, rotate: 8 }}
        transition={{
          duration: 1.5,
          delay: 1.5,
          ease: "easeOut",
        }}
        className="fixed -bottom-10 -right-5 lg:right-20 z-10 select-none pointer-events-none scale-[0.6] lg:scale-[0.8] origin-bottom-right"
        style={{
          filter: "drop-shadow(-10px 10px 20px rgba(21, 51, 120, 0.1))",
        }}
      >
        <div className="relative w-[280px] h-[550px]">
          {/* STRIP FILM */}
          <div className="absolute -top-45 left-7 w-[200px] h-[500px] p-4">
            <Image
              src="/images/strip.png"
              width={300}
              height={400}
              alt="strip"
              className="w-full h-auto brightness-[0.85] contrast-[0.8] grayscale-[0.2] rounded-lg shadow-sm"
            />
          </div>

          <div className="absolute top-[180px] left-0 w-[250px] h-[350px] bg-[#d8d2c9] border-t border-[#b9b3aa]/30 shadow-[0_10px_25px_rgba(21,51,120,0.05)] rounded-t-xl transition-all duration-500 hover:shadow-[0_20px_40px_rgba(21,51,120,0.1)]">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#d8d2c9] rounded-full" />

            <div className="w-full h-full flex items-center justify-center pt-10">
              <p className="-rotate-90 text-[#153378]/60 font-medium tracking-[0.3em] uppercase text-[11px]">
                Best Version Of You
              </p>
            </div>
            <div className="absolute inset-0 rounded-t-xl bg-linear-to-b from-transparent via-transparent to-[#d8d2c9] pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* --- MAIN CONTENT --- */}
      <main className="relative flex items-center justify-center z-20 w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-10">
            <h2
              ref={copyRight}
              className="text-[10px] gsap-reveal md:text-xs font-medium tracking-[3px] md:tracking-[5px] text-[#153378]/50 italic"
            >
              © 2025 Caméree • Crafted with Soul by{" "}
              <a
                href="#"
                className="underline decoration-1 underline-offset-4 hover:text-[#153378] transition-colors"
              >
                Reezyee
              </a>
            </h2>

            {/* Main Title */}
            <div className="space-y-2">
              <h1 className="text-[16vw] leading-[0.85] sm:text-[14vw] md:text-[9rem] lg:text-[9rem] font-black tracking-tighter flex items-baseline justify-center lg:justify-start">
                <span ref={mainTitleRef} className="gsap-reveal">
                  Cam
                </span>
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

            <div
              ref={contentRef}
              className="space-y-8 md:space-y-10 gsap-reveal"
            >
              <p className="text-base sm:text-md md:text-lg lg:text-xl max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-4xl mx-auto lg:mx-0 leading-relaxed font-light opacity-70">
                Your moments, through a vintage lens. Create classic photo
                strips instantly, wherever you are.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center">
                <Link href="/camera" className="w-full sm:w-auto">
                  <Button className="group relative w-full sm:w-auto overflow-hidden px-8 py-5 md:px-12 md:py-7 text-lg md:text-xl font-bold cursor-pointer rounded-2xl bg-[#153378] text-[#d8d2c9] hover:bg-[#153378]/90 active:bg-[#153378]/80 transition-colors">
                    <span className="relative z-10 flex items-center justify-center">
                      <Camera className="mr-3 size-5 md:size-6 transition-transform" />
                      Snap Now
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                  </Button>
                </Link>

                <div className="text-[10px] md:text-xs italic font-medium opacity-40 uppercase tracking-widest text-center sm:text-left sm:max-w-[180px] leading-tight">
                  No account needed. <br className="hidden sm:block" /> Just
                  smile.
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
          <div className="w-8 h-1 bg-[#153378]" />
          <span>Analog Filter</span>
        </div>
      </div>
    </div>
  );
}
