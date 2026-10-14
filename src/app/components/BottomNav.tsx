import svgPaths from "../../imports/svg-67owiawy17";

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d={svgPaths.p3c0bf880} />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d={svgPaths.p56ff800} />
    </svg>
  );
}

function PlaylistIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d={svgPaths.p364de200} />
    </svg>
  );
}

function FavoritesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d={svgPaths.p3d899000} />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

interface BottomNavProps {
  activeItem: string;
  onNavChange: (item: string) => void;
}

export function BottomNav({ activeItem, onNavChange }: BottomNavProps) {
  const items = [
    { id: "inicio",    label: "Início",    icon: <HomeIcon /> },
    { id: "descobrir", label: "Descobrir", icon: <DiscoverIcon /> },
    { id: "playlist",  label: "Playlist",  icon: <PlaylistIcon /> },
    { id: "favoritos", label: "Favoritos", icon: <FavoritesIcon /> },
    { id: "perfil",    label: "Perfil",    icon: <ProfileIcon /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[95] flex items-stretch lg:hidden"
      style={{
        backgroundColor: "var(--color-bg-sidebar)",
        borderTop: "1px solid var(--color-border-subtle)",
        height: "60px",
      }}
    >
      {items.map((item) => {
        const isActive = activeItem === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors duration-150 min-w-[44px]"
            style={{
              color: isActive ? "var(--color-brand)" : "var(--color-text-muted)",
            }}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            {item.icon}
            <span style={{ fontSize: "10px" }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}