"use client";

import React, { useRef, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { OrbitControls, Float } from "@react-three/drei";
import { Camera, Filter, Download } from "lucide-react";

function VintageCamera() {
  const meshRef = useRef<Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group ref={meshRef} scale={[2, 2, 2]}>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2, 1.5, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.75, 0.6]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

export default function Home() {
  return (
    <div className="bg-[#c7c1b6] min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 lg:py-5 pt-16 grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-7xl font-serif text-[#153378] font-bold leading-3">
            Caméree
          </h1>
          <h2 className="text-4xl font-serif text-[#153378] font-bold">
            Capture Timeless Moments
          </h2>
          <p className="text-xl text-[#153378] opacity-80">
            Embrace the vintage charm of photography with Caméree&apos;s unique
            vintage filters and retro aesthetics.
          </p>
          <div className="flex z-50 space-x-4">
            <Link href="/camera">
              <Button className="px-8 py-4 text-lg rounded-2xl shadow-lg bg-[#153378] text-[#c7c1b6] hover:scale-105 hover:bg-[#153378] transition-all">
                <Camera className="mr-2" /> Start Capturing
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* 3D Camera Visualization */}
        <div className="hidden md:block h-[500px]">
          <Canvas>
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} />
            <Suspense fallback={null}>
              <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                <VintageCamera />
              </Float>
              <OrbitControls enableZoom={false} />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-5 grid md:grid-cols-3 gap-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-[#c7c1b9] border-t border-gray-300/70 backdrop-blur-md p-6 rounded-xl shadow-lg text-center"
        >
          <Filter size={48} className="mx-auto mb-4 text-[#153378]" />
          <h3 className="text-2xl font-serif text-[#153378] mb-2">
            Live Filters
          </h3>
          <p className="text-[#153378] opacity-80">
            Apply stunning vintage effects in real-time, transforming your
            photos with classic charm.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-[#c7c1b9] border-t border-gray-300/70 backdrop-blur-md p-6 rounded-xl shadow-lg text-center"
        >
          <Camera size={48} className="mx-auto mb-4 text-[#153378]" />
          <h3 className="text-2xl font-serif text-[#153378] mb-2">
            Retro Aesthetics
          </h3>
          <p className="text-[#153378] opacity-80">
            Embrace the classic look with unique photo styles that tell a
            nostalgic story.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-[#c7c1b9] border-t border-gray-300/70 backdrop-blur-md p-6 rounded-xl shadow-lg text-center"
        >
          <Download size={48} className="mx-auto mb-4 text-[#153378]" />
          <h3 className="text-2xl font-serif text-[#153378] mb-2">
            Instant Download
          </h3>
          <p className="text-[#153378] opacity-80">
            Save your captures instantly in high quality, ready to be shared or
            printed.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="backdrop-blur-md py-6 text-center">
        <p className="text-[#153378]">
          © {new Date().getFullYear()}{" "}
          <a href="https://reezyee.github.io">Reezyee. </a>
          Capture the essence of memories.
        </p>
      </footer>
    </div>
  );
}
