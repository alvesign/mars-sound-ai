import type { Track } from "../context/MusicContext";
import fallbackCover from "../../assets/fallback-cover.svg";

export const FALLBACK_COVER = fallbackCover;

export interface CatalogTrack extends Track {
  category: string;
  categorySlug: string;
  mood: string;
  moodSlug: string;
  moodSlugs: string[];
  userId: string;
  plays: number;
  uploadedByUser?: boolean;
}

export interface CatalogCreator {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
}

export interface LibraryTag {
  slug: string;
  name: string;
}

export interface CatalogPlaylist {
  id: string;
  title: string;
  description: string;
  image: string;
  isPublic: boolean;
  trackIds: string[];
}

export interface LibraryGenre {
  slug: string;
  name: string;
  label: string;
}

export function formatDuration(tracks: Track[]) {
  if (tracks.length === 0) return "0 min";
  const seconds = tracks.reduce((total, item) => {
    if (typeof item.duration !== "string" || !item.duration.includes(":")) return total + 210;
    const [minutes, secs] = item.duration.split(":").map(Number);
    return total + minutes * 60 + secs;
  }, 0);
  return `${Math.round(seconds / 60)} min`;
}
