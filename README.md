# Caméree v5.0.1 🚀

A modern photo booth with a vintage soul — combining real-time filters, retro aesthetics, and instant memories.

Caméree transforms your device into an elegant, intuitive photo booth experience with live effects, collage modes, and instant saving. Built for creators, events, and anyone who loves capturing beautiful moments effortlessly.

---

## 🌋 What's New in v5.0.1

Version 5.0.1 is a complete ground-up re-engineering of Caméree. We moved away from temporary client-side states into a fully database-driven, multi-stage Photobooth Platform.

### 🗄️ 1. Full Database Integration (Prisma ORM)
* **Dynamic Strip Management**: No more messy, hardcoded layout configs. All templates, canvas grids, and elements are now stored securely in the database.
* **Admin Dashboard & Studio Editor**: Built an internal studio suite allowing the admin to create, position, duplicate, rotate, and manage template strips on the fly without changing a single line of code.
* **Persistent Custom Sorting**: Drag-and-drop template layers in the admin library to lock their display order globally across the application.

### 🔄 2. Complete UX Flow Redesign (Multi-Stage Pipeline)
* **Modular Page Architecture**: Shattered the old, bloated "all-in-one" single-page setup. The workflow is now split into beautifully isolated, animated view stages:
  * 🌟 **LobbyView**: High-end template catalog browser with dynamic loading and responsive layouts.
  * 📸 **ShootingView**: Immersive camera view with interactive smart tools (mirror toggle, live color ringlight, and step-by-step frame tracking).
  * 🧪 **LabView**: Post-processing analog darkroom for instant filter grading, softfile rendering, and automated uploading.

### 🎞️ 3. Advanced Multimedia Features & AI Pipeline
* **Animated GIF Recap**: Automatically compiles individual high-resolution session snapshots into smooth, looping animated GIFs for a dynamic photo booth recap.
* **AI Background Isolation**: Integrates client-side background removal powered by `@imgly/background-removal`, utilizing multi-thread workers and leveraging the user's browser GPU via custom headers isolation.
* **Instant Cloud Delivery**: Generates unique session IDs (`cam-timestamp`) to instantly upload strips and GIFs into encrypted Cloudinary storage, rendering on-the-fly download nodes with dynamic QR code generation.

### 🛡️ 4. Enterprise-Grade Stability & Optimization
* **100% Strict Type-Safety**: Rebuilt all view components, frame steps, and canvas parameters under non-implicit strict TypeScript typings to eradicate production runtime crashes.
* **Zero-Log Production Bundler**: Automated production configuration using NextJS compiler hooks to completely wipe developer logging on deployment while keeping debugging live locally.
---

## 📸 Features

### 🔮 Live Vintage Filters
Real-time deep analog grayscale, sepia film, retro, and vivid pastel effects that bring a nostalgic look to your photos.

### 🧩 Photo Booth Mode & GIF Recap
Switch between **4x1** or **3x1** strip layouts and instantly compile your dynamic session frames into looping animated GIFs.

### ⚡ Seamless Overlays
Apply custom branded overlays or fine-tune individual border radius corners with precise custom range editors.

### 💾 Instant Export
Download your photo strips instantly as high-quality JPEGs or share them through cloud-hosted live download nodes.

---

## 🛠 Tech Stack

* **Next.js (App Router)**
* **React 18**
* **Prisma ORM**
* **Tailwind CSS & Radix UI**
* **Framer Motion**
* **Three.js (WebGL Features)**

---

## ❤️ Credits

Caméree v5.0.1 is proudly crafted with soul by [Reezyee](https://reezyee.github.io).

---

Ready to shine?
Open **[https://cameree.vercel.app](https://cameree.vercel.app)** to test the live preview!