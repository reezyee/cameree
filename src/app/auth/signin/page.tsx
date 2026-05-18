"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://assets.codepen.io/605876/noise.png')] z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="max-w-md w-full bg-[#0e0e0e]/90 border flex flex-col justify-center items-center border-white/[0.04] p-12 rounded-[3.5rem] text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl relative z-20"
      >
        <Image
          src="/images/camereestudio.png"
          alt="Caméree Studio Logo"
          width={240}
          height={80}
          priority
          className="w-[240px] h-auto"
        />
        <div className="space-y-2 mb-12">
          <div className="h-[2px] w-12 bg-blue-600 rounded-full mx-auto" />
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] pt-2">
            Restricted Access Only
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/admin/templates" })}
          className="w-full bg-white text-black py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3.5 shadow-xl shadow-white/5 cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.google.com/favicon.ico"
            className="w-4 h-4 grayscale opacity-80 group-hover:grayscale-0"
            alt="Google Icon"
          />
          Sign in with Google
        </button>

        <div className="mt-12 pt-6 border-t border-white/[0.03] space-y-1">
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
