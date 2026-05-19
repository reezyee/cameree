"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

interface LobbyTemplate {
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

interface LobbyViewProps {
  templates: LobbyTemplate[];
  loading: boolean;
  selectedTemplate: LobbyTemplate | null;
  setSelectedTemplate: (t: LobbyTemplate) => void;
  onStart: () => void;
  isMobileView: boolean;
}

export default function LobbyView({
  templates: initialTemplates,
  loading,
  selectedTemplate,
  setSelectedTemplate,
  onStart,
  isMobileView,
}: LobbyViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });
  
  const [liveTemplates, setLiveTemplates] = useState<LobbyTemplate[]>(initialTemplates);

  useEffect(() => {
    setLiveTemplates(initialTemplates);
  }, [initialTemplates]);

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 💡 JALUR SAKTI REAL-TIME: Mendengar bisikan langsung dari tab Admin pas lo lagi nge-drag!
  useEffect(() => {
    const channel = new BroadcastChannel("cameree_realtime_sync");
    
    channel.onmessage = (event) => {
      if (event.data && event.data.type === "REORDER_EVENT") {
        // Detik ini juga urutan di Lobby kegeser instan tanpa nunggu interval atau reload!
        setLiveTemplates(event.data.newOrder);
      }
    };

    return () => channel.close();
  }, []);

  // Polling background tiap 5 detik tetep dinyalakan buat nge-sync HP user publik luar
  useEffect(() => {
    if (loading) return;

    const silentFetch = async () => {
      try {
        const res = await fetch("/api/strips");
        if (res.ok) {
          const freshData: LobbyTemplate[] = await res.json();
          setLiveTemplates(freshData);
        }
      } catch (err) {
        console.error("Silent sync lobby failed:", err);
      }
    };

    const interval = setInterval(silentFetch, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-[#d8d2c9] text-[#153378]">
        <Loader2 className="animate-spin w-12 h-12 opacity-40" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <div
        ref={scrollRef}
        className={`h-full w-full overflow-x-auto overflow-y-hidden no-scrollbar flex items-center snap-x snap-mandatory ${
          isMobileView ? "px-[30vw]" : "px-[40vw]"
        }`}
        style={{ 
          scrollBehavior: "smooth", 
          scrollbarWidth: "none"
        }}
      >
        <div className={`flex items-center ${isMobileView ? "gap-4" : "gap-6"} py-10`}>
          {liveTemplates.map((t) => {
            const DISPLAY_HEIGHT = Math.min(windowSize.h * 0.55, 600);
            const ratio = DISPLAY_HEIGHT / t.canvasHeight;
            const displayWidth = t.canvasWidth * ratio;
            const allElements = t.elements || [];

            return (
              <motion.div
                key={t.id}
                className={`flex flex-col items-center flex-shrink-0 snap-center ${
                  isMobileView ? "gap-4" : "gap-6"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ margin: "-10%" }}
              >
                <button
                  onClick={() => setSelectedTemplate(t)}
                  className={`relative transition-all duration-700 shadow-[0_40px_80px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto ${
                    selectedTemplate?.id === t.id
                      ? `ring-[#153378] ring-offset-[#d8d2c9] z-20 scale-100 ${
                          isMobileView ? "ring-[1px] ring-offset-[2px]" : "ring-[2px] ring-offset-[4px]"
                        }`
                      : "opacity-30 z-10 scale-95 hover:opacity-100"
                  }`}
                  style={{
                    width: `${displayWidth}px`,
                    height: `${DISPLAY_HEIGHT}px`,
                    backgroundColor:
                      t.backgroundMode === "color" ? t.backgroundValue : "#fff",
                    backgroundImage:
                      t.backgroundMode === "image"
                        ? `url(${t.backgroundValue})`
                        : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "2px",
                  }}
                >
                  {allElements.map((el, idx) => {
                    let scaledRadius = "0px";
                    if (el.radius === "50%") scaledRadius = "50%";
                    else if (el.radius) {
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
                        className="absolute pointer-events-none"
                        style={{
                          left: `${el.x * ratio}px`,
                          top: `${el.y * ratio}px`,
                          width: `${el.w * ratio}px`,
                          height: `${el.h * ratio}px`,
                          transform: `rotate(${el.rotate || 0}deg)`,
                          zIndex: idx,
                        }}
                      >
                        <div
                          className="w-full h-full relative overflow-hidden flex items-center justify-center"
                          style={{ borderRadius: scaledRadius }}
                        >
                          {el.type === "photo" ? (
                            <div className="w-full h-full bg-[#bababa] flex items-center justify-center relative">
                              <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat" />
                              <span
                                className="font-black italic text-[#153378] opacity-30 z-10"
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
                              className="w-full h-full object-contain"
                              alt=""
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </button>

                <div className="text-center transition-all duration-500">
                  <p className={`font-black italic text-[#153378] tracking-wider ${
                    isMobileView ? "text-[10px]" : "text-[11px] md:text-md"
                  }`}>
                    {t.name}
                  </p>
                  <p className="text-[8px] font-bold text-[#153378]/50 uppercase tracking-[0.3em]">
                    {t.totalShots} Shots
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className={`fixed z-[9999] ${
        isMobileView ? "bottom-3 right-6" : "bottom-8 right-12"
      }`}>
        <Button
          onClick={onStart}
          disabled={!selectedTemplate}
          className={`cursor-pointer flex items-center justify-center bg-[#153378] hover:bg-[#1a3f96] text-[#d8d2c9] rounded-full shadow-[0_20px_80px_rgba(21,51,120,0.4)] transition-all active:scale-90 disabled:opacity-10 border-none ${
            isMobileView ? "h-10 w-14" : "h-12 w-20"
          }`}
        >
          <ArrowRight className={`transition-transform duration-500 ${
            isMobileView ? "h-10 w-10" : "h-16 w-16"
          }`} />
        </Button>
      </div>

      <div className={`fixed left-1/2 -translate-x-1/2 pointer-events-none ${
        isMobileView ? "top-6" : "top-10"
      }`}>
        <p className={`font-black uppercase tracking-[0.8em] text-[#153378] opacity-20 whitespace-nowrap ${
          isMobileView ? "text-[8px]" : "text-[10px]"
        }`}>
          Select Template
        </p>
      </div>
    </div>
  );
}