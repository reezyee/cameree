import { useRef, useCallback } from "react";

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(
    async (facingMode: "user" | "environment") => {
      stopCamera();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          const playPromise = videoRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
              })
              .catch((error) => {
                console.log("Autoplay prevented or interrupted:", error);
              });
          }
        }
        return stream;
      } catch (err) {
        console.error("Camera error:", err);
        return null;
      }
    },
    [stopCamera],
  );
  return { videoRef, startCamera, stopCamera };
};
