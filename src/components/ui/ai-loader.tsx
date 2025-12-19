import * as React from "react";

interface LoaderProps {
  size?: number;
  text?: string;
}

export const AILoader: React.FC<LoaderProps> = ({ size = 180, text = "Generating" }) => {
  const letters = text.split("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[hsl(222,60%,28%)] via-[hsl(222,47%,11%)] to-[hsl(0,0%,0%)]">
      <div
        className="relative flex items-center justify-center font-sans select-none"
        style={{ width: size, height: size }}
      >
        {letters.map((letter, index) => (
          <span
            key={index}
            className="inline-block text-primary-foreground opacity-40 animate-loader-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {letter}
          </span>
        ))}

        <div className="absolute inset-0 rounded-full animate-loader-circle"></div>
      </div>
    </div>
  );
};

export default AILoader;
