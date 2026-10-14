interface CategoryChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryChip({
  label,
  active = false,
  onClick,
  className = "",
}: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 whitespace-nowrap
        ${
          active
            ? "bg-[#ff164c] text-white"
            : "bg-transparent text-[#a19a9b] border border-[#30292b] hover:border-[#ff164c] hover:text-white"
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}