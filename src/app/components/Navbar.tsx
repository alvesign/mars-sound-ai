import { useState, useRef } from "react";
import svgPaths from "../../imports/svg-67owiawy17";
import { useLibrary } from "../context/LibraryContext";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d={svgPaths.p130c800} />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d={svgPaths.p1be993f2} />
      <path d={svgPaths.p3cae3680} />
    </svg>
  );
}

interface NavbarProps {
  onMenuToggle?: () => void;
  onAvatarClick?: () => void;
  onSearch?: (query: string) => void;
  onUploadClick?: () => void;
}

export function Navbar({ onMenuToggle, onAvatarClick, onSearch, onUploadClick }: NavbarProps) {
  const { profile } = useLibrary();
  const [searchValue, setSearchValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(value);
    }, 300);
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-8"
      style={{
        height: "var(--navbar-height)",
        backgroundColor: "var(--color-bg-sidebar)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Hamburger (mobile only) */}
      <button
        className="lg:hidden shrink-0 flex flex-col gap-1 p-2 min-w-[44px] min-h-[44px] items-center justify-center"
        onClick={onMenuToggle}
        aria-label="Abrir menu"
      >
        <span
          className="block w-5 h-0.5 rounded"
          style={{ backgroundColor: "var(--color-text-secondary)" }}
        />
        <span
          className="block w-5 h-0.5 rounded"
          style={{ backgroundColor: "var(--color-text-secondary)" }}
        />
        <span
          className="block w-5 h-0.5 rounded"
          style={{ backgroundColor: "var(--color-text-secondary)" }}
        />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-xl relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--color-text-muted)" }}
        >
          <SearchIcon />
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar músicas ou artistas"
          className="w-full rounded-md pl-9 pr-4 py-2 outline-none transition-all duration-150"
          style={{
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border-subtle)",
            color: "var(--color-text-primary)",
            fontSize: "14px",
            height: "44px",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "var(--color-brand)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "var(--color-border-subtle)";
          }}
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* Upload button */}
        <button
          onClick={onUploadClick}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-150 cursor-pointer min-h-[44px]"
          style={{
            borderColor: "var(--color-brand)",
            color: "var(--color-text-primary)",
            backgroundColor: "transparent",
            fontSize: "13px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-active-bg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          <UploadIcon />
          <span>Carregar música AI</span>
        </button>

        {/* Avatar */}
        <button
          className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 cursor-pointer transition-all duration-150"
          style={{ borderColor: "var(--color-border-subtle)" }}
          onClick={onAvatarClick}
          aria-label="Abrir perfil"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-brand)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border-subtle)";
          }}
        >
          <img src={profile.avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
}