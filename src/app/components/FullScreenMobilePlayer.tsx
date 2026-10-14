import { useMusicPlayer } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { FavoriteButton } from "./ui/FavoriteButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { FALLBACK_COVER } from "../types/library";
import svgPaths from "../../imports/svg-1rskmayuh7";

function ChevronDownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p5cd5200} />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p9da1b80} />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="8,5 19,12 8,19" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="4" height="18" rx="1" />
      <rect x="15" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p251da300} />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.pf5e8780} />
    </svg>
  );
}

export function FullScreenMobilePlayer() {
  const {
    currentTrack,
    isPlaying,
    playbackStatus,
    playbackError,
    togglePlay,
    progress,
    setProgress,
    isFullscreenOpen,
    closeFullscreen,
    audioRef,
    playNext,
    playPrevious,
    shuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
  } = useMusicPlayer();
  const { isFavorite: isTrackFavorite, toggleFavorite } = useLibrary();
  const isFavorite = currentTrack ? isTrackFavorite(currentTrack.id) : false;

  if (!isFullscreenOpen || !currentTrack) return null;

  const displayImage = currentTrack?.image || FALLBACK_COVER;
  const displayTitle = currentTrack?.title || "";
  const displayArtist = currentTrack?.artist || "";

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getCurrentTime = () => {
    if (audioRef.current && audioRef.current.currentTime) {
      return formatTime(audioRef.current.currentTime);
    }
    return "0:00";
  };

  const getTotalTime = () => {
    if (audioRef.current && audioRef.current.duration) {
      return formatTime(audioRef.current.duration);
    }
    return "0:00";
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
  };

  return (
    <div
      className="fixed inset-0 z-[100] lg:hidden flex flex-col"
      style={{
        background: "linear-gradient(to bottom, #2d1f21 0%, #150f10 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={closeFullscreen}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          <ChevronDownIcon />
        </button>
        <div className="flex-1 text-center">
          <p className="text-white text-xs font-medium">A TOCAR DO SEU TELEFONE</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[340px] aspect-square rounded-lg overflow-hidden shadow-2xl">
          <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Track Info */}
      <div className="px-6 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-white text-2xl font-bold truncate mb-1">
              {displayTitle}
            </h1>
            <p className="text-[#a19a9b] text-base truncate">
              {displayArtist}
            </p>
            {playbackError && (
              <p className="text-sm truncate" style={{ color: "#ff164c" }}>
                {playbackError}
              </p>
            )}
          </div>
          <div className="shrink-0 pt-1">
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={() => toggleFavorite(currentTrack.id)}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-1 bg-[#5b4f51] rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ff164c 0%, #ff164c ${progress}%, #5b4f51 ${progress}%, #5b4f51 100%)`,
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-[#a19a9b]">
          <span>{getCurrentTime()}</span>
          <span>{getTotalTime()}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-8">
          {/* Shuffle */}
          <button
            type="button"
            onClick={toggleShuffle}
            aria-pressed={shuffle}
            aria-label={shuffle ? "Desativar aleatório" : "Ativar aleatório"}
            className="w-8 h-8 flex items-center justify-center"
            style={{ color: shuffle ? "#ff164c" : "#a19a9b" }}
          >
            <ShuffleIcon />
          </button>

          {/* Previous */}
          <button
            onClick={playPrevious}
            className="w-12 h-12 flex items-center justify-center text-white"
          >
            <PrevIcon />
          </button>

          {/* Play/Pause */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playbackStatus === "loading" ? "Carregando" : isPlaying ? "Pausar" : "Tocar"}
                className="w-16 h-16 rounded-full flex items-center justify-center bg-white"
                style={{ color: "#150f10" }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{playbackStatus === "loading" ? "Carregando" : isPlaying ? "Pausar" : "Tocar"}</TooltipContent>
          </Tooltip>

          {/* Next */}
          <button
            onClick={playNext}
            className="w-12 h-12 flex items-center justify-center text-white"
          >
            <NextIcon />
          </button>

          {/* Repeat */}
          <button
            type="button"
            onClick={cycleRepeat}
            aria-pressed={repeatMode !== "off"}
            aria-label={repeatMode === "one" ? "Repetir faixa" : repeatMode === "all" ? "Repetir fila" : "Ativar repetição"}
            className="w-8 h-8 flex items-center justify-center"
            style={{ color: repeatMode === "off" ? "#a19a9b" : "#ff164c" }}
          >
            <RepeatIcon />
          </button>
        </div>
      </div>
    </div>
  );
}