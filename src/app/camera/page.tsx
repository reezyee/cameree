"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone } from "lucide-react";

import LobbyView from "./_components/LobbyView";
import ShootingView from "./_components/ShootingView";
import LabView from "./_components/LabView";

export type AppStage = "LOBBY" | "SHOOTING" | "LAB";

interface CameraTemplate {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  totalShots: number;
  backgroundMode: "color" | "image";
  backgroundValue: string;
  elements: Array<{
    id: string;
    type: "photo" | "sticker";
    src?: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotate?: number;
    radius?: string;
  }>;
}

declare global {
  interface Window {
    playPrintSoundGlobal?: () => void;
  }
}

export default function CameraPage() {
  const [stage, setStage] = useState<AppStage>("LOBBY");
  const [templates, setTemplates] = useState<CameraTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CameraTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [collageImages, setCollageImages] = useState<string[]>([]);
  const [showRotateScreen, setShowRotateScreen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [chosenFilter , setChosenFilter] = useState<string>("none");


  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudioHTML5IOS = () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
      audioRef.current.load();

      const p = audioRef.current.play();
      if (p !== undefined) {
        p.then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = "/sounds/print.mp3";
            audioRef.current.load();
          }
        }).catch((e) => console.log("Audio unlock:", e));
      }
    } catch (e) {
      console.error("Failed access security audio:", e);
    }
  };

  const playPrintSound = () => {
    if (!audioRef.current) return;
    try {
      if (!audioRef.current.src.includes("/sounds/print.mp3")) {
        audioRef.current.src = "/sounds/print.mp3";
        audioRef.current.load();
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } catch (e) {
      console.error("Failed play audio in iOS:", e);
    }
  };

  useEffect(() => {
    window.playPrintSoundGlobal = playPrintSound;
    return () => {
      window.playPrintSoundGlobal = undefined;
    };
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/strips");
        const data = await res.json();
        const actualTemplates = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        setTemplates(actualTemplates);
        if (actualTemplates.length > 0) setSelectedTemplate(actualTemplates[0]);
      } catch (err) {
        console.error("Failed to load template database:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobileOrLandscapeHP = window.innerWidth < 1024 || window.innerHeight < 500;
      setIsMobileView(mobileOrLandscapeHP);
      setShowRotateScreen(window.innerHeight > window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCaptureComplete = (images: string[], selectedFilter: string) => {
    setCollageImages(images);
    setChosenFilter(selectedFilter);
    setStage("LAB");
  };

  if (showRotateScreen) {
    return (
      <div className="fixed inset-0 bg-[#153378] flex items-center justify-center z-100 text-white text-center p-8">
        <motion.div animate={{ rotate: -90 }} transition={{ repeat: Infinity, duration: 2 }}>
          <Smartphone size={80} />
        </motion.div>
        <h2 className="absolute bottom-20 text-2xl font-bold italic uppercase">please rotate your device</h2>
      </div>
    );
  }

  return (
    <div className="font-serif h-screen w-screen bg-[#d8d2c9] flex flex-col overflow-hidden relative">
      <audio ref={audioRef} preload="auto" playsInline className="hidden pointer-events-none" />

      <div className={`fixed z-60 transition-all duration-300 ${isMobileView ? "top-3 left-3" : "top-8 left-12"}`}>
        <Link href="/" title="Back to Home">
          <Button className={`group relative overflow-hidden cursor-pointer bg-[#153378] hover:bg-[#153378]/90 text-[#d8d2c9] rounded-full shadow-[0_20px_50px_rgba(21,51,120,0.4)] transition-all active:scale-95 italic border-none flex items-center justify-center ${isMobileView ? "h-10 w-14" : "h-12 w-20"}`}>
            <span className="relative z-10 flex items-center justify-center">
              <ArrowLeft size={isMobileView ? 20 : 30} />
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          </Button>
        </Link>
      </div>

      <main className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === "LOBBY" && (
            <LobbyView
              key="lobby"
              templates={templates}
              loading={loading}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              onStart={() => {
                unlockAudioHTML5IOS();
                setStage("SHOOTING");
              }}
              isMobileView={isMobileView}
            />
          )}

          {stage === "SHOOTING" && selectedTemplate && (
            <ShootingView
              key="shooting"
              template={selectedTemplate}
              onComplete={handleCaptureComplete}
              onCancel={() => setStage("LOBBY")}
              isMobileView={isMobileView}
            />
          )}

          {stage === "LAB" && (
            <LabView
              key="lab"
              images={collageImages}
              template={selectedTemplate}
              filter={chosenFilter}
              onRetake={() => setStage("LOBBY")}
              isMobileView={isMobileView}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}