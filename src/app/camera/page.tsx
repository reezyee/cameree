"use client";

import { useState, useEffect } from "react";
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

export default function CameraPage() {
  const [stage, setStage] = useState<AppStage>("LOBBY");
  const [templates, setTemplates] = useState<CameraTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CameraTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [collageImages, setCollageImages] = useState<string[]>([]);
  const [showRotateScreen, setShowRotateScreen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/strips");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data: CameraTemplate[] = await res.json();

        if (Array.isArray(data)) {
          const savedOrder = JSON.parse(
            localStorage.getItem("cameree_order") || "[]",
          );

          if (savedOrder.length > 0) {
            const sorted = savedOrder
              .map((id: string) => data.find((t) => t.id === id))
              .filter((item: unknown): item is CameraTemplate => !!item);

            const missing = data.filter((t) => !savedOrder.includes(t.id));
            const finalOrder = [...sorted, ...missing];

            setTemplates(finalOrder);
            if (finalOrder.length > 0) setSelectedTemplate(finalOrder[0]);
          } else {
            setTemplates(data);
            if (data.length > 0) setSelectedTemplate(data[0]);
          }
        }
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobileOrLandscapeHP =
        window.innerWidth < 1024 || window.innerHeight < 500;
      setIsMobileView(mobileOrLandscapeHP);
      setShowRotateScreen(window.innerHeight > window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCaptureComplete = (images: string[]) => {
    setCollageImages(images);
    setStage("LAB");
  };

  if (showRotateScreen) {
    return (
      <div className="fixed inset-0 bg-[#153378] flex items-center justify-center z-[100] text-white text-center p-8">
        <motion.div
          animate={{ rotate: -90 }}
          transition={{
            repeat: Infinity,
            repeatDelay: 1.5,
            duration: 2,
            ease: "linear",
          }}
        >
          <Smartphone size={80} />
        </motion.div>
        <h2 className="absolute bottom-20 text-2xl font-bold italic uppercase tracking-widest">
          please rotate your device to landscape
        </h2>
      </div>
    );
  }

  return (
    <div className="font-serif h-screen w-screen bg-[#d8d2c9] flex flex-col overflow-hidden relative select-none">
      {/* Global Back Button */}
      <div
        className={`fixed z-[60] transition-all duration-300 ${isMobileView ? "top-3 left-3" : "top-8 left-12"}`}
      >
        <Link href="/" title="Back to Home">
          <Button
            className={`group relative overflow-hidden cursor-pointer bg-[#153378] hover:bg-[#153378]/90 text-[#d8d2c9] rounded-full shadow-[0_20px_50px_rgba(21,51,120,0.4)] transition-all active:scale-95 italic border-none flex items-center justify-center ${isMobileView ? "h-10 w-14" : "h-12 w-20"}`}
          >
            <span className="relative z-10 flex items-center justify-center">
              <ArrowLeft size={isMobileView ? 20 : 30} />
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Grain Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[url('https://assets.codepen.io/605876/noise.png')] z-50 mix-blend-soft-light" />

      <main className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {stage === "LOBBY" && (
            <LobbyView
              key="lobby"
              templates={templates}
              loading={loading}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              onStart={() => setStage("SHOOTING")}
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
              onRetake={() => {
                setCollageImages([]);
                setStage("LOBBY");
              }}
              isMobileView={isMobileView}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
