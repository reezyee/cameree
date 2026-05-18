"use client";

import { useCamera } from "@/hooks/useCamera";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  FlipHorizontal,
  Sun,
  RefreshCcw,
  Palette,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface ShootingTemplate {
  id: string;
  name: string;
  totalShots: number;
  canvasWidth: number;
  canvasHeight: number;
  backgroundMode: "color" | "image";
  backgroundValue: string;
  photoPositions?: Array<{
    id: string;
    index: number;
    x: number;
    y: number;
    w: number;
    h: number;
    rotate?: number;
    radius?: string;
  }>;
}

interface ShootingViewProps {
  template: ShootingTemplate | null;
  onComplete: (images: string[]) => void;
  onCancel: () => void;
  isMobileView: boolean;
}

export default function ShootingView({
  template,
  onComplete,
  onCancel,
  isMobileView,
}: ShootingViewProps) {
  const { videoRef, startCamera, stopCamera } = useCamera();
  const [count, setCount] = useState<number | null>(null);
  const [captured, setCaptured] = useState<string[]>([]);
  const [isShooting, setIsShooting] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  const [isMirrored, setIsMirrored] = useState(true);
  const [isRinglightOn, setIsRinglightOn] = useState(true);
  const [ringlightColor, setRinglightColor] = useState("#ffdfba");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const tempImagesRef = useRef<string[]>([]);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalSteps = useMemo(
    () => template?.photoPositions?.length || template?.totalShots || 0,
    [template],
  );

  useEffect(() => {
    let isMounted = true;
    const initCamera = async () => {
      await new Promise((r) => setTimeout(r, 150));
      if (isMounted) startCamera(facingMode);
    };
    initCamera();
    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const canvas = offscreenCanvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.save();
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      tempImagesRef.current.push(dataUrl);
      setCaptured((prev) => [...prev, dataUrl]);
      ctx.restore();
    }
  };

  const runShootingCycle = async () => {
    if (totalSteps === 0 || isShooting) return;
    setIsShooting(true);
    tempImagesRef.current = [];
    setCaptured([]);

    for (let i = 0; i < totalSteps; i++) {
      for (let s = 3; s > 0; s--) {
        setCount(s);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCount(null);
      setShowFlash(true);
      takeSnapshot();
      setTimeout(() => setShowFlash(false), 150);
      await new Promise((r) => setTimeout(r, 2000));
    }
    setTimeout(() => onComplete(tempImagesRef.current), 800);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#d8d2c9] flex items-center justify-center p-2 md:p-6 overflow-hidden">
      <div className="flex flex-row w-full h-full max-w-[1300px] max-h-[80vh] gap-3 md:gap-8 items-center justify-center">
        {/* CAMERA SECTION */}
        <div className="relative flex-1 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-h-[90vh] aspect-video rounded-[2rem] md:rounded-[4rem] transition-all duration-700 shadow-2xl overflow-hidden"
            style={{
              padding: isRinglightOn ? (isMobileView ? "4vh" : "min(7vh, 120px)") : "0px", 
              backgroundColor: isRinglightOn ? ringlightColor : "#1a1a1c",
              boxShadow: isRinglightOn
                ? `0 0 60px ${ringlightColor}44`
                : "none",
            }}
          >
            <div className="relative w-full h-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-black shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: isMirrored ? "scaleX(-1)" : "scaleX(1)" }}
              />

              {/* FLOATING CONTROLS */}
              {!isShooting && (
                <div className={`absolute top-1/2 -translate-y-1/2 flex flex-col bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl pointer-events-auto z-[60] ${isMobileView ? "right-2 p-1.5 gap-1.5" : "right-3 md:right-6 p-2 md:p-3 gap-2 md:gap-3"}`}>
                  <button
                    onClick={() => setIsMirrored(!isMirrored)}
                    className={`p-2 md:p-3 flex justify-center rounded-full ${isMirrored ? "bg-white text-[#153378]" : "text-white"}`}
                  >
                    <FlipHorizontal size={isMobileView ? 14 : 18} />
                  </button>
                  <button
                    onClick={() => setIsRinglightOn(!isRinglightOn)}
                    className={`p-2 md:p-3 flex justify-center rounded-full ${isRinglightOn ? "bg-white text-[#153378]" : "text-white"}`}
                  >
                    <Sun size={isMobileView ? 14 : 18} />
                  </button>
                  <button
                    onClick={() =>
                      setRinglightColor(
                        ringlightColor === "#ffffff" ? "#ffdfba" : "#ffffff",
                      )
                    }
                    className="p-2 md:p-3 flex justify-center text-white"
                  >
                    <Palette size={isMobileView ? 14 : 18} style={{ color: ringlightColor }} />
                  </button>
                  <button
                    onClick={toggleCamera}
                    className="p-2 md:p-3 flex justify-center text-white md:hidden"
                  >
                    <RefreshCcw size={isMobileView ? 14 : 18} />
                  </button>
                  <div className="h-[1px] w-4 bg-white/20 mx-auto" />
                  <button
                    onClick={runShootingCycle}
                    className="p-3 md:p-4 rounded-full bg-white text-[#153378] shadow-xl active:scale-90 transition-all"
                  >
                    <Camera size={isMobileView ? 18 : 22} />
                  </button>
                </div>
              )}

              {/* COUNTDOWN */}
              <AnimatePresence>
                {count && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                  >
                    <span className="text-[15vh] md:text-[25vh] font-black italic text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                      {count}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {showFlash && (
                <div className="absolute inset-0 bg-white z-[100]" />
              )}
            </div>
          </motion.div>
        </div>

        {/* SIDEBAR PREVIEWS */}
        <div className={`hidden sm:flex flex-col h-full gap-3 py-2 md:py-6 ${isMobileView ? "w-28" : "w-40 md:w-64 lg:w-80"}`}>
          <div className="flex items-center gap-2 opacity-30 px-2 shrink-0">
            <ImageIcon size={14} className="text-[#153378]" />
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#153378]">
              Previews
            </p>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-2 p-1 content-start">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className="relative aspect-video bg-white/60 rounded-xl overflow-hidden border-2 shadow-sm shrink-0"
                style={{ borderColor: captured[i] ? ringlightColor : "white" }}
              >
                {captured[i] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={captured[i]}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#153378]/10 font-black text-xs md:text-lg">
                    {i + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={onCancel}
            disabled={isShooting}
            className="flex items-center justify-center gap-2 w-full py-3 md:py-4 bg-white text-[#153378] rounded-full font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-xl shrink-0"
          >
            <X size={14} />{" "}
            <span className="hidden md:inline text-nowrap">
              Switch Template
            </span>
            <span className="md:hidden">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}