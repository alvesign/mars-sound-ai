import { useState, useRef, useCallback } from "react";
import svgPaths from "../../imports/svg-r7seo7qk5p";
import { useLibrary } from "../context/LibraryContext";

interface UploadMusicPageProps {
  onCancel?: () => void;
  onPublished?: () => void;
}

// ── Field error indicator ──
function FieldError({ message }: { message: string }) {
  return (
    <p
      className="flex items-center gap-1 text-[12px] leading-[1.25] mt-1"
      style={{ color: "#ff164c" }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff164c">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      {message}
    </p>
  );
}

export function UploadMusicPage({ onCancel, onPublished }: UploadMusicPageProps) {
  const { publishTrack, profile, genres, tags: tagCatalog } = useLibrary();
  // Audio upload
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Cover upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [aiGenerator, setAiGenerator] = useState("");
  const [category, setCategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ audio?: string; title?: string; agreed?: string; category?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const filteredCategories = genres.filter((genre) =>
    genre.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );
  const selectedGenre = genres.find((genre) => genre.slug === category);

  // ── Audio upload handlers ──
  const handleAudioFile = (file: File) => {
    setAudioFile(file);
    if (errors.audio) setErrors((e) => ({ ...e, audio: undefined }));
    // Simulate progress
    setAudioProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
      }
      setAudioProgress(Math.min(Math.round(p), 100));
    }, 150);
  };

  const handleAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav"))) {
      handleAudioFile(file);
    }
  }, []);

  // ── Cover upload handlers ──
  const handleCoverFile = (file: File) => {
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      handleCoverFile(file);
    }
  }, []);

  // ── Tags ──
  const addTag = (tag: string) => {
    const t = tag.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const validate = () => {
    const newErrors: { audio?: string; title?: string; agreed?: string; category?: string } = {};
    if (!audioFile) newErrors.audio = "Por favor, faça o upload de um arquivo de áudio (MP3 ou WAV até 50MB).";
    else if (audioFile.size > 50 * 1024 * 1024) newErrors.audio = "O arquivo passa de 50 MB.";
    if (!title.trim()) newErrors.title = "O título da música é obrigatório.";
    if (!category) newErrors.category = "Escolha um gênero.";
    if (!agreed) newErrors.agreed = "Você precisa concordar com os Termos de Uso para continuar.";
    return newErrors;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || !audioFile) return;
    void publishTrack({
      title: title.trim(),
      artist: aiGenerator.trim() || profile.name,
      image: coverPreview || "",
      category,
      album: selectedGenre?.name || "",
      moods: tags,
      aiModel: aiGenerator.trim(),
      aiPrompt: prompt.trim(),
      audioFile,
      coverFile,
    })
      .then(() => onPublished?.())
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Não foi possível publicar a música.";
        setErrors((current) => ({ ...current, title: message }));
      });
  };

  const hasError = (field: "audio" | "title" | "agreed" | "category") => submitted && !!errors[field];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 lg:py-[40px]">
        
        {/* ── Page Title ── */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="font-bold text-[24px] leading-[1.5]" style={{ color: "#ebe9e9" }}>
            Carregue sua música
          </h1>
          <p className="font-semibold text-[16px] leading-[1.5]" style={{ color: "#bfbbbc" }}>
            Compartilhe suas criações de IA com a comunidade
          </p>
        </div>

        <div className="flex flex-col gap-[22px]">

          {/* ── Upload Section ── */}
          <div
            className="relative"
            style={{ background: "#24191b", border: "1px solid #30292b" }}
          >
            <div className="p-6">
              <h2 className="font-bold text-[24px] leading-[1.5] mb-6" style={{ color: "#ebe9e9" }}>
                Faça upload da sua música e capa
              </h2>
              <div className="flex flex-col sm:flex-row gap-6">

                {/* Audio upload zone */}
                <div className="flex-1 flex flex-col">
                  <div
                    className={[
                      "flex-1 flex flex-col items-center justify-center gap-4 p-6 cursor-pointer transition-colors duration-200",
                      "min-h-[280px]",
                    ].join(" ")}
                    style={{ border: `2.694px solid ${isDraggingAudio ? "#ff164c" : hasError("audio") ? "#ff164c" : "#30292b"}`,
                      background: hasError("audio") ? "rgba(255,22,76,0.04)" : "transparent" }}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                    onDragLeave={() => setIsDraggingAudio(false)}
                    onDrop={handleAudioDrop}
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/mp3,audio/wav,.mp3,.wav"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleAudioFile(e.target.files[0])}
                    />

                    {/* Music icon */}
                    <div className="relative size-[79px] overflow-clip shrink-0">
                      <svg className="absolute block size-full" fill="none" viewBox="0 0 32 32" />
                      <div className="absolute inset-[12.5%_4.17%]">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 72.4171 59.2504">
                          <path d={svgPaths.p6552b80} fill="#F8F8F8" />
                        </svg>
                      </div>
                    </div>

                    {audioFile ? (
                      <div className="flex flex-col items-center gap-3 w-full">
                        <p className="font-bold text-[18px] text-center" style={{ color: "#f8f8f8" }}>
                          {audioFile.name}
                        </p>
                        <p className="text-[12px]" style={{ color: "#bababa" }}>
                          {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        {/* Progress bar */}
                        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#5b4f51" }}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${audioProgress}%`,
                              background: "linear-gradient(90deg, #ff164c, #ea5858)",
                            }}
                          />
                        </div>
                        <p className="text-[12px] font-semibold" style={{ color: audioProgress === 100 ? "#ff164c" : "#bababa" }}>
                          {audioProgress === 100 ? "✓ Arquivo carregado" : `${audioProgress}%`}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-2">
                          <p className="font-bold text-[18px] text-center leading-[1.5]" style={{ color: "#f8f8f8" }}>
                            Carregar áudio
                          </p>
                          <p className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                            Mp3, WAV até 50mb
                          </p>
                        </div>
                        <button
                          className="px-[16px] py-[8px] font-semibold text-[16px] leading-[1.5] transition-opacity hover:opacity-90 min-h-[44px]"
                          style={{
                            background: "linear-gradient(90deg, #ff164c 57.214%, #ea5858)",
                            color: "#f8f8f8",
                          }}
                          onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }}
                        >
                          Selecionar arquivo
                        </button>
                      </>
                    )}
                  </div>
                  {hasError("audio") && <FieldError message={errors.audio!} />}
                </div>

                {/* Cover upload zone */}
                <div
                  className={[
                    "flex-1 flex flex-col items-center justify-center gap-4 p-6 cursor-pointer transition-colors duration-200",
                    "min-h-[280px]",
                  ].join(" ")}
                  style={{ border: `2.694px solid ${isDraggingCover ? "#ff164c" : "#30292b"}` }}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={handleCoverDrop}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCoverFile(e.target.files[0])}
                  />

                  {coverPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative size-[120px] overflow-hidden" style={{ border: "1px solid #30292b" }}>
                        <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
                      </div>
                      <button
                        className="px-[16px] py-[8px] font-semibold text-[14px] leading-[1.5] transition-opacity hover:opacity-90 min-h-[44px]"
                        style={{
                          background: "linear-gradient(90deg, #ff164c 57.214%, #ea5858)",
                          color: "#f8f8f8",
                        }}
                        onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                      >
                        Alterar capa
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Picture icon */}
                      <div className="relative size-[64.657px] overflow-clip shrink-0">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64.6567 64.6567">
                          <g>
                            <path d={svgPaths.p959d900} fill="#EBE9E9" />
                            <path d={svgPaths.p12218b00} fill="#EBE9E9" />
                          </g>
                        </svg>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-bold text-[18px] text-center leading-[1.5]" style={{ color: "#f8f8f8" }}>
                          Carregar capa
                        </p>
                        <p className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                          PNG, JPEG até 2mb
                        </p>
                      </div>
                      <button
                        className="px-[16px] py-[8px] font-semibold text-[16px] leading-[1.5] transition-opacity hover:opacity-90 min-h-[44px]"
                        style={{
                          background: "linear-gradient(90deg, #ff164c 57.214%, #ea5858)",
                          color: "#f8f8f8",
                        }}
                        onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                      >
                        Selecionar arquivo
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── Details Section ── */}
          <div
            className="relative"
            style={{ background: "#24191b", border: "1px solid #30292b" }}
          >
            <div className="p-6 flex flex-col gap-6">
              <h2 className="font-bold text-[24px] leading-[1.5]" style={{ color: "#ebe9e9" }}>
                Detalhes da música
              </h2>

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                  Título da música <span style={{ color: "#ff164c" }}>*</span>
                </label>
                <div
                  style={{ border: `1px solid ${hasError("title") ? "#ff164c" : "#30292b"}`,
                    background: hasError("title") ? "rgba(255,22,76,0.04)" : "transparent" }}
                  className="hover:border-[#ff164c]/50 transition-colors"
                >
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((er) => ({ ...er, title: undefined }));
                    }}
                    placeholder="Ex: Neon Gênesis..."
                    className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none min-h-[44px]"
                    style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                    aria-invalid={hasError("title")}
                    aria-describedby={hasError("title") ? "title-error" : undefined}
                  />
                </div>
                {hasError("title") && <FieldError message={errors.title!} />}
              </div>

              {/* Category + AI Generator */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Category dropdown */}
                <div className="flex-1 flex flex-col gap-2 relative">
                  <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                    Categoria
                  </label>
                  <button
                    className="w-full flex items-center justify-between px-6 py-2 text-left transition-colors min-h-[44px]"
                    style={{ border: "1px solid #30292b", color: "#f8f8f8" }}
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    type="button"
                  >
                    <span className="font-semibold text-[16px] leading-[1.5]">
                      {selectedGenre?.name || "Todas as categorias"}
                    </span>
                    <svg
                      className={`shrink-0 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
                      width="16" height="16" fill="none" viewBox="0 0 9.33439 4.7821"
                    >
                      <path d={svgPaths.p3c6a5200} fill="#FF164C" />
                    </svg>
                  </button>

                  {categoryOpen && (
                    <div
                      className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden"
                      style={{ background: "#24191b", border: "1px solid #30292b" }}
                    >
                      {/* Search inside dropdown */}
                      <div className="p-2" style={{ borderBottom: "1px solid #30292b" }}>
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Buscar categoria..."
                          className="w-full bg-transparent px-3 py-1 text-[14px] outline-none"
                          style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((genre) => (
                            <button
                              key={genre.slug}
                              className="w-full text-left px-6 py-2 text-[14px] font-semibold transition-colors hover:bg-white/5 min-h-[44px]"
                              style={{ color: category === genre.slug ? "#ff164c" : "#f8f8f8" }}
                              onClick={() => {
                                setCategory(genre.slug);
                                if (errors.category) setErrors((current) => ({ ...current, category: undefined }));
                                setCategorySearch("");
                                setCategoryOpen(false);
                              }}
                            >
                              {genre.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-6 py-3 text-[13px]" style={{ color: "#bababa" }}>
                            Nenhuma categoria encontrada
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {hasError("category") && <FieldError message={errors.category!} />}
                </div>

                {/* AI Generator */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                    Nome da IA geradora
                  </label>
                  <div style={{ border: "1px solid #30292b" }} className="hover:border-[#ff164c]/50 transition-colors">
                    <input
                      type="text"
                      value={aiGenerator}
                      onChange={(e) => setAiGenerator(e.target.value)}
                      placeholder="Nome da IA"
                      className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none min-h-[44px]"
                      style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                  Tags (clima, sensação, uso)
                </label>

                {/* Tag input with existing tags */}
                <div
                  className="flex flex-wrap gap-2 px-4 py-2 min-h-[44px] items-center hover:border-[#ff164c]/50 transition-colors"
                  style={{ border: "1px solid #30292b" }}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-0.5 text-[13px] font-semibold"
                      style={{ border: "1px solid #ff164c", color: "#f8f8f8" }}
                    >
                      #{tagCatalog.find((item) => item.slug === tag)?.name ?? tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:opacity-70 transition-opacity ml-1 min-w-[20px] min-h-[20px] flex items-center justify-center"
                        style={{ color: "#a19a9b" }}
                        aria-label={`Remover tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Adicione Tags personalizadas (pressione Enter)" : ""}
                    className="flex-1 min-w-[180px] bg-transparent py-1 font-semibold text-[14px] outline-none placeholder:opacity-20"
                    style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                  />
                </div>

                {/* Tag suggestions */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                    Sugestões
                  </span>
                  {tagCatalog.filter((item) => !tags.includes(item.slug)).map((item) => (
                    <button
                      key={item.slug}
                      onClick={() => addTag(item.slug)}
                      className="flex items-center gap-1 px-2 py-1 text-[13px] font-semibold transition-opacity hover:opacity-80 min-h-[32px]"
                      style={{ border: "1px solid #ff164c", color: "#f8f8f8" }}
                    >
                      <span style={{ color: "#ff164c" }}>+</span> {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Prompt */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                  Prompt de geração (opcional)
                </label>
                <div
                  className="hover:border-[#ff164c]/50 transition-colors"
                  style={{ border: "1px solid #30292b" }}
                >
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Cole aqui o prompt que você usou para criar esta música..."
                    rows={4}
                    className="w-full bg-transparent px-6 py-2 font-semibold text-[16px] leading-[1.5] outline-none resize-none placeholder:opacity-20"
                    style={{ color: "#f8f8f8", caretColor: "#ff164c" }}
                  />
                </div>
                <p
                  className="text-[12px] leading-[1.25]"
                  style={{ color: "#bababa", opacity: 0.5 }}
                >
                  Seu prompt pode ser compartilhado por outros usuários da plataforma e utilizado em novas músicas.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px w-full" style={{ background: "#766c6e" }} />

              {/* Footer row: terms + buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Checkbox */}
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-5 h-5 shrink-0 flex items-center justify-center cursor-pointer transition-colors"
                      style={{
                        background: agreed ? "#ff164c" : "#30292b",
                        border: `1px solid ${agreed ? "#ff164c" : hasError("agreed") ? "#ff164c" : "#5b4f51"}`,
                        outline: hasError("agreed") ? "1px solid rgba(255,22,76,0.4)" : "none",
                      }}
                      onClick={() => {
                        setAgreed(!agreed);
                        if (errors.agreed) setErrors((e) => ({ ...e, agreed: undefined }));
                      }}
                    >
                      {agreed && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <p className="text-[12px] leading-[1.25]" style={{ color: "#bababa" }}>
                      Concordo com os{" "}
                      <span className="underline cursor-pointer" style={{ color: "#ff164c" }}>Termos de uso</span>{" "}
                      e{" "}
                      <span className="underline cursor-pointer" style={{ color: "#ff164c" }}>Políticas de privacidade</span>{" "}
                      da plataforma. <span style={{ color: "#ff164c" }}>*</span>
                    </p>
                  </label>
                  {hasError("agreed") && <FieldError message={errors.agreed!} />}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 font-semibold text-[16px] leading-[1.5] transition-colors hover:bg-white/5 min-h-[44px]"
                    style={{ border: "1px solid #ff164c", color: "#f8f8f8" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 font-semibold text-[16px] leading-[1.5] transition-opacity hover:opacity-90 min-h-[44px]"
                    style={{
                      background: "linear-gradient(90deg, #ff164c 57.214%, #ea5858)",
                      color: "#f8f8f8",
                    }}
                  >
                    Salvar alterações
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}