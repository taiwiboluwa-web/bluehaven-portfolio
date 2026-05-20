import bluehavenLogo from "figma:asset/318705c2795eaab3aa2bbcbe474e91ea2d50306e.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CreativeStudioLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CreativeStudioLogo({ size = "md", className = "" }: CreativeStudioLogoProps) {
  const sizeClasses = {
    sm: "h-8 md:h-12",
    md: "h-10 md:h-14",
    lg: "h-12 md:h-16"
  };

  return (
    <ImageWithFallback 
      src={bluehavenLogo} 
      alt="Bluehaven Studios" 
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
    />
  );
}