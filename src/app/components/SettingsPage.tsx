import { useEffect, useState, useRef } from "react";
import { Switch } from "./ui/switch";
import { CategoryChip } from "./ui/CategoryChip";
import { Button } from "./ui/Button";
import { useLibrary } from "../context/LibraryContext";
import { notifySuccess } from "../lib/notify";

// ─── Sub-components ─────────────────────────────────────────────────

// Image upload icon
function PictureIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6Z"
        stroke="#EBE9E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 16L10 13L14.5 18"
        stroke="#EBE9E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 18L17.5 15L21 18"
        stroke="#EBE9E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 9C16.5 9.82843 15.8284 10.5 15 10.5C14.1716 10.5 13.5 9.82843 13.5 9C13.5 8.17157 14.1716 7.5 15 7.5C15.8284 7.5 16.5 8.17157 16.5 9Z"
        fill="#EBE9E9"
      />
    </svg>
  );
}

// Styled input
function SettingsInput({
  placeholder,
  type = "text",
  value,
  onChange,
  defaultValue,
}: {
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  defaultValue?: string;
}) {
  return (
    <div
      className="relative flex-1 min-w-0"
      style={{ border: "1px solid #30292b" }}
    >
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-transparent outline-none px-6 py-2 placeholder-white/20"
        style={{
          color: "#f8f8f8",
          fontSize: "14px",
          fontWeight: 600,
          height: "44px",
        }}
      />
    </div>
  );
}

// Panel card wrapper
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-full"
      style={{
        background: "#24191b",
        border: "1px solid #30292b",
      }}
    >
      <div className="flex flex-col gap-6 p-6">{children}</div>
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────

function ProfileTab() {
  const { profile, updateProfile, genres, tags } = useLibrary();
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [publicProfile, setPublicProfile] = useState(profile.isPublic);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set(profile.genres));
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set(profile.moods));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (!profile.email) return;
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    setPublicProfile(profile.isPublic);
    setAvatarUrl(profile.avatarUrl);
    setSelectedGenres(new Set(profile.genres));
    setSelectedMoods(new Set(profile.moods));
  }, [profile.email, profile.name, profile.username, profile.bio, profile.isPublic, profile.avatarUrl, profile.genres, profile.moods]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleGenre(g: string) {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }

  function toggleMood(m: string) {
    setSelectedMoods((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(String(reader.result || ""));
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Panel 1: Informações do perfil ── */}
      <Panel>
        {/* Title */}
        <div>
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Informações do perfil
          </h2>
        </div>

        {/* Cover + fields */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Cover upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center gap-3 cursor-pointer transition-opacity duration-150 hover:opacity-80 shrink-0"
            style={{
              width: "120px",
              height: "120px",
              border: "1px solid #30292b",
              background: avatarUrl ? "none" : "transparent",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Capa"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <PictureIcon />
                <span
                  className="font-semibold text-center"
                  style={{ fontSize: "14px", color: "#f8f8f8" }}
                >
                  Capa
                </span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Text fields */}
          <div className="flex flex-col gap-4 flex-1 w-full min-w-0">
            {/* Row: Nome + @username */}
            <div className="flex flex-col sm:flex-row gap-4">
              <SettingsInput placeholder="Nome do usuário" value={name} onChange={setName} />
              <SettingsInput placeholder="@username" value={username} onChange={(value) => setUsername(value.replace(/^@/, ""))} />
            </div>
            {/* Bio textarea */}
            <div
              className="relative w-full"
              style={{ border: "1px solid #30292b" }}
            >
              <textarea
                placeholder="Uma frase para representar seu perfil."
                rows={3}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="w-full bg-transparent outline-none resize-none px-6 py-2 placeholder-white/20"
                style={{
                  color: "#f8f8f8",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              />
            </div>
          </div>
        </div>

        {/* Public toggle + Save */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span
                className="font-semibold"
                style={{ fontSize: "14px", color: "#f8f8f8" }}
              >
                Perfil público
              </span>
              <Switch
                checked={publicProfile}
                onCheckedChange={setPublicProfile}
              />
            </div>
            <p style={{ fontSize: "12px", color: "#bababa" }}>
              Outros usuários poderão ver seu perfil e encontrar nas buscas
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!name.trim() || !username.trim()) {
                setProfileMessage("Nome e usuário são obrigatórios.");
                return;
              }
              updateProfile({
                name: name.trim(),
                username: username.trim(),
                bio: bio.trim(),
                isPublic: publicProfile,
                avatarUrl: avatarUrl || profile.avatarUrl,
              });
              setProfileMessage("");
            }}
            className="px-4"
            style={{
              background: "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
              color: "#f8f8f8",
              height: "44px",
            }}
          >
            Salvar alterações
          </Button>
        </div>
        {profileMessage && <p style={{ fontSize: "12px", color: "#bababa" }}>{profileMessage}</p>}
      </Panel>

      {/* ── Panel 2: Preferências musicais ── */}
      <Panel>
        {/* Title */}
        <div>
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Preferências musicais
          </h2>
        </div>

        {/* Genres */}
        <div className="flex flex-col gap-3">
          <p
            className="font-semibold leading-[1.5]"
            style={{ fontSize: "14px", color: "#bfbbbc" }}
          >
            Gêneros favoritos
          </p>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <CategoryChip
                key={genre.slug}
                label={genre.name}
                active={selectedGenres.has(genre.slug)}
                onClick={() => toggleGenre(genre.slug)}
              />
            ))}
          </div>
        </div>

        {/* Moods */}
        <div className="flex flex-col gap-3">
          <p
            className="font-semibold leading-[1.5]"
            style={{ fontSize: "14px", color: "#bfbbbc" }}
          >
            Clima
          </p>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <CategoryChip
                key={tag.slug}
                label={tag.name}
                active={selectedMoods.has(tag.slug)}
                onClick={() => toggleMood(tag.slug)}
              />
            ))}
          </div>
        </div>

        {/* Bottom save */}
        <div
          className="flex justify-end pt-2"
          style={{ borderTop: "1px solid #30292b" }}
        >
          <Button
            type="button"
            onClick={() => {
              updateProfile({
                genres: [...selectedGenres],
                moods: [...selectedMoods],
              });
            }}
            className="flex items-center justify-center px-4 py-2 cursor-pointer transition-opacity duration-150 hover:opacity-90 whitespace-nowrap shrink-0"
            style={{
              background: "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
              color: "#f8f8f8",
              fontSize: "14px",
              fontWeight: 600,
              height: "44px",
            }}
          >
            Salvar alterações
          </Button>
        </div>
      </Panel>
    </div>
  );
}

// ─── Account Tab ─────────────────────────────────────────────────────

function AccountTab({ onLogout }: { onLogout?: () => void }) {
  const { profile, updateProfile, changePassword, resetLibrary } = useLibrary();
  const [email, setEmail] = useState(profile.email);

  useEffect(() => {
    if (profile.email) setEmail(profile.email);
  }, [profile.email]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Panel 1: Informações da conta ── */}
      <Panel>
        <div>
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Informações da conta
          </h2>
        </div>

        {/* Email + current password row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <SettingsInput placeholder="E-mail" type="email" value={email} onChange={setEmail} />
          <SettingsInput placeholder="Senha atual" type="password" value={currentPassword} onChange={setCurrentPassword} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-stretch">
          <SettingsInput placeholder="Nova senha" type="password" value={nextPassword} onChange={setNextPassword} />
          <SettingsInput placeholder="Confirmar nova senha" type="password" value={confirmPassword} onChange={setConfirmPassword} />
          <Button
            type="button"
            onClick={() => {
              void (async () => {
                if (!email.trim().includes("@")) {
                  setAccountMessage("Informe um e-mail válido.");
                  return;
                }
                const passwordChanged = Boolean(nextPassword || confirmPassword);
                if (passwordChanged) {
                  if (nextPassword !== confirmPassword) {
                    setAccountMessage("A confirmação da senha não coincide.");
                    return;
                  }
                  const error = await changePassword(currentPassword, nextPassword);
                  if (error) {
                    setAccountMessage(error);
                    return;
                  }
                  notifySuccess("Senha atualizada");
                }
                if (email.trim() !== profile.email) {
                  updateProfile({ email: email.trim() });
                }
                setCurrentPassword("");
                setNextPassword("");
                setConfirmPassword("");
                setAccountMessage("");
              })();
            }}
            className="px-4"
            style={{
              background: "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
              color: "#f8f8f8",
              height: "44px",
            }}
          >
            Salvar alterações
          </Button>
        </div>
        {accountMessage && <p style={{ fontSize: "12px", color: "#bababa" }}>{accountMessage}</p>}
      </Panel>

      {/* ── Panel 2: Sair da conta ou excluir ── */}
      <Panel>
        <div>
          <h2
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Sair da conta ou excluir
          </h2>
        </div>

        {/* Sign out row */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4"
          style={{ borderBottom: "1px solid #30292b" }}
        >
          <div className="flex flex-col gap-1">
            <p
              className="font-semibold leading-[1.5]"
              style={{ fontSize: "16px", color: "#ebe9e9" }}
            >
              Sair da conta
            </p>
            <p style={{ fontSize: "12px", color: "#bababa" }}>
              Encerrar sua sessão neste dispositivo
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-center px-4 py-2 cursor-pointer transition-opacity duration-150 hover:opacity-90 whitespace-nowrap shrink-0"
            style={{
              background: "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
              color: "#f8f8f8",
              fontSize: "14px",
              fontWeight: 600,
              height: "44px",
            }}
          >
            Sair da conta
          </button>
        </div>

        {/* Delete account row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p
              className="font-semibold leading-[1.5]"
              style={{ fontSize: "16px", color: "#ebe9e9" }}
            >
              Encerrar conta
            </p>
            <p style={{ fontSize: "12px", color: "#bababa" }}>
              Excluir permanentemente sua conta e todos os seus dados
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Excluir conta
          </Button>
        </div>
      </Panel>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="relative w-full max-w-sm flex flex-col gap-6 p-6"
            style={{ background: "#24191b", border: "1px solid #30292b" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <h3 className="font-bold" style={{ fontSize: "18px", color: "#ebe9e9" }}>Sair da conta?</h3>
              <p style={{ fontSize: "13px", color: "#bababa" }}>Sua sessão neste dispositivo será encerrada.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2" style={{ border: "1px solid #5b4f51", color: "#a19a9b" }}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onLogout?.()}
                className="px-4 py-2"
                style={{ background: "linear-gradient(to right, #ff164c 57%, #ea5858 100%)", color: "#f8f8f8" }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="relative w-full max-w-sm flex flex-col gap-6 p-6"
            style={{ background: "#24191b", border: "1px solid #30292b" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <h3
                className="font-bold"
                style={{ fontSize: "18px", color: "#ebe9e9" }}
              >
                Excluir conta permanentemente?
              </h3>
              <p style={{ fontSize: "13px", color: "#bababa" }}>
                Esta ação é irreversível. Todos os seus dados, músicas e
                playlists serão excluídos permanentemente.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 cursor-pointer"
                style={{
                  border: "1px solid #5b4f51",
                  color: "#a19a9b",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  resetLibrary();
                  onLogout?.();
                }}
                className="px-4 py-2 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #ff164c 57%, #ea5858 100%)",
                  color: "#f8f8f8",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Confirmar exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main SettingsPage ────────────────────────────────────────────────

type SettingsTab = "perfil" | "conta";

interface SettingsPageProps {
  onLogout?: () => void;
}

export function SettingsPage({ onLogout }: SettingsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("perfil");

  return (
    <div className="w-full min-h-full flex justify-center">
      {/* Centered container - only for settings page */}
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 lg:py-[38px]">
        {/* ── Page header ── */}
        <div className="flex flex-col gap-2 mb-6">
          <h1
            className="font-bold leading-[1.5]"
            style={{ fontSize: "24px", color: "#ebe9e9" }}
          >
            Configurações
          </h1>
          <p
            className="font-semibold leading-[1.5]"
            style={{ fontSize: "14px", color: "#bfbbbc" }}
          >
            Gerencie sua conta e preferências
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-3 mb-6">
          {(["perfil", "conta"] as SettingsTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === "perfil" ? "Perfil" : "Conta";
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="relative flex items-center justify-center px-4 py-2 cursor-pointer transition-all duration-150 whitespace-nowrap"
                style={{
                  background: isActive
                    ? "linear-gradient(to right, #ff164c 57%, #ea5858 100%)"
                    : "transparent",
                  border: isActive ? "none" : "1px solid #ff164c",
                  color: "#f8f8f8",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "perfil" ? <ProfileTab /> : <AccountTab onLogout={onLogout} />}
      </div>
    </div>
  );
}