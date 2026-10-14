import imgMenuSidebar from "figma:asset/97e074a98bd267b7e793590cf7916ed3199aac5e.png";
import svgPaths from "../../imports/svg-l3bgvctykq";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 15.9904" fill="currentColor">
      <path d={svgPaths.p1b846000} />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d={svgPaths.p228fb100} />
    </svg>
  );
}

function PlaylistIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d={svgPaths.p37530f80} />
    </svg>
  );
}

function FavoritesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 15.9983 15.9976" fill="currentColor">
      <path d={svgPaths.p2a54b400} />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14.6667 16" fill="currentColor">
      <path d={svgPaths.p3a2be680} />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16.0003" fill="currentColor">
      <path d={svgPaths.pfb19300} />
      <path d={svgPaths.p30acfa00} />
      <path d={svgPaths.p23679f70} />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 15.9997" fill="currentColor">
      <path d={svgPaths.p7a0c500} />
      <path d={svgPaths.p2c402cb0} />
    </svg>
  );
}

interface SidebarProps {
  activeItem?: string;
  onNavChange?: (item: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ activeItem = "inicio", onNavChange, mobileOpen, onMobileClose }: SidebarProps) {
  const menuItems: NavItem[] = [
    { id: "inicio", label: "Início", icon: <HomeIcon /> },
    { id: "descobrir", label: "Descobrir", icon: <DiscoverIcon /> },
    { id: "playlist", label: "Playlist", icon: <PlaylistIcon /> },
    { id: "favoritos", label: "Favoritos", icon: <FavoritesIcon /> },
  ];

  const profileItems: NavItem[] = [
    { id: "perfil", label: "Perfil", icon: <ProfileIcon /> },
    { id: "configuracoes", label: "Configurações", icon: <SettingsIcon /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "h-full z-50 flex flex-col backdrop-blur-[3.9px]",
          "w-fit shrink-0",
          "border-r border-[#30292b]",
          // Mobile: fixed with slide animation
          "fixed top-0 left-0 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static (part of flex layout)
          "lg:relative lg:translate-x-0",
        ].join(" ")}
        style={{ backgroundColor: "rgba(21, 15, 16, 0.8)" }}
      >
        {/* Logo */}
        <div className="h-[80px] w-full flex items-center pl-[37px] pr-[62px] py-[18px] gap-[12px] shrink-0">
          <div className="bg-[#ff164c] flex h-[34px] items-start pl-[1.36px] pr-[0.68px] py-[1.36px] rounded-[16.32px] shrink-0 w-[33.32px]">
            <div className="mix-blend-plus-lighter rounded-[15.3px] shrink-0 size-[30.6px]">
              <img alt="" className="w-full h-full object-cover pointer-events-none rounded-[15.3px]" src={imgMenuSidebar} />
            </div>
          </div>
          <p className="bg-clip-text bg-gradient-to-b font-bold from-white leading-[1.7] text-[20px] text-transparent to-[#999] tracking-[-1.4px] whitespace-nowrap">
            Mars sound ai
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-[24px] overflow-y-auto scrollbar-hide">
          {/* First menu group */}
          <div className="w-full">
            <div className="flex flex-col gap-[16px] pl-[37px] pr-[62px]">
              <p className="text-[#a19a9b] text-[12px] leading-[1.25]">MENU</p>
              <div className="flex flex-col w-full">
                {menuItems.map((item) => {
                  const isActive = activeItem === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavChange?.(item.id)}
                      className="w-full flex items-center gap-[12px] pl-[8px] pr-[12px] py-[8px] transition-all duration-150 cursor-pointer text-left hover:bg-white/5 rounded-lg"
                    >
                      <span className="shrink-0 size-[16px] overflow-clip" style={{ color: isActive ? "#ff164c" : "#a19a9b" }}>
                        {item.icon}
                      </span>
                      <p className="font-semibold text-[14px] leading-[1.5] whitespace-nowrap transition-colors duration-150" style={{ color: isActive ? "#f8f8f8" : "#a19a9b" }}>
                        {item.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Second menu group */}
          <div className="w-full">
            <div className="flex flex-col gap-[16px] pl-[37px] pr-[62px]">
              <p className="text-[#a19a9b] text-[12px] leading-[1.25]">MENU</p>
              <div className="flex flex-col w-full">
                {profileItems.map((item) => {
                  const isActive = activeItem === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavChange?.(item.id)}
                      className="w-full flex items-center gap-[12px] pl-[8px] pr-[12px] py-[8px] transition-all duration-150 cursor-pointer text-left hover:bg-white/5 rounded-lg"
                    >
                      <span className="shrink-0 size-[16px] overflow-clip" style={{ color: isActive ? "#ff164c" : "#a19a9b" }}>
                        {item.icon}
                      </span>
                      <p className="font-semibold text-[14px] leading-[1.5] whitespace-nowrap" style={{ color: isActive ? "#f8f8f8" : "#a19a9b" }}>
                        {item.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upload button - right after profile section */}
          <div className="w-full px-[37px]">
            <button
              onClick={() => onNavChange?.("carregar-musica")}
              className="w-full flex items-center justify-center gap-[12px] px-[16px] py-[8px] border border-[#ff164c] transition-all duration-150 cursor-pointer hover:bg-[#ff164c]/10"
            >
              <span className="size-[16px] shrink-0" style={{ color: "#f8f8f8" }}>
                <UploadIcon />
              </span>
              <p className="font-semibold text-[14px] leading-[1.5] text-[#f8f8f8] whitespace-nowrap">
                Carregar música AI
              </p>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}