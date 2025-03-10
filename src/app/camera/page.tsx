"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Camera, RefreshCcw, Download } from "lucide-react";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveFilterCanvasRef = useRef<HTMLCanvasElement>(null);
  const collageCanvasRef = useRef<HTMLCanvasElement>(null);
  type FilterType = {
    id: "none" | "grayscale" | "sepia" | "retro" | "infrared";
    label: string;
    src: string;
  };

  const filters: FilterType[] = [
    { id: "none", label: "No Filter", src: "/images/no-filter.jpeg" },
    { id: "grayscale", label: "B&W", src: "/images/B&W.jpeg" },
    { id: "sepia", label: "Sepia", src: "/images/sepia.jpeg" },
    { id: "retro", label: "Retro", src: "/images/retro.png" },
    { id: "infrared", label: "Infrared", src: "/images/infrared.png" },
  ];

  const [filter, setFilter] = useState<FilterType["id"]>("none");
  const [collageImages, setCollageImages] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [backgroundColor, setBackgroundColor] = useState<string>("#f5e6d8");
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [gridLayout, setGridLayout] = useState<"2x2" | "4x1">("4x1");
  const animationFrameRef = useRef<number | null>(null);

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
    const screenWidth = window.innerWidth;
    const isMobile =
      /Mobi|Android/i.test(navigator.userAgent) || screenWidth < 640;

    if (!isMobile && screenWidth >= 2560) {
      // Laptop/PC resolusi tinggi (4K/2K)
      return { width: { ideal: 3840 }, height: { ideal: 2160 } };
    } else if (!isMobile) {
      // Laptop/PC standar (Full HD)
      return { width: { ideal: 1920 }, height: { ideal: 1080 } };
    } else if (screenWidth >= 1280) {
      // Tablet (1280x720)
      return { width: { ideal: 1280 }, height: { ideal: 720 } };
    } else {
      // HP (720x480)
      return { width: { ideal: 720 }, height: { ideal: 480 } };
    }
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

      const { width, height } = getOptimalResolution();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width,
          height,
          frameRate: { ideal: 30, max: 120 },
          aspectRatio: { ideal: 16 / 9 },
        },
      });

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
  }, [collageImages, backgroundColor, gridLayout]);

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

  // In the renderCollage function, update your code for both layouts

  // Replace your renderCollage function with this improved version
  const renderCollage = async () => {
    if (collageCanvasRef.current && collageImages.length > 0) {
      const context = collageCanvasRef.current.getContext("2d");
      if (!context) return;

      // Get dimensions from video reference or use default
      const baseWidth = videoRef.current?.videoWidth || 640;

      // Device detection for better responsiveness
      const screenWidth = window.innerWidth;
      const isMobile =
        /Mobi|Android/i.test(navigator.userAgent) || screenWidth < 768;

      // Smaller padding for mobile
      const padding = isMobile ? 8 : 12;

      // Define fixed landscape aspect ratio (16:9)
      const aspectRatio = 16 / 9;

      // Helper function for contrast color
      const getContrastColor = (bgColor: string): string => {
        // Validate hex color format (e.g., #RRGGBB)
        const hexToRgb = (hex: string) => {
          if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
            throw new Error("Invalid hex color format");
          }
          const bigint = parseInt(hex.slice(1), 16);
          return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
          };
        };

        try {
          const { r, g, b } = hexToRgb(bgColor);

          // Calculate perceived brightness
          const brightness = r * 0.299 + g * 0.587 + b * 0.114;

          // Use black text on light backgrounds, white text on dark backgrounds
          return brightness > 128 ? "black" : "white";
        } catch (error) {
          console.error("Error processing color:", error);
          return "black"; // Default fallback
        }
      };

      // Calculate device pixel ratio for sharper rendering
      const dpr = window.devicePixelRatio || 1;

      if (gridLayout === "2x2") {
        // 2x2 grid layout - MOBILE OPTIMIZED

        // For mobile, use nearly full width of screen minus margins
        const adjustedBaseWidth = isMobile
          ? Math.min(screenWidth - 40, 320) // Reduced width for mobile
          : Math.min(baseWidth, 600);

        // Use smaller gap between cells on mobile
        const cellGap = isMobile ? 2 : 8;

        // Total width including padding
        const totalWidth = adjustedBaseWidth;

        // Calculate cell width accounting for the gap
        const cellWidth = (adjustedBaseWidth - padding * 2 - cellGap) / 2;

        // Enforce landscape aspect ratio (width > height)
        const cellHeight = cellWidth / aspectRatio;

        // Calculate total height including a small footer area for text
        const totalHeight =
          cellHeight * 2 + cellGap + padding * 2 + (isMobile ? 20 : 30);

        // Set physical size of canvas with DPR scaling for sharpness
        collageCanvasRef.current.width = totalWidth * dpr;
        collageCanvasRef.current.height = totalHeight * dpr;

        // Set display size of canvas (CSS size)
        collageCanvasRef.current.style.width = `${totalWidth}px`;
        collageCanvasRef.current.style.height = `${totalHeight}px`;

        // Scale context according to device pixel ratio for sharpness
        context.scale(dpr, dpr);

        // Clear canvas and set background
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, totalWidth, totalHeight);

        // Draw images in a 2x2 grid with consistent landscape orientation
        await Promise.all(
          collageImages.map((img, index) => {
            return new Promise<void>((resolve) => {
              const image = document.createElement("img");
              image.crossOrigin = "anonymous";
              image.src = img;
              image.onload = () => {
                const row = Math.floor(index / 2);
                const col = index % 2;

                // Calculate position with padding and gap
                const x = padding + col * (cellWidth + cellGap);
                const y = padding + row * (cellHeight + cellGap);

                // Draw rounded corners - smaller radius on mobile
                const cornerRadius = isMobile ? 6 : 8;
                context.save();
                context.beginPath();
                context.moveTo(x + cornerRadius, y);
                context.arcTo(
                  x + cellWidth,
                  y,
                  x + cellWidth,
                  y + cellHeight,
                  cornerRadius
                );
                context.arcTo(
                  x + cellWidth,
                  y + cellHeight,
                  x,
                  y + cellHeight,
                  cornerRadius
                );
                context.arcTo(x, y + cellHeight, x, y, cornerRadius);
                context.arcTo(x, y, x + cellWidth, y, cornerRadius);
                context.closePath();
                context.clip();

                // Calculate source dimensions to maintain aspect ratio
                let sourceX = 0;
                let sourceY = 0;
                let sourceWidth = image.width;
                let sourceHeight = image.height;

                // Calculate the aspect ratio of the source image
                const sourceAspect = image.width / image.height;

                // If source aspect doesn't match our target, crop the source
                if (sourceAspect > aspectRatio) {
                  // Source is wider than target: crop width
                  sourceWidth = image.height * aspectRatio;
                  sourceX = (image.width - sourceWidth) / 2;
                } else if (sourceAspect < aspectRatio) {
                  // Source is taller than target: crop height
                  sourceHeight = image.width / aspectRatio;
                  sourceY = (image.height - sourceHeight) / 2;
                }

                // Enable high quality image rendering
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";

                // Draw the image with proper cropping to maintain exact 16:9 aspect ratio
                context.drawImage(
                  image,
                  sourceX,
                  sourceY,
                  sourceWidth,
                  sourceHeight, // Source
                  x,
                  y,
                  cellWidth,
                  cellHeight // Destination
                );

                // Add a subtle border - thinner on mobile
                context.strokeStyle = "rgba(255,255,255,0.6)";
                context.lineWidth = isMobile ? 1 : 1.5;
                context.stroke();

                context.restore();
                resolve();
              };

              // Add error handling
              image.onerror = () => {
                console.error("Failed to load image:", img);
                resolve();
              };
            });
          })
        );

        // Text rendering code for 2x2 layout
        const textColor = getContrastColor(backgroundColor);
        const text = "Caméree - Photo Booth";

        // Smaller font on mobile
        context.font = `bold ${isMobile ? "14px" : "16px"} Arial, sans-serif`;
        context.fillStyle = textColor;
        context.textAlign = "center";
        context.textBaseline = "bottom";

        // Very subtle text shadow for legibility
        context.shadowColor =
          textColor === "white" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";
        context.shadowBlur = 2;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        // Position text at the bottom center
        const textX = totalWidth / 2;
        const textY = totalHeight - 10;

        // Draw text on canvas
        context.fillText(text, textX, textY);

        // Reset shadow
        context.shadowColor = "transparent";
        context.shadowBlur = 0;
      } else {
        // 4x1 Vertical layout

        // Adjust width based on device - narrower on mobile
        const maxWidth = isMobile
          ? Math.min(screenWidth * 0.9, 320) // Use more screen width on mobile
          : 400;

        // Calculate the actual image width accounting for padding
        const imgWidth = maxWidth - padding * 2;

        // CRITICALLY IMPORTANT: Calculate height based on landscape aspect ratio
        const imgHeight = imgWidth / aspectRatio;

        // Smaller space between images on mobile
        const gap = isMobile ? 6 : 8;

        // Calculate total canvas height
        const totalHeight =
          padding * 2 +
          imgHeight * collageImages.length +
          gap * (collageImages.length - 1) +
          30; // Space for text

        // Set physical canvas dimensions with DPR scaling
        collageCanvasRef.current.width = maxWidth * dpr;
        collageCanvasRef.current.height = totalHeight * dpr;

        // Set display dimensions (CSS)
        collageCanvasRef.current.style.width = `${maxWidth}px`;
        collageCanvasRef.current.style.height = `${totalHeight}px`;

        // Scale context based on DPR
        context.scale(dpr, dpr);

        // Fill background
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, maxWidth, totalHeight);

        // Draw each image
        await Promise.all(
          collageImages.map((img, index) => {
            return new Promise<void>((resolve) => {
              const image = document.createElement("img");
              image.crossOrigin = "anonymous";
              image.src = img;
              image.onload = () => {
                // Calculate image position
                const imgX = padding;
                const imgY = padding + index * (imgHeight + gap);

                // Apply rounded corners - smaller on mobile
                const cornerRadius = isMobile ? 6 : 8;
                context.save();
                context.beginPath();
                context.moveTo(imgX + cornerRadius, imgY);
                context.arcTo(
                  imgX + imgWidth,
                  imgY,
                  imgX + imgWidth,
                  imgY + imgHeight,
                  cornerRadius
                );
                context.arcTo(
                  imgX + imgWidth,
                  imgY + imgHeight,
                  imgX,
                  imgY + imgHeight,
                  cornerRadius
                );
                context.arcTo(imgX, imgY + imgHeight, imgX, imgY, cornerRadius);
                context.arcTo(imgX, imgY, imgX + imgWidth, imgY, cornerRadius);
                context.closePath();
                context.clip();

                // Calculate source dimensions to maintain aspect ratio
                let sourceX = 0;
                let sourceY = 0;
                let sourceWidth = image.width;
                let sourceHeight = image.height;

                // Calculate the aspect ratio of the source image
                const sourceAspect = image.width / image.height;

                // If source aspect doesn't match our target, crop the source
                if (sourceAspect > aspectRatio) {
                  // Source is wider than target: crop width
                  sourceWidth = image.height * aspectRatio;
                  sourceX = (image.width - sourceWidth) / 2;
                } else if (sourceAspect < aspectRatio) {
                  // Source is taller than target: crop height
                  sourceHeight = image.width / aspectRatio;
                  sourceY = (image.height - sourceHeight) / 2;
                }

                // High quality rendering
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";

                // Draw the image with proper cropping to maintain aspect ratio
                context.drawImage(
                  image,
                  sourceX,
                  sourceY,
                  sourceWidth,
                  sourceHeight, // Source rectangle
                  imgX,
                  imgY,
                  imgWidth,
                  imgHeight // Destination rectangle
                );

                // Add subtle border - thinner on mobile
                context.strokeStyle = "rgba(255,255,255,0.5)";
                context.lineWidth = isMobile ? 1 : 1.5;
                context.stroke();

                context.restore();
                resolve();
              };

              // Add error handling
              image.onerror = () => {
                console.error("Failed to load image:", img);
                resolve();
              };
            });
          })
        );

        // Add watermark text
        const textColor = getContrastColor(backgroundColor);
        const text = "Caméree - Photo Booth";

        // Smaller font on mobile
        context.font = `bold ${isMobile ? "14px" : "16px"} Arial, sans-serif`;
        context.fillStyle = textColor;
        context.textAlign = "center";
        context.textBaseline = "bottom";

        // Add slight shadow for better text readability
        context.shadowColor =
          textColor === "white" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";
        context.shadowBlur = 2;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        // Position text at the bottom
        const textX = maxWidth / 2;
        const textY = totalHeight - 10;

        context.fillText(text, textX, textY);
        context.shadowColor = "transparent";
        context.shadowBlur = 0;
      }
    }
  };

  const capturePhotoSeries = () => {
    setIsCapturing(true);
    setCollageImages([]);

    function startCountdown(callback: () => void) {
      let count = 3; // Hitung mundur 3 detik sebelum capture
      setCountdownValue(count);

      const countdownInterval = setInterval(() => {
        count--;
        setCountdownValue(count);

        if (count === 0) {
          clearInterval(countdownInterval);
          setCountdownValue(null);
          callback(); // Jalankan fungsi setelah hitung mundur selesai
        }
      }, 1500);
    }

    const startCapturing = () => {
      let photoCount = 0;

      const captureNextPhoto = () => {
        if (photoCount < 4) {
          startCountdown(() => {
            capturePhoto(); // Ambil foto setelah hitung mundur
            photoCount++;

            // Lanjut ke capture berikutnya tanpa menghentikan live video
            requestAnimationFrame(captureNextPhoto);
          });
        } else {
          setIsCapturing(false);
        }
      };

      captureNextPhoto();
    };

    startCapturing();
  };

  const downloadCollage = () => {
    if (collageCanvasRef.current && collageImages.length > 0) {
      try {
        // Get canvas and create filename with timestamp
        const canvas = collageCanvasRef.current;
        const fileName = `cameree-collage-${new Date().getTime()}.png`;

        // Convert to data URL with high quality
        const dataURL = canvas.toDataURL("image/png", 1.0);

        // Check if running on iOS
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.userAgent.includes("Mac") && "ontouchend" in window);

        if (isIOS) {
          // iOS handling - open in new window for manual saving
          alert("Please take a screenshot of your collage to save it");
          window.open(dataURL);
        } else {
          // Standard download for other platforms
          const link = document.createElement("a");
          link.download = fileName;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error("Error downloading collage:", error);
        alert("Failed to download. Please try taking a screenshot instead.");
      }
    } else {
      alert("Please capture images first before downloading.");
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

  const toggleGridLayout = () => {
    setGridLayout((prev) => (prev === "2x2" ? "4x1" : "2x2"));
  };

  return (
    <div className="min-h-screen bg-[#c7c1b6] flex flex-col">
      {/* Elegant Header */}
      <header className="py-4 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-[#153378]"
        >
          <Link href="/">Caméree</Link>
          <span className="block text-sm font-medium text-[#153378] mt-2">
            Interactive Photo Booth
          </span>
        </motion.h1>
      </header>

      <div className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-8 grid md:grid-cols-2 gap-4 sm:gap-8">
        {/* Camera Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#c7c1b9] border-t border-gray-300/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          {/* Camera Preview */}
          <div className="relative rounded-xl overflow-hidden border-2 sm:border-4 border-[#153378] shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full aspect-video object-cover ${
                filter !== "none" ? "hidden" : ""
              }`}
              style={{
                transform: isMirrored ? "scaleX(-1)" : "scaleX(1)",
                objectFit: "cover",
              }}
            />
            <canvas
              ref={liveFilterCanvasRef}
              className={`w-full aspect-video object-cover ${
                filter === "none" ? "hidden" : ""
              }`}
            />

            {/* Countdown Overlay */}
            {countdownValue !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
              >
                <span className="text-9xl font-bold text-white">
                  {countdownValue}
                </span>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-6 space-y-4">
            {/* Filter Buttons */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {filters.map(({ id, label, src }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`overflow-hidden w-12 sm:w-16 rounded-full ${
                    filter === id
                      ? "border-3 sm:border-4 border-[#153378]"
                      : "border-2 border-[#c7c1b6] hover:border-[#bdb7ae]"
                  } transition-all duration-300 ease-in-out`}
                >
                  <Image
                    src={src as string}
                    alt={label}
                    width={64}
                    height={64}
                    className="w-full h-auto object-cover"
                  />
                </button>
              ))}
            </div>
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={flipCamera}
                className="px-5 py-2 bg-[#c7c1b6] text-[#153378] font-medium rounded-lg shadow-sm hover:bg-[#bdb7ae] focus:ring-2 focus:ring-[#153378] transition-all duration-200"
              >
                <RefreshCcw className="mr-2" size={16} /> Switch
              </Button>
              <Button
                onClick={toggleMirror}
                className="px-5 py-2 bg-[#c7c1b6] text-[#153378] font-medium rounded-lg shadow-sm hover:bg-[#bdb7ae] focus:ring-2 focus:ring-[#153378] transition-all duration-200"
              >
                {isMirrored ? "Unmirror" : "Mirror"}
              </Button>
              <Button
                onClick={restartCapture}
                className="px-5 py-2 bg-[#c7c1b6] text-[#781515] font-medium rounded-lg shadow-sm hover:bg-[#bdb7ae] focus:ring-2 focus:ring-[#781515] transition-all duration-200"
              >
                Clear Photos
              </Button>
            </div>

            {/* Advanced Controls */}
            <div className="flex justify-between items-center">
              {/* Background Color Picker */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">
                  Background:
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-8 cursor-pointer hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Layout Toggle Button */}
              <Button
                onClick={toggleGridLayout}
                className="px-5 py-2 bg-[#c7c1b6] text-[#153378] font-medium rounded-lg shadow-sm hover:bg-[#bdb7ae] focus:ring-2 focus:ring-[#153378] transition-all duration-200"
              >
                Layout: {gridLayout === "2x2" ? "2×2 Grid" : "4×1 Stack"}
              </Button>
            </div>

            {/* Main Capture Button */}
            <motion.div
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                onClick={capturePhotoSeries}
                disabled={isCapturing}
                className={`w-full py-3 rounded-lg text-white font-medium shadow-md transition-all duration-300 ${
                  isCapturing
                    ? "bg-[#c7c1b6] cursor-not-allowed"
                    : "bg-[#153378] hover:bg-[#153378f8] focus:ring-2 focus:ring-pink-300"
                }`}
              >
                {isCapturing ? "Capturing..." : "Start Photo Booth"}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Collage Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#c7c1b9] border-t border-gray-300/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          {collageImages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#153378]">
              <Camera className="w-24 h-24 text-[#153378]" strokeWidth={1} />
              <h2 className="text-2xl font-bold mb-2">Ready to Capture</h2>
              <p className="text-sm">
                Click &quot;Start Photo Booth&quot; to begin your photoshoot.
                You&apos;ll capture 4 photos in a{" "}
                {gridLayout === "2x2" ? "2×2 grid" : "4×1 stack"} layout.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-4 text-center text-gray-700">
                Collage Preview
              </h3>
              <div className="flex justify-center mb-4 overflow-hidden">
                <canvas
                  ref={collageCanvasRef}
                  className={`
                    rounded-xl shadow-lg max-w-full
                    ${gridLayout === "4x1" ? "w-xs" : "w-full"}
                  `}
                />
              </div>

              {collageImages.length < 4 ? (
                <p className="text-center text-[#153378]">
                  Progress: {collageImages.length}/4 photos captured
                </p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={downloadCollage}
                    className="px-5 py-2 bg-[#c7c1b6] text-[#153378] font-medium rounded-lg shadow-sm hover:bg-[#bdb7ae] focus:ring-2 focus:ring-[#153378] transition-all duration-200"
                  >
                    <Download className="mr-2" /> Download Collage
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
