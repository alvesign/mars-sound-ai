import { useState, useEffect } from "react";
import svgPaths from "../../imports/svg-upld88zslp";

interface PlaylistData {
  name: string;
  description: string;
  isPublic: boolean;
  coverImage?: string;
}

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: PlaylistData) => void;
  /** If provided, the modal opens in edit mode pre-filled with these values */
  initialData?: PlaylistData;
  mode?: "create" | "edit";
}

export function CreatePlaylistModal({ isOpen, onClose, onCreate, initialData, mode = "create" }: CreatePlaylistModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState<string>("");

  // Sync with initialData when opening in edit mode
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name ?? "");
      setDescription(initialData.description ?? "");
      setIsPublic(initialData.isPublic ?? true);
      setCoverImage(initialData.coverImage ?? "");
    } else if (isOpen && mode === "create") {
      setName("");
      setDescription("");
      setIsPublic(true);
      setCoverImage("");
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const isEdit = mode === "edit";

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({ name, description, isPublic, coverImage });
    if (!isEdit) {
      setName("");
      setDescription("");
      setIsPublic(true);
      setCoverImage("");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-[#24191b] border border-[#30292b] p-6 w-full max-w-[687px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-[24px] text-[#ebe9e9] leading-[1.5]">
            {isEdit ? "Editar playlist" : "Criar playlist"}
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d={svgPaths.p2b31e200} fill="#ebe9e9" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#766c6e] mb-6" />

        {/* Form */}
        <div className="space-y-6">
          {/* Cover image and inputs row */}
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="relative w-[137px] h-[137px] flex-shrink-0 border border-[#30292b] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#ff164c] transition-colors overflow-hidden">
              {coverImage && (
                <img src={coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setCoverImage(String(reader.result || ""));
                  reader.readAsDataURL(file);
                }}
              />
              {!coverImage && (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d={svgPaths.p10ab0370} fill="#ebe9e9" />
                    <path d={svgPaths.p17084a00} fill="#ebe9e9" />
                  </svg>
                  <p className="font-semibold text-[16px] text-[#f8f8f8] leading-[1.5]">
                    Capa
                  </p>
                </>
              )}
            </label>

            {/* Inputs */}
            <div className="flex-1 space-y-6">
              {/* Name input */}
              <div className="border border-[#30292b] hover:border-[#ff164c]/50 transition-colors">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da playlist"
                  className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] text-[#f8f8f8] leading-[1.5] placeholder:text-[#f8f8f8]/20 outline-none"
                />
              </div>

              {/* Description textarea */}
              <div className="border border-[#30292b] hover:border-[#ff164c]/50 transition-colors">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição da playlist"
                  rows={3}
                  className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] text-[#f8f8f8] leading-[1.5] placeholder:text-[#f8f8f8]/20 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer with toggle and buttons */}
          <div className="flex items-center justify-between">
            {/* Public toggle */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-[16px] text-[#f8f8f8] leading-[1.5]">
                  Pública
                </p>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className="relative w-[34px] h-[14px] rounded-full transition-colors"
                  style={{ backgroundColor: isPublic ? "#ff6387" : "#5b4f51" }}
                >
                  <div
                    className="absolute top-[-2px] w-[18px] h-[18px] rounded-full bg-[#ff164c] transition-all duration-200"
                    style={{ left: isPublic ? "16px" : "0px" }}
                  />
                </button>
              </div>
              <p className="text-[12px] text-[#bababa] leading-[1.25]">
                Outros usuários poderão ver e ouvir
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-[#ff164c] font-semibold text-[16px] text-[#f8f8f8] leading-[1.5] hover:bg-[#ff164c]/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#ff164c] from-[57.214%] to-[#ea5858] font-semibold text-[16px] text-[#f8f8f8] leading-[1.5] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {isEdit ? "Salvar alterações" : "Criar playlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}