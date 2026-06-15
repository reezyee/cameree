"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Rnd } from "react-rnd";
import Image from "next/image";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Plus,
  Trash2,
  Camera,
  Undo2,
  Redo2,
  RotateCw,
  Layers,
  Square,
  Circle,
  Loader2,
  Edit3,
  ImageMinus,
  ImageIcon,
  CropIcon,
  Copy,
  Sticker,
} from "lucide-react";

interface EditorElement {
  id: string;
  type: "photo" | "sticker";
  src?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  radius?: string;
  customRadius?: { tl: number; tr: number; bl: number; br: number };
}

interface ServerTemplate {
  id: string;
  name: string;
  totalShots: number;
  canvasWidth: number;
  canvasHeight: number;
  backgroundMode: "color" | "image";
  backgroundValue: string;
  elements: EditorElement[];
}

interface ImglyModule {
  removeBackground?: (
    blob: Blob,
    config?: { model?: string; device?: string },
  ) => Promise<Blob>;
  default?: (
    blob: Blob,
    config?: { model?: string; device?: string },
  ) => Promise<Blob>;
}

export default function ProStripsEditor() {
  const [themeName, setThemeName] = useState("New Template");
  const [totalShots, setTotalShots] = useState(4);
  const [canvasSize, setCanvasSize] = useState<{
    w: number | "";
    h: number | "";
  }>({ w: 300, h: 900 });
  const [bgMode, setBgMode] = useState<"color" | "image">("color");
  const [bgValue, setBgValue] = useState<string>("#ffffff");
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.6);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInternalDragging, setIsInternalDragging] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const commitHistory = useCallback(
    (newElements: EditorElement[]) => {
      const snapshot = JSON.stringify(newElements);
      const updatedHistory = history.slice(0, historyStep + 1);
      updatedHistory.push(snapshot);
      setHistory(updatedHistory.slice(-30));
      setHistoryStep(updatedHistory.length - 1);
    },
    [history, historyStep],
  );

  const undo = useCallback(() => {
    if (historyStep > 0) {
      setElements(JSON.parse(history[historyStep - 1]));
      setHistoryStep(historyStep - 1);
    }
  }, [history, historyStep]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setElements(JSON.parse(history[historyStep + 1]));
      setHistoryStep(historyStep + 1);
    }
  }, [history, historyStep]);

  const duplicateElement = useCallback(
    (id: string) => {
      setElements((prev) => {
        const target = prev.find((el) => el.id === id);
        if (!target || target.type === "photo") return prev;
        const newSticker: EditorElement = {
          ...target,
          id: `st-dup-${Date.now()}`,
          x: target.x + 20,
          y: target.y + 20,
        };
        const newState = [...prev, newSticker];
        commitHistory(newState);
        setSelectedId(newSticker.id);
        return newState;
      });
    },
    [commitHistory],
  );

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );
    formData.append("folder", "cameree/strips");
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const initPhotos = useCallback(
    (shots: number, saveToHistory: boolean = false) => {
      setElements((prev) => {
        const currentStickers = prev.filter((el) => el.type === "sticker");

        const oldPhotosMap = new Map(
          prev.filter((el) => el.type === "photo").map((p) => [p.id, p]),
        );

        const newPhotos: EditorElement[] = Array.from({
          length: Math.min(shots, 6),
        }).map((_, i) => {
          const oldPhoto = oldPhotosMap.get(`photo-${i}`);
          if (oldPhoto) return oldPhoto;

          return {
            id: `photo-${i}`,
            type: "photo",
            x: 20,
            y: i * 140 + 40,
            w: 260,
            h: 120,
            rotate: 0,
            radius: "0px",
            customRadius: { tl: 0, tr: 0, bl: 0, br: 0 },
          };
        });

        const newState = [...newPhotos, ...currentStickers];
        if (saveToHistory) commitHistory(newState);
        return newState;
      });
    },
    [commitHistory],
  );

  useEffect(() => {
    initPhotos(totalShots, false);
  }, [totalShots]);

  const togglePhotoRadius = (id: string) => {
    setElements((prev) => {
      const newState = prev.map((el) => {
        if (el.id === id && el.type === "photo") {
          const isCurrentlyRounded = el.customRadius?.tl !== 0;

          const newRadius = isCurrentlyRounded ? 0 : 150;
          const newCustom = {
            tl: newRadius,
            tr: newRadius,
            bl: newRadius,
            br: newRadius,
          };

          return {
            ...el,
            customRadius: newCustom,
            radius: `${newRadius}px ${newRadius}px ${newRadius}px ${newRadius}px`,
          };
        }
        return el;
      });
      commitHistory(newState);
      return newState;
    });
  };

  const updateCustomRadius = (id: string, corner: string, value: number) => {
    setElements((prev) => {
      const newState = prev.map((el) => {
        if (el.id === id) {
          const currentCustom = el.customRadius || {
            tl: 0,
            tr: 0,
            bl: 0,
            br: 0,
          };
          const newCustom = {
            ...currentCustom,
            [corner]: value,
          };

          return {
            ...el,
            customRadius: newCustom,
            radius: `${newCustom.tl}px ${newCustom.tr}px ${newCustom.br}px ${newCustom.bl}px`,
          };
        }
        return el;
      });
      commitHistory(newState);
      return newState;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const loadTemplate = async () => {
        setIsProcessing(true);
        try {
          const res = await fetch(`/api/strips`);
          const allTemplates: ServerTemplate[] = await res.json();
          const target = allTemplates.find((t) => t.id === id);

          if (target) {
            setEditId(id);
            setThemeName(target.name);
            setTotalShots(target.totalShots);
            setCanvasSize({ w: target.canvasWidth, h: target.canvasHeight });
            setBgMode(target.backgroundMode);
            setBgValue(target.backgroundValue);
            setElements(target.elements);
          }
        } catch (err) {
          console.error("Failed to load template:", err);
        } finally {
          setIsProcessing(false);
        }
      };
      loadTemplate();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomSpeed = 0.001;
        setZoom((prev) =>
          Math.min(Math.max(0.1, prev - e.deltaY * zoomSpeed), 3),
        );
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        if (selectedId.startsWith("photo-")) return;
        setElements((prev) => {
          const newState = prev.filter((el) => el.id !== selectedId);
          commitHistory(newState);
          return newState;
        });
        setSelectedId(null);
      } else if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedId) duplicateElement(selectedId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, undo, redo, duplicateElement, commitHistory]);

  const addSticker = async (file: File) => {
    setIsProcessing(true);
    try {
      const url = await uploadToCloudinary(file);
      const newSticker: EditorElement = {
        id: `st-${Date.now()}`,
        type: "sticker",
        src: url,
        x: 50,
        y: 50,
        w: 120,
        h: 120,
        rotate: 0,
      };
      setElements((prev) => {
        const newState = [...prev, newSticker];
        commitHistory(newState);
        return newState;
      });
      setSelectedId(newSticker.id);
    } catch (err) {
      console.error("Failed to add sticker:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeBackground = async (stickerId: string) => {
    const target = elements.find((el) => el.id === stickerId);
    if (!target || !target.src || isProcessing) return;
    try {
      setIsProcessing(true);
      const imgly = await import("@imgly/background-removal");
      const removeFn =
        (imgly as unknown as ImglyModule).removeBackground ||
        (imgly as unknown as ImglyModule).default ||
        imgly;

      if (typeof removeFn !== "function")
        throw new Error("Background removal function not found");

      const response = await fetch(target.src);
      const blob = await response.blob();
      const resultBlob = await removeFn(blob, {
        model: "medium",
        device: "gpu",
      });
      const file = new File([resultBlob], "sticker.png", { type: "image/png" });
      const newUrl = await uploadToCloudinary(file);
      setElements((prev) => {
        const newState = prev.map((el) =>
          el.id === stickerId ? { ...el, src: newUrl } : el,
        );
        commitHistory(newState);
        return newState;
      });
    } catch {
      alert("Failed to remove background!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBgDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setCropImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop,
  ): Promise<File> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    const activeElement = elements.find((el) => el.id === selectedId);
    const isSticker = activeElement?.type === "sticker";

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const ext = isSticker ? "png" : "jpg";
          const mime = isSticker ? "image/png" : "image/jpeg";
          resolve(new File([blob!], `cropped.${ext}`, { type: mime }));
        },
        isSticker ? "image/png" : "image/jpeg",
        isSticker ? undefined : 0.95,
      );
    });
  };

  const handleConfirmCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
      const url = await uploadToCloudinary(croppedFile);
      const activeElement = elements.find((el) => el.id === selectedId);

      if (activeElement && activeElement.type === "sticker") {
        setElements((prev) => {
          const newState = prev.map((el) =>
            el.id === selectedId ? { ...el, src: url } : el,
          );
          commitHistory(newState);
          return newState;
        });
      } else {
        setBgValue(url);
        setBgMode("image");
      }
      setCropImage(null);
    } catch (e) {
      console.error("Failed to crop:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (isInternalDragging) {
      setIsInternalDragging(false);
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) await addSticker(file);
  };

  const handleCanvasSizeChange = (dim: "w" | "h", value: string) => {
    setCanvasSize((prev) => ({
      ...prev,
      [dim]: value === "" ? "" : parseInt(value) || 0,
    }));
  };

  const validateCanvasSize = (dim: "w" | "h") => {
    const minLimits = { w: 300, h: 400 };
    const currentVal = canvasSize[dim];
    if (currentVal === "" || (currentVal as number) < minLimits[dim]) {
      setCanvasSize((prev) => ({ ...prev, [dim]: minLimits[dim] }));
    }
  };

  const cropSticker = () => {
    const target = elements.find((el) => el.id === selectedId);
    if (target && target.type === "sticker" && target.src) {
      setCropImage(target.src);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-300 overflow-hidden font-sans">
      {isProcessing && (
        <div className="fixed inset-0 z-9999 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        </div>
      )}

      {/* SIDEBAR LEFT */}
      <div
        className="w-64 shrink-0 bg-[#0c0c0c] border-r border-white/3 p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar z-20"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Image
              src="/images/camereestudio.png"
              alt="Caméree Studio Logo"
              width={140}
              height={40}
              priority
              className="w-[140px] h-auto"
            />
          </div>
          <button
            onClick={() => (window.location.href = "/admin/templates")}
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all group cursor-pointer"
            title="Back to Library"
          >
            <ImageIcon
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
        </div>
        <div className="space-y-6">
          <div className="space-y-2.5 border-b border-white/3 pb-4">
            <label className="text-[9px] uppercase font-black text-zinc-600 tracking-[0.2em] block px-1">
              Template Name
            </label>
            <div className="group relative">
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className="w-full bg-[#141414] border border-white/5 p-3 rounded-md text-[11px] outline-none focus:border-blue-500/50 text-zinc-100 font-medium"
              />
              <Edit3
                size={10}
                className="absolute right-3 top-3.5 text-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 pb-4 border-b border-white/3">
            <label className="text-[9px] uppercase font-black text-zinc-600 tracking-[0.2em] block px-1">
              Capture Config
            </label>
            <div className="bg-[#111111] p-2 rounded-xl border border-white/3 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                  Shots
                </span>
                <input
                  type="number"
                  value={totalShots}
                  onChange={(e) => {
                    const n = parseInt(e.target.value);
                    if (n >= 1 && n <= 6) {
                      setTotalShots(n);
                      initPhotos(n);
                    }
                  }}
                  className="bg-zinc-900 w-16 p-2 rounded-md text-[11px] outline-none text-blue-500 font-black text-center border border-white/5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase font-black text-zinc-600 tracking-[0.2em] block px-1">
              Canvas
            </label>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="flex flex-1 gap-3 p-1 bg-[#111111] rounded-lg border border-white/3">
                {[
                  { label: "Width", key: "w" as const },
                  { label: "Height", key: "h" as const },
                ].map((dim) => (
                  <div key={dim.key} className="space-y-1.5 flex-1">
                    <p className="text-[8px] text-zinc-600 font-black uppercase text-center tracking-widest">
                      {dim.label}
                    </p>
                    <input
                      type="number"
                      value={canvasSize[dim.key]}
                      onChange={(e) =>
                        handleCanvasSizeChange(dim.key, e.target.value)
                      }
                      onBlur={() => validateCanvasSize(dim.key)}
                      className="bg-zinc-900 w-full p-2.5 rounded-md text-[10px] text-center outline-none text-zinc-200 font-bold border border-white/5"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 p-2 border border-white/3 rounded-lg overflow-hidden">
                {["color", "image"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBgMode(mode as "color" | "image")}
                    className={`flex-1 py-2 cursor-pointer text-[8px] font-black rounded-md transition-all duration-300 uppercase tracking-widest ${bgMode === mode ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-600 hover:text-zinc-400"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-11">
              {bgMode === "color" ? (
                <div className="relative h-11 w-full rounded-lg border border-white/5 overflow-hidden group bg-[#141414]">
                  <input
                    type="color"
                    value={bgValue?.startsWith("#") ? bgValue : "#ffffff"}
                    onChange={(e) => setBgValue(e.target.value)}
                    className="absolute -inset-2.5 w-[150%] h-[150%] cursor-pointer bg-transparent"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-3">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                      Background Hex
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">
                        {bgValue}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: bgValue }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleBgDrop}
                  className="relative group p-6 border border-dashed border-white/5 rounded-xl text-[8px] font-black text-zinc-600 text-center hover:border-blue-500/50 hover:bg-blue-500/2 transition-all cursor-pointer bg-zinc-900/20"
                >
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const url = await uploadToCloudinary(e.target.files[0]);
                        setBgValue(url);
                      }
                    }}
                  />
                  <ImageIcon
                    size={14}
                    className="mx-auto mb-2 opacity-20 group-hover:opacity-100 transition-opacity text-blue-500"
                  />
                  IMPORT IMAGE AS BACKGROUND
                </div>
              )}
            </div>
          </div>

          <button className="relative w-full group overflow-hidden rounded-xl">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={(e) => e.target.files && addSticker(e.target.files[0])}
            />
            <div className="flex items-center justify-center gap-2 w-full p-4 bg-zinc-100 text-black text-[10px] font-black uppercase tracking-tighter hover:bg-white transition-colors">
              <Plus size={14} strokeWidth={3} /> Add Overlay
            </div>
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-white/3 flex gap-2">
          <button
            onClick={undo}
            className="flex-1 py-3 bg-[#111111] hover:bg-zinc-800 border border-white/3 rounded-lg flex justify-center text-zinc-500 hover:text-white transition-all"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            className="flex-1 py-3 bg-[#111111] hover:bg-zinc-800 border border-white/3 rounded-lg flex justify-center text-zinc-500 hover:text-white transition-all"
          >
            <Redo2 size={14} />
          </button>
        </div>
      </div>

      {/* WORKING AREA */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-[#151516f6] overflow-auto scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          className="inline-flex min-w-full min-h-full items-center justify-center p-[400px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onClick={() => setSelectedId(null)}
        >
          <div
            className="transition-transform duration-75 ease-out"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <div
              className="relative shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-white overflow-hidden"
              style={{
                width: canvasSize.w || 300,
                height: canvasSize.h || 900,
                backgroundColor: bgMode === "color" ? bgValue : "transparent",
                backgroundImage:
                  bgMode === "image" ? `url(${bgValue})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {elements.map((el, index) => (
                <Rnd
                  key={el.id}
                  size={{ width: el.w, height: el.h }}
                  position={{ x: el.x, y: el.y }}
                  scale={zoom}
                  style={{ zIndex: selectedId === el.id ? 9999 : index }}
                  onDragStart={() => {
                    setSelectedId(el.id);
                    setIsInternalDragging(true);
                  }}
                  onDragStop={(_, d) => {
                    setTimeout(() => setIsInternalDragging(false), 200);
                    setElements((prev) => {
                      const up = prev.map((it) =>
                        it.id === el.id ? { ...it, x: d.x, y: d.y } : it,
                      );
                      commitHistory(up);
                      return up;
                    });
                  }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                  disableDragging={selectedId !== el.id}
                  enableResizing={false}
                >
                  <div
                    className="w-full h-full relative"
                    style={{
                      transform: `rotate(${el.rotate}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Content */}
                    <div
                      className="w-full h-full relative overflow-hidden flex items-center justify-center"
                      style={{
                        borderRadius:
                          el.radius === "50%" ? "50%" : el.radius || "0px",
                        pointerEvents: "none",
                      }}
                    >
                      {el.type === "photo" ? (
                        <div className="w-full h-full bg-[#bababa] flex items-center justify-center">
                          <h2 className="text-[24px] font-black italic tracking-tighter text-blue-600">
                            0
                            {elements
                              .filter((it) => it.type === "photo")
                              .indexOf(el) + 1}
                          </h2>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={el.src}
                          crossOrigin="anonymous"
                          className="w-full h-full object-contain select-none"
                          alt="sticker"
                        />
                      )}
                    </div>

                    {/* FLOATING CONTROLS */}
                    {selectedId === el.id && (
                      <>
                        <div
                          className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
                          style={{
                            borderRadius:
                              el.radius === "50%" ? "50%" : el.radius || "0px",
                          }}
                        />

                        <div
                          className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize z-110 shadow-md pointer-events-auto"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const { w: sW, h: sH, x: sX, y: sY } = el;
                            const move = (mv: MouseEvent) => {
                              const dx = (mv.clientX - startX) / zoom;
                              const dy = (mv.clientY - startY) / zoom;
                              setElements((prev) =>
                                prev.map((it) =>
                                  it.id === el.id
                                    ? {
                                        ...it,
                                        w: Math.max(30, sW - dx),
                                        h: Math.max(30, sH - dy),
                                        x: sX + dx,
                                        y: sY + dy,
                                      }
                                    : it,
                                ),
                              );
                            };
                            const up = () => {
                              window.removeEventListener("mousemove", move);
                              window.removeEventListener("mouseup", up);
                              commitHistory(elements);
                            };
                            window.addEventListener("mousemove", move);
                            window.addEventListener("mouseup", up);
                          }}
                        />

                        <div
                          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-se-resize z-110 shadow-xl pointer-events-auto"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const { w: sW, h: sH } = el;
                            const move = (mv: MouseEvent) => {
                              const dx = (mv.clientX - startX) / zoom;
                              const dy = (mv.clientY - startY) / zoom;
                              setElements((prev) =>
                                prev.map((it) =>
                                  it.id === el.id
                                    ? {
                                        ...it,
                                        w: Math.max(30, sW + dx),
                                        h: Math.max(30, sH + dy),
                                      }
                                    : it,
                                ),
                              );
                            };
                            const up = () => {
                              window.removeEventListener("mousemove", move);
                              window.removeEventListener("mouseup", up);
                              commitHistory(elements);
                            };
                            window.addEventListener("mousemove", move);
                            window.addEventListener("mouseup", up);
                          }}
                        />

                        <div
                          className="absolute -top-14 left-1/2 -translate-x-1/2 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center border-2 border-blue-500 z-120 shadow-xl cursor-grab active:cursor-grabbing pointer-events-auto"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const rndElement =
                              e.currentTarget.closest(".react-draggable");
                            if (!rndElement) return;
                            const rect = rndElement.getBoundingClientRect();
                            const centerX = rect.left + rect.width / 2;
                            const centerY = rect.top + rect.height / 2;
                            const move = (mv: MouseEvent) => {
                              const angle = Math.atan2(
                                mv.clientY - centerY,
                                mv.clientX - centerX,
                              );
                              setElements((prev) =>
                                prev.map((it) =>
                                  it.id === el.id
                                    ? {
                                        ...it,
                                        rotate: (angle * 180) / Math.PI + 90,
                                      }
                                    : it,
                                ),
                              );
                            };
                            const stop = () => {
                              window.removeEventListener("mousemove", move);
                              window.removeEventListener("mouseup", stop);
                              commitHistory(elements);
                            };
                            window.addEventListener("mousemove", move);
                            window.addEventListener("mouseup", stop);
                          }}
                        >
                          <RotateCw size={14} />
                        </div>
                      </>
                    )}
                  </div>
                </Rnd>
              ))}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 10, x: "-50%" }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 z-5000 flex items-center gap-3 p-2.5 bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl"
            >
              {elements.find((el) => el.id === selectedId)?.type === "photo" ? (
                <div className="flex items-center gap-4 px-2">
                  <div className="flex gap-3">
                    {["tl", "tr", "bl", "br"].map((corner) => {
                      const currentEl = elements.find(
                        (el) => el.id === selectedId,
                      );
                      const radiusValue =
                        currentEl?.customRadius?.[corner as "tl"] || 0;

                      return (
                        <div
                          key={corner}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-wider">
                            {corner}
                          </span>

                          <input
                            type="range"
                            min="0"
                            max="150"
                            className="w-12 h-1 accent-blue-500 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                            value={radiusValue}
                            onChange={(e) =>
                              updateCustomRadius(
                                selectedId!,
                                corner,
                                parseInt(e.target.value),
                              )
                            }
                          />

                          <div className="relative group/input">
                            <input
                              type="number"
                              min="0"
                              max="300"
                              value={radiusValue}
                              onChange={(e) => {
                                const val =
                                  e.target.value === ""
                                    ? 0
                                    : parseInt(e.target.value);
                                updateCustomRadius(selectedId!, corner, val);
                              }}
                              className="w-10 bg-zinc-900/50 border border-white/5 rounded text-[9px] text-center font-mono text-blue-400 outline-none focus:border-blue-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-1">
                  <button
                    onClick={() => removeBackground(selectedId!)}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl text-[10px] font-black uppercase hover:bg-purple-500 hover:text-white transition-all"
                  >
                    <ImageMinus size={14} /> Remove BG
                  </button>
                  <button
                    onClick={() => duplicateElement(selectedId!)}
                    className="p-2.5 bg-blue-500/10 text-blue-400 cursor-pointer rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={cropSticker}
                    className="p-2.5 bg-zinc-800 text-zinc-400 cursor-pointer rounded-xl hover:bg-white hover:text-black transition-all"
                  >
                    <CropIcon size={16} />
                  </button>
                </div>
              )}

              {elements.find((el) => el.id === selectedId)?.type ===
                "sticker" && (
                <div className="pl-2 border-l border-white/10">
                  <button
                    onClick={() => {
                      setElements((prev) => {
                        const up = prev.filter((el) => el.id !== selectedId);
                        commitHistory(up);
                        return up;
                      });
                      setSelectedId(null);
                    }}
                    className="p-3 text-red-500 cursor-pointer hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SIDEBAR RIGHT - LAYERS */}
      <div
        className="w-72 shrink-0 bg-[#0c0c0c] border-l border-white/3 p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar z-20"
        style={{ scrollbarWidth: "none" }}
      >
        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex justify-between px-1">
          Layers <span>{elements.length}</span>
        </label>

        <Reorder.Group
          axis="y"
          values={[...elements].reverse()}
          onReorder={(newOrder) => {
            const updated = [...newOrder].reverse();
            setElements(updated);
            commitHistory(updated);
          }}
          className="space-y-2 overflow-y-auto no-scrollbar flex-1 pr-1"
        >
          {[...elements].reverse().map((el) => (
            <Reorder.Item
              key={el.id}
              value={el}
              className={`group flex items-center justify-between p-3 rounded-xl text-[10px] cursor-grab active:cursor-grabbing transition-all ${
                selectedId === el.id
                  ? "bg-blue-600 text-white shadow-xl"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
              }`}
              onClick={() => setSelectedId(el.id)}
            >
              <div className="flex items-center gap-3">
                <Layers size={10} className="opacity-30" />
                <div className="flex items-center gap-2">
                  {el.type === "photo" ? (
                    <Camera size={12} />
                  ) : (
                    <Sticker
                      size={12}
                      className={
                        selectedId === el.id ? "text-white" : "text-purple-400"
                      }
                    />
                  )}
                  <span className="font-bold italic uppercase truncate w-20">
                    {el.type === "photo"
                      ? `Photo #${elements.filter((it) => it.type === "photo").indexOf(el) + 1}`
                      : `Overlay #${elements.filter((it) => it.type === "sticker").indexOf(el) + 1}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {el.type === "sticker" ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setElements((prev) => {
                        const up = prev.filter((it) => it.id !== el.id);
                        commitHistory(up);
                        return up;
                      });
                      if (selectedId === el.id) setSelectedId(null);
                    }}
                    className="p-1.5 cursor-pointer opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-md transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoRadius(el.id);
                    }}
                    className={`p-1.5 cursor-pointer rounded-md transition-all ${
                      el.radius === "50%"
                        ? "bg-white/20 text-white"
                        : "bg-black/20 text-zinc-500 hover:text-white"
                    }`}
                  >
                    {el.radius === "50%" ? (
                      <Circle size={12} />
                    ) : (
                      <Square size={12} />
                    )}
                  </button>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        <div className="mt-auto space-y-3">
          {editId && (
            <button
              onClick={() => (window.location.href = "/admin/templates")}
              className="w-full bg-zinc-900 border border-white/5 py-4 rounded-2xl font-black text-zinc-400 text-[11px] hover:bg-zinc-800 transition-all uppercase"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={async () => {
              setIsProcessing(true);
              const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
              try {
                const method = editId ? "PUT" : "POST";
                const payload = {
                  ...(editId && { id: editId }),
                  name: themeName,
                  backgroundMode: bgMode,
                  backgroundValue: bgValue,
                  totalShots: totalShots,
                  canvasWidth: canvasSize.w,
                  canvasHeight: canvasSize.h,
                  elements: elements.map((el) => ({
                    ...el,
                    x: Math.round(Number(el.x)),
                    y: Math.round(Number(el.y)),
                    w: Math.round(Number(el.w)),
                    h: Math.round(Number(el.h)),
                    rotate: Math.round(Number(el.rotate || 0)),
                    radius: el.radius || "0px",
                  })),
                };
                const res = await fetch("/api/strips", {
                  method: String(method),
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Error saving template");
                setToast({
                  show: true,
                  message: "SUCCESS",
                  type: "success",
                });
                await delay(1500);
                window.location.href = "/admin/templates";
              } catch {
                setToast({ show: true, message: "FAILED", type: "error" });
              }
            }}
            className="w-full bg-blue-600 py-4 rounded-2xl font-black text-white text-[11px] hover:bg-blue-500 shadow-2xl transition-all uppercase"
          >
            {editId ? "Update Template" : "Publish Template"}
          </button>
        </div>
      </div>

      {/* MODAL CROPPER */}
      <AnimatePresence>
        {cropImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10000 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-10"
          >
            <div className="relative w-full max-w-4xl max-h-[70vh] bg-[#0c0c0c] p-4 rounded-2xl overflow-auto flex justify-center items-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={cropImage}
                  alt="Crop me"
                  crossOrigin="anonymous"
                  style={{ maxWidth: "100%", maxHeight: "60vh" }}
                  onLoad={(e) => {
                    const { width, height } = e.currentTarget;
                    setCrop(
                      centerCrop(
                        makeAspectCrop(
                          { unit: "%", width: 90 },
                          1,
                          width,
                          height,
                        ),
                        width,
                        height,
                      ),
                    );
                  }}
                />
              </ReactCrop>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setCropImage(null)}
                className="px-8 py-3 rounded-full border border-white/10 text-zinc-500 text-[10px] uppercase font-black tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCrop}
                className="px-10 py-3 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-10001 px-6 py-4 bg-[#141414] border border-white/10 rounded-2xl flex items-center gap-4"
          >
            <div
              className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
