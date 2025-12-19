import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";

interface ResultComparisonProps {
  originalImage: string;
  avatarImage: string;
  onReset: () => void;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  originalImage,
  avatarImage,
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
    <div className="flex flex-col items-center gap-8 p-6">
      <h2 className="text-3xl font-bold text-foreground">Your Avatar is Ready!</h2>
      
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
        {/* Original Image */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={originalImage}
              alt="Original"
              className="w-72 h-72 object-cover rounded-2xl border-4 border-muted shadow-xl"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-muted px-4 py-1 rounded-full text-sm font-medium text-muted-foreground">
              Original
            </div>
          </div>
        </div>

        {/* Arrow / VS indicator */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
            VS
          </div>
        </div>

        {/* Avatar Image */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={avatarImage}
              alt="Avatar"
              className="w-72 h-72 object-cover rounded-2xl border-4 border-cyan-400/50 shadow-xl shadow-cyan-500/20"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1 rounded-full text-sm font-medium text-primary-foreground">
              Avatar
            </div>
          </div>
        </div>
      </div>

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
          className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          <Download className="w-5 h-5" />
          Download Avatar
        </Button>
      </div>
    </div>
  );
};

export default ResultComparison;
