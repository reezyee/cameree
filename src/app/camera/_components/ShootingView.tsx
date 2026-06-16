"use client";

import { useCamera } from "@/hooks/useCamera";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  FlipHorizontal,
  Sun,
  Undo2,
  X,
  SwitchCamera,
  Image as ImageIcon,
  Check,
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
  onComplete: (images: string[], selectedFilter: string) => void;
  onCancel: () => void;
  isMobileView: boolean;
  filter: string;
}

export default function ShootingView({
  template,
  onComplete,
  onCancel,
  filter,
}: ShootingViewProps) {
  const { videoRef, startCamera, stopCamera } = useCamera();
  const [count, setCount] = useState<number | null>(null);
  const [captured, setCaptured] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isShooting, setIsShooting] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isFilterLocked, setIsFilterLocked] = useState(false);

  const [isMirrored, setIsMirrored] = useState(true);
  const [isRinglightOn, setIsRinglightOn] = useState(true);
  const [ringlightColor] = useState("#ffffff");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const [activeFilter, setActiveFilter] = useState("none");
  const filters = [
    { id: "none", label: "Original", style: "" },
    {
      id: "sepia",
      label: "Creamy Film",
      style: "sepia(25%) contrast(90%) brightness(102%) saturate(75%)",
    },
    {
      id: "classic",
      label: "Classic B&W",
      style: "grayscale(100%) sepia(18%) contrast(125%) brightness(98%)",
    },
    {
      id: "darkbw",
      label: "Dark B&W",
      style: "grayscale(100%) contrast(185%) brightness(72%)",
    },
    {
      id: "grayscale",
      label: "Deep Analog",
      style: "grayscale(100%) contrast(145%) brightness(95%)",
    },
    {
      id: "vivid",
      label: "Vivid Retro",
      style: "contrast(110%) brightness(110%) saturate(125%)",
    },
    {
      id: "kodak-portra",
      label: "Kodak Portra",
      style: "sepia(10%) contrast(95%) brightness(105%) saturate(110%)",
    },
    {
      id: "fuji-classic",
      label: "Fuji Classic",
      style: "contrast(90%) brightness(100%) saturate(90%) hue-rotate(5deg)",
    },
    {
      id: "dusted-film",
      label: "Dusted Film",
      style: "contrast(80%) brightness(105%) saturate(70%) sepia(20%)",
    },
  ];

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
    if (!offscreenCanvasRef.current)
      offscreenCanvasRef.current = document.createElement("canvas");

    const canvas = offscreenCanvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); // Tambahkan ini untuk performa iOS

    if (ctx) {
      ctx.save();
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0);

      const activeFilterStyle =
        filters.find((f) => f.id === activeFilter)?.style || "none";
      if (activeFilter !== "none") {
        ctx.filter = activeFilterStyle;
        ctx.globalCompositeOperation = "source-in"; // atau 'copy'
        ctx.drawImage(canvas, 0, 0);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      tempImagesRef.current.push(dataUrl);
      setCaptured((prev) => [...prev, dataUrl]);
      ctx.restore();
    }
  };

  const captureSingle = async () => {
    if (isShooting) return;
    setIsFilterLocked(true);
    setIsShooting(true);
    for (let s = 3; s > 0; s--) {
      setCount(s);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCount(null);
    setShowFlash(true);
    takeSnapshot();
    setTimeout(() => setShowFlash(false), 150);
    setIsShooting(false);
    setCurrentStep((prev) => prev + 1);
  };

  const handleRetake = () => {
    tempImagesRef.current.pop();
    setCaptured((prev) => prev.slice(0, -1));
    setCurrentStep((prev) => prev - 1);
    if (currentStep - 1 === 0) setIsFilterLocked(false);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#d8d2c9] flex items-center justify-center p-2 md:p-6 overflow-hidden">
      <div className="flex flex-row w-full h-full max-w-[1400px] max-h-[85vh] items-center justify-center gap-4 md:gap-8">
        {/* FILM ROLL */}
        <div className="flex flex-col bg-[#d8d2c9] border-t-8 border-t-[#153378] shadow-xl w-32 md:w-52 h-fit pt-2 pb-5 justify-center space-y-2 shrink-0 z-50">
          <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-[#153378] mb-5 px-1">
            Select Film Roll
          </p>
          <div
            className="flex-1 overflow-y-auto no-scrollbar space-y-2"
            style={{ scrollbarWidth: "none" }}
          >
            {filters.map((f) => (
              <button
                key={f.id}
                disabled={isFilterLocked}
                onClick={() => setActiveFilter(f.id)}
                className={`w-full text-left p-2  text-[9px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 ${
                  activeFilter === f.id
                    ? "border-l-4 border-[#153378] text-[#153378]"
                    : "bg-[d8d2c9]/10 border-transparent text-[#153378]/40 hover:border-white"
                } ${isFilterLocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div
                  className="w-4 h-4 rounded bg-zinc-400 overflow-hidden shrink-0"
                  style={{ filter: f.style }}
                />
                <span className="truncate">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CAMERA */}
        <div className="relative flex-[1.5] h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-h-[90vh] aspect-video rounded-4xl md:rounded-[4rem] shadow-2xl overflow-hidden"
            style={{
              padding: isRinglightOn ? "3vh" : "0px",
              backgroundColor: isRinglightOn ? ringlightColor : "#1a1a1c",
              boxShadow: isRinglightOn
                ? `0 0 40px ${ringlightColor}44`
                : "none",
            }}
          >
            <div className="relative w-full h-full rounded-3xl md:rounded-[3rem] overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: isMirrored ? "scaleX(-1)" : "scaleX(1)",
                  filter:
                    filters.find((f) => f.id === activeFilter)?.style || "none",
                }}
              />

              {!isShooting && (
                <div className="absolute top-6 left-6 right-6 flex justify-between z-60">
                  <div className="flex gap-2">
                    <button
                      onClick={toggleCamera}
                      className="p-3 bg-black/40 backdrop-blur cursor-pointer rounded-full text-white"
                    >
                      <SwitchCamera size={18} />
                    </button>
                    <button
                      onClick={() => setIsMirrored(!isMirrored)}
                      className="p-3 bg-black/40 backdrop-blur cursor-pointer rounded-full text-white"
                    >
                      <FlipHorizontal size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => setIsRinglightOn(!isRinglightOn)}
                    className="p-3 bg-black/40 backdrop-blur cursor-pointer rounded-full text-white"
                  >
                    <Sun size={18} />
                  </button>
                </div>
              )}

              {!isShooting && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-60">
                  {currentStep > 0 && (
                    <button
                      onClick={handleRetake}
                      className="p-4 bg-black/40 backdrop-blur rounded-full text-white"
                    >
                      <Undo2 size={24} />
                    </button>
                  )}

                  {currentStep < totalSteps ? (
                    <button
                      onClick={captureSingle}
                      className="p-5 bg-white/90  text-[#153378] rounded-full shadow-2xl hover:scale-105 transition-transform"
                    >
                      <Camera size={32} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onComplete(captured, activeFilter)}
                      className="p-5 bg-[#153378] text-white rounded-full shadow-2xl"
                    >
                      <Check size={32} />
                    </button>
                  )}
                </div>
              )}

              <AnimatePresence>
                {count && (
                  <motion.div className="absolute inset-0 flex items-center justify-center z-50">
                    <span className="text-[20vh] font-black italic text-white drop-shadow-2xl">
                      {count}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {showFlash && <div className="absolute inset-0 bg-white z-100" />}
            </div>
          </motion.div>
        </div>

        {/* PREVIEW */}
        <div className="flex flex-col h-full gap-2 py-4 w-20 md:w-40 shrink-0">
          <div className="flex items-center gap-2 opacity-30 px-1">
            <ImageIcon size={12} className="text-[#153378]" />
            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[#153378]">
              Previews
            </p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 gap-2 content-start">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className="relative aspect-video bg-white/60 rounded-xl overflow-hidden border-2 shadow-sm"
                style={{ borderColor: captured[i] ? ringlightColor : "white" }}
              >
                {captured[i] ? (
                   // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={captured[i]}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#153378]/10 font-black text-xs">
                    {i + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={onCancel}
            disabled={isShooting}
            className="flex items-center justify-center cursor-pointer gap-2 w-full py-3 bg-white text-[#153378] rounded-full font-black uppercase text-[8px] tracking-widest shadow-xl"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
