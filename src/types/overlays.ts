// app/types/overlays.ts

export type Overlay = {
  type: "image" | "text";
  src?: string; // Untuk image
  text?: string; // Untuk text
  x: number; // Posisi X (0-1, 0 = kiri, 1 = kanan)
  y: number; // Posisi Y (0-1, 0 = atas, 1 = bawah)
  width: number; // Ukuran lebar relatif (0-1 dari canvas width)
  opacity: number;
  font?: string; // Untuk text
  color?: string; // Untuk text
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
      // Stiker wajah Billie kecil di pojok kiri atas (pinggir kiri-atas, ukuran kecil)
      { type: "image", src: "/overlays/be.png", x: 0.10, y: 0.43, width: 0.17, opacity: 1, rotate: -15 },
      
      // Logo kecil "blohsh" di pojok kanan atas (pinggir kanan-atas)
      { type: "image", src: "/overlays/blohsh.png", x: 0.08, y: 0.9, width: 0.15, opacity: 1 },
      
      // Tulisan kecil di pojok kanan bawah (pinggir kanan-bawah, text kecil)
      { type: "text", text: "bad guy", x: 0.9, y: 0.05, font: "bold 14px 'Arial'", color: "#ffffff", opacity: 0.9, rotate: -10 },
      
      // Bintang kecil di pojok kiri bawah (pinggir kiri-bawah)
      { type: "image", src: "/overlays/sbe.png", x: 0.9, y: 0.55, width: 0.2, opacity: 1, rotate: 20 },
    ],
  },

  {
    id: "strangerthings",
    name: "Stranger Things",
    thumbnail: "/thumbnails/st.png",
     overlays: [
      // Stiker wajah Billie kecil di pojok kiri atas (pinggir kiri-atas, ukuran kecil)
      { type: "image", src: "/overlays/est.png", x: 0.10, y: 0.43, width: 0.17, opacity: 1, rotate: -15 },
      
      // Logo kecil "blohsh" di pojok kanan atas (pinggir kanan-atas)
      { type: "image", src: "/overlays/maxst.png", x: 0.08, y: 0.9, width: 0.15, opacity: 1 },
      
      // Tulisan kecil di pojok kanan bawah (pinggir kanan-bawah, text kecil)
      { type: "image", src: "/overlays/tudst.png", x: 0.9, y: 0.05, width: 0.2, opacity: 1, rotate: -10 },
      
      // Bintang kecil di pojok kiri bawah (pinggir kiri-bawah)
      { type: "image", src: "/overlays/dst.png", x: 0.9, y: 0.55, width: 0.2, opacity: 1, rotate: 20 },
    ],
  },

  {
    id: "harrypotter",
    name: "Harry Potter",
    thumbnail: "/thumbnails/hp.png",
    overlays: [
      // Stiker wajah Billie kecil di pojok kiri atas (pinggir kiri-atas, ukuran kecil)
      { type: "image", src: "/overlays/thp.png", x: 0.10, y: 0.43, width: 0.17, opacity: 1, rotate: -15 },
      
      // Logo kecil "blohsh" di pojok kanan atas (pinggir kanan-atas)
      { type: "image", src: "/overlays/shp.png", x: 0.18, y: 0.95, width: 0.2, opacity: 1 },
      
      // Tulisan kecil di pojok kanan bawah (pinggir kanan-bawah, text kecil)
      { type: "text", text: "Avada Kadabra", x: 0.5, y: 0.9, font: "bold 14px 'Arial'", color: "#ADFF2F", opacity: 0.9 },
      
      // Bintang kecil di pojok kiri bawah (pinggir kiri-bawah)
      { type: "image", src: "/overlays/hhp.png", x: 0.9, y: 0.5, width: 0.2, opacity: 1, rotate: 20 },
      
      // Bintang kecil di pojok kiri bawah (pinggir kiri-bawah)
      { type: "image", src: "/overlays/dhp.png", x: 0.9, y: 0.05, width: 0.2, opacity: 1, rotate: -20 },
    ],
  },
];