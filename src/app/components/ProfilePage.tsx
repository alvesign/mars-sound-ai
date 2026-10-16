import { useEffect, useState, useRef } from "react";
import { useMusicPlayer } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { formatDuration } from "../types/library";
import { TrackRow, TrackTableHeader } from "./ui/TrackRow";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Upload, ImageIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// ── Figma Assets ──
import imgBanner from "figma:asset/1ff0fd371e6317f8995f6626691775855756bce5.png";

// ── Share Icon SVG ──
function formatCount(value: number) {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}k`;
  }
  return String(value);
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M13.3333 10.6667C12.7811 10.6667 12.2844 10.8978 11.9289 11.2711L5.28 7.58667C5.31556 7.40444 5.33333 7.21778 5.33333 7.02667C5.33333 6.83556 5.31556 6.64889 5.28 6.46667L11.8667 2.81333C12.2311 3.2 12.7467 3.44 13.3333 3.44C14.5689 3.44 15.5556 2.45333 15.5556 1.21778C15.5556 -0.0177778 14.5689 -1 13.3333 -1C12.0978 -1 11.1111 -0.0177778 11.1111 1.21778C11.1111 1.40889 11.1289 1.59556 11.1644 1.77778L4.57778 5.43111C4.21333 5.04444 3.69778 4.80444 3.11111 4.80444C1.87556 4.80444 0.888889 5.79111 0.888889 7.02667C0.888889 8.26222 1.87556 9.24889 3.11111 9.24889C3.69778 9.24889 4.21333 9.00889 4.57778 8.62222L11.2267 12.32C11.1911 12.4844 11.1733 12.6578 11.1733 12.8311C11.1733 14.0311 12.1333 15 13.3333 15C14.5333 15 15.4933 14.0311 15.4933 12.8311C15.4933 11.6311 14.5333 10.6667 13.3333 10.6667Z"
        fill="#F8F8F8"
      />
    </svg>
  );
}

// ── Three dots vertical icon ──
function DotsVerticalIcon() {
  return (
    <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
      <circle cx="2" cy="2" r="2" fill="#766C6E" />
      <circle cx="2" cy="8" r="2" fill="#766C6E" />
      <circle cx="2" cy="14" r="2" fill="#766C6E" />
    </svg>
  );
}

// ── Profile Page ──
interface ProfilePageProps {
  isPublic?: boolean;
  onEditProfile?: () => void;
}

export function ProfilePage({ isPublic = false, onEditProfile }: ProfilePageProps) {
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const {
    profile,
    uploadedTracks,
    userId,
    viewedProfile,
    viewedTracks,
    viewedLoading,
    viewedError,
    retryViewed,
    updateProfile,
    toggleFollow,
  } = useLibrary();
  const shownProfile = isPublic ? viewedProfile : profile;
  const publishedTracks = isPublic ? viewedTracks : uploadedTracks;
  const canFollow = Boolean(isPublic && shownProfile && shownProfile.id && shownProfile.id !== userId);
  const [copied, setCopied] = useState(false);
  const [bannerImage, setBannerImage] = useState(shownProfile?.bannerUrl || imgBanner);

  useEffect(() => {
    setBannerImage(shownProfile?.bannerUrl || imgBanner);
  }, [shownProfile?.id, shownProfile?.bannerUrl]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result || "");
        setBannerImage(url);
        updateProfile({ bannerUrl: url });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isPublic && viewedLoading) {
    return <p className="px-8 py-16" style={{ color: "#bababa" }}>Carregando perfil...</p>;
  }

  if (isPublic && (viewedError || !shownProfile)) {
    return (
      <div className="flex flex-col items-start gap-3 px-8 py-16">
        <p style={{ color: "#bababa" }}>{viewedError || "Não foi possível carregar o perfil"}</p>
        <button type="button" onClick={retryViewed} className="px-4 py-2 font-semibold" style={{ background: "#ff164c", color: "#f8f8f8" }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!shownProfile) return null;

  return (
    <div className="w-full min-h-full">
      {/* ══════════════════════════════════════════
          BANNER + PROFILE HEADER SECTION
      ══════════════════════════════════════════ */}
      <div className="relative w-full">
        {/* Banner image */}
        <div className="relative w-full overflow-hidden" style={{ height: "245px" }}>
          <img
            src={bannerImage}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
          />
          {/* Gradient overlay at bottom for readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(21,15,16,0.7) 100%)",
            }}
          />
          {/* Dots menu - top right */}
          {!isPublic && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors duration-150 z-10"
                  aria-label="Opções"
                >
                  <DotsVerticalIcon />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                style={{ 
                  background: "#24191b",
                  border: "1px solid #30292b",
                  color: "#f8f8f8"
                }}
              >
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: "pointer" }}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Editar banner</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: "pointer" }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload nova imagem</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />
        </div>

        {/* ── Profile info section (overlaps banner) ── */}
        <div
          className="relative w-full px-4 sm:px-6 lg:px-8"
          style={{ marginTop: "-80px" }}
        >
          {/* Desktop: row layout | Mobile: stacked */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

            {/* Left: Photo + Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Profile photo */}
              <div
                className="relative shrink-0"
                style={{ width: "140px", height: "140px" }}
              >
                <img
                  src={shownProfile.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover border-4 border-[#0a0608]"
                />
              </div>

              {/* Name + username + stats */}
              <div className="flex flex-col gap-2 pb-1">
                <div>
                  <h1
                    className="font-bold leading-[1.5]"
                    style={{ fontSize: "clamp(20px, 4vw, 40px)", color: "#ebe9e9" }}
                  >
                    {shownProfile.name}
                  </h1>
                  <p
                    className="font-semibold leading-[1.5]"
                    style={{ fontSize: "16px", color: "#bababa" }}
                  >
                    @{shownProfile.username}
                  </p>
                </div>

                {/* Stats: followers + following */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ fontSize: "16px", color: "#f8f8f8" }}>
                      {publishedTracks.length}
                    </span>
                    <span style={{ fontSize: "14px", color: "#a19a9b" }}>músicas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ fontSize: "16px", color: "#f8f8f8" }}>
                      {formatCount(publishedTracks.reduce((total, item) => total + (item.plays ?? 0), 0))}
                    </span>
                    <span style={{ fontSize: "14px", color: "#a19a9b" }}>plays</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ fontSize: "16px", color: "#f8f8f8" }}>
                      {formatCount(shownProfile.followers)}
                    </span>
                    <span style={{ fontSize: "14px", color: "#a19a9b" }}>seguidores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ fontSize: "16px", color: "#f8f8f8" }}>
                      {formatCount(shownProfile.following)}
                    </span>
                    <span style={{ fontSize: "14px", color: "#a19a9b" }}>seguindo</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-[12px] leading-[1.25] max-w-md" style={{ color: "#bababa" }}>
                  {shownProfile.bio}
                </p>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              {canFollow ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleFollow}
                      className="flex items-center justify-center px-4 py-2 cursor-pointer transition-opacity duration-150 hover:opacity-90 whitespace-nowrap"
                      style={{
                        background: shownProfile.isFollowedByViewer ? "transparent" : "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
                        border: shownProfile.isFollowedByViewer ? "1px solid #ff164c" : "none",
                        color: "#f8f8f8",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {shownProfile.isFollowedByViewer ? "Seguindo" : "Seguir perfil"}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{shownProfile.isFollowedByViewer ? "Deixar de seguir" : "Seguir"}</TooltipContent>
                </Tooltip>
              ) : !isPublic ? (
                /* PERSONAL: Editar perfil */
                <Button
                  type="button"
                  onClick={onEditProfile}
                  className="px-4"
                  style={{
                    background: "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
                    color: "#f8f8f8",
                    height: "40px",
                  }}
                >
                  Editar perfil
                </Button>
              ) : null}

              {/* Share button */}
              <button
                type="button"
                className="relative flex items-center justify-center p-3 cursor-pointer transition-opacity duration-150 hover:opacity-80"
                aria-label={copied ? "Perfil copiado" : "Compartilhar"}
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `Mars Sound AI — ${shownProfile.name} (@${shownProfile.username})`,
                  );
                  setCopied(true);
                }}
                style={{ color: "#f8f8f8" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ border: "1px solid #ff164c" }}
                />
                <ShareIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PUBLISHED TRACKS SECTION
      ══════════════════════════════════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        {isPublic && !shownProfile.isPublic ? (
          <p className="py-10 text-center" style={{ color: "#bababa" }}>
            Este perfil é privado.
          </p>
        ) : (
        <>

        {/* Section header */}
        <div className="flex flex-col gap-1 mb-4">
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Músicas publicadas
          </h2>
          <p style={{ fontSize: "12px", color: "#bababa" }}>
            {publishedTracks.length} músicas · {formatDuration(publishedTracks)}
          </p>
        </div>

        {/* Tracks table */}
        {publishedTracks.length === 0 ? (
          <p className="py-8" style={{ color: "#bababa" }}>Nenhuma música publicada</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <TrackTableHeader showFavorites={false} />
            <tbody>
              {publishedTracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                const isTrackPlaying = isCurrentTrack && isPlaying;

                return (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    isPlaying={isTrackPlaying}
                    onClick={() => playTrack(track, publishedTracks)}
                    showFavorites={false}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}