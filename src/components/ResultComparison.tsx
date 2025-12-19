import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, RotateCcw } from "lucide-react";

// Lazy load the 3D viewer to avoid SSR issues
const Model3DViewer = React.lazy(() => import("./Model3DViewer"));

interface ResultComparisonProps {
  originalImage: string;
  avatarImage: string;
  modelUrl?: string;
  onReset: () => void;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  avatarImage,
  modelUrl,
  onReset,
}) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = avatarImage;
    link.download = "avatar.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-foreground">Your 3D Avatar is Ready!</h2>
      
      {/* 3D Model Viewer */}
      {modelUrl ? (
        <div className="w-full">
          <Suspense 
            fallback={
              <div className="w-full h-[400px] rounded-2xl bg-muted flex items-center justify-center border-4 border-cyan-400/50">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground">Loading 3D model...</p>
                </div>
              </div>
            }
          >
            <Model3DViewer modelUrl={modelUrl} />
          </Suspense>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <RotateCcw className="w-4 h-4" />
            <span>Drag to rotate • Scroll to zoom</span>
          </div>
        </div>
      ) : (
        // Fallback to 2D avatar if no 3D model
        <div className="relative">
          <img
            src={avatarImage}
            alt="Avatar"
            className="w-80 h-80 object-cover rounded-2xl border-4 border-cyan-400/50 shadow-2xl bg-white"
          />
        </div>
      )}

      <div className="flex gap-4 mt-4">
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </Button>
        
        <Button
          onClick={handleDownload}
          size="lg"
          className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          <Download className="w-5 h-5" />
          Download Avatar
        </Button>
      </div>
    </div>
  );
};

export default ResultComparison;
