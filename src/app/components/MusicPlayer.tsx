import { useMusicPlayer } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { FALLBACK_COVER } from "../types/library";
import svgPaths from "../../imports/svg-1rskmayuh7";
import { FavoriteButton } from "./ui/FavoriteButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function ShuffleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p5cd5200} />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p9da1b80} />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="8,5 19,12 8,19" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="4" height="18" rx="1" />
      <rect x="15" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.p251da300} />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 33 33" fill="currentColor">
      <path d={svgPaths.pf5e8780} />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d={svgPaths.p2abb5600} />
    </svg>
  );
}

function VolumeMutedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export function MusicPlayer() {
  const { currentTrack, isPlaying, playbackStatus, playbackError, togglePlay, progress, setProgress, volume, setVolume, isMuted, toggleMute, audioRef, playNext, playPrevious, shuffle, repeatMode, toggleShuffle, cycleRepeat } = useMusicPlayer();
  const { isFavorite: isTrackFavorite, toggleFavorite } = useLibrary();
  const isFavorite = currentTrack ? isTrackFavorite(currentTrack.id) : false;

  const formatTime = (pct: number, duration: number = 392) => {
    const currentSec = Math.round((pct / 100) * duration);
    const m = Math.floor(currentSec / 60);
    const s = currentSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTotalTime = () => {
    if (audioRef.current && audioRef.current.duration) {
      const duration = audioRef.current.duration;
      const m = Math.floor(duration / 60);
      const s = Math.floor(duration % 60);
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return "00:00";
  };

  const displayImage = currentTrack?.image || FALLBACK_COVER;
  const displayTitle = currentTrack?.title || "Nenhuma música";
  const displayArtist = currentTrack?.artist || "";
  const duration = audioRef.current?.duration || 392;
  const displayVolume = isMuted ? 0 : volume;

  return (
    <footer
      className="hidden lg:flex fixed bottom-0 left-0 right-0 z-[100] items-center gap-6 px-[37px] py-3 border-t border-[#30292b]"
      style={{
        backgroundColor: "#1c1315",
        width: "100%",
      }}
    >
      {/* Track info - Left side */}
      <div className="flex items-center gap-0 shrink-0">
        <div
          className="w-16 h-16 shrink-0 border border-[#30292b]"
        >
          <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col px-[18px] py-3 min-w-[142px]">
          <p
            className="font-semibold text-[16px] leading-[1.5] truncate text-[#bababa]"
          >
            {displayTitle}
          </p>
          <p
            className="text-[12px] leading-[1.25] text-[#bababa]"
          >
            {displayArtist}
          </p>
          {playbackError && (
            <p className="text-[12px] leading-[1.25]" style={{ color: "#ff164c" }}>
              {playbackError}
            </p>
          )}
        </div>
        <FavoriteButton
          isFavorite={isFavorite}
          onToggle={() => currentTrack && toggleFavorite(currentTrack.id)}
        />
      </div>

      {/* Center controls */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {/* Buttons */}
        <div className="flex items-center gap-7">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-pressed={shuffle}
            aria-label={shuffle ? "Desativar aleatório" : "Ativar aleatório"}
            className="cursor-pointer transition-colors duration-150 w-[34px] h-[34px] flex items-center justify-center"
            style={{ color: shuffle ? "#ff164c" : "#a19a9b" }}
          >
            <ShuffleIcon />
          </button>

          <button
            onClick={playPrevious}
            className="cursor-pointer transition-colors duration-150 w-[34px] h-[34px] flex items-center justify-center hover:opacity-80"
            style={{ color: "#a19a9b" }}
            aria-label="Faixa anterior"
          >
            <PrevIcon />
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playbackStatus === "loading" ? "Carregando" : isPlaying ? "Pausar" : "Tocar"}
                className="w-[43px] h-[43px] flex items-center justify-center cursor-pointer transition-all duration-150 shrink-0 border border-[#30292b]"
                style={{ backgroundColor: "black" }}
              >
                <span style={{ color: "#ff164c" }}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{playbackStatus === "loading" ? "Carregando" : isPlaying ? "Pausar" : "Tocar"}</TooltipContent>
          </Tooltip>

          <button
            onClick={playNext}
            className="cursor-pointer transition-colors duration-150 w-[34px] h-[34px] flex items-center justify-center hover:opacity-80"
            style={{ color: "#a19a9b" }}
            aria-label="Próxima faixa"
          >
            <NextIcon />
          </button>

          <button
            type="button"
            onClick={cycleRepeat}
            aria-pressed={repeatMode !== "off"}
            aria-label={repeatMode === "one" ? "Repetir faixa" : repeatMode === "all" ? "Repetir fila" : "Ativar repetição"}
            className="cursor-pointer transition-colors duration-150 w-[34px] h-[34px] flex items-center justify-center"
            style={{ color: repeatMode === "off" ? "#a19a9b" : "#ff164c" }}
          >
            <RepeatIcon />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex w-full max-w-[752px] items-center gap-[14px]">
          <span
            style={{ color: "#a19a9b", fontSize: "13px", fontFamily: "Raleway, sans-serif", lineHeight: "1.7" }}
          >
            {formatTime(progress, duration)}
          </span>
          <div className="flex-1 relative group">
            <div
              className="w-full h-1 cursor-pointer relative transition-all duration-150 group-hover:h-1.5"
              style={{ backgroundColor: "#5b4f51" }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                setProgress(Math.max(0, Math.min(100, pct)));
              }}
            >
              <div
                className="h-full absolute left-0 top-0 transition-all duration-150"
                style={{
                  backgroundColor: "#ff164c",
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
          <span
            style={{ color: "#a19a9b", fontSize: "13px", fontFamily: "Raleway, sans-serif", lineHeight: "1.7" }}
          >
            {getTotalTime()}
          </span>
        </div>
      </div>

      {/* Volume - Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={toggleMute}
          className="w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-150 hover:opacity-80"
          style={{ color: isMuted ? "#ff164c" : "#5b4f51" }}
        >
          {displayVolume > 0 ? <VolumeIcon /> : <VolumeMutedIcon />}
        </button>
        <div className="group">
          <div
            className="h-1 cursor-pointer relative w-[105px] transition-all duration-150 group-hover:h-1.5"
            style={{ backgroundColor: "#5b4f51" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = ((e.clientX - rect.left) / rect.width) * 100;
              setVolume(Math.max(0, Math.min(100, pct)));
              if (isMuted && pct > 0) {
                toggleMute();
              }
            }}
          >
            <div
              className="h-full absolute left-0 top-0 transition-all duration-150"
              style={{
                backgroundColor: "#ff164c",
                width: `${displayVolume}%`,
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}