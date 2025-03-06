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

  const startCamera = async () => {
    try {
      console.log("Attempting to start camera with facingMode:", facingMode);

      // Stop any existing video streams
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        console.log("Stopped previous camera streams.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 3840 }, // 4K resolution for maximum clarity
          height: { ideal: 2160 },
          frameRate: { ideal: 60, max: 120 }, // Smooth video
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Camera stream started successfully.");

        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = () => {
            console.log("Metadata loaded, playing video.");
            videoRef.current?.play().then(() => {
              // Start processing frames for filter preview once video is playing
              startLiveFilterPreview();
              resolve(null);
            });
          };
        });
      }
    } catch (err: unknown) {
      console.error("Error accessing camera:", err);

      if (err instanceof Error) {
        alert(`Error accessing camera: ${err.message}`);
      } else {
        alert("Error accessing camera: Unknown error occurred");
      }
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

  const applyRetroVintageFilter = (
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
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
    if (collageCanvasRef.current && collageImages.length > 0) {
      const context = collageCanvasRef.current.getContext("2d");
      if (!context) return;

      const width = videoRef.current?.videoWidth || 640;
      const height = videoRef.current?.videoHeight || 480;
      const padding = 14;

      // Set canvas size based on selected layout
      if (gridLayout === "2x2") {
        // 2x2 Grid layout
        collageCanvasRef.current.width = width + padding * 2;
        collageCanvasRef.current.height = height + padding * 2 + 35;

        const cellWidth = width / 2 - 10;
        const cellHeight = height / 2 - 10;

        // Clear canvas and set background
        context.fillStyle = backgroundColor;
        context.fillRect(
          0,
          0,
          collageCanvasRef.current.width,
          collageCanvasRef.current.height
        );

        // Draw images in a 2x2 grid
        await Promise.all(
          collageImages.map((img, index) => {
            return new Promise<void>((resolve) => {
              // Use document.createElement to create the image
              const image = document.createElement("img");
              image.src = img;
              image.onload = () => {
                const row = Math.floor(index / 2);
                const col = index % 2;
                const x = col * (cellWidth + 15) + padding;
                const y = row * (cellHeight + 10) + padding;

                // Draw rounded corners
                context.save();
                context.beginPath();
                context.moveTo(x + 10, y);
                context.arcTo(
                  x + cellWidth,
                  y,
                  x + cellWidth,
                  y + cellHeight,
                  10
                );
                context.arcTo(
                  x + cellWidth,
                  y + cellHeight,
                  x,
                  y + cellHeight,
                  10
                );
                context.arcTo(x, y + cellHeight, x, y, 10);
                context.arcTo(x, y, x + cellWidth, y, 10);
                context.closePath();
                context.clip();

                context.drawImage(image, x, y, cellWidth, cellHeight);

                // Add a subtle border
                context.strokeStyle = "rgba(255,255,255,0.5)";
                context.lineWidth = 3;
                context.stroke();

                context.restore();
                resolve();
              };
            });
          })
        );

        // Tentukan warna teks berdasarkan warna background
        const getContrastColor = (bgColor: string): string => {
          // Validasi format warna hex (contoh: #RRGGBB)
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

            // Hitung kecerahan (luminance) menggunakan rumus persepsi
            const brightness = r * 0.299 + g * 0.587 + b * 0.114;

            // Jika cerah, gunakan teks hitam, jika gelap gunakan teks putih
            return brightness > 128 ? "black" : "white";
          } catch (error) {
            console.error("Error processing color:", error);
            return "black"; // Default jika warna tidak valid
          }
        };

        // Tentukan warna teks berdasarkan backgroundColor
        const textColor = getContrastColor(backgroundColor);

        // Tambahkan teks "Caméree - Photo Booth"
        const text = "Caméree - Photo Booth";
        context.font = "bold 28px Arial";
        context.fillStyle = textColor;
        context.textAlign = "center";
        context.textBaseline = "bottom";

        // Hitung posisi teks di tengah bawah
        const textX = collageCanvasRef.current.width / 2;
        const textY = collageCanvasRef.current.height - 20;

        // Gambar teks di canvas
        context.fillText(text, textX, textY);
      } else {
        // 4x1 Vertical layout
        const aspectRatio = width / height;

        // Calculate image dimensions for the 4x1 layout
        const imgWidth = Math.min(width * 0.85, 520);
        const imgHeight = imgWidth / aspectRatio;
        const gap = 7;

        // Calculate total height based on 4 images
        const totalHeight =
          imgHeight * collageImages.length +
          gap * (collageImages.length - 1) +
          padding * 2 +
          35 +
          30;

        collageCanvasRef.current.width = imgWidth + padding * 2;
        collageCanvasRef.current.height = totalHeight;

        // Clear canvas and set background
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, collageCanvasRef.current.width, totalHeight);

        // Draw images stacked vertically with proper aspect ratio
        await Promise.all(
          collageImages.map((img, index) => {
            return new Promise<void>((resolve) => {
              // Use document.createElement to create the image
              const image = document.createElement("img");
              image.src = img;
              image.onload = () => {
                const imgX = padding;
                const imgY = padding + index * (imgHeight + gap);

                // Draw rounded corners
                context.save();
                context.beginPath();
                context.moveTo(imgX + 10, imgY);
                context.arcTo(
                  imgX + imgWidth,
                  imgY,
                  imgX + imgWidth,
                  imgY + imgHeight,
                  10
                );
                context.arcTo(
                  imgX + imgWidth,
                  imgY + imgHeight,
                  imgX,
                  imgY + imgHeight,
                  10
                );
                context.arcTo(imgX, imgY + imgHeight, imgX, imgY, 10);
                context.arcTo(imgX, imgY, imgX + imgWidth, imgY, 10);
                context.closePath();
                context.clip();

                // Draw the image with improved quality
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";
                context.drawImage(image, imgX, imgY, imgWidth, imgHeight);

                // Add a subtle border
                context.strokeStyle = "rgba(255,255,255,0.5)";
                context.lineWidth = 3;
                context.stroke();

                context.restore();
                resolve();
              };
            });
          })
        );

        // Tentukan warna teks berdasarkan warna background
        const getContrastColor = (bgColor: string): string => {
          // Validasi format warna hex (contoh: #RRGGBB)
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

            // Hitung kecerahan (luminance) menggunakan rumus persepsi
            const brightness = r * 0.299 + g * 0.587 + b * 0.114;

            // Jika cerah, gunakan teks hitam, jika gelap gunakan teks putih
            return brightness > 128 ? "black" : "white";
          } catch (error) {
            console.error("Error processing color:", error);
            return "black"; // Default jika warna tidak valid
          }
        };

        // Tentukan warna teks berdasarkan backgroundColor
        const textColor = getContrastColor(backgroundColor);

        // Tambahkan teks "Caméree - Photo Booth"
        const text = "Caméree - Photo Booth";
        context.font = "bold 20px Arial";
        context.fillStyle = textColor;
        context.textAlign = "center";
        context.textBaseline = "bottom";

        // Hitung posisi teks di tengah bawah
        const textX = collageCanvasRef.current.width / 2;
        const textY = collageCanvasRef.current.height - 20;

        // Gambar teks di canvas
        context.fillText(text, textX, textY);
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
      const link = document.createElement("a");
      link.href = collageCanvasRef.current.toDataURL("image/png");
      link.download = "cameree-collage.png";
      link.click();
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

      <div className="flex-grow container mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        {/* Camera Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#c7c1b9] border-t border-gray-300/70 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
        >
          {/* Camera Preview */}
          <div className="relative rounded-xl overflow-hidden border-4 border-[#153378] shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full aspect-video object-cover ${
                filter !== "none" ? "hidden" : ""
              }`}
              style={{
                transform: isMirrored ? "scaleX(-1)" : "scaleX(1)",
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
            <div className="grid grid-cols-5 gap-2">
              {filters.map(({ id, label, src }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`overflow-hidden w-16 rounded-full ${
                    filter === id
                      ? "border-4 border-[#153378]"
                      : "border-2 border-[#c7c1b6] hover:border-[#bdb7ae]"
                  } transition-all duration-300 ease-in-out`}
                >
                  <Image
                    src={src as string}
                    alt={label}
                    width={64} // Sesuaikan dengan ukuran gambar
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
              <div className="flex justify-center mb-4">
                <canvas
                  ref={collageCanvasRef}
                  className={`
                    rounded-xl shadow-lg 
                    ${gridLayout === "4x1" ? "max-w-xs" : "w-full"}
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
