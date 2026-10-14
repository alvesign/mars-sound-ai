import { CategoryChip } from "./ui/CategoryChip";
import { MusicCard } from "./ui/MusicCard";
import { DataState } from "./ui/DataState";
import { useLibrary } from "../context/LibraryContext";
import { CatalogTrack } from "../types/library";

interface HomePageProps {
  onOpenDiscover?: (category?: string) => void;
  onOpenCreator?: (userId: string) => void;
}

export function HomePage({ onOpenDiscover, onOpenCreator }: HomePageProps) {
  const {
    tracks,
    genres,
    creators,
    creatorsError,
    trendingTracks,
    recentTracks,
    recommendedTracks,
    recommendationsError,
    loading,
    error,
    retry,
  } = useLibrary();

  return (
    <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
      <div className="w-full px-4 sm:px-6 lg:px-[37px] py-6 lg:py-[38px] space-y-8 lg:space-y-[38px]">
        <section>
          <h2 className="text-lg sm:text-xl lg:text-[24px] font-semibold text-white mb-4">Top criadores</h2>
          <div className="overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 lg:mx-0">
            {creatorsError ? (
              <div className="flex flex-col items-start gap-3 py-4">
                <p className="text-[#bababa]">{creatorsError}</p>
                <button type="button" onClick={retry} className="px-4 py-2 font-semibold text-[#f8f8f8]" style={{ background: "#ff164c" }}>
                  Tentar novamente
                </button>
              </div>
            ) : !loading && !error && creators.length === 0 ? (
              <p className="py-4 text-[#bababa]">Nenhum criador encontrado</p>
            ) : (
            <div className="flex gap-4 px-4 sm:px-6 lg:px-0">
              {creators.map((creator) => (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => onOpenCreator?.(creator.id)}
                  className="relative flex-none w-[140px] sm:w-[160px] lg:w-[175px] h-[220px] sm:h-[250px] lg:h-[279px] overflow-hidden text-left"
                  style={{ border: "1px solid #30292b" }}
                >
                  <img src={creator.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[38%] to-black" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4">
                    <p className="font-semibold truncate text-white" style={{ fontSize: "14px" }}>{creator.name}</p>
                    <p className="truncate" style={{ color: "#bababa", fontSize: "12px" }}>@{creator.username}</p>
                  </div>
                </button>
              ))}
            </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl lg:text-[24px] font-semibold text-white">Categorias</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {genres.map((genre) => (
              <CategoryChip key={genre.slug} label={genre.name} onClick={() => onOpenDiscover?.(genre.slug)} />
            ))}
          </div>
        </section>

        <DataState
          loading={loading}
          error={error}
          empty={tracks.length === 0}
          emptyMessage="Nenhuma música encontrada"
          onRetry={retry}
        >
          <>
            <TrackRail title="Em alta agora" tracks={trendingTracks} emptyMessage="Nenhuma música encontrada" onSeeAll={() => onOpenDiscover?.()} />
            <TrackRail title="Lançamentos recentes" tracks={recentTracks} emptyMessage="Nenhuma música encontrada" onSeeAll={() => onOpenDiscover?.()} />
            <TrackRail
              title="Recomendados para você"
              tracks={recommendedTracks}
              emptyMessage={recommendationsError ?? "Nenhuma recomendação para o seu perfil"}
              onRetry={recommendationsError ? retry : undefined}
              onSeeAll={() => onOpenDiscover?.()}
            />
          </>
        </DataState>
      </div>
    </div>
  );
}

function TrackRail({
  title,
  tracks,
  emptyMessage,
  onRetry,
  onSeeAll,
}: {
  title: string;
  tracks: CatalogTrack[];
  emptyMessage: string;
  onRetry?: () => void;
  onSeeAll: () => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl lg:text-[24px] font-semibold text-white">{title}</h2>
        <button type="button" onClick={onSeeAll} className="text-sm" style={{ color: "#a19a9b" }}>
          Ver tudo
        </button>
      </div>
      {tracks.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-4">
          <p className="text-[#bababa]">{emptyMessage}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="px-4 py-2 font-semibold text-[#f8f8f8]" style={{ background: "#ff164c" }}>
              Tentar novamente
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 lg:mx-0">
          <div className="flex gap-4 px-4 sm:px-6 lg:px-0">
            {tracks.map((track) => (
              <MusicCard key={`${title}-${track.id}`} track={track} queue={tracks} className="w-[160px] sm:w-[180px] shrink-0" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
