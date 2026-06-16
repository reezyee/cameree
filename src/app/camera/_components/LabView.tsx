"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
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
  filter: string;
}

interface GifshotResponse {
  error: boolean;
  errorCode: string;
  errorMsg: string;
  image: string;
}

export default function LabView({
  images,
  template,
  onRetake,
  isMobileView,
  filter,
}: LabViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setIsPrinting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [printAnimationDone, setPrintAnimationDone] = useState(false);
  const triggerAutomaticPrintSound = useCallback(() => {
    if (window.playPrintSoundGlobal) {
      window.playPrintSoundGlobal();

      console.log("🖨️ Global print sound executed perfectly");
    }
  }, []);

  useEffect(() => {
    const autoStart = setTimeout(() => {
      setIsPrinting(true);
      triggerAutomaticPrintSound();
    }, 500);

    const stopPrinting = setTimeout(() => {
      setIsPrinting(false);
      setPrintAnimationDone(true);
    }, 6500);

    return () => {
      clearTimeout(autoStart);
      clearTimeout(stopPrinting);
    };
  }, [triggerAutomaticPrintSound]);

  const forceCanvasRefresh = (canvas: HTMLCanvasElement) => {
    const w = canvas.width;
    canvas.width = w + 1;
    canvas.width = w;
  };

  const renderFinalCollage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = template.canvasWidth;
    canvas.height = template.canvasHeight;
    forceCanvasRefresh(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (filter && filter !== "none") {
      ctx.filter = filter;
    }
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
      img.src =
        el.type === "photo"
          ? images[allElements.filter((it) => it.type === "photo").indexOf(el)]
          : el.src || "";

      img.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        const processImage = () => {
          ctx.save();
          const centerX = el.x + el.w / 2;
          const centerY = el.y + el.h / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate(((el.rotate || 0) * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
          if (el.type === "photo") {
            ctx.beginPath();
            if (el.radius === "50%") {
              ctx.ellipse(
                centerX,
                centerY,
                el.w / 2,
                el.h / 2,
                0,
                0,
                Math.PI * 2,
              );
            } else {
              const r = el.radius?.includes(" ")
                ? el.radius.split(" ").map((v) => parseFloat(v) || 0)
                : parseFloat(el.radius || "0");
              ctx.roundRect(el.x, el.y, el.w, el.h, r);
            }
            ctx.clip();

            const offscreenCanvas = document.createElement("canvas");
            offscreenCanvas.width = el.w;
            offscreenCanvas.height = el.h;
            const oCtx = offscreenCanvas.getContext("2d");
            if (oCtx) {
              const imgRatio = img.width / img.height;
              const targetRatio = el.w / el.h;
              let sW, sH, sX, sY;
              if (imgRatio > targetRatio) {
                sH = img.height;
                sW = img.height * targetRatio;
                sX = (img.width - sW) / 2;
                sY = 0;
              } else {
                sW = img.width;
                sH = img.width / targetRatio;
                sX = 0;
                sY = (img.height - sH) / 2;
              }
              oCtx.drawImage(img, sX, sY, sW, sH, 0, 0, el.w, el.h);
              ctx.drawImage(offscreenCanvas, el.x, el.y);
            }
          } else {
            ctx.filter = "none";
            const imgRatio = img.width / img.height;
            const targetRatio = el.w / el.h;
            let dW, dH, dX, dY;
            if (imgRatio > targetRatio) {
              dW = el.w;
              dH = el.w / imgRatio;
              dX = el.x;
              dY = el.y + (el.h - dH) / 2;
            } else {
              dH = el.h;
              dW = el.h * imgRatio;
              dX = el.x + (el.w - dW) / 2;
              dY = el.y;
            }
            ctx.drawImage(img, dX, dY, dW, dH);
          }
          ctx.restore();
          resolve(null);
        };

        if (img.complete) {
          setTimeout(processImage, 40);
        } else {
          img.onload = processImage;

          img.onerror = () => resolve(null);
        }
      });
    }
    ctx.filter = "none";
  }, [images, template, filter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      renderFinalCollage();
    }, 60);

    return () => clearTimeout(timeout);
  }, [images, template, renderFinalCollage]);

  const handleFinalizeAndUpload = async () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    setIsUploading(true);

    try {
      const sessionId = `cam-${Date.now()}`;

      const finalUrl = `${window.location.origin}/download/${sessionId}`;

      await renderFinalCollage();

      const stripData = canvas.toDataURL("image/jpeg", 0.9);

      gifshot.createGIF(
        {
          images: images,

          interval: 0.8,

          gifWidth: 400,

          gifHeight: 300,

          filter: "",

          numWorkers: 2,
        },

        async (obj: GifshotResponse) => {
          const upload = async (file: string, suf: string) => {
            const formData = new FormData();

            formData.append("file", file);

            formData.append("upload_preset", "strips");

            formData.append(
              "public_id",

              `cameree/sessions/${sessionId}_${suf}`,
            );

            if (suf === "gif") {
              formData.append("resource_type", "auto");
            }

            return fetch(
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,

              { method: "POST", body: formData },
            );
          };

          await Promise.all([
            upload(stripData, "strip"),

            upload(obj.image, "gif"),
          ]);

          setShareUrl(finalUrl);

          setIsUploading(false);

          setIsDone(true);
        },
      );
    } catch (err) {
      console.error("Upload Error:", err);

      setIsUploading(false);
    }
  };

  const templateRatio = template
    ? template.canvasWidth / template.canvasHeight
    : 1 / 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 w-full h-full bg-[#d8d2c9] flex items-center justify-center p-2 overflow-auto"
    >
      <div className="flex flex-row w-full h-full items-center justify-center gap-2 md:gap-6 relative py-2">
        {/* Printer */}
        <div className="w-auto flex flex-col items-center justify-center relative shrink-0">
          <div className="bg-linear-to-b from-zinc-300 via-zinc-100 to-zinc-400 border border-neutral-400 p-1 md:py-7 shadow-md rounded-sm text-center mb-2 w-24 md:w-52 flex flex-col items-center justify-center leading-none z-20 shrink-0">
            <span className="text-[5px] md:text-[8px] font-black text-neutral-800 uppercase tracking-[0.15em]">
              Photos
            </span>
            <span className="text-[5px] md:text-[8px] font-black text-neutral-800 uppercase tracking-[0.15em] mt-0.5">
              Delivered Here
            </span>
            <span className="text-[5px] md:text-[8px] font-black text-neutral-800 uppercase tracking-[0.15em] mt-0.5">
              in 6 seconds
            </span>
            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-4 border-t-neutral-800 mt-1" />
          </div>

          <div
            className="bg-linear-to-r from-zinc-400 via-zinc-100 to-zinc-500 p-2 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(255,255,255,0.4)] rounded-md flex justify-center overflow-hidden relative shrink-0 transition-all duration-300"
            style={{
              height: isMobileView ? "55vh" : "62vh",
              width: `calc(${isMobileView ? "55vh" : "62vh"} * ${templateRatio} + 80px)`,
            }}
          >
            <div className="absolute top-1 left-1 w-2 h-2 bg-[#404040] rounded-full z-50" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-[#404040] rounded-full z-50" />
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-[#404040] rounded-full z-50" />
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-[#404040] rounded-full z-50" />

            <div className="w-full h-full bg-linear-to-b from-[#111112] via-[#202022] to-[#151516] rounded shadow-[inset_0_12px_25px_rgba(0,0,0,0.95)] relative overflow-hidden flex justify-center border border-black/40">
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-b from-neutral-800 to-black border-b border-black shadow-md z-30" />
              <div className="absolute top-20 bottom-0 left-1/2 w-2 bg-linear-to-r from-zinc-300 via-white to-zinc-500 shadow-sm z-40 transform -translate-x-1/2 border-x border-black/10" />
              <div className="absolute top-20 inset-x-0 h-2 bg-linear-to-b from-zinc-300 via-white to-zinc-500 shadow-sm z-40 border-y border-black/10" />

              <div className="absolute inset-0 z-10 flex justify-center overflow-hidden">
                <motion.div
                  initial={{ y: "-100%" }}
                  animate={
                    printAnimationDone
                      ? {
                          y: [0, 14, 8],
                          rotate: [0, -5.5, -3.8],
                          x: [0, -7, -4],
                        }
                      : { y: 0 }
                  }
                  transition={
                    printAnimationDone
                      ? { duration: 0.6, ease: "easeOut" }
                      : { duration: 6.5, ease: "linear" }
                  }
                  className="w-full h-full p-2 flex items-start justify-center absolute top-0.5"
                >
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[94%] block shadow-2xl object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code*/}
        <div
          className={`flex flex-col bg-[#d8d2c9] border-t-8 border-t-[#153378] shadow-xl md:py-20 shrink-0 ${isMobileView ? "w-[130px]" : "w-[320px]"}`}
          style={{ height: isMobileView ? "55vh" : "auto" }}
        >
          <div className="flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {shareUrl ? (
                <motion.a
                  key="qr"
                  href={shareUrl}
                  target="_blank"
                  className="p-2 bg-white border border-[#153378]/20 shadow-md"
                >
                  <QRCodeSVG value={shareUrl} size={isMobileView ? 60 : 100} />
                </motion.a>
              ) : (
                <p className="text-[#153378]/40 text-[7px] uppercase tracking-widest text-center">
                  Ready to Get QR
                </p>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-auto space-y-2 pt-4">
            {!isDone && (
              <button
                onClick={handleFinalizeAndUpload}
                disabled={isUploading}
                className="w-full bg-[#153378] cursor-pointer text-[#d8d2c9] py-3 font-black text-[8px] uppercase tracking-[0.2em] hover:bg-[#153378]/70 transition-all"
              >
                {isUploading ? "..." : "Get QR"}
              </button>
            )}
            <button
              onClick={onRetake}
              className="flex gap-1 justify-center cursor-pointer w-full text-[#153378]/40 hover:text-[#153378] font-bold text-[7px] uppercase tracking-[0.2em] py-2"
            >
              <RefreshCw size={10} /> New Session
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
