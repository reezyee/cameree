"use client";

import React, { useState } from "react";
import { Download, Image as ImageIcon, Film, Loader2 } from "lucide-react";

export default function DownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const [loading, setLoading] = useState<string | null>(null);

  const cloudName = "dyh1najmn";
  const fullPath = `cameree/sessions/${id}`;

  const stripUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${fullPath}_strip.jpg`;
  const gifUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${fullPath}_gif.gif`;

  const downloadFile = async (url: string, filename: string) => {
    setLoading(filename);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      window.open(url, "_blank");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#d8d2c9] flex flex-col font-serif items-center justify-center p-6 relative font-sans select-none">
      <div className="max-w-[380px] w-full bg-white rounded-[3rem] p-5 shadow-2xl border-4 border-[#153378] text-center relative z-10">
        
        {/* PREVIEW GIF AREA */}
        <div className="mb-4 rounded-3xl overflow-hidden border-4 border-[#153378]/10 shadow-inner bg-zinc-50 relative aspect-square group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gifUrl}
            alt="Recap Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-end justify-center p-4">
            <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] bg-[#153378] px-3 py-1 rounded-full">
              Press & Hold to save GIF
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Button Strip */}
          <button
            onClick={() => downloadFile(stripUrl, `cameree strip ${id}.jpg`)}
            disabled={loading !== null}
            className="w-full flex items-center justify-between bg-[#153378] p-4 rounded-3xl text-[#d8d2c9] active:scale-95 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-4 text-left">
              <ImageIcon size={24} />
              <div>
                <p className="font-black text-sm leading-none">Photo Strip</p>
                <p className="text-[9px] opacity-70 mt-1 tracking-wider">
                  High Quality JPEG
                </p>
              </div>
            </div>
            {loading === `cameree strip ${id}.jpg` ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Download size={20} />
            )}
          </button>

          {/* Button GIF */}
          <button
            onClick={() => downloadFile(gifUrl, `cameree recap ${id}.gif`)}
            disabled={loading !== null}
            className="w-full flex items-center justify-between border-4 border-[#153378] p-3 rounded-3xl text-[#153378] active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-4 text-left">
              <Film size={24} />
              <div>
                <p className="font-black text-sm leading-none">GIF Recap</p>
                <p className="text-[9px] opacity-60 mt-1 tracking-wider">
                  Animated Memories
                </p>
              </div>
            </div>
            {loading === `cameree recap ${id}.gif` ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Download size={20} />
            )}
          </button>
        </div>

        <div className="mt-10 space-y-2">
          <p className="text-[9px] font-black text-[#153378]/80 uppercase tracking-[0.2em]">
            Files will be deleted in 7 days
          </p>
          <div className="w-12 h-1 bg-[#153378]/40 mx-auto rounded-full" />
        </div>
      </div>

      <footer className="mt-8 text-[#153378]/40 text-[8px] text-center font-bold tracking-[0.4em] relative z-10">
        Caméree • Crafted with Soul by{" "}
        <a
          href="https://reezyee.github.io"
          target="_blank"
          className="underline"
          rel="noopener noreferrer"
        >
          Reezyee
        </a>
      </footer>
    </div>
  );
}