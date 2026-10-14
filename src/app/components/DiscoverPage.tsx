import { useEffect, useMemo, useState } from "react";
import { SearchInput } from "./ui/SearchInput";
import { CategoryChip } from "./ui/CategoryChip";
import { MusicCard } from "./ui/MusicCard";
import { DataState } from "./ui/DataState";
import { useLibrary } from "../context/LibraryContext";

interface DiscoverPageProps {
  externalSearchQuery?: string;
  initialCategory?: string;
}

export function DiscoverPage({ externalSearchQuery = "", initialCategory = "Todos" }: DiscoverPageProps) {
  const { tracks: allTracks, genres, tags, loading, error, retry } = useLibrary();
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeMood, setActiveMood] = useState("Todos");

  // Sync external search query (from Navbar debounced search)
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Filtrar músicas baseado na busca e categoria
  const filteredTracks = useMemo(() => {
    let result = allTracks;

    // Filtrar por categoria
    if (activeCategory !== "Todos") {
      result = result.filter((track) => track.categorySlug === activeCategory);
    }

    if (activeMood !== "Todos") {
      result = result.filter((track) => track.moodSlugs.includes(activeMood));
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (track) =>
          track.title.toLowerCase().includes(query) ||
          track.artist.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allTracks, searchQuery, activeCategory, activeMood]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-[37px] py-6 lg:py-8">
        {/* Title and subtitle */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-2">Descobrir</h1>
          <p className="text-[#a19a9b] text-sm sm:text-base">
            Encontre sua próxima música criada com AI
          </p>
        </div>

        {/* Search input dentro do conteúdo */}
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar músicas ou artistas"
          />
        </div>

        {hasSearchQuery ? (
          // VARIANT: Search Results (List view)
          <div className="space-y-4">
            <p className="text-[#a19a9b] text-sm mb-4">
              {filteredTracks.length} resultado{filteredTracks.length !== 1 ? "s" : ""} encontrado{filteredTracks.length !== 1 ? "s" : ""}
            </p>
            {filteredTracks.length > 0 ? (
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <MusicCard key={track.id} track={track} variant="list" queue={filteredTracks} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-[#a19a9b] text-lg mb-4">
                  Nenhum resultado encontrado
                </p>
                <p className="text-[#5b4f51] text-sm">
                  Tente buscar por outro termo
                </p>
              </div>
            )}

          </div>
        ) : (
          // VARIANT: Default (Grid view with categories)
          <>
            {/* Categories */}
            <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              <span className="text-[#a19a9b] text-sm font-semibold shrink-0">
                Categorias
              </span>
              <div className="flex items-center gap-2 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                <CategoryChip
                  label="Todos"
                  active={activeCategory === "Todos"}
                  onClick={() => setActiveCategory("Todos")}
                />
                {genres.map((genre) => (
                  <CategoryChip
                    key={genre.slug}
                    label={genre.name}
                    active={activeCategory === genre.slug}
                    onClick={() => setActiveCategory(genre.slug)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              <span className="text-[#a19a9b] text-sm font-semibold shrink-0">Clima</span>
              <CategoryChip
                label="Todos"
                active={activeMood === "Todos"}
                onClick={() => setActiveMood("Todos")}
              />
              {tags.map((tag) => (
                <CategoryChip
                  key={tag.slug}
                  label={tag.name}
                  active={activeMood === tag.slug}
                  onClick={() => setActiveMood(tag.slug)}
                />
              ))}
            </div>

            {/* Music Grid */}
            <DataState
              loading={loading}
              error={error}
              empty={filteredTracks.length === 0}
              emptyMessage="Nenhuma música encontrada"
              onRetry={retry}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
                {filteredTracks.map((track) => (
                  <MusicCard key={track.id} track={track} variant="grid" queue={filteredTracks} />
                ))}
              </div>
            </DataState>
          </>
        )}
      </div>
    </div>
  );
}