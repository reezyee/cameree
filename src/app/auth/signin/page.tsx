"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="h-screen w-screen bg-[#080808] flex items-center justify-center p-6 relative overflow-hidden font-serif selection:bg-white selection:text-black">
      <div className="absolute top-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-orange-900/10 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-blue-900/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[url('https://assets.codepen.io/605876/noise.png')]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[340px] w-full bg-[#0d0d0d] border border-white/8 p-12 text-center relative z-20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="mb-12">
          <Image
            src="/images/camereestudio.png"
            alt="Logo"
            width={200}
            height={50}
            className="mx-auto opacity-80 filter brightness-110"
          />
        </div>
        <button
          onClick={() => signIn("google", { callbackUrl: "/admin/templates" })}
          className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-300 py-4 font-medium text-[10px] uppercase tracking-[0.2em] 
                     hover:bg-[#153378]  transition-all duration-500 ease-out active:scale-[0.99]
                     shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
        >
          Sign in
        </button>

        <p className="mt-10 text-[8px] text-zinc-700 font-medium italic">
          Copyright © 2025. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}