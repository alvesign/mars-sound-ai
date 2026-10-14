import { useMusicPlayer } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { FALLBACK_COVER } from "../types/library";
import { FavoriteButton } from "./ui/FavoriteButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="8,4 20,12 8,20" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="4" height="18" rx="1.5" />
      <rect x="15" y="3" width="4" height="18" rx="1.5" />
    </svg>
  );
}

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    playbackStatus,
    playbackError,
    togglePlay,
    progress,
    openFullscreen,
  } = useMusicPlayer();
  const { isFavorite: isTrackFavorite, toggleFavorite } = useLibrary();
  const isFavorite = currentTrack ? isTrackFavorite(currentTrack.id) : false;

  if (!currentTrack) return null;

  const displayImage = currentTrack.image || FALLBACK_COVER;
  const displayTitle = currentTrack?.title || "";
  const displayArtist = currentTrack?.artist || "";

  return (
    /* Sits right above the 60px BottomNav */
    <div
      className="fixed bottom-[60px] left-0 right-0 z-[90] lg:hidden"
      style={{
        backgroundColor: "#1e1a2e",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Progress bar — very top edge of the player */}
      <div className="w-full h-[2px]" style={{ backgroundColor: "#3a3550" }}>
        <div
          className="h-full transition-all duration-300 ease-linear"
          style={{
            backgroundColor: "#ff164c",
            width: `${progress}%`,
          }}
        />
      </div>

      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Album art — clicking opens fullscreen */}
        <button
          className="w-11 h-11 shrink-0 rounded overflow-hidden focus:outline-none active:scale-95 transition-transform"
          onClick={openFullscreen}
          aria-label="Abrir player"
        >
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Track info — clicking also opens fullscreen */}
        <button
          className="flex-1 min-w-0 text-left focus:outline-none active:opacity-70 transition-opacity"
          onClick={openFullscreen}
          aria-label="Abrir player"
        >
          <p
            className="truncate"
            style={{
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {displayTitle}
          </p>
          <p
            className="truncate"
            style={{
              color: "#b3afc0",
              fontSize: "11px",
              lineHeight: 1.3,
            }}
          >
            {displayArtist}
          </p>
          {playbackError && (
            <p className="truncate" style={{ color: "#ff164c", fontSize: "11px" }}>
              {playbackError}
            </p>
          )}
        </button>

        {/* Favorite button */}
        <div className="shrink-0">
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => currentTrack && toggleFavorite(currentTrack.id)}
            size="sm"
          />
        </div>

        {/* Play / Pause — just toggles, never opens fullscreen */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-9 h-9 flex items-center justify-center shrink-0 focus:outline-none active:scale-90 transition-transform"
              style={{ color: "#ffffff" }}
              aria-label={playbackStatus === "loading" ? "Carregando" : isPlaying ? "Pausar" : "Tocar"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </TooltipTrigger>
          <TooltipContent>{playbackStatus === "loading" ? "Carregando" : isPlaying ? "Pausar" : "Tocar"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}