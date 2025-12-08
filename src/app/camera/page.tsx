"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, RefreshCcw, Download } from "lucide-react";
import { OVERLAY_PACKS } from "@/types/overlays";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveFilterCanvasRef = useRef<HTMLCanvasElement>(null);
  const collageCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraAspect, setCameraAspect] = useState<number | null>(null);

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
  const [gridLayout, setGridLayout] = useState<"2x2" | "4x1" | "2x1">("4x1");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "landscape"
  );
  const [isPortraitModeForced, setIsPortraitModeForced] =
    useState<boolean>(false);

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

  // =============== LIVE FILTER ===============
  const startLiveFilterPreview = useCallback(() => {
    if (!videoRef.current || !liveFilterCanvasRef.current) return;

    const process = () => {
      const video = videoRef.current!;
      const canvas = liveFilterCanvasRef.current!;

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(process);
        return;
      }

      // Gunakan ukuran asli video untuk mencegah width/height = 0
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      if (!vw || !vh) {
        animationFrameRef.current = requestAnimationFrame(process);
        return;
      }

      canvas.width = vw;
      canvas.height = vh;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (filter === "grayscale") {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
          d[i] = d[i + 1] = d[i + 2] = avg;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filter === "sepia") {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i],
            g = d[i + 1],
            b = d[i + 2];
          d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filter === "retro") {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.min(255, d[i] * 1.15);
          d[i + 1] = Math.min(255, d[i + 1] * 1.05);
          d[i + 2] = Math.max(0, d[i + 2] * 0.85);
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filter === "pastel") {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
          d[i] = avg + (d[i] - avg) * 0.7;
          d[i + 1] = avg + (d[i + 1] - avg) * 0.7;
          d[i + 2] = avg + (d[i + 2] - avg) * 0.7;
          // lift blacks sedikit
          d[i] += 25;
          d[i + 1] += 25;
          d[i + 2] += 25;
        }
        ctx.putImageData(imgData, 0, 0);
      }
      animationFrameRef.current = requestAnimationFrame(process);
    };

    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(process);
  }, [filter, isMirrored]);

  // =============== CAMERA ===============
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    if (videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode,
          // aspectRatio: { ideal: 0.8 },
          frameRate: { ideal: 30 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();

        if (!videoRef.current) return;

        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;

        if (vw && vh) {
          setCameraAspect(vw / vh); // ← simpan rasio asli kamera
        }

        startLiveFilterPreview();
      };
    } catch (err) {
      console.error(err);
      alert("Gagal mengakses kamera");
    }
  }, [facingMode, orientation, startLiveFilterPreview]);

  // =============== CAPTURE ===============
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !liveFilterCanvasRef.current)
      return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    if (filter !== "none") {
      ctx.drawImage(liveFilterCanvasRef.current, 0, 0);
    } else {
      ctx.save();
      if (isMirrored) {
        ctx.translate(canvasRef.current.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0);
      ctx.restore();
    }

    const dataUrl = canvasRef.current.toDataURL("image/png");
    setCollageImages((prev) => (prev.length < 4 ? [...prev, dataUrl] : prev));
  }, [filter, isMirrored]);

  // =============== OVERLAY DRAWER ===============
  const drawOverlayElements = useCallback(
    async (
      ctx: CanvasRenderingContext2D,
      canvasWidth: number,
      canvasHeight: number
    ) => {
      const pack = OVERLAY_PACKS.find((p) => p.id === selectedOverlayPack);
      if (!pack?.overlays.length) return;

      for (const ov of pack.overlays) {
        ctx.save();
        ctx.globalAlpha = ov.opacity ?? 1;

        const width = canvasWidth * ov.width;
        const centerX = canvasWidth * ov.x;
        const centerY = canvasHeight * ov.y;
        ctx.translate(centerX, centerY);
        if (ov.rotate) ctx.rotate((ov.rotate * Math.PI) / 180);

        if (ov.type === "image" && ov.src) {
          const img = document.createElement("img");
          img.crossOrigin = "anonymous";
          img.src = ov.src;
          await new Promise<void>((res) => {
            img.onload = () => {
              const h = width * (img.naturalHeight / img.naturalWidth);
              ctx.drawImage(img, -width / 2, -h / 2, width, h);
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

  const capturePhotoSeries = () => {
    // CEGAH DOUBLE CLICK SINGKAT
    if (isCaptureLocked.current) return;
    isCaptureLocked.current = true; // 🔒 LOCK LANGSUNG (sync)

    setIsCapturing(true);
    setCollageImages([]); // reset dulu

    // Tentukan berapa foto yang harus diambil
    const getTargetPhotoCount = () => {
      if (orientation === "portrait") {
        return gridLayout === "2x2" ? 4 : 2;
      }
      return 4;
    };

    const targetCount = getTargetPhotoCount();

    let photoCount = 0;

    const startCountdown = (callback: () => void) => {
      let count = 3;
      setCountdownValue(count);

      const interval = setInterval(() => {
        count--;
        setCountdownValue(count);
        if (count === 0) {
          clearInterval(interval);
          setCountdownValue(null);
          callback();
        }
      }, 1000);
    };

    const captureNext = () => {
      if (photoCount < targetCount) {
        startCountdown(() => {
          capturePhoto();
          photoCount++;

          if (photoCount < targetCount) {
            setTimeout(captureNext, 800);
          } else {
            // SELESAI CAPTURE
            setIsCapturing(false);
            isCaptureLocked.current = false;
          }
        });
      } else {
        // fallback kalau kondisi lain
        setIsCapturing(false);
        isCaptureLocked.current = false;
      }
    };

    // Mulai capture pertama
    captureNext();
  };

  const renderCollage = useCallback(async () => {
    if (!collageCanvasRef.current || collageImages.length === 0) return;

    const canvas = collageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = Math.min(window.innerWidth - 32, 420);

    canvas.style.width = canvasWidth + "px";
    canvas.style.maxWidth = "100%";
    canvas.style.display = "block";
    canvas.style.boxSizing = "border-box";
    canvas.style.overflow = "hidden";

    const isPortrait = orientation === "portrait" || isPortraitModeForced;
    const isMobile =
      /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

    const padding = isMobile ? 8 : 10;
    const gap = isMobile ? 4 : 6;
    const borderWidth = isMobile ? 2 : 3;
    const cornerRadius = isMobile ? 10 : 14;

    const photoCount = gridLayout === "4x1" ? 4 : gridLayout === "2x1" ? 2 : 4;
    const targetAspect =
      gridLayout === "2x2"
        ? isPortrait
          ? 4 / 5
          : 16 / 9
        : isPortrait
        ? 4 / 5
        : 16 / 9;

    let cellWidth, cellHeight, canvasHeight;

    if (gridLayout === "2x2") {
      const innerW = canvasWidth - padding * 2 - gap;
      cellWidth = innerW / 2;
      cellHeight = cellWidth / targetAspect;
      canvasHeight = padding * 2 + cellHeight * 2 + gap + 60;
    } else {
      cellWidth = canvasWidth - padding * 2;
      cellHeight = cellWidth / targetAspect;
      canvasHeight =
        padding * 2 + cellHeight * photoCount + gap * (photoCount - 1) + 60;
    }

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.height = canvasHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // === BACKGROUND ===
    if (backgroundMode === "image" && selectedBackground?.src) {
      const bg = document.createElement("img");
      bg.src = selectedBackground.src;
      await new Promise((resolve) => {
        bg.onload = () => {
          ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);
          resolve(null);
        };
        bg.onerror = resolve;
      });
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Noise
    const applyNoise = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 50;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);
    };
    applyNoise();

    // === GAMBAR SEMUA FOTO ===
    await Promise.all(
      collageImages.slice(0, photoCount).map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = document.createElement("img");
          img.src = src;
          img.crossOrigin = "anonymous";

          img.onload = () => {
            let x, y;
            if (gridLayout === "2x2") {
              const row = Math.floor(index / 2);
              const col = index % 2;
              x = padding + col * (cellWidth + gap);
              y = padding + row * (cellHeight + gap);
            } else {
              x = padding;
              y = padding + index * (cellHeight + gap);
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

            // border putih
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

    // === OVERLAY ELEMENTS (DI ATAS FOTO, DI BAWAH WATERMARK) ===
    await drawOverlayElements(ctx, canvasWidth, canvasHeight);

    ctx.font = `bold ${isMobile ? 19 : 23}px Arial`;
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeText("Caméree - Photo Booth", canvasWidth / 2, canvasHeight - 22);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Caméree - Photo Booth", canvasWidth / 2, canvasHeight - 22);
  }, [
    collageImages,
    backgroundColor,
    backgroundMode,
    selectedBackground,
    gridLayout,
    orientation,
    isPortraitModeForced,
    drawOverlayElements,
  ]);

  const downloadCollage = useCallback(() => {
    if (!collageCanvasRef.current || collageImages.length === 0) {
      alert("Capture foto dulu ya!");
      return;
    }

    const canvas = collageCanvasRef.current;
    const dataURL = canvas.toDataURL("image/png");
    const fileName = `cameree-${Date.now()}.png`;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      const newWin = window.open("", "_blank");
      if (!newWin) {
        alert("Izinkan popup untuk download di iPhone!");
        return;
      }
      newWin.document.write(`
        <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Save Photo</title>
        <style>body{margin:0;background:#000;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:system-ui}
        img{max-width:94vw;max-height:76vh;border-radius:16px}button{margin-top:24px;padding:16px 32px;background:#007AFF;color:#fff;border:none;border-radius:14px;font-size:18px}</style></head>
        <body><img src="${dataURL}"><button onclick="save()">Save to Photos</button>
        <div style="margin-top:16px;font-size:14px;opacity:.8">Tekan lama gambar → Add to Photos</div>
        <script>function save(){const a=document.createElement('a');a.href="${dataURL}";a.download="${fileName}";document.body.appendChild(a);a.click();a.remove()}</script>
        </body></html>`);
      newWin.document.close();
      return;
    }

    const a = document.createElement("a");
    a.href = dataURL;
    a.download = fileName;
    a.click();
  }, [collageImages.length]);

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setCollageImages([]);
  };

  const toggleMirror = () => {
    setIsMirrored((prev) => !prev);
  };

  const restartCapture = () => {
    setCollageImages([]);
  };

  const handleClickStart = () => {
    if (isCaptureLocked.current) return; // hard prevent
    capturePhotoSeries(); // call real function
  };

  const toggleGridLayout = () => {
    if (orientation === "portrait") {
      // Di portrait: hanya boleh pilih antara 2x2 atau 2x1
      setGridLayout((prev) => (prev === "2x2" ? "2x1" : "2x2"));
    } else {
      // Di landscape: boleh pilih 2x2 atau 4x1
      setGridLayout((prev) => (prev === "2x2" ? "4x1" : "2x2"));
    }
  };

  // =============== USE EFFECTS ===============
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    startLiveFilterPreview();
  }, [startLiveFilterPreview]);

  useEffect(() => {
    if (collageImages.length > 0) renderCollage();
  }, [collageImages.length, renderCollage]);

  useEffect(() => {
    const updateOrientation = () => {
      const w = window.innerWidth,
        h = window.innerHeight;
      const isPortraitScreen = h > w;

      if (isPortraitModeForced) {
        setOrientation("portrait");
        setIsMirrored(facingMode === "user");
        return;
      }

      const mobile =
        /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      if (mobile && isPortraitScreen && w <= 768) {
        setOrientation("portrait");
      } else {
        setOrientation("landscape");
      }
      setIsMirrored(facingMode === "user");
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);
    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, [facingMode, isPortraitModeForced]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null; // optional: bersihin
      }
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#c7c1b6] via-[#d8d2c9] to-[#c7c1b6] flex flex-col overflow-x-hidden">
        {/* Header Elegan */}
        <header className="relative py-8 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 " />
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#153378] to-[#153378dd]">
              <Link href="/" className="hover:text-[#153371]/90 transition">
                Caméree
              </Link>
            </h1>
            <p className="mt-3 text-lg md:text-xl font-medium text-[#153378]/90">
              Interactive Photo Booth • Premium Experience
            </p>
          </motion.div>
        </header>

        {/* Main Content – Grid Responsif */}
        <main className="flex-1 w-full px-3 sm:px-6 pb-6 lg:pb-12">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 xl:gap-16 h-full">
            {/* ==================== KIRI: KAMERA & CONTROLS ==================== */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col gap-6"
            >
              {/* Camera Preview Card – PORTRAIT 4:5 BESAR & TAJAM */}
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <div
                  className={`
                    relative mx-auto bg-black overflow-hidden
                    transition-all duration-500 ease-out

                    ${
                      isPortraitModeForced || orientation === "portrait"
                        ? "w-full max-w-[420px]"
                        : "w-full max-w-3xl"
                    }
                  `}
                  style={{
                    aspectRatio:
                      isPortraitModeForced || orientation === "portrait"
                        ? "4 / 5"
                        : cameraAspect ?? "16/9",
                  }}
                >
                  {/* Video Feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`
                      absolute inset-0 w-full h-full object-contain bg-black
                      ${filter !== "none" ? "hidden" : ""}
                      ${isMirrored ? "scale-x-[-1]" : ""}
                    `}
                  />

                  {/* Live Filter Canvas */}
                  <canvas
                    ref={liveFilterCanvasRef}
                    className={`
        absolute inset-0 w-full h-full object-contain bg-black
        ${filter === "none" ? "hidden" : ""}
      `}
                  />

                  {/* Countdown – lebih dramatis */}
                  {countdownValue !== null && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.15, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      {/* Background semi-transparan + blur halus */}
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

                      {/* Lingkaran putih tipis di belakang angka (efek glow modern) */}
                      <div className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-white/10 blur-3xl" />

                      {/* Angka utama — super tajam & glowing */}
                      <span
                        className="relative text-9xl md:text-[12rem] lg:text-[14rem] font-black text-white 
                     drop-shadow-xl tracking-tighter
                     [text-shadow:_0_0_40px_rgba(255,255,255,0.8),_0_0_80px_rgba(255,255,255,0.6)] 
                     animate-pulse"
                      >
                        {countdownValue}
                      </span>

                      {/* Optional: tambah efek flash kecil saat hitungan 1 */}
                      {countdownValue === 1 && (
                        <div className="absolute inset-0 bg-white/20 animate-ping" />
                      )}
                    </motion.div>
                  )}

                  {/* Label kecil di pojok */}
                  <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                    {isPortraitModeForced || orientation === "portrait"
                      ? "PORTRAIT 4:5"
                      : "LANDSCAPE"}
                  </div>
                </div>
              </div>

              {/* Controls Card */}
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-6 space-y-6">
                {/* Filter Pills */}
                <div>
                  <p className="text-sm font-semibold text-[#153378] mb-3">
                    Filters
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {filters.map(({ id, label, src }) => (
                      <button
                        key={id}
                        onClick={() => !isCapturing && setFilter(id)} // cegah klik
                        disabled={isCapturing}
                        className={`relative group overflow-hidden rounded-2xl transition-all duration-300
                          ${
                            filter === id
                              ? "ring-4 ring-[#153378] ring-offset-4 scale-110"
                              : "hover:scale-105"
                          }
                          ${isCapturing && "opacity-40 cursor-not-allowed"}
                        `}
                      >
                        <Image
                          src={src}
                          alt={label}
                          width={80}
                          height={80}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl"
                        />
                        <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-2 text-white text-xs font-medium">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Button
                    onClick={flipCamera}
                    disabled={isCapturing}
                    variant="outline"
                    className="bg-white/50 text-black hover:bg-[#153371]/10"
                  >
                    <RefreshCcw className="mr-2" size={18} /> Switch
                  </Button>
                  <Button
                    onClick={toggleMirror}
                    disabled={isCapturing}
                    variant="outline"
                    className="bg-white/50 text-black hover:bg-[#153371]/10"
                  >
                    {isMirrored ? "Unmirror" : "Mirror"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsPortraitModeForced((p) => !p);
                      setCollageImages([]);
                    }}
                    disabled={isCapturing}
                    className={`${
                      isPortraitModeForced || orientation === "portrait"
                        ? "bg-[#153378] hover:bg-[#153378dd] text-white"
                        : "bg-white/50 text-black hover:bg-[#153371]/10"
                    } border border-[#153378]/30`}
                  >
                    {isPortraitModeForced || orientation === "portrait"
                      ? "Portrait"
                      : "Landscape"}
                  </Button>
                  <Button
                    onClick={restartCapture}
                    disabled={isCapturing}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Clear
                  </Button>
                </div>

                {/* Advanced Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* ====================== BACKGROUND SELECTOR — MINI & ULTRA CLEAN ====================== */}
                  <div className="w-full space-y-6">
                    {/* Toggle Color / Theme — Kecil tapi elegan */}
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          if (isCapturing) return;
                          setBackgroundMode("color");
                          setSelectedOverlayPack("none");
                          setSelectedBackground(null);
                        }}
                        disabled={isCapturing}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-md
                          ${
                            backgroundMode === "color"
                              ? "bg-[#153378] text-white shadow-lg"
                              : "bg-white/50 text-[#153378] hover:bg-white/80"
                          } ${isCapturing && "opacity-50 cursor-not-allowed"}`}
                      >
                        Colour
                      </button>
                      <button
                        onClick={() =>
                          !isCapturing && setBackgroundMode("image")
                        }
                        disabled={isCapturing}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-md
        ${
          backgroundMode === "image"
            ? "bg-[#153378] text-white shadow-lg"
            : "bg-white/50 text-[#153378] hover:bg-white/80"
        } ${isCapturing && "opacity-50 cursor-not-allowed"}`}
                      >
                        Theme
                      </button>
                    </div>

                    {/* MODE: COLOR — Mini Color Picker */}
                    {backgroundMode === "color" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center items-center gap-3 flex-wrap px-4"
                      >
                        {[
                          "#f5e6d8",
                          "#1e293b",
                          "#0f3460",
                          "#e94560",
                          "#ff6b6b",
                          "#4ecdc4",
                          "#ffe66d",
                          "#a8e6cf",
                        ].map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              !isCapturing && setBackgroundColor(color)
                            }
                            className={`w-10 h-10 rounded-full shadow-lg border-2 border-white/80 transition-all
            ${
              backgroundColor === color
                ? "ring-3 ring-[#153378] scale-110"
                : "hover:scale-110"
            }
            ${isCapturing && "opacity-60 cursor-not-allowed"}
          `}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) =>
                            !isCapturing && setBackgroundColor(e.target.value)
                          }
                          disabled={isCapturing}
                          className="w-12 h-12 rounded-full cursor-pointer shadow-lg border-2 border-white/80 hover:scale-110 transition"
                        />
                      </motion.div>
                    )}

                    {/* MODE: THEME — Kecil, rapih, cantik banget di HP */}
                    {backgroundMode === "image" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-5"
                      >
                        {/* Grid 3 tema — super mungil & manis */}
                        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                          {backgroundPresets.map((preset) => {
                            const isSelected =
                              selectedBackground?.overlayPackId ===
                              preset.overlayPackId;

                            return (
                              <motion.button
                                key={preset.overlayPackId}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (isCapturing) return;
                                  setSelectedBackground({
                                    src: preset.src,
                                    overlayPackId: preset.overlayPackId,
                                  });
                                  setSelectedOverlayPack(preset.overlayPackId);
                                }}
                                className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300
                ${
                  isSelected
                    ? "ring-3 ring-[#153378] ring-offset-2 shadow-xl"
                    : "shadow-md"
                }
              `}
                              >
                                <div className="aspect-[3/4] relative">
                                  <Image
                                    src={
                                      preset.thumbnail ||
                                      "/thumbnails/placeholder.jpg"
                                    }
                                    alt={preset.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                  {/* Overlay gelap + nama */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                  <p className="absolute bottom-2 left-0 right-0 text-white text-[10px] font-bold text-center tracking-wider">
                                    {preset.name}
                                  </p>

                                  {/* Checkmark kecil */}
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
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

                        {/* Indikator tema aktif — mini & clean
                        {selectedBackground && (
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-xs font-bold text-[#153378] bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full inline-block mx-auto shadow"
                          >
                            Aktif:{" "}
                            {
                              backgroundPresets.find(
                                (p) =>
                                  p.overlayPackId ===
                                  selectedBackground.overlayPackId
                              )?.name
                            }
                          </motion.p>
                        )} */}
                      </motion.div>
                    )}
                  </div>

                  <Button
                    onClick={toggleGridLayout}
                    disabled={isCapturing}
                    variant="outline"
                    className="bg-white/70 text-black hover:bg-[#153371]/10"
                  >
                    {gridLayout === "2x2"
                      ? "2×2 Grid"
                      : orientation === "portrait"
                      ? "2×1 Stack"
                      : "4×1 Strip"}
                  </Button>
                </div>

                {/* CAPTURE BUTTON BESAR */}
                <motion.div
                  className={isCapturing ? "pointer-events-none" : ""}
                  whileHover={{ scale: isCapturing ? 1 : 1.02 }}
                  whileTap={{ scale: isCapturing ? 1 : 0.98 }}
                >
                  <Button
                    onClick={handleClickStart}
                    disabled={isCapturing}
                    size="lg"
                    className={`w-full h-14 text-lg font-bold rounded-2xl shadow-xl ${
                      isCapturing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#153378] to-[#153378ee] hover:from-[#153378dd] hover:to-[#153378] text-white"
                    }`}
                  >
                    {isCapturing ? "Capturing..." : "Start Photo Booth"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* ==================== KANAN: COLLAGE PREVIEW ==================== */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 w-full p-4 sm:p-6 flex flex-col">
                {collageImages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="p-8 bg-[#153378]/10 rounded-full">
                      <Camera
                        size={80}
                        className="text-[#153378]"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-[#153378]">
                        Ready to Shine!
                      </h2>
                      <p className="mt-4 text-[#153378]/80 max-w-sm mx-auto text-sm md:text-base">
                        Press the{" "}
                        <span className="font-bold">“Start Photo Booth”</span>{" "}
                        button to start the photo session.
                        <br />
                        <br />
                        You will take{" "}
                        <span className="text-2xl font-black text-[#153378]">
                          {orientation === "portrait" && gridLayout !== "2x2"
                            ? "2"
                            : "4"}
                        </span>{" "}
                        photos from{" "}
                        <span className="font-bold">
                          {orientation === "portrait"
                            ? gridLayout === "2x2"
                              ? "2×2"
                              : "2×1 vertical"
                            : gridLayout === "2x2"
                            ? "2×2"
                            : "4×1 strip"}
                        </span>{" "}
                        layout.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-[#153378] text-center mb-6">
                      Collage Preview
                    </h3>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full max-w-sm mx-auto">
                        <canvas
                          ref={collageCanvasRef}
                          className="w-full h-auto rounded-2xl shadow-xl md:shadow-2xl"
                        />
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      {collageImages.length <
                      (orientation === "portrait" && gridLayout !== "2x2"
                        ? 2
                        : 4) ? (
                        <p className="text-lg font-medium text-[#153378]">
                          Progress: {collageImages.length}/
                          {orientation === "portrait" && gridLayout !== "2x2"
                            ? 2
                            : 4}
                        </p>
                      ) : (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                        >
                          <Button
                            onClick={downloadCollage}
                            size="lg"
                            className="mt-4 bg-gradient-to-r from-[#153378] to-[#153378ee] hover:from-[#153378dd] hover:to-[#153378] text-white px-10 py-6 text-lg font-bold rounded-2xl shadow-xl"
                          >
                            <Download className="mr-3" size={24} /> Download
                            Collage
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </main>

        {/* Hidden canvas untuk proses */}
        <canvas ref={canvasRef} className="hidden" />

        <footer className="py-12 text-center text-[#153378]/70 text-sm">
          © {new Date().getFullYear()} Caméree by{" "}
          <a
            href="https://reezyee.github.io"
            className="underline decoration-[#153378]/40 hover:decoration-[#153378]"
          >
            Reezyee
          </a>
          . All memories reserved.
        </footer>
      </div>
    </>
  );
}
