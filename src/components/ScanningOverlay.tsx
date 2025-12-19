import React from "react";

interface ScanningOverlayProps {
  imageSrc: string;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ imageSrc }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative">
        <img
          src={imageSrc}
          alt="Scanning"
          className="w-80 h-80 object-cover rounded-2xl border-4 border-primary/20"
        />
        
        {/* Scanning line animation */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line shadow-[0_0_20px_5px_rgba(34,211,238,0.5)]" />
        </div>
        
        {/* Corner brackets */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
        
        <p className="mt-6 text-center text-lg font-medium text-foreground animate-pulse">
          Scanning facial features...
        </p>
      </div>
    </div>
  );
};

export default ScanningOverlay;
