import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { MusicProvider } from "./context/MusicContext";
import { LibraryProvider, useLibrary } from "./context/LibraryContext";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { MusicPlayer } from "./components/MusicPlayer";
import { MiniPlayer } from "./components/MiniPlayer";
import { FullScreenMobilePlayer } from "./components/FullScreenMobilePlayer";
import { HomePage } from "./components/HomePage";
import { DiscoverPage } from "./components/DiscoverPage";
import { PlaylistsPage } from "./components/PlaylistsPage";
import { PlaylistDetailPage } from "./components/PlaylistDetailPage";
import { FavoritesPage } from "./components/FavoritesPage";
import { ProfilePage } from "./components/ProfilePage";
import { SettingsPage } from "./components/SettingsPage";
import { BottomNav } from "./components/BottomNav";
import { UploadMusicPage } from "./components/UploadMusicPage";
import { AuthPage } from "./components/AuthPage";
import bgImage from "figma:asset/755a0ad35d80d322f261566363a27bca5637a26e.png";

const PAGE_LABELS: Record<string, string> = {
  descobrir: "Descobrir",
  playlist: "Playlist",
  favoritos: "Favoritos",
  perfil: "Perfil",
  configuracoes: "Configurações",
  "carregar-musica": "Carregar Música AI",
};

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

export default function App() {
  return (
    <LibraryProvider>
      <Toaster
        theme="dark"
        position="top-center"
        closeButton
        toastOptions={{
          style: {
            background: "#24191b",
            border: "1px solid #30292b",
            color: "#f8f8f8",
          },
        }}
      />
      <AppShell />
    </LibraryProvider>
  );
}

function AppShell() {
  const [activeNav, setActiveNav] = useState("inicio");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverCategory, setDiscoverCategory] = useState("Todos");
  const { openCreator, actionError, clearActionError } = useLibrary();

  const handleSearch = (query: string) => {
    setDiscoverQuery(query);
    if (query.trim()) {
      setDiscoverCategory("Todos");
      setActiveNav("descobrir");
    }
  };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(data.session));
      setSessionReady(true);
    }).catch(() => {
      if (!mounted) return;
      setIsAuthenticated(false);
      setSessionReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setSessionReady(true);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const startSession = () => {
    setIsAuthenticated(true);
  };

  const endSession = () => {
    void supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (!sessionReady) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: "var(--color-bg-base, #0d0d0d)" }}
      >
        <p className="text-sm text-[#bababa]">Carregando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AnimatePresence>
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AuthPage onAuthenticated={startSession} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <MusicProvider>
      <div
        className="h-screen overflow-hidden relative"
        style={{ backgroundColor: "var(--color-bg-base)" }}
      >
        {/* Background image */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <img 
            src={bgImage} 
            alt="" 
            className="w-full h-full object-cover opacity-10"
            style={{ mixBlendMode: "lighten" }}
          />
        </div>

        {/* ────────── HORIZONTAL LAYOUT: Sidebar + Main Content ────────── */}
        <div className="flex h-screen relative z-10">
          
          {/* ────────── Sidebar (Left - Fixed Width) ────────── */}
          <Sidebar
            activeItem={activeNav}
            onNavChange={(item) => {
              setActiveNav(item);
              setSidebarOpen(false);
            }}
            mobileOpen={sidebarOpen}
            onMobileClose={() => setSidebarOpen(false)}
          />

          {/* ────────── Main Content (Right - Fill Container) ────────── */}
          <div className="flex flex-col flex-1 h-screen overflow-hidden lg:ml-0">
            
            {/* Navbar - Top (Fill Width) */}
            <Navbar 
              onMenuToggle={() => setSidebarOpen(true)}
              onAvatarClick={() => setActiveNav("configuracoes")}
              onSearch={handleSearch}
              onUploadClick={() => setActiveNav("carregar-musica")}
            />

            {/* Body - Scrollable Content (Fill Container) */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-[132px] lg:pb-[90px] relative">
              {actionError && (
                <div className="mx-4 mt-4 flex items-center justify-between gap-3 px-4 py-3 sm:mx-6 lg:mx-[37px]" style={{ border: "1px solid #ff164c", background: "#24191b" }}>
                  <p style={{ color: "#f8f8f8" }}>{actionError}</p>
                  <button type="button" onClick={clearActionError} className="shrink-0 font-semibold" style={{ color: "#ff164c" }}>
                    Fechar
                  </button>
                </div>
              )}
              <AnimatePresence mode="wait">
                {activeNav === "inicio" ? (
                  <motion.div
                    key="inicio"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <HomePage
                      onOpenDiscover={(category) => {
                        setDiscoverCategory(category ?? "Todos");
                        setDiscoverQuery("");
                        setActiveNav("descobrir");
                      }}
                      onOpenCreator={(userId) => {
                        openCreator(userId);
                        setActiveNav("perfil-publico");
                      }}
                    />
                  </motion.div>
                ) : activeNav === "descobrir" ? (
                  <motion.div
                    key="descobrir"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <DiscoverPage externalSearchQuery={discoverQuery} initialCategory={discoverCategory} />
                  </motion.div>
                ) : activeNav === "playlist" ? (
                  <motion.div
                    key="playlist"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <PlaylistsPage
                      onPlaylistClick={(playlist) => {
                        setSelectedPlaylistId(playlist.id);
                        setActiveNav("playlist-detail");
                      }}
                    />
                  </motion.div>
                ) : activeNav === "playlist-detail" ? (
                  <motion.div
                    key="playlist-detail"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <PlaylistDetailPage
                      playlistId={selectedPlaylistId}
                      onBack={() => setActiveNav("playlist")}
                    />
                  </motion.div>
                ) : activeNav === "favoritos" ? (
                  <motion.div
                    key="favoritos"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <FavoritesPage />
                  </motion.div>
                ) : activeNav === "perfil" ? (
                  <motion.div
                    key="perfil"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <ProfilePage
                      isPublic={false}
                      onEditProfile={() => setActiveNav("configuracoes")}
                    />
                  </motion.div>
                ) : activeNav === "perfil-publico" ? (
                  <motion.div
                    key="perfil-publico"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <ProfilePage isPublic={true} />
                  </motion.div>
                ) : activeNav === "configuracoes" ? (
                  <motion.div
                    key="configuracoes"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <SettingsPage onLogout={endSession} />
                  </motion.div>
                ) : activeNav === "carregar-musica" ? (
                  <motion.div
                    key="carregar-musica"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <UploadMusicPage
                      onCancel={() => setActiveNav("inicio")}
                      onPublished={() => setActiveNav("perfil")}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeNav}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <PlaceholderPage title={PAGE_LABELS[activeNav] ?? activeNav} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ────────── Bottom nav (mobile only - Layer above content) ────────── */}
        <BottomNav activeItem={activeNav} onNavChange={setActiveNav} />

        {/* ────────── Fixed music player (Absolute Position - Top Layer) ────────── */}
        <MusicPlayer />
        <MiniPlayer />
        <FullScreenMobilePlayer />
      </div>
    </MusicProvider>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8"
      style={{ color: "var(--color-text-muted)" }}
    >
      <svg
        width="52"
        height="52"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ opacity: 0.2 }}
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
      <p className="font-semibold" style={{ fontSize: "18px", color: "var(--color-text-primary)" }}>
        {title}
      </p>
      <p
        style={{
          fontSize: "13px",
          textAlign: "center",
          maxWidth: "300px",
          lineHeight: 1.7,
        }}
      >
        Esta seção está sendo desenvolvida. Continue explorando a plataforma!
      </p>
    </div>
  );
}