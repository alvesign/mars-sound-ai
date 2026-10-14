import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { useLibrary } from "./LibraryContext";

export interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
  audioUrl: string;
  duration?: number | string;
  album?: string;
}

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackStatus: PlaybackStatus;
  playbackError: string | null;
  progress: number;
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  isFullscreenOpen: boolean;
  shuffle: boolean;
  repeatMode: "off" | "all" | "one";
  queue: Track[];
  currentIndex: number;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFavorite: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  openFullscreen: () => void;
  closeFullscreen: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

function resolveNextIndex(
  index: number,
  list: Track[],
  shuffle: boolean,
  repeat: "off" | "all" | "one",
) {
  if (list.length === 0) return null;
  if (shuffle && list.length > 1) {
    let next = index;
    while (next === index) next = Math.floor(Math.random() * list.length);
    return next;
  }
  if (index + 1 < list.length) return index + 1;
  if (repeat === "all") return 0;
  return null;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { recordPlay } = useLibrary();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("idle");
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shuffleRef = useRef(false);
  const repeatRef = useRef<"off" | "all" | "one">("off");
  const queueRef = useRef<Track[]>([]);
  const indexRef = useRef(-1);
  const trackIdRef = useRef<string | null>(null);
  const statusRef = useRef<PlaybackStatus>("idle");
  const countedForRef = useRef<string | null>(null);
  const startTrackRef = useRef<(track: Track, index: number) => void>(() => {});
  statusRef.current = playbackStatus;

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    repeatRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    queueRef.current = queue;
    indexRef.current = currentIndex;
  }, [queue, currentIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
    };

    const handleEnded = () => {
      const audioElement = audioRef.current;
      const list = queueRef.current;
      const index = indexRef.current;
      if (repeatRef.current === "one" && audioElement && list[index]) {
        countedForRef.current = null;
        audioElement.currentTime = 0;
        void audioElement.play().catch(() => {
          setIsPlaying(false);
          setPlaybackStatus("error");
          setPlaybackError("Não foi possível reproduzir esta música");
        });
        setProgress(0);
        return;
      }
      const nextIndex = resolveNextIndex(index, list, shuffleRef.current, repeatRef.current);
      if (nextIndex === null) {
        setIsPlaying(false);
        setPlaybackStatus("paused");
        setProgress(0);
        return;
      }
      startTrackRef.current(list[nextIndex], nextIndex);
    };

    const handlePlaying = () => {
      const trackId = trackIdRef.current;
      setIsPlaying(true);
      setPlaybackStatus("playing");
      setPlaybackError(null);
      if (trackId && countedForRef.current !== trackId) {
        countedForRef.current = trackId;
        recordPlay(trackId);
      }
    };

    const handlePause = () => {
      if (statusRef.current !== "playing") return;
      setIsPlaying(false);
      setPlaybackStatus("paused");
    };

    const handleError = () => {
      setIsPlaying(false);
      setPlaybackStatus("error");
      setPlaybackError("Não foi possível reproduzir esta música");
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [recordPlay]);

  const startTrack = (track: Track, index: number) => {
    if (!audioRef.current) return;
    trackIdRef.current = track.id;
    countedForRef.current = null;
    setCurrentTrack(track);
    setCurrentIndex(index);
    setPlaybackError(null);
    setPlaybackStatus("loading");
    setIsPlaying(false);
    audioRef.current.src = track.audioUrl;
    void audioRef.current.play().catch(() => {
      setIsPlaying(false);
      setPlaybackStatus("error");
      setPlaybackError("Não foi possível reproduzir esta música");
    });
    setProgress(0);
  };
  startTrackRef.current = startTrack;

  const playTrack = (track: Track, newQueue?: Track[]) => {
    const nextQueue = newQueue?.length ? newQueue : [track];
    const index = Math.max(0, nextQueue.findIndex((item) => item.id === track.id));
    setQueue(nextQueue);
    queueRef.current = nextQueue;
    startTrack(nextQueue[index] ?? track, index === -1 ? 0 : index);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      return;
    }
    setPlaybackError(null);
    setPlaybackStatus("loading");
    void audioRef.current.play().catch(() => {
      setIsPlaying(false);
      setPlaybackStatus("error");
      setPlaybackError("Não foi possível reproduzir esta música");
    });
  };

  const handleSetProgress = (newProgress: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleShuffle = () => setShuffle((current) => !current);

  const cycleRepeat = () => {
    setRepeatMode((current) => (current === "off" ? "all" : current === "all" ? "one" : "off"));
  };

  const playNext = () => {
    const list = queueRef.current;
    const nextIndex = resolveNextIndex(indexRef.current, list, shuffleRef.current, repeatRef.current);
    if (nextIndex === null) return;
    startTrack(list[nextIndex], nextIndex);
  };

  const playPrevious = () => {
    // If more than 3 seconds in, restart current track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    if (currentIndex > 0) {
      const prev = queue[currentIndex - 1];
      if (prev) startTrack(prev, currentIndex - 1);
    }
  };

  const openFullscreen = () => {
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playbackStatus,
        playbackError,
        progress,
        volume,
        isMuted,
        isFavorite,
        isFullscreenOpen,
        shuffle,
        repeatMode,
        queue,
        currentIndex,
        playTrack,
        togglePlay,
        setProgress: handleSetProgress,
        setVolume,
        toggleMute,
        toggleFavorite,
        toggleShuffle,
        cycleRepeat,
        playNext,
        playPrevious,
        openFullscreen,
        closeFullscreen,
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicProvider");
  }
  return context;
}