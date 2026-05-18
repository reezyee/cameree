"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, QrCode, CheckCircle2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import gifshot from "gifshot";

interface LabTemplate {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
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

interface LabViewProps {
  images: string[];
  template: LabTemplate | null;
  onRetake: () => void;
  isMobileView: boolean;
}

interface GifshotResponse {
  error: boolean;
  errorCode: string;
  errorMsg: string;
  image: string;
}

export default function LabView({ images, template, onRetake, isMobileView }: LabViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [filter, setFilter] = useState("none");
  const [isPrinting, setIsPrinting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filters = [
    { id: "none", label: "Original", class: "" },
    { id: "grayscale(100%) contrast(1.2) brightness(0.9)", label: "Deep Analog", class: "grayscale contrast-125 brightness-90" },
    { id: "sepia(0.5) contrast(1.1) brightness(1.0) saturate(0.8)", label: "Creamy Film", class: "sepia-[0.5] contrast-110 saturate-80" },
    { id: "grayscale(100%) sepia(0.2) contrast(1.3)", label: "Classic B&W", class: "grayscale sepia-[0.2] contrast-150" },
    { id: "contrast(1.1) brightness(1.1) saturate(1.2)", label: "Vivid Retro", class: "contrast-110 brightness-110 saturate-125" }
  ];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/print.mp3");
      audioRef.current.load();
    }
    const autoStart = setTimeout(() => {
      setIsPrinting(true);
      audioRef.current?.play().catch(() => {});
    }, 800);
    const stopPrinting = setTimeout(() => {
      setIsPrinting(false);
    }, 7000); 
    return () => {
      clearTimeout(autoStart);
      clearTimeout(stopPrinting);
    };
  }, []);

  const renderFinalCollage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = template.canvasWidth;
    canvas.height = template.canvasHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (template.backgroundMode === "color") {
      ctx.fillStyle = template.backgroundValue;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const bgImg = new Image();
      bgImg.src = template.backgroundValue;
      bgImg.crossOrigin = "anonymous";
      await new Promise((r) => {
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          r(null);
        };
        bgImg.onerror = () => r(null);
      });
    }
    const allElements = template.elements || [];
    for (const el of allElements) {
      const img = new Image();
      img.src = el.type === "photo" ? images[allElements.filter((it) => it.type === "photo").indexOf(el)] : el.src || "";
      img.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.save();
          const centerX = el.x + el.w / 2;
          const centerY = el.y + el.h / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate(((el.rotate || 0) * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
          if (el.type === "photo") {
            ctx.beginPath();
            if (el.radius === "50%") {
              ctx.ellipse(centerX, centerY, el.w / 2, el.h / 2, 0, 0, Math.PI * 2);
            } else {
              const r = el.radius?.includes(" ") ? el.radius.split(" ").map((v) => parseFloat(v) || 0) : parseFloat(el.radius || "0");
              ctx.roundRect(el.x, el.y, el.w, el.h, r);
            }
            ctx.clip();
            ctx.filter = filter;
            const imgRatio = img.width / img.height;
            const targetRatio = el.w / el.h;
            let sW, sH, sX, sY;
            if (imgRatio > targetRatio) {
              sH = img.height; sW = img.height * targetRatio;
              sX = (img.width - sW) / 2; sY = 0;
            } else {
              sW = img.width; sH = img.width / targetRatio;
              sX = 0; sY = (img.height - sH) / 2;
            }
            ctx.drawImage(img, sX, sY, sW, sH, el.x, el.y, el.w, el.h);
          } else {
            ctx.filter = "none";
            const imgRatio = img.width / img.height;
            const targetRatio = el.w / el.h;
            let dW, dH, dX, dY;
            if (imgRatio > targetRatio) {
              dW = el.w; dH = el.w / imgRatio;
              dX = el.x; dY = el.y + (el.h - dH) / 2;
            } else {
              dH = el.h; dW = el.h * imgRatio;
              dX = el.x + (el.w - dW) / 2; dY = el.y;
            }
            ctx.drawImage(img, dX, dY, dW, dH);
          }
          ctx.restore();
          resolve(null);
        };
        img.onerror = () => resolve(null);
      });
    }
  }, [images, filter, template]);

  useEffect(() => { renderFinalCollage(); }, [renderFinalCollage]);

  const handleFinalizeAndUpload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsUploading(true);
    try {
      const sessionId = `cam-${Date.now()}`;
      const finalUrl = `${window.location.origin}/download/${sessionId}`;
      await renderFinalCollage();
      const stripData = canvas.toDataURL("image/jpeg", 0.9);
      gifshot.createGIF({
        images: images, interval: 0.4, gifWidth: 400, gifHeight: 300,
        filter: filter === "none" ? "" : filter, numWorkers: 2,
      }, async (obj: GifshotResponse) => {
        const upload = async (file: string, suf: string) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "strips");
          formData.append("public_id", `cameree/sessions/${sessionId}_${suf}`);
          return fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
        };
        await Promise.all([upload(stripData, "strip"), upload(obj.image, "gif")]);
        setShareUrl(finalUrl);
        setIsUploading(false);
        setIsDone(true);
      });
    } catch (err) { 
      console.error("Upload Error:", err);
      setIsUploading(false); 
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 w-full h-full bg-[#d8d2c9] flex items-center justify-center p-4 overflow-hidden"
    >
      <div className={`flex flex-row w-full h-full max-w-[1400px] items-center justify-center ${isMobileView ? 'gap-0' : 'gap-10'}`}>
        
        {/* PRINTER AREA */}
        <div className={`flex-[1.5] h-full flex flex-col items-center justify-center relative`}>
          <div className={`relative flex flex-col items-center transition-all duration-700 ${isMobileView ? 'scale-[0.89] -translate-x-6' : 'scale-90 md:scale-100'}`}>
            <div className={`${isMobileView ? 'w-[300px] h-18' : 'w-[400px] h-28'} bg-[#222224] rounded-t-[4rem] z-40 shadow-2xl border-x-[15px] border-[#161618] relative flex flex-col items-center`}>
              <div className="mt-4 px-3 py-1 border border-white/5 rounded-full">
                <p className="text-[4px] md:text-[6px] font-black text-white/30 uppercase tracking-[0.5em] italic leading-none">Caméree Printer</p>
              </div>
              
              <div className="absolute top-[40%] left-10 flex items-center gap-2.5 bg-[#0f0f10] px-2 py-1.5 md:px-4 md:py-2 rounded-full border border-white/5">
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-500 ${
                  isPrinting || isUploading 
                    ? "bg-red-500 animate-pulse shadow-[0_0_10px_red]" 
                    : "bg-green-500 shadow-[0_0_10px_green]"
                }`} />
                <span className="text-[6px] md:text-[8px] font-black text-white uppercase tracking-widest italic">
                  {isPrinting ? "Printing..." : isUploading ? "Uploading..." : "Ready"}
                </span>
              </div>
            </div>

            <div className={`${isMobileView ? 'w-[260px] h-20' : 'w-[340px] h-30'} absolute top-3 bg-black/90 rounded-full shadow-2xl -mt-8 z-10`} />
            <div className={`${isMobileView ? 'w-[260px] h-20' : 'w-[340px] h-30'} absolute top-2/12 md:top-2/11 bg-black/90 shadow-2xl -mt-8 z-10`} />
            <div className={`${isMobileView ? 'w-[263px] h-6' : 'w-[343px] h-10'} bg-[#100f0f] rounded-full shadow-2xl -mt-4 md:-mt-6 z-50`} />

            <div className={`relative z-10 overflow-hidden ${isMobileView ? 'h-[62vh] w-[360px]' : 'h-[62vh] w-[460px]'} flex justify-center -mt-1 pointer-events-none`}>
              <motion.div
                initial={{ y: -800 }}
                animate={isPrinting ? { y: 0 } : { y: 0 }}
                transition={{ duration: 8, ease: [0.33, 1, 0.68, 1] }}
                className="origin-top drop-shadow-2xl shadow-2xl"
              >
                <canvas ref={canvasRef} className={`${isMobileView ? 'max-h-[62vh]' : 'max-h-[62vh]'} w-auto h-auto block`} />
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {shareUrl && (
              <motion.div 
                initial={{ scale: 0, opacity: 0, x: 50 }} 
                animate={{ scale: 1, opacity: 1, x: 0 }} 
                className={`absolute ${isMobileView ? 'left-[75%] -translate-x-1/2 top-2/17' : 'left-[65%] top-2/9 -translate-y-1/2'} p-2 rotate-6 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-4 border-[#1a1a1c] z-[100] flex flex-col items-center`}
              >
                <div className="md:p-0.5 bg-zinc-50 rounded-2xl">
                  <QRCodeSVG value={shareUrl} size={isMobileView ? 75 : 110} includeMargin />
                </div>
                <p className="text-[7px] md:text-[9px] font-black text-[#1a1a1c] uppercase italic text-center tracking-tighter mt-1">Scan to Download</p>
              </motion.div>
             )} 
          </AnimatePresence>
        </div>

        {/* SIDEBAR TOOLS */}
        <div className={`flex flex-col bg-white/40 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white/50 z-50 shadow-2xl shrink-0 transition-all h-[90vh] ${isMobileView ? 'w-xs p-5 mr-8' : 'w-72 md:w-xl p-8'}`}>
          <div className="flex items-center gap-2 opacity-40 mb-4">
            <Loader2 size={14} className="text-[#153378]" />
            <h3 className="text-[8px] md:text-[10px] font-black text-[#153378] uppercase tracking-[0.3em]">Filter</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1" style={{ scrollbarWidth: "none" }}>
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                disabled={isUploading}
                className={`w-full flex items-center mt-1 gap-3 md:gap-4 p-2 md:p-3 rounded-2xl border-2 transition-all ${filter === f.id ? "bg-[#153378] border-[#153378] text-white shadow-xl -translate-y-1" : "bg-white/60 border-transparent hover:border-white/80 text-[#153378]"}`}
              >
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0 shadow-inner ${f.class}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[0]} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex flex-col items-start overflow-hidden leading-tight">
                  <span className="text-[9px] md:text-[11px] font-black uppercase truncate w-full tracking-tighter">{f.label}</span>
                  <span className="text-[6px] md:text-[7px] font-bold uppercase opacity-50 tracking-widest">Select</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 md:mt-6 space-y-3 shrink-0 border-t border-[#153378]/10 pt-3 md:pt-6">
            {!isDone ? (
              <button onClick={handleFinalizeAndUpload} disabled={isUploading} className={`w-full bg-[#153378] text-[#d8d2c9] font-black rounded-full flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all group disabled:opacity-50 ${isMobileView ? 'py-2' : 'py-4'}`}>
                {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <QrCode size={18} />}
                <span className="uppercase italic text-[8px] md:text-[10px] tracking-widest">{isUploading ? "..." : "Softfile"}</span>
              </button>
            ) : (
              <div className="py-2 md:py-4 bg-green-500/10 border-2 border-green-500/20 rounded-full flex items-center justify-center gap-3 text-green-700 font-black text-[10px] uppercase tracking-widest">
                <CheckCircle2 size={16} /> Ready!
              </div>
            )}
            <button onClick={onRetake} disabled={isUploading} className="w-full text-[#153378]/40 hover:text-red-500 font-black text-[7px] md:text-[9px] uppercase tracking-[0.4em] py-2 transition-colors flex items-center justify-center gap-2 group">
              <X size={12} /> Retake
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  ); 
}