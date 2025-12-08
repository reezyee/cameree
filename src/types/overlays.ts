
// src/types/overlays.ts

export type Overlay = {
  type: "image" | "text";
  src?: string;
  text?: string;
  x: number;
  y: number;
  width: number;       
  opacity: number;
  font?: string;
  color?: string;
  rotate?: number;
};

export type OverlayPack = {
  id: string;
  name: string;
  thumbnail: string;
  overlays: Overlay[];
};

export const OVERLAY_PACKS: OverlayPack[] = [
  {
    id: "billie",
    name: "Billie Eilish",
    thumbnail: "/thumbnails/be.png",
    overlays: [
      { type: "image", src: "/overlays/be.png", x: 0.10, y: 0.43, width: 0.17, opacity: 1, rotate: -15 },
      { type: "image", src: "/overlays/blohsh.png", x: 0.08, y: 0.9, width: 0.15, opacity: 1 },
      { type: "text", text: "bad guy", x: 0.9, y: 0.05, width: 0.3, font: "bold 14px 'Arial'", color: "#ffffff", opacity: 0.9, rotate: -10 },
      { type: "image", src: "/overlays/sbe.png", x: 0.9, y: 0.55, width: 0.2, opacity: 1, rotate: 20 },
    ],
  },
  {
    id: "strangerthings",
    name: "Stranger Things",
    thumbnail: "/thumbnails/st.png",
    overlays: [
      { type: "image", src: "/overlays/est.png", x: 0.10, y: 0.43, width: 0.17, opacity: 1, rotate: -15 },
      { type: "image", src: "/overlays/maxst.png", x: 0.08, y: 0.9, width: 0.15, opacity: 1 },
      { type: "image", src: "/overlays/tudst.png", x: 0.9, y: 0.05, width: 0.2, opacity: 1, rotate: -10 },
      { type: "image", src: "/overlays/dst.png", x: 0.9, y: 0.55, width: 0.2, opacity: 1, rotate: 20 },
    ],
  },
  {
    id: "harrypotter",
    name: "Harry Potter",
    thumbnail: "/thumbnails/hp.png",
    overlays: [
      { type: "image", src: "/overlays/thp.png", x: 0.10, y: 0.43, width: 0.17, opacity: 1, rotate: -15 },
      { type: "image", src: "/overlays/shp.png", x: 0.18, y: 0.95, width: 0.2, opacity: 1 },
      { type: "text", text: "Avada Kadabra", x: 0.5, y: 0.9, width: 0.6, font: "bold 18px 'Arial'", color: "#ADFF2F", opacity: 0.9 },
      { type: "image", src: "/overlays/hhp.png", x: 0.9, y: 0.5, width: 0.2, opacity: 1, rotate: 20 },
      { type: "image", src: "/overlays/dhp.png", x: 0.9, y: 0.05, width: 0.2, opacity: 1, rotate: -20 },
    ],
  },
];