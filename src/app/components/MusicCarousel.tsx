import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MusicCarouselProps {
  children: React.ReactNode;
}

export function MusicCarousel({ children }: MusicCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newPosition =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => {
        setIsHovering(true);
        checkScroll();
      }}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Left Arrow */}
      {isHovering && showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/80 border border-[#30292b] cursor-pointer transition-all duration-200 hover:bg-black hover:scale-110"
          style={{ color: "#ff164c" }}
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide"
      >
        {children}
      </div>

      {/* Right Arrow */}
      {isHovering && showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/80 border border-[#30292b] cursor-pointer transition-all duration-200 hover:bg-black hover:scale-110"
          style={{ color: "#ff164c" }}
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
