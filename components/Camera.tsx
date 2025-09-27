
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

export interface CameraHandles {
  capture: () => string | null;
}

interface CameraProps {
    onStreamReady?: () => void;
}

const Camera = forwardRef<CameraHandles, CameraProps>(({ onStreamReady }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
          if(onStreamReady) onStreamReady();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access was denied. Please enable camera permissions in your browser settings.");
      }
    };

    enableCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onStreamReady]);

  useImperativeHandle(ref, () => ({
    capture: () => {
      if (videoRef.current && canvasRef.current && isCameraReady) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.9);
        }
      }
      return null;
    },
  }));

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
      <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} />
      {!isCameraReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>Starting camera...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-red-900/50 text-white">
          <p>{error}</p>
        </div>
      )}
       <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

Camera.displayName = 'Camera';

export default Camera;
