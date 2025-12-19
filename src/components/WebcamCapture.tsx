import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative rounded-2xl overflow-hidden border-4 border-primary/20 shadow-2xl">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-xl"
          mirrored
        />
        
        {/* Face guide overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-64 border-2 border-dashed border-cyan-400/50 rounded-[50%] animate-pulse" />
        </div>
      </div>

      <Button
        onClick={capture}
        size="lg"
        className="gap-2 px-8 py-6 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
      >
        <Camera className="w-6 h-6" />
        Capture Photo
      </Button>

      <p className="text-muted-foreground text-sm text-center max-w-sm">
        Position your face within the oval guide and click capture for best results
      </p>
    </div>
  );
};

export default WebcamCapture;
