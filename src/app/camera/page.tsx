"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Camera,
  RefreshCcw,
  Download,
  RotateCw,
  FlipHorizontal,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { OVERLAY_PACKS } from "@/types/overlays";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveFilterCanvasRef = useRef<HTMLCanvasElement>(null);
  const collageCanvasRef = useRef<HTMLCanvasElement>(null);

  const [showRotateScreen, setShowRotateScreen] = useState(false);

  const [selectedBackground, setSelectedBackground] = useState<{
    src: string;
    overlayPackId: string;
  } | null>(null);

  type FilterType = "none" | "grayscale" | "sepia" | "retro" | "pastel";
  const [filter, setFilter] = useState<FilterType>("none");

  const [selectedOverlayPack, setSelectedOverlayPack] =
    useState<string>("none");
  const [collageImages, setCollageImages] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [gridLayout, setGridLayout] = useState<"3x1" | "4x1">("4x1");

  const isCaptureLocked = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const filters = [
    { id: "none", label: "No Filter", src: "/filters/no-filter.jpeg" },
    { id: "grayscale", label: "B&W", src: "/filters/B&W.jpeg" },
    { id: "sepia", label: "Sepia", src: "/filters/sepia.jpeg" },
    { id: "retro", label: "Retro", src: "/filters/retro.png" },
    { id: "pastel", label: "Pastel", src: "/filters/pastel.jpg" },
  ] as const;

  const backgroundPresets = [
    {
      src: "/images/billieeilish.jpg",
      name: "Billie Eilish",
      overlayPackId: "billie",
      thumbnail: "/thumbnails/be.png",
    },
    {
      src: "/images/st.jpg",
      name: "Stranger Things",
      overlayPackId: "strangerthings",
      thumbnail: "/thumbnails/st.png",
    },
    {
      src: "/images/hp.jpg",
      name: "Harry Potter",
      overlayPackId: "harrypotter",
      thumbnail: "/thumbnails/hp.png",
    },
  ];

  const [backgroundMode, setBackgroundMode] = useState<"color" | "image">(
    "color",
  );
  const [backgroundColor, setBackgroundColor] = useState<string>("#f5e6d8");
  const colorPickers = "/images/colorpicker.webp";

  // ORIENTATION CHECK
  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowRotateScreen(isPortrait);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // LIVE FILTER PREVIEW
  const startLiveFilterPreview = useCallback(() => {
    if (!videoRef.current || !liveFilterCanvasRef.current) return;

    let animationFrameId: number;

    const process = () => {
      const video = videoRef.current;
      const canvas = liveFilterCanvasRef.current;

      if (!video || !canvas) {
        animationFrameId = requestAnimationFrame(process);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationFrameId = requestAnimationFrame(process);
        return;
      }

      // Set canvas size
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Video ready check
      if (video.readyState < video.HAVE_ENOUGH_DATA) {
        animationFrameId = requestAnimationFrame(process);
        return;
      }

      // Mirror
      ctx.save();
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Apply filter
      if (filter !== "none") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        if (filter === "grayscale") {
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
          }
        } else if (filter === "sepia") {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i],
              g = data[i + 1],
              b = data[i + 2];
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          }
        } else if (filter === "retro") {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.15);
            data[i + 1] = Math.min(255, data[i + 1] * 1.05);
            data[i + 2] = Math.max(0, data[i + 2] * 0.85);
          }
        } else if (filter === "pastel") {
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg + (data[i] - avg) * 0.7 + 25;
            data[i + 1] = avg + (data[i + 1] - avg) * 0.7 + 25;
            data[i + 2] = avg + (data[i + 2] - avg) * 0.7 + 25;
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      animationFrameId = requestAnimationFrame(process);
    };

    // Cleanup sebelum mulai loop baru
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameId = requestAnimationFrame(process);
    animationFrameRef.current = animationFrameId;

    // Cleanup saat component unmount
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [filter, isMirrored]);

  // START CAMERA
  const startCamera = useCallback(async () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startLiveFilterPreview();
        };
      }
    } catch {
      alert("Camera access failed! Please allow camera access.");
    }
  }, [facingMode, startLiveFilterPreview]);

  // CAPTURE SINGLE PHOTO
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !liveFilterCanvasRef.current)
      return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.save();
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (filter !== "none") ctx.drawImage(liveFilterCanvasRef.current, 0, 0);

    const maxPhotos = gridLayout === "3x1" ? 3 : 4;
    setCollageImages((prev) =>
      prev.length < maxPhotos ? [...prev, canvas.toDataURL("image/png")] : prev,
    );
  }, [filter, isMirrored, gridLayout]);

  // CAPTURE SERIES
  const capturePhotoSeries = () => {
    if (isCaptureLocked.current) return;
    isCaptureLocked.current = true;

    setIsCapturing(true);

    const total = gridLayout === "3x1" ? 3 : 4;
    setCollageImages([]);

    let count = 0;

    const shoot = () => {
      let sec = 3;
      setCountdownValue(sec);
      const timer = setInterval(() => {
        sec--;
        setCountdownValue(sec);
        if (sec === 0) {
          clearInterval(timer);
          setCountdownValue(null);
          capturePhoto();
          count++;
          if (count < total) {
            setTimeout(shoot, 800);
          } else {
            setTimeout(() => {
              setIsCapturing(false);
              isCaptureLocked.current = false;
            }, 500);
          }
        }
      }, 1000);
    };
    shoot();
  };

  // DRAW OVERLAYS
  const drawOverlayElements = useCallback(
    async (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const pack = OVERLAY_PACKS.find((p) => p.id === selectedOverlayPack);
      if (!pack?.overlays.length) return;

      for (const ov of pack.overlays) {
        ctx.save();
        ctx.globalAlpha = ov.opacity ?? 1;
        const width = w * ov.width;
        const centerX = w * ov.x;
        const centerY = h * ov.y;
        ctx.translate(centerX, centerY);
        if (ov.rotate) ctx.rotate((ov.rotate * Math.PI) / 180);

        if (ov.type === "image" && ov.src) {
          const img = document.createElement("img");
          img.crossOrigin = "anonymous";
          img.src = ov.src;
          await new Promise<void>((res) => {
            img.onload = () => {
              const height = width * (img.naturalHeight / img.naturalWidth);
              ctx.drawImage(img, -width / 2, -height / 2, width, height);
              res();
            };
            img.onerror = () => res();
          });
        }

        if (ov.type === "text" && ov.text) {
          ctx.font = ov.font ?? "bold 20px Arial";
          ctx.fillStyle = ov.color ?? "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 6;
          ctx.strokeText(ov.text, 0, 0);
          ctx.fillText(ov.text, 0, 0);
        }
        ctx.restore();
      }
    },
    [selectedOverlayPack],
  );

  // RENDER COLLAGE
  const renderCollage = useCallback(async () => {
    if (!collageCanvasRef.current || collageImages.length === 0) return;
    const canvas = collageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = Math.min(window.innerWidth - 32, 420);
    const isMobile = window.innerWidth < 768;
    const padding = isMobile ? 8 : 10;
    const gap = isMobile ? 4 : 6;
    const borderWidth = isMobile ? 0.5 : 1;
    const cornerRadius = isMobile ? 8 : 10;
    const targetAspect = 16 / 9;

    let cellWidth, cellHeight, canvasHeight;
    if (gridLayout === "3x1") {
      cellWidth = canvasWidth - padding * 2;
      cellHeight = cellWidth / targetAspect;
      canvasHeight = padding * 2 + cellHeight * 3 + gap * 2 + 60;
    } else {
      cellWidth = canvasWidth - padding * 2;
      cellHeight = cellWidth / targetAspect;
      canvasHeight = padding * 2 + cellHeight * 4 + gap * 3 + 60;
    }

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    if (backgroundMode === "image" && selectedBackground?.src) {
      const bg = document.createElement("img");
      bg.src = selectedBackground.src;
      await new Promise((r) => {
        bg.onload = r;
        bg.onerror = r;
      });
      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Noise
    const noiseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = noiseData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }
    ctx.putImageData(noiseData, 0, 0);

    // Photos
    await Promise.all(
      collageImages.slice(0, gridLayout === "3x1" ? 3 : 4).map((src, i) => {
        return new Promise<void>((resolve) => {
          const img = document.createElement("img");
          img.src = src;
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const x = padding;
            const y = padding + i * (cellHeight + gap);
            const imgRatio = img.width / img.height;
            let sx = 0,
              sy = 0,
              sw = img.width,
              sh = img.height;
            if (imgRatio > targetAspect) {
              sw = img.height * targetAspect;
              sx = (img.width - sw) / 2;
            } else {
              sh = img.width / targetAspect;
              sy = (img.height - sh) / 2;
            }

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, cellWidth, cellHeight, cornerRadius);
            ctx.clip();
            ctx.drawImage(img, sx, sy, sw, sh, x, y, cellWidth, cellHeight);
            ctx.restore();

            ctx.beginPath();
            ctx.roundRect(x, y, cellWidth, cellHeight, cornerRadius);
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = "rgba(255,255,255,0.95)";
            ctx.stroke();

            resolve();
          };
          img.onerror = () => resolve();
        });
      }),
    );

    // Overlays
    await drawOverlayElements(ctx, canvasWidth, canvasHeight);

    // Watermark
    ctx.font = `bold ${isMobile ? 16 : 20}px Serif`;
    ctx.textAlign = "center";
    ctx.strokeStyle = "#0f3460";
    ctx.lineWidth = 3;
    ctx.strokeText(
      "Caméree  -  Photo Booth",
      canvasWidth / 2,
      canvasHeight - 22,
    );
    ctx.fillStyle = "#f5e6d8";
    ctx.fillText("Caméree  -  Photo Booth", canvasWidth / 2, canvasHeight - 22);
  }, [
    collageImages,
    backgroundColor,
    backgroundMode,
    selectedBackground,
    gridLayout,
    drawOverlayElements,
  ]);

  // DOWNLOAD
  const downloadCollage = useCallback(() => {
    if (!collageCanvasRef.current || collageImages.length === 0) {
      alert("Capture first!");
      return;
    }
    const dataURL = collageCanvasRef.current.toDataURL("image/png");
    const fileName = `cameree-collage-${Date.now()}.png`;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) {
      const win = window.open("", "_blank");
      if (!win) {
        alert("Allow popups for download!");
        return;
      }
      win.document.write(`
        <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Save</title>
        <style>body{margin:0;background:#000;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:system-ui}
        img{max-width:94vw;max-height:76vh;border-radius:16px}button{margin-top:24px;padding:16px 32px;background:#007AFF;color:#fff;border:none;border-radius:14px;font-size:18px}</style></head>
        <body><img src="${dataURL}"><button onclick="save()">Save to Photos</button>
        <div style="margin-top:16px;font-size:14px;opacity:.8">Tekan lama gambar → Add to Photos</div>
        <script>function save(){const a=document.createElement('a');a.href="${dataURL}";a.download="${fileName}";document.body.appendChild(a);a.click();a.remove()}</script>
        </body></html>`);
      win.document.close();
      return;
    }

    const a = document.createElement("a");
    a.href = dataURL;
    a.download = fileName;
    a.click();
  }, [collageImages.length]);

  // EFFECTS
  useEffect(() => {
    if (!showRotateScreen) startCamera();
  }, [startCamera, showRotateScreen]);
  useEffect(() => {
    startLiveFilterPreview();
  }, [startLiveFilterPreview]);
  useEffect(() => {
    if (collageImages.length > 0) renderCollage();
  }, [collageImages.length, renderCollage]);

  // RENDER ROTATE SCREEN
  if (showRotateScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#153378] to-[#153378ee] flex items-center justify-center z-50 text-white text-center px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <RotateCw size={90} className="mx-auto mb-8 animate-spin-slow" />
          <h1 className="text-5xl font-black mb-6">Rotate Your Phone</h1>
          <p className="text-2xl">
            Caméree can only be used in{" "}
            <span className="underline font-bold">landscape</span> mode
          </p>
          <p className="mt-6 text-xl opacity-80">
            Turn the phone left or right!!
          </p>
        </motion.div>
      </div>
    );
  }

  // MAIN UI
  return (
    <>
      <div className="font-serif min-h-screen bg-gradient-to-br from-[#c7c1b6] via-[#d8d2c9] to-[#c7c1b6] flex flex-col overflow-hidden">
        <Link
          href="/"
          className="absolute z-50 left-4 top-4 md:left-6 md:top-6 flex items-center justify-center 
             w-10 h-10 md:w-12 md:h-12
             bg-white/10 backdrop-blur-md border border-white/20 
             rounded-xl shadow-lg transition-all 
             hover:bg-white/20 hover:border-white/40 group active:scale-90"
        >
          <ArrowLeft className="text-[#153378] size-5 md:size-6 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <main className="flex-1 px-4 py-8">
          <div className="flex gap-8 max-w-7xl mx-auto">
            {/* LEFT: CAMERA + CONTROL */}
            <div className="space-y-6 relative w-4xl">
              {/* Preview */}
              <div className="bg-black rounded-3xl overflow-hidden shadow-2xl width-4xl aspect-video relative group">
                {/* Video & Canvas Elements */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    isMirrored ? "scale-x-[-1]" : ""
                  } ${filter !== "none" ? "hidden" : ""}`}
                />
                <canvas
                  ref={liveFilterCanvasRef}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    filter === "none" ? "hidden" : ""
                  }`}
                />

                {/* Countdown */}
                {countdownValue !== null && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.15, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute w-96 h-96 rounded-full bg-white/10 blur-3xl" />
                    <span className="relative text-[14rem] font-black text-white drop-shadow-2xl [text-shadow:0_0_80px_rgba(255,255,255,0.8)] animate-pulse">
                      {countdownValue}
                    </span>
                    {countdownValue === 1 && (
                      <div className="absolute inset-0 bg-white/20 animate-ping" />
                    )}
                  </motion.div>
                )}

                {/* CAMERA CONTROL */}
                <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-2 transition-opacity">
                  {/* Switch Button */}
                  <button
                    onClick={() => {
                      setFacingMode((prev) =>
                        prev === "user" ? "environment" : "user",
                      );
                      setCollageImages([]);
                    }}
                    disabled={isCapturing}
                    title="Switch Camera"
                    className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full shadow-lg hover:bg-white/40 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCcw size={20} />
                  </button>

                  {/* Mirroring*/}
                  <button
                    onClick={() => setIsMirrored((p) => !p)}
                    disabled={isCapturing}
                    title={isMirrored ? "Unmirror" : "Mirror"}
                    className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full shadow-lg hover:bg-white/40 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FlipHorizontal size={20} />
                  </button>

                  {/* Layout toggle */}
                  <Button
                    onClick={() =>
                      setGridLayout((prev) => (prev === "4x1" ? "3x1" : "4x1"))
                    }
                    disabled={isCapturing}
                    size="sm"
                    title="Strips"
                    variant="outline"
                    className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full shadow-lg hover:bg-white/40 hover:text-white transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {gridLayout === "3x1" ? "3×1" : "4×1"}
                  </Button>

                  {/* Start Button */}
                  <button
                    onClick={capturePhotoSeries}
                    disabled={isCapturing}
                    className="w-14 h-14 rounded-full flex items-center justify-center 
             backdrop-blur-lg bg-blue-500/30 border border-blue-400/30 
             text-white shadow-xl transition-all 
             hover:bg-blue-600/50 hover:scale-105
             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera size={28} />
                  </button>
                </div>
              </div>

              {/* Filter & Background Controls */}
              <div className="bg-white/20 backdrop-blur-xl flex flex-col md:flex-row items-center justify-evenly rounded-3xl shadow-xl border border-white/40 p-4 gap-4 min-h-[110px]">
                {/* Camera Filters */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {filters.map(({ id, label, src }) => (
                      <button
                        key={id}
                        onClick={() => !isCapturing && setFilter(id)}
                        disabled={isCapturing}
                        className={`group relative w-12 h-12 rounded-xl overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          filter === id
                            ? "ring-4 ring-[#153378] scale-105 shadow-md"
                            : "hover:scale-105"
                        }`}
                      >
                        <Image
                          src={src}
                          alt={label}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[8px] text-white font-bold uppercase">
                            {label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seperator */}
                <div className="hidden md:block w-[1px] h-16 bg-[#153378]/10 mx-2" />

                {/* Background Option (Colour / Theme) */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col bg-white/30 p-1 rounded-2xl border border-white/20">
                    <button
                      onClick={() => {
                        setBackgroundMode("color");
                        setSelectedOverlayPack("none");
                        setSelectedBackground(null);
                      }}
                      className={`p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${backgroundMode === "color" ? "bg-[#153378] text-white shadow-md" : "text-[#153378] hover:bg-white/50"}`}
                      disabled={isCapturing}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m21 11-8-8" />
                        <path d="M21 16v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                        <path d="m21 11-10 10" />
                        <path d="m21 11-10 10" />
                        <path d="M12 11.5a4.5 4.5 0 0 1-9 0" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setBackgroundMode("image")}
                      className={`p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${backgroundMode === "image" ? "bg-[#153378] text-white shadow-md" : "text-[#153378] hover:bg-white/50"}`}
                      disabled={isCapturing}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1">
                    {backgroundMode === "color" ? (
                      <div className="flex flex-wrap gap-1.5 items-center animate-in fade-in zoom-in duration-300">
                        {[
                          "#f5e6d8",
                          "#1e293b",
                          "#0f3460",
                          "#285A48",
                          "#AA2B1D",
                          "#000000",
                        ].map((c) => (
                          <button
                            key={c}
                            onClick={() => setBackgroundColor(c)}
                            style={{ backgroundColor: c }}
                            disabled={isCapturing}
                            className={`w-7 h-7 rounded-full border-2 border-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${backgroundColor === c ? "ring-2 ring-[#153378] scale-110 shadow-md" : "hover:scale-110"}`}
                          />
                        ))}
                        <div className="w-[1px] h-5 bg-[#153378]/10 mx-1" />
                        <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url(${colorPickers})`,
                              backgroundSize: "cover",
                            }}
                          />
                          <input
                            type="color"
                            value={
                              backgroundColor.startsWith("#")
                                ? backgroundColor
                                : "#ffffff"
                            }
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            disabled={isCapturing}
                            className="absolute inset-0 w-[200%] h-[200%] cursor-pointer opacity-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ transform: "translate(-25%, -25%)" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        {backgroundPresets.map((p) => {
                          const active =
                            selectedBackground?.overlayPackId ===
                            p.overlayPackId;
                          return (
                            <button
                              key={p.overlayPackId}
                              onClick={() => {
                                setSelectedBackground({
                                  src: p.src,
                                  overlayPackId: p.overlayPackId,
                                });
                                setSelectedOverlayPack(p.overlayPackId);
                              }}
                              disabled={isCapturing}
                              className={`relative w-11 h-20 rounded-xl overflow-hidden border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${active ? "border-[#153378] scale-110 shadow-lg" : "border-transparent opacity-70"}`}
                            >
                              <Image
                                src={p.thumbnail}
                                alt={p.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <p className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white font-bold py-0.5 truncate">
                                {p.name}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: PREVIEW COLLAGE */}
            <div className="bg-white/20 width-3xl backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 flex flex-col items-center justify-center flex-1 relative">
              {collageImages.length === 0 ? (
                <div className="text-center">
                  <Camera
                    size={80}
                    className="mx-auto text-[#153378] mb-6 opacity-40"
                  />
                  <h2 className="text-3xl font-bold text-[#153378]">
                    Ready to Shine!
                  </h2>
                  <p className="mt-4 text-lg text-[#153378]/80 px-4">
                    Press the button to start taking{" "}
                    {gridLayout === "3x1" ? "3" : "4"} photos.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full max-w-full">
                  <div className="relative group overflow-hidden bg-white/10">
                    <canvas
                      ref={collageCanvasRef}
                      className="h-auto w-full block mx-auto shadow-lg"
                      style={{
                        maxWidth: gridLayout === "3x1" ? "280px" : "230px",
                        maxHeight: gridLayout === "3x1" ? "560px" : "590px",
                      }}
                    />
                  </div>
                  {/* Preview Control */}
                  {collageImages.length === (gridLayout === "3x1" ? 3 : 4) && (
                    <div className="absolute top-3 right-3 flex flex-row gap-2 transition-opacity duration-300 z-30">
                      <button
                        onClick={downloadCollage}
                        className="w-10 h-10 flex items-center justify-center bg-[#153378] text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => setCollageImages([])}
                        className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </>
  );
}
