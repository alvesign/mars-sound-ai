import { useState } from "react";
import { Track } from "../../context/MusicContext";
import { useLibrary } from "../../context/LibraryContext";
import { FavoriteButton } from "./FavoriteButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// ── Equalizer animation bars ──
function EqualizerBars() {
  return (
    <div className="flex items-end gap-[2px]" style={{ width: "14px", height: "14px" }}>
      <div
        className="bg-[#ff164c]"
        style={{ width: "4px", height: "14px", animation: "barBounce 0.8s ease-in-out infinite alternate" }}
      />
      <div
        className="bg-[#ff164c]"
        style={{ width: "4px", height: "8px", animation: "barBounce 0.6s ease-in-out infinite alternate 0.2s" }}
      />
      <div
        className="bg-[#ff164c]"
        style={{ width: "4px", height: "11px", animation: "barBounce 0.9s ease-in-out infinite alternate 0.1s" }}
      />
    </div>
  );
}

// ── Track Row ──
interface TrackRowProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  onClick: () => void;
  showAlbum?: boolean;
  showDuration?: boolean;
  showFavorites?: boolean;
  playlists?: { id: string; title: string }[];
  onAddToPlaylist?: (playlistId: string) => void;
  onRemove?: () => void;
}

export function TrackRow({ 
  track, 
  index, 
  isPlaying, 
  onClick,
  showAlbum = true,
  showDuration = true,
  showFavorites = true,
  playlists = [],
  onAddToPlaylist,
  onRemove,
}: TrackRowProps) {
  const { isFavorite: isTrackFavorite, toggleFavorite } = useLibrary();
  const isFavorite = isTrackFavorite(track.id);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer transition-colors duration-150"
      style={{
        backgroundColor: isPlaying ? "rgba(255,22,76,0.08)" : isHovered ? "rgba(255,255,255,0.04)" : "transparent",
        borderBottom: "1px solid #30292b",
        border: isPlaying ? "1px solid #ff164c" : undefined,
      }}
    >
      {/* # / playing indicator */}
      <td className="px-4 py-4" style={{ width: "56px" }}>
        <div className="flex items-center justify-center" style={{ width: "24px" }}>
          {isPlaying ? (
            <EqualizerBars />
          ) : isHovered ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M1 1L11 7L1 13V1Z" fill="#ff164c" />
            </svg>
          ) : (
            <span
              className="font-semibold text-[14px] leading-[1.5]"
              style={{ color: "#a19a9b" }}
            >
              {index + 1}
            </span>
          )}
        </div>
      </td>

      {/* Título */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0" style={{ width: "48px", height: "48px" }}>
            <img
              src={track.image}
              alt={track.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ border: `1px solid ${isPlaying ? "#ff164c" : "#30292b"}` }}
            />
          </div>
          <div className="min-w-0">
            <p
              className="font-semibold text-[14px] leading-[1.5] truncate"
              style={{ color: isPlaying ? "#ff164c" : "#f8f8f8" }}
            >
              {track.title}
            </p>
            <p className="text-[12px] leading-[1.25] truncate" style={{ color: "#bababa" }}>
              {track.artist}
            </p>
          </div>
        </div>
      </td>

      {/* Álbum */}
      {showAlbum && (
        <td className="px-4 py-4 hidden sm:table-cell">
          <p className="font-semibold text-[14px] leading-[1.5] truncate" style={{ color: "#bababa" }}>
            {track.album || "—"}
          </p>
        </td>
      )}

      {/* Tempo */}
      {showDuration && (
        <td className="px-4 py-4 text-center hidden sm:table-cell">
          <p className="font-semibold text-[14px] leading-[1.5]" style={{ color: "#bababa" }}>
            {track.duration || "—"}
          </p>
        </td>
      )}

      {/* Salvar */}
      {showFavorites && (
        <td className="px-4 py-4">
          <div className="flex items-center justify-center">
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={() => toggleFavorite(track.id)}
              size="sm"
            />
          </div>
        </td>
      )}
      {(onAddToPlaylist || onRemove) && (
        <td className="px-2 py-4">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Adicionar à playlist"
                    onClick={(event) => event.stopPropagation()}
                    className="w-8 h-8"
                    style={{ color: "#a19a9b" }}
                  >
                    ⋮
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Adicionar à playlist</TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              align="end"
              onClick={(event) => event.stopPropagation()}
              style={{ background: "#24191b", border: "1px solid #30292b", color: "#f8f8f8" }}
            >
              {playlists.map((playlist) => (
                <DropdownMenuItem
                  key={playlist.id}
                  onSelect={() => onAddToPlaylist?.(playlist.id)}
                >
                  Adicionar a {playlist.title}
                </DropdownMenuItem>
              ))}
              {onRemove && (
                <DropdownMenuItem onSelect={onRemove}>
                  Remover da playlist
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      )}
    </tr>
  );
}

// ── Table Header ──
interface TrackTableHeaderProps {
  showAlbum?: boolean;
  showDuration?: boolean;
  showFavorites?: boolean;
}

export function TrackTableHeader({ showAlbum = true, showDuration = true, showFavorites = true }: TrackTableHeaderProps) {
  return (
    <thead>
      <tr style={{ borderBottom: "1px solid #30292b" }}>
        <th className="px-4 py-3 text-center" style={{ width: "56px" }}>
          <span
            className="font-semibold text-[12px] uppercase tracking-wide"
            style={{ color: "#a19a9b" }}
          >
            #
          </span>
        </th>
        <th className="px-4 py-3 text-left">
          <span
            className="font-semibold text-[12px] uppercase tracking-wide"
            style={{ color: "#a19a9b" }}
          >
            Título
          </span>
        </th>
        {showAlbum && (
          <th className="px-4 py-3 text-left hidden sm:table-cell">
            <span
              className="font-semibold text-[12px] uppercase tracking-wide"
              style={{ color: "#a19a9b" }}
            >
              Álbum
            </span>
          </th>
        )}
        {showDuration && (
          <th className="px-4 py-3 text-center hidden sm:table-cell">
            <span
              className="font-semibold text-[12px] uppercase tracking-wide"
              style={{ color: "#a19a9b" }}
            >
              Tempo
            </span>
          </th>
        )}
        {showFavorites && (
          <th className="px-4 py-3 text-center">
            <span
              className="font-semibold text-[12px] uppercase tracking-wide"
              style={{ color: "#a19a9b" }}
            >
              Salvar
            </span>
          </th>
        )}
      </tr>
    </thead>
  );
}