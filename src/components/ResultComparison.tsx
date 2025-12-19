import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";

interface ResultComparisonProps {
  originalImage: string;
  avatarImage: string;
  onReset: () => void;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  avatarImage,
  onReset,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -15;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 15;
    
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
    <div className="flex flex-col items-center gap-8 p-6">
      <h2 className="text-3xl font-bold text-foreground">Your Avatar is Ready!</h2>
      
      {/* 3D Interactive Avatar */}
      <div 
        className="perspective-1000"
        style={{ perspective: "1000px" }}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleMouseLeave}
          className="relative cursor-pointer transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Glow effect behind the image */}
          <div 
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 blur-xl opacity-50 transition-opacity duration-300"
            style={{
              transform: "translateZ(-20px)",
              opacity: isHovering ? 0.7 : 0.4,
            }}
          />
          
          {/* Main avatar image */}
          <div 
            className="relative"
            style={{ transform: "translateZ(20px)" }}
          >
            <img
              src={avatarImage}
              alt="Avatar"
              className="w-80 h-80 object-cover rounded-2xl border-4 border-cyan-400/50 shadow-2xl"
            />
            
            {/* Shine effect on hover */}
            <div 
              className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none"
              style={{ opacity: isHovering ? 1 : 0 }}
            />
          </div>
          
          {/* Floating label */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
            style={{ transform: "translateX(-50%) translateZ(40px)" }}
          >
            ✨ Your Avatar
          </div>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mt-2">
        Move your mouse over the avatar to see the 3D effect
      </p>

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
