import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function HeartIcon({ filled, size }: { filled?: boolean; size: number }) {
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  size = "md",
  className = "",
}: FavoriteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeMap = {
    sm: { cls: "w-8 h-8", iconSize: 16 },
    md: { cls: "w-9 h-9", iconSize: 18 },
    lg: { cls: "w-10 h-10", iconSize: 22 },
  };

  const { cls, iconSize } = sizeMap[size];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onToggle();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleToggle}
          className={`shrink-0 cursor-pointer flex items-center justify-center ${cls} ${className}`}
          style={{
            color: "#ff164c",
            transform: isAnimating ? "scale(1.3)" : "scale(1)",
            transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.15s",
          }}
          aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar"}
          aria-pressed={isFavorite}
        >
          <HeartIcon filled={isFavorite} size={iconSize} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{isFavorite ? "Remover dos favoritos" : "Favoritar"}</TooltipContent>
    </Tooltip>
  );
}