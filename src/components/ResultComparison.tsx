import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, RotateCcw } from "lucide-react";

interface ResultComparisonProps {
  originalImage: string;
  avatarImage: string;
  onReset: () => void;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  avatarImage,
  onReset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 25;
    const rotateX = ((centerY - y) / centerY) * 25;
    
    setTransform({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTransform({ rotateX: 0, rotateY: 0 });
  };

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
      <h2 className="text-3xl font-bold text-foreground">Your Avatar is Ready!</h2>
      
      {/* Interactive 3D-style Avatar */}
      <div 
        ref={containerRef}
        className="relative perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative transition-transform duration-150 ease-out"
          style={{
            transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <img
            src={avatarImage}
            alt="Avatar"
            className="w-80 h-80 object-cover rounded-2xl border-4 border-cyan-400/50 shadow-2xl bg-white"
          />
          
          {/* Shine effect */}
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
            style={{
              background: isHovering 
                ? `linear-gradient(${135 + transform.rotateY}deg, rgba(255,255,255,0.4) 0%, transparent 50%)`
                : "none",
              opacity: isHovering ? 1 : 0,
            }}
          />
          
          {/* Glow effect */}
          <div 
            className="absolute -inset-2 rounded-3xl -z-10 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              filter: isHovering ? "blur(20px)" : "blur(15px)",
              opacity: isHovering ? 0.6 : 0.3,
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <RotateCcw className="w-4 h-4" />
        <span>Move mouse over avatar to interact</span>
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
