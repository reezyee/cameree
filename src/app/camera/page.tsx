"use client";

import { useEffect, useRef, useState } from "react";
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
  const [selectedBackground, setSelectedBackground] = useState<{
    src: string;
    overlayPackId: string;
  } | null>(null);
  type FilterType = {
    id: "none" | "grayscale" | "sepia" | "retro" | "infrared";
    label: string;
    src: string;
  };
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [selectedOverlayPack, setSelectedOverlayPack] =
    useState<string>("none");
  const filters: FilterType[] = [
    { id: "none", label: "No Filter", src: "/filters/no-filter.jpeg" },
    { id: "grayscale", label: "B&W", src: "/filters/B&W.jpeg" },
    { id: "sepia", label: "Sepia", src: "/filters/sepia.jpeg" },
    { id: "retro", label: "Retro", src: "/filters/retro.png" },
    { id: "infrared", label: "Infrared", src: "/filters/infrared.png" },
  ];
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

  const [filter, setFilter] = useState<FilterType["id"]>("none");
  const [collageImages, setCollageImages] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [backgroundColor, setBackgroundColor] = useState<string>("#f5e6d8");
  const [backgroundMode, setBackgroundMode] = useState<"color" | "image">(
    "color"
  );
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const isCaptureLocked = useRef(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [gridLayout, setGridLayout] = useState<"2x2" | "4x1" | "2x1">("4x1");
  const animationFrameRef = useRef<number | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "landscape"
  );
  const [isPortraitModeForced, setIsPortraitModeForced] =
    useState<boolean>(false);

  const checkCameraPermissions = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((device) => device.kind === "videoinput");

      if (!hasCamera) {
        alert("No camera found. Please connect a camera device.");
      }
    } catch (error) {
      console.error("Error checking camera permissions:", error);
    }
  };

  const getOptimalResolution = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortraitMode = orientation === "portrait";

    // Deteksi device high-end (iPhone 12+, Samsung S21+, Pixel 6+, dll)
    const isHighEndPhone =
      /iPhone|iPad|Pixel|Galaxy S2[1-9]|Galaxy Note2[0-9]/i.test(
        navigator.userAgent
      ) ||
      (width >= 1080 && window.devicePixelRatio >= 2);

    if (isPortraitMode) {
      // PORTRAIT — RESOLUSI TINGGI KHUSUS HP
      if (isHighEndPhone) {
        return { width: { ideal: 1080 }, height: { ideal: 1920 } }; // 1080p potret → super tajam
      } else {
        return { width: { ideal: 1080 }, height: { ideal: 1440 } }; // 1080×1440 (masih tajam, lebih ringan)
      }
    }

    // LANDSCAPE (tablet / desktop / HP diputar)
    if (width >= 2560)
      return { width: { ideal: 3840 }, height: { ideal: 2160 } };
    if (width >= 1920)
      return { width: { ideal: 1920 }, height: { ideal: 1080 } };
    if (width >= 1280)
      return { width: { ideal: 1280 }, height: { ideal: 720 } };
    return { width: { ideal: 720 }, height: { ideal: 480 } };
  };

  const startCamera = async () => {
    try {
      console.log("Starting camera...");

      // Hentikan stream yang sudah ada
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode,
          width: {
            min: 720,
            ideal: orientation === "portrait" ? 1080 : 1920,
            max: 3840,
          },
          height: {
            min: 720,
            ideal: orientation === "portrait" ? 1920 : 1080,
            max: 2160,
          },
          frameRate: { ideal: 30, max: 60 },
          aspectRatio: orientation === "portrait" ? 4 / 5 : 16 / 9,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = () => {
            videoRef.current?.play();
            startLiveFilterPreview();
            resolve(null);
          };
        });

        console.log("Camera started successfully.");
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      alert("Gagal mengakses kamera: " + (error as Error).message);
    }
  };

  // Stop the animation frame when component unmounts
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    checkCameraPermissions();
    startCamera();
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      console.log("Available video devices:", videoDevices);
    });
  }, [facingMode]);

  // Reset animation frame when filter changes
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      startLiveFilterPreview();
    }
  }, [filter, isMirrored]);

  // Effect to update the collage canvas whenever collageImages or layout changes
  useEffect(() => {
    if (collageImages.length > 0) {
      renderCollage();
    }
  }, [
    collageImages,
    backgroundColor,
    gridLayout,
    selectedBackground,
    orientation,
  ]);

  const applyThermalInfraredFilter = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Ambil nilai RGB
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // Hitung kecerahan menggunakan rumus luminance
      const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;

      // Perbaiki gradasi efek thermal imaging
      if (brightness < 50) {
        // Sangat dingin (biru tua)
        data[i] = 40; // Red
        data[i + 1] = 0; // Green
        data[i + 2] = 90; // Blue
      } else if (brightness < 100) {
        // Dingin (ungu kebiruan)
        data[i] = 80; // Red
        data[i + 1] = 20; // Green
        data[i + 2] = 150; // Blue
      } else if (brightness < 150) {
        // Hangat (merah muda ke merah)
        data[i] = 180; // Red
        data[i + 1] = 50; // Green
        data[i + 2] = 80; // Blue
      } else if (brightness < 200) {
        // Panas (oranye lembut)
        data[i] = 240; // Red
        data[i + 1] = 140; // Green
        data[i + 2] = 30; // Blue
      } else {
        // Sangat panas (kuning ke putih)
        data[i] = 255; // Red
        data[i + 1] = 220; // Green
        data[i + 2] = 120; // Blue
      }

      // Pertahankan transparansi (jika ada kanal alpha)
      data[i + 3] = data[i + 3];
    }

    context.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    const updateOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortraitScreen = height > width;

      // Jika user memaksa portrait mode → paksa portrait
      if (isPortraitModeForced) {
        setOrientation("portrait");
        // Mirror hanya untuk kamera depan
        setIsMirrored(facingMode === "user");
        return;
      }

      // Jika tidak dipaksa → ikuti rotasi device / window
      const isRealMobile =
        /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isLikelyDesktopOrTablet = width > 768;

      if (isRealMobile && isPortraitScreen && !isLikelyDesktopOrTablet) {
        setOrientation("portrait");
      } else {
        setOrientation("landscape");
      }

      // Mirror logic tetap sama
      setIsMirrored(facingMode === "user");
    };

    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, [facingMode, isPortraitModeForced]); // Tambahkan isPortraitModeForced

  const applyRetroVintageFilter = async (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const imageBitmap = await createImageBitmap(canvas);
    context.drawImage(imageBitmap, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply warm tones and vintage color shift
    for (let i = 0; i < data.length; i += 4) {
      // Get RGB values
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Warm vintage tone - boost reds and yellows, reduce blues
      r = Math.min(255, r * 1.15); // Boost red channel
      g = Math.min(255, g * 1.05); // Slightly boost green channel
      b = Math.max(0, b * 0.85); // Reduce blue channel

      // Apply slight color cross-processing effect (popular in vintage photos)
      // Adjust shadows to have more cyan/blue, highlights to have more yellow/red
      const brightness = (r + g + b) / 3;

      if (brightness < 128) {
        // Shadows get cooler blue tint
        b = Math.min(255, b * 1.1);
      } else {
        // Highlights get warmer yellow/red tint
        r = Math.min(255, r * 1.1);
        g = Math.min(255, g * 1.05);
      }

      // Apply slight contrast boost
      r = r < 128 ? r * 0.95 : r * 1.05;
      g = g < 128 ? g * 0.95 : g * 1.05;
      b = b < 128 ? b * 0.95 : b * 1.05;

      // Update values
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    // Apply grain effect
    for (let i = 0; i < data.length; i += 4) {
      // Add random noise to create film grain effect
      // Less noise in highlights, more in shadows
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const noise = Math.random() * 20 - 10; // Random value between -10 and 10
      const noiseAmount = Math.max(0, 15 - brightness / 25); // More noise in darker areas

      data[i] = Math.min(
        255,
        Math.max(0, data[i] + noise * (noiseAmount / 15))
      );
      data[i + 1] = Math.min(
        255,
        Math.max(0, data[i + 1] + noise * (noiseAmount / 15))
      );
      data[i + 2] = Math.min(
        255,
        Math.max(0, data[i + 2] + noise * (noiseAmount / 15))
      );
    }

    // Apply slight vignette effect (darkened corners)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;

        // Calculate distance from center (normalized 0-1)
        const distX = x - centerX;
        const distY = y - centerY;
        const distance = Math.sqrt(distX * distX + distY * distY) / maxDistance;

        // Apply stronger vignette to corners
        const vignetteAmount = Math.pow(distance, 1.5) * 0.6; // Adjustable vignette strength

        // Darken pixels based on distance from center
        data[idx] = data[idx] * (1 - vignetteAmount);
        data[idx + 1] = data[idx + 1] * (1 - vignetteAmount);
        data[idx + 2] = data[idx + 2] * (1 - vignetteAmount);
      }
    }

    context.putImageData(imageData, 0, 0);
  };

  const startLiveFilterPreview = () => {
    if (!videoRef.current || !liveFilterCanvasRef.current) return;

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = liveFilterCanvasRef.current;

      if (!video || !canvas || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Set canvas size to match video
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame
      context.save();

      // Apply mirror if needed
      if (isMirrored) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.restore();

      // Apply filter if not "none"
      if (filter === "infrared") {
        applyThermalInfraredFilter(context, canvas);
      } else if (filter === "grayscale") {
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg =
            (imageData.data[i] +
              imageData.data[i + 1] +
              imageData.data[i + 2]) /
            3;
          imageData.data[i] = avg; // Red
          imageData.data[i + 1] = avg; // Green
          imageData.data[i + 2] = avg; // Blue
        }
        context.putImageData(imageData, 0, 0);
      } else if (filter === "sepia") {
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];

          imageData.data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); // Red
          imageData.data[i + 1] = Math.min(
            255,
            r * 0.349 + g * 0.686 + b * 0.168
          ); // Green
          imageData.data[i + 2] = Math.min(
            255,
            r * 0.272 + g * 0.534 + b * 0.131
          ); // Blue
        }
        context.putImageData(imageData, 0, 0);
      } else if (filter === "retro") {
        applyRetroVintageFilter(context, canvas);
      }

      // Loop
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    // Start processing frames
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && liveFilterCanvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      // Set proper dimensions
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      // For filtered images, copy from the live filter canvas
      if (filter !== "none") {
        context.drawImage(liveFilterCanvasRef.current, 0, 0);
      } else {
        // For non-filtered images, draw directly from video
        context.save();
        if (isMirrored) {
          context.translate(canvasRef.current.width, 0);
          context.scale(-1, 1);
        }
        context.drawImage(videoRef.current, 0, 0);
        context.restore();
      }

      const imageData = canvasRef.current.toDataURL("image/png");
      setCollageImages((prev) =>
        prev.length < 4 ? [...prev, imageData] : prev
      );
    }
  };

  const renderCollage = async () => {
    if (!collageCanvasRef.current || collageImages.length === 0) return;

    const canvas = collageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = 420;

    canvas.style.width = canvasWidth + "px";

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

    // === WATERMARK (PALING ATAS) ===
    const getContrastColor = (hex: string) => {
      const r = parseInt(hex.substr(1, 2), 16);
      const g = parseInt(hex.substr(3, 2), 16);
      const b = parseInt(hex.substr(5, 2), 16);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum > 0.5 ? "#000" : "#fff";
    };

    ctx.font = `bold ${isMobile ? 19 : 23}px Arial`;
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeText("Caméree - Photo Booth", canvasWidth / 2, canvasHeight - 22);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Caméree - Photo Booth", canvasWidth / 2, canvasHeight - 22);
  };

  // === FUNGSI OVERLAY DIPINDAH KE LUAR renderCollage (biar aman) ===
  const drawOverlayElements = async (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const pack = OVERLAY_PACKS.find((p) => p.id === selectedOverlayPack);
    if (!pack || pack.overlays.length === 0) return;

    for (const ov of pack.overlays) {
      ctx.save(); // PENTING: simpan state canvas
      ctx.globalAlpha = ov.opacity ?? 1;

      const width = canvasWidth * ov.width;
      let height = width * 0.8; // default buat text

      // Hitung posisi tengah stiker (biar rotasi di tengah, bukan pojok)
      const centerX = canvasWidth * ov.x;
      const centerY = canvasHeight * ov.y;

      // Pindah ke tengah stiker
      ctx.translate(centerX, centerY);

      // ROTATE DI SINI — KALAU ADA rotate: -15, langsung jalan!
      if (ov.rotate !== undefined) {
        ctx.rotate((ov.rotate * Math.PI) / 180); // derajat → radian
      }

      // === GAMBAR STIKER (IMAGE) ===
      if (ov.type === "image" && ov.src) {
        const img = document.createElement("img");
        img.crossOrigin = "anonymous";
        img.src = ov.src;

        await new Promise<void>((resolve) => {
          const drawImage = () => {
            height = width * (img.naturalHeight / img.naturalWidth);
            // Gambar dari tengah (offset -width/2, -height/2)
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
            resolve();
          };

          if (img.complete && img.naturalWidth > 0) {
            drawImage();
          } else {
            img.onload = drawImage;
            img.onerror = () => resolve();
          }
        });
      }

      // === GAMBAR TEXT ===
      if (ov.type === "text" && ov.text) {
        ctx.font = ov.font ?? "bold 20px Arial";
        ctx.fillStyle = ov.color ?? "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Outline hitam biar kelihatan di background apa aja
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;
        ctx.strokeText(ov.text, 0, 0); // posisi 0,0 karena sudah di-translate
        ctx.fillText(ov.text, 0, 0);
      }

      ctx.restore(); // PENTING: balikin canvas ke kondisi semula
    }
  };

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

  const downloadCollage = () => {
    if (!collageCanvasRef.current || collageImages.length === 0) {
      alert("Please capture images first before downloading.");
      return;
    }

    try {
      const canvas = collageCanvasRef.current;
      const dataURL = canvas.toDataURL("image/png", 1.0);
      const fileName = `cameree-collage-${Date.now()}.png`;

      const isIOS =
        /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in window);

      if (isIOS) {
        const win = window.open("", "_blank");

        const html = `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    background: #000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    overflow: hidden;
                    color: white;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  }
                  img {
                    max-width: 100%;
                    max-height: 85vh;
                    border-radius: 12px;
                  }
                  button {
                    margin-top: 18px;
                    padding: 12px 20px;
                    font-size: 17px;
                    background: #1fa3ff;
                    border: none;
                    border-radius: 10px;
                    color: white;
                    cursor: pointer;
                  }
                  button:active {
                    background: #0b7cc3;
                  }
                </style>
              </head>
              <body>
                <img id="preview" src="${dataURL}" />

                <button id="saveBtn">Save Image</button>

                <script>
                  const btn = document.getElementById("saveBtn");
                  btn.onclick = () => {
                    const img = document.getElementById("preview");
                    const link = document.createElement("a");
                    link.href = img.src;
                    link.download = "${fileName}";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  };
                </script>
              </body>
            </html>
          `;

        win.document.write(html);
        return;
      }

      // ---- Android/Desktop normal download ----
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download. Please try again.");
    }
  };

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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#c7c1b6] via-[#d8d2c9] to-[#c7c1b6] flex flex-col">
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
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-12 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 xl:gap-16 h-full">
            {/* ==================== KIRI: KAMERA & CONTROLS ==================== */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col gap-6"
            >
              {/* Camera Preview Card – PORTRAIT 4:5 BESAR & TAJAM */}
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <div
                  className={`
      relative mx-auto bg-black/90 overflow-hidden
      transition-all duration-700 ease-out
      /* PORTRAIT MODE → 4:5 besar dan dominan */
      ${
        isPortraitModeForced || orientation === "portrait"
          ? "w-full max-w-sm sm:max-w-md md:max-w-lg aspect-[4/5] mx-auto"
          : "w-full aspect-video"
      }
    `}
                >
                  {/* Video Feed – SELALU TAJAM karena pakai object-cover + resolution tinggi */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    playsInline
                    className={`
        absolute inset-0 w-full h-full object-cover border border-white
        ${filter !== "none" ? "hidden" : ""}
        ${isMirrored ? "scale-x-[-1]" : ""}
      `}
                    // Pastikan kamera ambil resolusi tinggi (khususnya di useEffect)
                  />

                  {/* Live Filter Canvas */}
                  <canvas
                    ref={liveFilterCanvasRef}
                    className={`
        absolute inset-0 w-full h-full object-cover
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
                     drop-shadow-2xl tracking-tighter
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
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-6 space-y-6">
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
              <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 flex-1 p-6 md:p-10 flex flex-col">
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
                      <div className="w-[436px]">
                        <canvas
                          ref={collageCanvasRef}
                          className="w-full h-auto rounded-2xl shadow-2xl"
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
          <a href="https://reezyee.github.io" className="underline decoration-[#153378]/40 hover:decoration-[#153378]">
            Reezyee
          </a>
          . All memories reserved.
        </footer>
      </div>
    </>
  );
}
