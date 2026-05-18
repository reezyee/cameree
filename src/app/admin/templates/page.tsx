"use client";

import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Edit3,
  Loader2,
  RefreshCw,
  AlertCircle,
  MoveHorizontal,
} from "lucide-react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  Reorder,
  useDragControls,
} from "framer-motion";

interface TemplateStructure {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  totalShots: number;
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

export default function TemplateManager() {
  const [templates, setTemplates] = useState<TemplateStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/strips");
      const rawData: TemplateStructure[] = await res.json();
      setTemplates(rawData);
    } catch (err) {
      console.error("Failed to load templates!", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleReorder = async (newOrder: TemplateStructure[]) => {
    setTemplates(newOrder);
    const orderedIds = newOrder.map((t) => t.id);

    try {
      await fetch("/api/strips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reorder: true,
          ids: orderedIds,
        }),
      });
    } catch (err) {
      console.error("Failed to save new order", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch("/api/strips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== deleteId));
        setDeleteId(null);
      }
    } catch (err) {
      console.error("Delete template crash:", err);
      alert("Failed to delete template!");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black backdrop-blur-lg flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151515d5] text-zinc-300 p-8 font-sans overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://assets.codepen.io/605876/noise.png')]" />

      <div className="max-w-[100vw] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/editor"
              title="back to editor"
              className="group p-4 bg-zinc-900/50 border border-white/5 rounded-full hover:bg-white hover:text-black transition-all duration-500"
            >
              <Edit3 size={24} />
            </Link>
            <div>
              <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                Library
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em] mt-2">
                Templates Management
              </p>
            </div>
          </div>
          <button
            onClick={fetchTemplates}
            className="flex items-center gap-3 bg-zinc-900/80 border border-white/5 px-8 py-4 rounded-2xl text-[11px] font-black hover:bg-blue-600 hover:text-white transition-all duration-500 uppercase tracking-widest"
          >
            <RefreshCw size={16} /> Sync Library
          </button>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex items-center overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory px-[40vw]"
            style={{ width: "100%", scrollBehavior: "smooth" }}
          >
            <Reorder.Group
              axis="x"
              values={templates}
              onReorder={handleReorder}
              className="flex items-end gap-16"
              style={{ width: "max-content" }}
            >
              {templates.map((t) => (
                <TemplateCard key={t.id} t={t} setDeleteId={setDeleteId} />
              ))}
            </Reorder.Group>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-[0_50px_100px_rgba(0,0,0,1)]"
            >
              <div className="w-20 h-20 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-4 leading-tight">
                Delete This Template?
              </h2>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-10">
                This action cannot be undone. All data related to this template
                will be permanently removed.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmDelete}
                  className="w-full bg-red-600 text-white font-black py-5 rounded-2xl hover:bg-red-500 transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="w-full bg-white/5 text-zinc-400 font-black py-5 rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-[0.2em]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function TemplateCard({
  t,
  setDeleteId,
}: {
  t: TemplateStructure;
  setDeleteId: (id: string) => void;
}) {
  const dragControls = useDragControls();
  const DISPLAY_HEIGHT = 450;
  const ratio = DISPLAY_HEIGHT / t.canvasHeight;
  const displayWidth = t.canvasWidth * ratio;
  const allElements = t.elements || [];

  return (
    <Reorder.Item
      key={t.id}
      value={t}
      layout
      dragListener={false}
      dragControls={dragControls}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 26,
        mass: 0.8,
      }}
      className="flex flex-col gap-8 flex-shrink-0 group snap-center select-none relative"
    >
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity duration-300 flex items-center gap-1 text-[8px] font-bold tracking-widest uppercase text-zinc-400 cursor-grab active:cursor-grabbing"
      >
        <MoveHorizontal size={10} /> Drag to Reorder
      </div>

      <div
        className="relative shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] transition-all duration-700 group-hover:scale-[1] group-hover:-translate-y-1.5"
        style={{
          width: `${displayWidth}px`,
          height: `${DISPLAY_HEIGHT}px`,
          backgroundColor:
            t.backgroundMode === "color" ? t.backgroundValue : "#fff",
          backgroundImage:
            t.backgroundMode === "image" ? `url(${t.backgroundValue})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        {allElements.map((el, idx) => {
          let scaledRadius = "0px";
          if (el.radius === "50%") {
            scaledRadius = "50%";
          } else if (el.radius) {
            scaledRadius = el.radius
              .split(" ")
              .map((r: string) => {
                const val = parseFloat(r);
                return isNaN(val) ? r : `${val * ratio}px`;
              })
              .join(" ");
          }

          return (
            <div
              key={idx}
              className="absolute overflow-hidden"
              style={{
                left: el.x * ratio,
                top: el.y * ratio,
                width: el.w * ratio,
                height: el.h * ratio,
                transform: `rotate(${el.rotate || 0}deg)`,
                borderRadius: scaledRadius,
                zIndex: idx,
              }}
            >
              <div className="w-full h-full relative flex items-center justify-center">
                {el.type === "photo" ? (
                  <div className="w-full h-full bg-[#bababa] flex items-center justify-center border border-black/5 relative">
                    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat" />
                    <span
                      className="font-black italic text-black/20 z-10 select-none"
                      style={{ fontSize: `${28 * ratio}px` }}
                    >
                      0
                      {allElements
                        .filter((item) => item.type === "photo")
                        .indexOf(el) + 1}
                    </span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={el.src}
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain pointer-events-none"
                    alt=""
                  />
                )}
              </div>
            </div>
          );
        })}

        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-2 backdrop-blur-sm z-[100] pointer-events-auto">
          <Link
            href={`/admin/editor?id=${t.id}`}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300"
          >
            <Edit3 size={18} />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(t.id);
            }}
            className="w-12 h-12 cursor-pointer bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="px-2 border-l-2 border-white group-hover:border-blue-600 transition-colors duration-500 text-center">
        <h3 className="text-white font-black italic uppercase text-sm tracking-[0.1em] leading-none mb-2">
          {t.name}
        </h3>
        <div className="flex items-center justify-center gap-3">
          <span className="text-[9px] font-bold text-zinc-200 uppercase tracking-widest">
            {t.totalShots} Frames
          </span>
          <div className="w-1 h-1 bg-zinc-300 rounded-full" />
          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">
            {t.canvasWidth}px x {t.canvasHeight}px
          </span>
        </div>
      </div>
    </Reorder.Item>
  );
}