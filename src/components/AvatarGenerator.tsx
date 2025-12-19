import React, { useState } from "react";
import { WebcamCapture } from "./WebcamCapture";
import { ScanningOverlay } from "./ScanningOverlay";
import { AILoader } from "./ui/ai-loader";
import { ResultComparison } from "./ResultComparison";
import { toast } from "sonner";

type AppState = "capture" | "scanning" | "generating" | "result";

// Configure your backend URL here
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const AvatarGenerator: React.FC = () => {
  const [state, setState] = useState<AppState>("capture");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [avatarImage, setAvatarImage] = useState<string>("");

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setState("scanning");

    // Show scanning animation for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setState("generating");

    try {
      const response = await fetch(`${BACKEND_URL}/generate-avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageSrc,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate avatar");
      }

      const data = await response.json();
      setAvatarImage(data.avatarUrl);
      setState("result");
      toast.success("Avatar generated successfully!");
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast.error("Failed to generate avatar. Make sure the backend is running.");
      setState("capture");
    }
  };

  const handleReset = () => {
    setCapturedImage("");
    setAvatarImage("");
    setState("capture");
  };

  return (
    <div className="min-h-screen bg-background">
      {state === "capture" && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-center">
            AI Avatar Generator
          </h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Capture your photo and let AI create your avatar
          </p>
          <WebcamCapture onCapture={handleCapture} />
        </div>
      )}

      {state === "scanning" && <ScanningOverlay imageSrc={capturedImage} />}

      {state === "generating" && <AILoader text="Creating Avatar" />}

      {state === "result" && (
        <div className="flex items-center justify-center min-h-screen py-8">
          <ResultComparison
            originalImage={capturedImage}
            avatarImage={avatarImage}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
};

export default AvatarGenerator;
