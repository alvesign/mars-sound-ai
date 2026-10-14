import { useState } from "react";
import { useMusicPlayer } from "../context/MusicContext";
import { useLibrary } from "../context/LibraryContext";
import { TrackRow, TrackTableHeader } from "./ui/TrackRow";
import { CreatePlaylistModal } from "./CreatePlaylistModal";
import { DataState } from "./ui/DataState";
import type { CatalogPlaylist } from "../types/library";

export type Playlist = CatalogPlaylist;

// ── Playlist Card ──
interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col cursor-pointer transition-all duration-200"
      style={{
        border: `1px solid ${hovered ? "#ff164c" : "#30292b"}`,
        boxShadow: hovered ? "0 0 16px rgba(255,22,76,0.25)" : "none",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      {/* Image section */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={playlist.image}
          alt={playlist.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[38%] to-black" />
      </div>

      {/* Text info */}
      <div className="px-[18px] py-[12px]">
        <p
          className="font-semibold text-[16px] leading-[1.5] truncate"
          style={{ color: "#bababa" }}
        >
          {playlist.title}
        </p>
        <p className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
          {playlist.trackIds.length} músicas
        </p>
      </div>
    </article>
  );
}

// ── Page ──
interface PlaylistsPageProps {
  onPlaylistClick: (playlist: Playlist) => void;
}

export function PlaylistsPage({ onPlaylistClick }: PlaylistsPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const { playlists, recentlyPlayed, historyError, createPlaylist, loading, error, retry } = useLibrary();

  return (
    <div className="w-full">
      <div className="w-full px-4 sm:px-6 lg:px-[37px] py-6 lg:py-[38px] space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1
              className="font-bold text-[24px] leading-[1.5] mb-2"
              style={{ color: "#ebe9e9" }}
            >
              Playlists
            </h1>
            <p className="font-semibold text-[16px] leading-[1.5]" style={{ color: "#bfbbbc" }}>
              Sua coleção pessoal de músicas criadas com AI
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-[12px] px-[16px] py-[8px] shrink-0 transition-colors duration-150 hover:bg-[#ff164c]/10"
            style={{ border: "1px solid #ff164c" }}
          >
            {/* Plus icon */}
            <svg width="16" height="16" viewBox="0 0 8 8" fill="none">
              <path
                d="M7.33333 3.33333H4.66667V0.666667C4.66667 0.489856 4.59643 0.320287 4.4714 0.195262C4.34638 0.070238 4.17681 0 4 0C3.82319 0 3.65362 0.070238 3.5286 0.195262C3.40357 0.320287 3.33333 0.489856 3.33333 0.666667V3.33333H0.666667C0.489856 3.33333 0.320287 3.40357 0.195262 3.5286C0.070238 3.65362 0 3.82319 0 4C0 4.17681 0.070238 4.34638 0.195262 4.4714C0.320287 4.59643 0.489856 4.66667 0.666667 4.66667H3.33333V7.33333C3.33333 7.51014 3.40357 7.67971 3.5286 7.80474C3.65362 7.92976 3.82319 8 4 8C4.17681 8 4.34638 7.92976 4.4714 7.80474C4.59643 7.67971 4.66667 7.51014 4.66667 7.33333V4.66667H7.33333C7.51014 4.66667 7.67971 4.59643 7.80474 4.4714C7.92976 4.34638 8 4.17681 8 4C8 3.82319 7.92976 3.65362 7.80474 3.5286C7.67971 3.40357 7.51014 3.33333 7.33333 3.33333Z"
                fill="#f8f8f8"
              />
            </svg>
            <span
              className="font-semibold text-[16px] leading-[1.5] whitespace-nowrap"
              style={{ color: "#f8f8f8" }}
            >
              Nova playlist
            </span>
          </button>
        </div>

        {/* ── Playlist Grid ── */}
        <section>
          <DataState
            loading={loading}
            error={error}
            empty={playlists.length === 0}
            emptyMessage="Sua biblioteca está vazia"
            onRetry={retry}
          >
            <>
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => onPlaylistClick(playlist)}
                  />
                ))}
              </div>
              <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-4">
                <div className="flex gap-4 px-4">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="flex-none w-[160px]">
                      <PlaylistCard
                        playlist={playlist}
                        onClick={() => onPlaylistClick(playlist)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          </DataState>
        </section>

        {/* ── Recently Played ── */}
        <section>
          <h2
            className="font-semibold text-[24px] leading-[1.5] mb-4"
            style={{ color: "#ebe9e9" }}
          >
            Tocadas recentemente
          </h2>

          {historyError ? (
            <div className="flex flex-col items-start gap-3 py-4">
              <p style={{ color: "#bababa" }}>{historyError}</p>
              <button type="button" onClick={retry} className="px-4 py-2 font-semibold" style={{ background: "#ff164c", color: "#f8f8f8" }}>
                Tentar novamente
              </button>
            </div>
          ) : !loading && !error && recentlyPlayed.length === 0 ? (
            <p className="py-4" style={{ color: "#bababa" }}>Você ainda não ouviu nenhuma música</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <TrackTableHeader showAlbum={false} showDuration={false} />
              <tbody>
                {recentlyPlayed.map((track, index) => {
                  const isCurrentTrack = currentTrack?.id === track.id;
                  const isTrackPlaying = isCurrentTrack && isPlaying;

                  return (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      isPlaying={isTrackPlaying}
                      onClick={() => playTrack(track, recentlyPlayed)}
                      showAlbum={false}
                      showDuration={false}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </section>
      </div>

      {/* ── Create Playlist Modal ── */}
      <CreatePlaylistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={async (data) => {
          const playlist = await createPlaylist(data);
          setModalOpen(false);
          onPlaylistClick(playlist);
        }}
      />
    </div>
  );
}