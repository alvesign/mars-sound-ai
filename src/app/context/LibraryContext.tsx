import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import type { CatalogCreator, CatalogPlaylist, CatalogTrack, LibraryGenre, LibraryTag } from "../types/library";
import { FALLBACK_COVER } from "../types/library";
import { supabase } from "../../lib/supabase";
import { notifySuccess } from "../lib/notify";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  email: string;
  isPublic: boolean;
  genres: string[];
  moods: string[];
  avatarUrl: string;
  bannerUrl: string;
  followers: number;
  following: number;
  isFollowedByViewer: boolean;
}

interface LibrarySnapshot {
  userId: string | null;
  tracks: CatalogTrack[];
  playlists: CatalogPlaylist[];
  genres: LibraryGenre[];
  tags: LibraryTag[];
  favoriteIds: string[];
  likedIds: string[];
  recentIds: string[];
  trendingIds: string[];
  recommendedIds: string[];
  creators: CatalogCreator[];
  uploadedIds: string[];
  profile: UserProfile;
}

interface PublishInput {
  title: string;
  artist: string;
  image: string;
  category: string;
  album?: string;
  duration?: number | string;
  audioUrl?: string;
  moods?: string[];
  aiModel?: string;
  aiPrompt?: string;
  audioFile?: File;
  coverFile?: File | null;
}

interface LibraryContextValue extends LibrarySnapshot {
  loading: boolean;
  error: string | null;
  actionError: string | null;
  historyError: string | null;
  recommendationsError: string | null;
  creatorsError: string | null;
  viewedUserId: string | null;
  viewedProfile: UserProfile | null;
  viewedTracks: CatalogTrack[];
  viewedLoading: boolean;
  viewedError: string | null;
  retry: () => void;
  clearActionError: () => void;
  retryViewed: () => void;
  favoriteTracks: CatalogTrack[];
  uploadedTracks: CatalogTrack[];
  trendingTracks: CatalogTrack[];
  recommendedTracks: CatalogTrack[];
  recentTracks: CatalogTrack[];
  recentlyPlayed: CatalogTrack[];
  isFavorite: (trackId: string) => boolean;
  toggleFavorite: (trackId: string) => void;
  openCreator: (userId: string) => void;
  createPlaylist: (data: { name: string; description: string; isPublic: boolean; coverImage?: string }) => Promise<CatalogPlaylist>;
  updatePlaylist: (id: string, data: { name: string; description: string; isPublic: boolean; coverImage?: string }) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  recordPlay: (trackId: string) => void;
  toggleFollow: () => void;
  tracksForPlaylist: (playlist: CatalogPlaylist) => CatalogTrack[];
  publishTrack: (track: PublishInput) => Promise<CatalogTrack>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<string | null>;
  resetLibrary: () => void;
}

const TRACK_SELECT = "id, title, artist, image_url, audio_url, duration, album, play_count, moods, user_id, published_at, genres(name, slug)";

const emptyProfile: UserProfile = {
  id: "",
  name: "",
  username: "",
  bio: "",
  email: "",
  isPublic: true,
  genres: [],
  moods: [],
  avatarUrl: FALLBACK_COVER,
  bannerUrl: "",
  followers: 0,
  following: 0,
  isFollowedByViewer: false,
};

function emptySnapshot(): LibrarySnapshot {
  return {
    userId: null,
    tracks: [],
    playlists: [],
    genres: [],
    tags: [],
    favoriteIds: [],
    likedIds: [],
    recentIds: [],
    trendingIds: [],
    recommendedIds: [],
    creators: [],
    uploadedIds: [],
    profile: emptyProfile,
  };
}

function formatTrackDuration(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function profileSavedMessage(profile: Partial<UserProfile>, previous: UserProfile) {
  const avatarChanged = profile.avatarUrl !== undefined && profile.avatarUrl !== previous.avatarUrl;
  const bannerChanged = profile.bannerUrl !== undefined && profile.bannerUrl !== previous.bannerUrl;
  const preferences = profile.genres !== undefined || profile.moods !== undefined;
  const identity = profile.name !== undefined || profile.username !== undefined || profile.bio !== undefined || profile.isPublic !== undefined;
  const emailChanged = profile.email !== undefined && profile.email !== previous.email;

  if (bannerChanged && !avatarChanged && !preferences && !identity && !emailChanged) return "Capa atualizada";
  if (avatarChanged && !bannerChanged && !preferences && !identity && !emailChanged) return "Foto atualizada";
  if (preferences && !avatarChanged && !bannerChanged && !identity && !emailChanged) return "Preferências salvas";
  if (emailChanged && !avatarChanged && !bannerChanged && !preferences && !identity) return "E-mail atualizado";
  if (avatarChanged) return "Perfil e foto salvos";
  if (bannerChanged) return "Perfil e capa salvos";
  if (identity) return "Perfil salvo";
  return "Alterações salvas";
}

function slugFromList(value: string, items: { slug: string; name: string }[]) {
  return items.find((item) => item.slug === value || item.name === value)?.slug ?? value;
}

function uniqueIds(ids: string[], limit: number) {
  const seen = new Set<string>();
  const unique: string[] = [];
  ids.forEach((id) => {
    if (!id || seen.has(id) || unique.length >= limit) return;
    seen.add(id);
    unique.push(id);
  });
  return unique;
}

type TrackRow = {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  audio_url: string;
  duration: number;
  album: string | null;
  play_count: number;
  moods: string[] | null;
  user_id: string;
  genres: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

type PlaylistRow = {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  playlist_tracks: { track_id: string; position: number }[] | null;
};

type UserRow = {
  id: string;
  email?: string | null;
  username: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  cover_image: string | null;
  is_public: boolean;
  favorite_genres: string[] | null;
  favorite_moods: string[] | null;
  total_followers: number;
  total_following: number;
};

function mapTrack(row: TrackRow, userId: string | null, tagNames: Map<string, string>): CatalogTrack {
  const genre = firstRelation(row.genres);
  const moodSlugs = (row.moods ?? []).filter(Boolean);
  const moodSlug = moodSlugs[0] ?? "";
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    image: row.image_url || FALLBACK_COVER,
    audioUrl: row.audio_url,
    duration: formatTrackDuration(row.duration),
    album: row.album ?? genre?.name ?? "",
    category: genre?.name ?? "",
    categorySlug: genre?.slug ?? "",
    mood: moodSlug ? tagNames.get(moodSlug) ?? moodSlug : "",
    moodSlug,
    moodSlugs,
    userId: row.user_id,
    plays: row.play_count ?? 0,
    uploadedByUser: row.user_id === userId,
  };
}

function mapPlaylist(row: PlaylistRow): CatalogPlaylist {
  const items = [...(row.playlist_tracks ?? [])].sort((a, b) => a.position - b.position);
  return {
    id: row.id,
    title: row.name,
    description: row.description ?? "",
    image: row.cover_image || FALLBACK_COVER,
    isPublic: row.visibility === "PUBLIC",
    trackIds: items.map((item) => item.track_id),
  };
}

function mapProfile(row: UserRow, isFollowedByViewer = false): UserProfile {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    bio: row.bio ?? "",
    email: row.email ?? "",
    isPublic: row.is_public,
    genres: row.favorite_genres ?? [],
    moods: row.favorite_moods ?? [],
    avatarUrl: row.avatar || FALLBACK_COVER,
    bannerUrl: row.cover_image ?? "",
    followers: row.total_followers ?? 0,
    following: row.total_following ?? 0,
    isFollowedByViewer,
  };
}

async function uploadBlob(bucket: string, userId: string, blob: Blob, extension: string) {
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function publicMediaUrl(bucket: string, userId: string, value?: string | null) {
  if (!value) return "";
  if (!value.startsWith("data:")) return value;
  const response = await fetch(value);
  const blob = await response.blob();
  const extension = blob.type.includes("png") ? "png" : "jpg";
  return uploadBlob(bucket, userId, blob, extension);
}

async function readDuration(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const seconds = await new Promise<number>((resolve) => {
      audio.onloadedmetadata = () => resolve(Math.round(audio.duration) || 180);
      audio.onerror = () => resolve(180);
      audio.src = url;
    });
    return seconds;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function writeEngagement(table: "favorites" | "likes", userId: string, trackId: string, active: boolean) {
  if (active) {
    return supabase.from(table).upsert(
      { user_id: userId, track_id: trackId },
      { onConflict: "user_id,track_id", ignoreDuplicates: true },
    );
  }
  return supabase.from(table).delete().eq("user_id", userId).eq("track_id", trackId);
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<LibrarySnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [creatorsError, setCreatorsError] = useState<string | null>(null);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
  const [viewedTracks, setViewedTracks] = useState<CatalogTrack[]>([]);
  const [viewedLoading, setViewedLoading] = useState(false);
  const [viewedError, setViewedError] = useState<string | null>(null);
  const snapshotRef = useRef(snapshot);
  const sessionRef = useRef<{ id: string; email: string } | null>(null);
  const viewedUserIdRef = useRef<string | null>(null);
  snapshotRef.current = snapshot;
  viewedUserIdRef.current = viewedUserId;

  const clearViewed = () => {
    setViewedUserId(null);
    setViewedProfile(null);
    setViewedTracks([]);
    setViewedLoading(false);
    setViewedError(null);
  };

  const loadCreator = async (targetId: string) => {
    setViewedUserId(targetId);
    setViewedLoading(true);
    setViewedError(null);
    const viewerId = snapshotRef.current.userId;
    const tagNames = new Map(snapshotRef.current.tags.map((tag) => [tag.slug, tag.name]));
    const [userResult, tracksResult, followResult] = await Promise.all([
      supabase
        .from("users")
        .select("id, username, name, bio, avatar, cover_image, is_public, favorite_genres, favorite_moods, total_followers, total_following")
        .eq("id", targetId)
        .maybeSingle(),
      supabase
        .from("tracks")
        .select(TRACK_SELECT)
        .eq("status", "PUBLISHED")
        .eq("user_id", targetId)
        .order("published_at", { ascending: false, nullsFirst: false }),
      viewerId && viewerId !== targetId
        ? supabase.from("follows").select("follower_id").eq("follower_id", viewerId).eq("following_id", targetId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (userResult.error || tracksResult.error || !userResult.data) {
      setViewedProfile(null);
      setViewedTracks([]);
      setViewedError("Não foi possível carregar o perfil");
      setViewedLoading(false);
      return;
    }

    setViewedProfile(mapProfile(userResult.data as UserRow, Boolean(followResult.data)));
    setViewedTracks(((tracksResult.data ?? []) as TrackRow[]).map((row) => mapTrack(row, viewerId, tagNames)));
    setViewedLoading(false);
  };

  const reload = async (userId: string, email = "", quiet = false) => {
    if (!userId) {
      setSnapshot(emptySnapshot());
      setLoading(false);
      setError(null);
      return;
    }
    if (!quiet) {
      setLoading(true);
      setError(null);
    }

    const [profileResult, tracksResult, playlistsResult, favoritesResult, likesResult, genresResult, tagsResult, historyResult, weekResult, recommendationsResult] = await Promise.all([
      supabase
        .from("users")
        .select("id, email, username, name, bio, avatar, cover_image, is_public, favorite_genres, favorite_moods, total_followers, total_following")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("tracks")
        .select(TRACK_SELECT)
        .eq("status", "PUBLISHED")
        .order("published_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("playlists")
        .select("id, name, description, cover_image, visibility, playlist_tracks(track_id, position)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase.from("favorites").select("track_id").eq("user_id", userId),
      supabase.from("likes").select("track_id").eq("user_id", userId),
      supabase.from("genres").select("name, slug").order("name"),
      supabase.from("tags").select("name, slug").order("name"),
      supabase
        .from("play_history")
        .select("track_id, played_at")
        .eq("user_id", userId)
        .order("played_at", { ascending: false })
        .limit(40),
      supabase.rpc("get_top_tracks_this_week", { p_limit: 12 }),
      supabase.rpc("get_recommendations", { p_user_id: userId, p_limit: 8 }),
    ]);

    if (tracksResult.error) {
      setError("Não foi possível carregar as músicas");
      setLoading(false);
      return;
    }
    if (favoritesResult.error || likesResult.error) {
      setError("Não foi possível carregar as curtidas");
      setLoading(false);
      return;
    }
    if (playlistsResult.error) {
      setError("Não foi possível carregar as playlists");
      setLoading(false);
      return;
    }
    if (genresResult.error || tagsResult.error) {
      setError("Não foi possível carregar os dados");
      setLoading(false);
      return;
    }

    const tags = ((tagsResult.data ?? []) as LibraryTag[]).map((row) => ({ slug: row.slug, name: row.name }));
    const tagNames = new Map(tags.map((tag) => [tag.slug, tag.name]));
    const tracks = ((tracksResult.data ?? []) as TrackRow[]).map((row) => mapTrack(row, userId, tagNames));
    const ownerIds = [...new Set(tracks.map((track) => track.userId))];
    const creatorsResult = ownerIds.length
      ? await supabase.from("users").select("id, name, username, avatar").in("id", ownerIds)
      : { data: [], error: null };
    const usersById = new Map(((creatorsResult.data ?? []) as { id: string; name: string; username: string; avatar: string | null }[]).map((user) => [user.id, user]));
    const creators: CatalogCreator[] = [];
    const seenCreators = new Set<string>();
    tracks.forEach((track) => {
      if (seenCreators.has(track.userId) || creators.length >= 8) return;
      const owner = usersById.get(track.userId);
      if (!owner) return;
      seenCreators.add(track.userId);
      creators.push({
        id: owner.id,
        name: owner.name,
        username: owner.username,
        avatarUrl: owner.avatar || FALLBACK_COVER,
        coverUrl: owner.avatar || track.image,
      });
    });

    const weekRows = (weekResult.data ?? []) as { id: string; play_count: number | string }[];
    const weekPlayed = weekRows.filter((row) => Number(row.play_count) > 0);
    const trendingIds = !weekResult.error && weekPlayed.length > 0
      ? weekPlayed.map((row) => row.id)
      : [...tracks].sort((left, right) => right.plays - left.plays).slice(0, 12).map((track) => track.id);
    const recommendedIds = recommendationsResult.error
      ? []
      : ((recommendationsResult.data ?? []) as { id: string }[]).map((row) => row.id);

    setHistoryError(historyResult.error ? "Não foi possível carregar o histórico" : null);
    setRecommendationsError(recommendationsResult.error ? "Não foi possível carregar as recomendações" : null);
    setCreatorsError(creatorsResult.error ? "Não foi possível carregar os criadores" : null);
    setSnapshot({
      userId,
      tracks,
      tags,
      genres: ((genresResult.data ?? []) as { name: string; slug: string }[]).map((row) => ({
        slug: row.slug,
        name: row.name,
        label: row.name,
      })),
      playlists: ((playlistsResult.data ?? []) as PlaylistRow[]).map(mapPlaylist),
      favoriteIds: (favoritesResult.data ?? []).map((row) => row.track_id),
      likedIds: (likesResult.data ?? []).map((row) => row.track_id),
      recentIds: uniqueIds((historyResult.data ?? []).map((row) => row.track_id), 8),
      trendingIds,
      recommendedIds,
      creators: creatorsResult.error ? [] : creators,
      uploadedIds: tracks.filter((track) => track.uploadedByUser).map((track) => track.id),
      profile: profileResult.data ? mapProfile(profileResult.data as UserRow) : { ...emptyProfile, email },
    });
    setError(null);
    setLoading(false);
  };

  const retry = () => {
    const session = sessionRef.current;
    if (!session) return;
    void reload(session.id, session.email);
  };

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const session = data.session;
      if (!session) {
        sessionRef.current = null;
        setSnapshot(emptySnapshot());
        clearViewed();
        setLoading(false);
        setError(null);
        return;
      }
      sessionRef.current = { id: session.user.id, email: session.user.email ?? "" };
      void reload(session.user.id, session.user.email ?? "");
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || event === "SIGNED_OUT") {
        sessionRef.current = null;
        setSnapshot(emptySnapshot());
        clearViewed();
        setLoading(false);
        setError(null);
        return;
      }
      sessionRef.current = { id: session.user.id, email: session.user.email ?? "" };
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        const userId = session.user.id;
        const email = session.user.email ?? "";
        setTimeout(() => {
          const alreadyLoaded = snapshotRef.current.userId === userId && snapshotRef.current.tracks.length > 0;
          void reload(userId, email, alreadyLoaded);
        }, 0);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<LibraryContextValue>(() => {
    const tracksById = new Map(snapshot.tracks.map((item) => [item.id, item]));
    const resolve = (ids: string[]) =>
      ids.map((id) => tracksById.get(id)).filter((item): item is CatalogTrack => Boolean(item));

    return {
      ...snapshot,
      loading,
      error,
      actionError,
      historyError,
      recommendationsError,
      creatorsError,
      viewedUserId,
      viewedProfile,
      viewedTracks,
      viewedLoading,
      viewedError,
      retry,
      clearActionError: () => setActionError(null),
      retryViewed: () => {
        if (viewedUserIdRef.current) void loadCreator(viewedUserIdRef.current);
      },
      favoriteTracks: resolve(snapshot.favoriteIds),
      uploadedTracks: resolve(snapshot.uploadedIds),
      trendingTracks: resolve(snapshot.trendingIds),
      recommendedTracks: resolve(snapshot.recommendedIds),
      recentTracks: snapshot.tracks.slice(0, 12),
      recentlyPlayed: resolve(snapshot.recentIds),
      isFavorite: (trackId) => snapshot.favoriteIds.includes(trackId),
      toggleFavorite: (trackId) => {
        const userId = snapshot.userId;
        if (!userId) return;
        const wasFavorite = snapshot.favoriteIds.includes(trackId);
        const previousFavorites = snapshot.favoriteIds;
        const previousLikes = snapshot.likedIds;
        const nextActive = !wasFavorite;
        setActionError(null);
        setSnapshot((current) => ({
          ...current,
          favoriteIds: nextActive
            ? [trackId, ...current.favoriteIds.filter((id) => id !== trackId)]
            : current.favoriteIds.filter((id) => id !== trackId),
          likedIds: nextActive
            ? [trackId, ...current.likedIds.filter((id) => id !== trackId)]
            : current.likedIds.filter((id) => id !== trackId),
        }));
        void (async () => {
          const [favoriteResult, likeResult] = await Promise.all([
            writeEngagement("favorites", userId, trackId, nextActive),
            writeEngagement("likes", userId, trackId, nextActive),
          ]);
          if (favoriteResult.error || likeResult.error) {
            if (!favoriteResult.error) await writeEngagement("favorites", userId, trackId, wasFavorite);
            if (!likeResult.error) await writeEngagement("likes", userId, trackId, wasFavorite);
            setSnapshot((current) => ({
              ...current,
              favoriteIds: previousFavorites,
              likedIds: previousLikes,
            }));
            setActionError("Não foi possível atualizar esta música");
            return;
          }
          await reload(userId, "", true);
        })();
      },
      openCreator: (userId) => {
        void loadCreator(userId);
      },
      createPlaylist: async (data) => {
        const userId = snapshotRef.current.userId;
        if (!userId) throw new Error("Entre na sua conta para criar uma playlist.");
        const cover = data.coverImage
          ? await publicMediaUrl("playlist-covers", userId, data.coverImage)
          : FALLBACK_COVER;
        const { data: row, error: insertError } = await supabase
          .from("playlists")
          .insert({
            name: data.name.trim(),
            description: data.description.trim(),
            cover_image: cover || FALLBACK_COVER,
            visibility: data.isPublic ? "PUBLIC" : "PRIVATE",
            user_id: userId,
          })
          .select("id, name, description, cover_image, visibility")
          .single();
        if (insertError || !row) throw new Error("Não foi possível criar a playlist.");
        const playlist = mapPlaylist(row as PlaylistRow);
        setSnapshot((current) => ({ ...current, playlists: [playlist, ...current.playlists] }));
        notifySuccess("Playlist criada");
        return playlist;
      },
      updatePlaylist: (id, data) => {
        const userId = snapshot.userId;
        if (!userId) return;
        const previous = snapshot.playlists;
        setActionError(null);
        setSnapshot((current) => ({
          ...current,
          playlists: current.playlists.map((playlist) =>
            playlist.id === id
              ? {
                  ...playlist,
                  title: data.name.trim(),
                  description: data.description.trim(),
                  isPublic: data.isPublic,
                  image: data.coverImage || playlist.image,
                }
              : playlist,
          ),
        }));
        void (async () => {
          try {
            const cover = data.coverImage
              ? await publicMediaUrl("playlist-covers", userId, data.coverImage)
              : undefined;
            const { error: updateError } = await supabase
              .from("playlists")
              .update({
                name: data.name.trim(),
                description: data.description.trim(),
                visibility: data.isPublic ? "PUBLIC" : "PRIVATE",
                ...(cover ? { cover_image: cover } : {}),
              })
              .eq("id", id)
              .eq("user_id", userId);
            if (updateError) throw updateError;
            await reload(userId, "", true);
            notifySuccess(data.coverImage?.startsWith("data:") ? "Playlist e capa salvas" : "Playlist atualizada");
          } catch {
            setSnapshot((current) => ({ ...current, playlists: previous }));
            setActionError("Não foi possível atualizar a playlist.");
          }
        })();
      },
      deletePlaylist: (id) => {
        const userId = snapshot.userId;
        if (!userId) return;
        const previous = snapshot.playlists;
        setActionError(null);
        setSnapshot((current) => ({
          ...current,
          playlists: current.playlists.filter((playlist) => playlist.id !== id),
        }));
        void supabase.from("playlists").delete().eq("id", id).eq("user_id", userId).then(({ error: deleteError }) => {
          if (!deleteError) {
            notifySuccess("Playlist excluída");
            return;
          }
          setSnapshot((current) => ({ ...current, playlists: previous }));
          setActionError("Não foi possível excluir a playlist.");
        });
      },
      addTrackToPlaylist: (playlistId, trackId) => {
        const userId = snapshot.userId;
        if (!userId) return;
        const previous = snapshot.playlists;
        setActionError(null);
        setSnapshot((current) => ({
          ...current,
          playlists: current.playlists.map((playlist) =>
            playlist.id === playlistId && !playlist.trackIds.includes(trackId)
              ? { ...playlist, trackIds: [...playlist.trackIds, trackId] }
              : playlist,
          ),
        }));
        void supabase.rpc("add_track_to_playlist", { p_playlist_id: playlistId, p_track_id: trackId }).then(({ error: rpcError }) => {
          if (rpcError) {
            setSnapshot((current) => ({ ...current, playlists: previous }));
            setActionError("Não foi possível adicionar a música à playlist.");
            return;
          }
          notifySuccess("Música adicionada à playlist");
          void reload(userId, "", true);
        });
      },
      removeTrackFromPlaylist: (playlistId, trackId) => {
        const userId = snapshot.userId;
        if (!userId) return;
        const previous = snapshot.playlists;
        setActionError(null);
        setSnapshot((current) => ({
          ...current,
          playlists: current.playlists.map((playlist) =>
            playlist.id === playlistId
              ? { ...playlist, trackIds: playlist.trackIds.filter((itemId) => itemId !== trackId) }
              : playlist,
          ),
        }));
        void supabase.from("playlist_tracks").delete().eq("playlist_id", playlistId).eq("track_id", trackId).then(({ error: deleteError }) => {
          if (deleteError) {
            setSnapshot((current) => ({ ...current, playlists: previous }));
            setActionError("Não foi possível remover a música da playlist.");
            return;
          }
          notifySuccess("Música removida da playlist");
          void reload(userId, "", true);
        });
      },
      recordPlay: (trackId) => {
        const userId = snapshot.userId;
        if (!userId) return;
        const previousTracks = snapshot.tracks;
        const previousRecent = snapshot.recentIds;
        setSnapshot((current) => ({
          ...current,
          recentIds: uniqueIds([trackId, ...current.recentIds], 8),
          tracks: current.tracks.map((item) =>
            item.id === trackId ? { ...item, plays: (item.plays ?? 0) + 1 } : item,
          ),
        }));
        void supabase.rpc("increment_play_count", { p_track_id: trackId }).then(({ error: rpcError }) => {
          if (rpcError) {
            setSnapshot((current) => ({ ...current, tracks: previousTracks, recentIds: previousRecent }));
            setActionError("Não foi possível registrar a reprodução.");
            return;
          }
          void reload(userId, "", true);
        });
      },
      toggleFollow: () => {
        const viewerId = snapshot.userId;
        const targetId = viewedUserId;
        const currentProfile = viewedProfile;
        if (!viewerId || !targetId || !currentProfile || viewerId === targetId) return;
        const wasFollowing = currentProfile.isFollowedByViewer;
        setActionError(null);
        setViewedProfile({
          ...currentProfile,
          isFollowedByViewer: !wasFollowing,
          followers: Math.max(0, currentProfile.followers + (wasFollowing ? -1 : 1)),
        });
        const request = wasFollowing
          ? supabase.from("follows").delete().eq("follower_id", viewerId).eq("following_id", targetId)
          : supabase.from("follows").insert({ follower_id: viewerId, following_id: targetId });
        void request.then(({ error: followError }) => {
          if (followError) {
            setViewedProfile(currentProfile);
            setActionError("Não foi possível atualizar o seguimento");
            return;
          }
          void loadCreator(targetId);
        });
      },
      tracksForPlaylist: (playlist) => resolve(playlist.trackIds),
      publishTrack: async (track) => {
        const userId = snapshotRef.current.userId;
        if (!userId) throw new Error("Entre na sua conta para publicar.");
        const current = snapshotRef.current;
        const genreSlug = slugFromList(track.category, current.genres);
        const { data: genre, error: genreError } = await supabase.from("genres").select("id, slug, name").eq("slug", genreSlug).maybeSingle();
        if (genreError || !genre) throw new Error("Gênero não encontrado.");
        const duration = track.audioFile ? await readDuration(track.audioFile) : 180;
        const audioUrl = track.audioFile
          ? await uploadBlob("track-audio", userId, track.audioFile, track.audioFile.name.split(".").pop() || "mp3")
          : track.audioUrl;
        if (!audioUrl) throw new Error("Envie um arquivo de áudio.");
        const imageUrl = track.coverFile
          ? await uploadBlob("track-covers", userId, track.coverFile, track.coverFile.type.includes("png") ? "png" : "jpg")
          : await publicMediaUrl("track-covers", userId, track.image);
        const moods = (track.moods ?? []).map((mood) => slugFromList(mood, current.tags)).filter(Boolean);
        const { data: row, error: insertError } = await supabase
          .from("tracks")
          .insert({
            title: track.title,
            artist: track.artist,
            audio_url: audioUrl,
            image_url: imageUrl || FALLBACK_COVER,
            duration,
            file_size: track.audioFile?.size ?? 1,
            format: track.audioFile?.name.toLowerCase().endsWith(".wav") ? "wav" : "mp3",
            album: track.album || genre.name,
            genre_id: genre.id,
            moods,
            ai_model: track.aiModel?.trim() || null,
            ai_prompt: track.aiPrompt?.trim() || null,
            status: "PUBLISHED",
            user_id: userId,
            published_at: new Date().toISOString(),
          })
          .select(TRACK_SELECT)
          .single();
        if (insertError || !row) throw new Error("Não foi possível publicar a música.");
        notifySuccess(track.coverFile || track.audioFile ? "Arquivos enviados e música publicada" : "Música publicada");
        const tagNames = new Map(current.tags.map((tag) => [tag.slug, tag.name]));
        const published = mapTrack(row as TrackRow, userId, tagNames);
        setSnapshot((currentSnapshot) => ({
          ...currentSnapshot,
          tracks: [published, ...currentSnapshot.tracks],
          uploadedIds: [published.id, ...currentSnapshot.uploadedIds],
        }));
        return published;
      },
      updateProfile: (profile) => {
        const userId = snapshot.userId;
        if (!userId) return;
        const previous = snapshot.profile;
        const genres = snapshot.genres;
        const tags = snapshot.tags;
        setActionError(null);
        setSnapshot((current) => ({ ...current, profile: { ...current.profile, ...profile } }));
        void (async () => {
          try {
            const avatar = profile.avatarUrl ? await publicMediaUrl("user-avatars", userId, profile.avatarUrl) : undefined;
            const banner = profile.bannerUrl ? await publicMediaUrl("user-avatars", userId, profile.bannerUrl) : undefined;
            const patch: Record<string, unknown> = {};
            if (profile.name !== undefined) patch.name = profile.name;
            if (profile.username !== undefined) patch.username = profile.username;
            if (profile.bio !== undefined) patch.bio = profile.bio;
            if (profile.isPublic !== undefined) patch.is_public = profile.isPublic;
            if (profile.email !== undefined) patch.email = profile.email;
            if (profile.genres) patch.favorite_genres = profile.genres.map((item) => slugFromList(item, genres));
            if (profile.moods) patch.favorite_moods = profile.moods.map((item) => slugFromList(item, tags));
            if (avatar) patch.avatar = avatar;
            if (banner) patch.cover_image = banner;
            if (Object.keys(patch).length > 0) {
              const { error: updateError } = await supabase.from("users").update(patch).eq("id", userId);
              if (updateError) throw updateError;
            }
            if (profile.email && profile.email !== previous.email) {
              const { error: emailError } = await supabase.auth.updateUser({ email: profile.email });
              if (emailError) throw emailError;
            }
            await reload(userId, "", true);
            const onlySameEmail = profile.email !== undefined
              && profile.email === previous.email
              && Object.keys(profile).every((key) => key === "email");
            if (!onlySameEmail) notifySuccess(profileSavedMessage(profile, previous));
          } catch {
            setSnapshot((current) => ({ ...current, profile: previous }));
            setActionError("Não foi possível salvar o perfil.");
          }
        })();
      },
      changePassword: async (currentPassword, nextPassword) => {
        if (nextPassword.length < 6) return "A nova senha deve ter pelo menos 6 caracteres.";
        const email = snapshotRef.current.profile.email;
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });
        if (signInError) return "A senha atual está incorreta.";
        const { error: updateError } = await supabase.auth.updateUser({ password: nextPassword });
        return updateError ? updateError.message : null;
      },
      resetLibrary: () => {
        setSnapshot(emptySnapshot());
        clearViewed();
        setActionError(null);
        void supabase.auth.signOut();
      },
    };
  }, [snapshot, loading, error, actionError, historyError, recommendationsError, creatorsError, viewedUserId, viewedProfile, viewedTracks, viewedLoading, viewedError]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used within a LibraryProvider");
  return context;
}
