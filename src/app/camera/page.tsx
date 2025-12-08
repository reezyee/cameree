"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, RefreshCcw, Download, RotateCw } from "lucide-react";
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
  const [backgroundColor, setBackgroundColor] = useState<string>("#f5e6d8");
  const [backgroundMode, setBackgroundMode] = useState<"color" | "image">(
    "color"
  );
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [gridLayout, setGridLayout] = useState<"2x2" | "4x1">("4x1");

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

  // DETEKSI ORIENTASI + POPUP ROTASI
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

      // DOBEL CHECK: pastikan DOM element benar-benar ada
      if (!video || !canvas) {
        animationFrameId = requestAnimationFrame(process);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animationFrameId = requestAnimationFrame(process);
        return;
      }

      // Set canvas size sesuai video
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Cek apakah video sudah ready
      if (video.readyState < video.HAVE_ENOUGH_DATA) {
        animationFrameId = requestAnimationFrame(process);
        return;
      }

      // Mirror jika perlu
      ctx.save();
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      // Gambar video ke canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Apply filter (sama seperti sebelumnya)
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

    setCollageImages((prev) =>
      prev.length < 4 ? [...prev, canvas.toDataURL("image/png")] : prev
    );
  }, [filter, isMirrored]);

  // CAPTURE SERIES (SELALU 4 FOTO)
  const capturePhotoSeries = () => {
    if (isCaptureLocked.current) return;
    isCaptureLocked.current = true;
    setIsCapturing(true);
    setCollageImages([]);

    let count = 0;
    const total = 4;

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
          if (count < total) setTimeout(shoot, 800);
          else {
            setIsCapturing(false);
            isCaptureLocked.current = false;
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
    [selectedOverlayPack]
  );

  // RENDER COLLAGE (LANDSCAPE ONLY)
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
    const borderWidth = isMobile ? 2 : 3;
    const cornerRadius = isMobile ? 10 : 14;
    const targetAspect = 16 / 9;

    let cellWidth, cellHeight, canvasHeight;
    if (gridLayout === "2x2") {
      cellWidth = (canvasWidth - padding * 2 - gap) / 2;
      cellHeight = cellWidth / targetAspect;
      canvasHeight = padding * 2 + cellHeight * 2 + gap + 60;
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
      const noise = (Math.random() - 0.5) * 50;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }
    ctx.putImageData(noiseData, 0, 0);

    // Photos
    await Promise.all(
      collageImages.map((src, i) => {
        return new Promise<void>((resolve) => {
          const img = document.createElement("img");
          img.src = src;
          img.crossOrigin = "anonymous";
          img.onload = () => {
            let x, y;
            if (gridLayout === "2x2") {
              const row = Math.floor(i / 2);
              const col = i % 2;
              x = padding + col * (cellWidth + gap);
              y = padding + row * (cellHeight + gap);
            } else {
              x = padding;
              y = padding + i * (cellHeight + gap);
            }

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
      })
    );

    // Overlays
    await drawOverlayElements(ctx, canvasWidth, canvasHeight);

    // Watermark
    ctx.font = `bold ${isMobile ? 16 : 20}px Serif`;
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 6;
    ctx.strokeText(
      "Caméree  -  Photo Booth",
      canvasWidth / 2,
      canvasHeight - 22
    );
    ctx.fillStyle = "#ffffff";
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
        alert("Izinkan popup untuk download!");
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

  // POPUP ROTASI
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
            <span className="underline font-bold">landscape</span>
            {" "}mode
          </p>
          <p className="mt-6 text-xl opacity-80">Turn the phone left or right!!</p>
        </motion.div>
      </div>
    );
  }

  // MAIN UI
  return (
    <>
      <div className="font-serif min-h-screen bg-gradient-to-br from-[#c7c1b6] via-[#d8d2c9] to-[#c7c1b6] flex flex-col overflow-hidden">
        <header className="py-8 px-6 text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#153378] to-[#153378dd]">
            <Link href="/">Caméree</Link>
          </h1>
          <p className="mt-2 text-xl text-[#153378]/90">
            Interactive Photo Booth
          </p>
        </header>

        <main className="flex-1 px-4 pb-8">
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* KIRI: KAMERA + KONTROL */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="bg-black rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-4xl aspect-video relative">
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
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                    <div className="absolute w-96 h-96 rounded-full bg-white/10 blur-3xl" />
                    <span className="relative text-[14rem] font-black text-white drop-shadow-2xl [text-shadow:0_0_80px_rgba(255,255,255,0.8)] animate-pulse">
                      {countdownValue}
                    </span>
                    {countdownValue === 1 && (
                      <div className="absolute inset-0 bg-white/20 animate-ping" />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Kontrol */}
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-6 space-y-6">
                {/* Filter */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {filters.map(({ id, label, src }) => (
                    <button
                      key={id}
                      onClick={() => !isCapturing && setFilter(id)}
                      disabled={isCapturing}
                      className={`relative overflow-hidden rounded-2xl transition-all ${
                        filter === id
                          ? "ring-4 ring-[#153378] scale-110"
                          : "hover:scale-105"
                      } ${isCapturing && "opacity-50"}`}
                    >
                      <Image
                        src={src}
                        alt={label}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-2xl"
                      />
                      <span className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-end justify-center pb-2 text-white text-xs font-bold">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => {
                      setFacingMode((prev) =>
                        prev === "user" ? "environment" : "user"
                      );
                      setCollageImages([]);
                    }}
                    disabled={isCapturing}
                    variant="outline"
                    className="bg-white/50"
                  >
                    <RefreshCcw className="mr-2" size={18} /> Switch
                  </Button>
                  <Button
                    onClick={() => setIsMirrored((p) => !p)}
                    disabled={isCapturing}
                    variant="outline"
                    className="bg-white/50"
                  >
                    {isMirrored ? "Unmirror" : "Mirror"}
                  </Button>
                  <Button
                    onClick={() => setCollageImages([])}
                    disabled={isCapturing}
                    variant="destructive"
                  >
                    Clear
                  </Button>
                </div>

                {/* Background & Layout */}
                <div className="space-y-6">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        if (!isCapturing) {
                          setBackgroundMode("color");
                          setSelectedOverlayPack("none");
                          setSelectedBackground(null);
                        }
                      }}
                      className={`px-5 py-2 rounded-full font-bold ${
                        backgroundMode === "color"
                          ? "bg-[#153378] text-white"
                          : "bg-white/50 text-[#153378]"
                      }`}
                    >
                      Colour
                    </button>
                    <button
                      onClick={() => !isCapturing && setBackgroundMode("image")}
                      className={`px-5 py-2 rounded-full font-bold ${
                        backgroundMode === "image"
                          ? "bg-[#153378] text-white"
                          : "bg-white/50 text-[#153378]"
                      }`}
                    >
                      Theme
                    </button>
                  </div>

                  {backgroundMode === "color" && (
                    <div className="flex justify-center gap-3 flex-wrap">
                      {[
                        "#f5e6d8",
                        "#1e293b",
                        "#0f3460",
                        "#e94560",
                        "#ff6b6b",
                        "#4ecdc4",
                        "#ffe66d",
                        "#a8e6cf",
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() => !isCapturing && setBackgroundColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-10 h-10 rounded-full border-2 border-white/80 ${
                            backgroundColor === c ? "ring-4 ring-[#153378]" : ""
                          }`}
                        />
                      ))}
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) =>
                          !isCapturing && setBackgroundColor(e.target.value)
                        }
                        className="w-12 h-12 rounded-full cursor-pointer"
                      />
                    </div>
                  )}

                  {backgroundMode === "image" && (
                    <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                      {backgroundPresets.map((p) => {
                        const active =
                          selectedBackground?.overlayPackId === p.overlayPackId;
                        return (
                          <motion.button
                            key={p.overlayPackId}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              !isCapturing &&
                              (setSelectedBackground({
                                src: p.src,
                                overlayPackId: p.overlayPackId,
                              }),
                              setSelectedOverlayPack(p.overlayPackId))
                            }
                            className={`relative overflow-hidden rounded-2xl ${
                              active ? "ring-4 ring-[#153378]" : ""
                            }`}
                          >
                            <div className="aspect-[3/4] relative">
                              <Image
                                src={p.thumbnail}
                                alt={p.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                              <p className="absolute bottom-2 left-0 right-0 text-white text-[10px] font-bold text-center">
                                {p.name}
                              </p>
                              {active && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-3.5 h-3.5 text-[#153378]"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    onClick={() =>
                      setGridLayout((prev) => (prev === "4x1" ? "2x2" : "4x1"))
                    }
                    disabled={isCapturing}
                    variant="outline"
                    className="w-full"
                  >
                    {gridLayout === "2x2" ? "2×2 Grid" : "4×1 Strip"}
                  </Button>
                </div>

                {/* Start Button */}
                <Button
                  onClick={capturePhotoSeries}
                  disabled={isCapturing}
                  size="lg"
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-[#153378] to-[#153378ee] hover:from-[#153378dd] hover:to-[#153378]"
                >
                  {isCapturing ? "Capturing..." : "Start Photo Booth"}
                </Button>
              </div>
            </div>

            {/* KANAN: PREVIEW COLLAGE */}
            <div className="flex flex-col">
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 flex flex-col flex-1">
                {collageImages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                      <Camera
                        size={100}
                        className="mx-auto text-[#153378] mb-8"
                      />
                      <h2 className="text-4xl font-bold text-[#153378]">
                        Ready to Shine!
                      </h2>
                      <p className="mt-6 text-xl text-[#153378]/80">
                        Press the button to start taking 4 photos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-[#153378] text-center mb-6">
                      Collage Preview
                    </h3>
                    <div className="flex-1 flex items-center justify-center">
                      <canvas
                        ref={collageCanvasRef}
                        className="max-w-full rounded-2xl shadow-2xl"
                      />
                    </div>
                    {collageImages.length === 4 && (
                      <Button
                        onClick={downloadCollage}
                        size="lg"
                        className="mt-8 bg-gradient-to-r from-[#153378] to-[#153378ee] py-8 text-xl"
                      >
                        <Download className="mr-3" size={28} /> Download Collage
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </>
  );
}
