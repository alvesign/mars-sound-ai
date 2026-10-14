import { ReactNode } from "react";
import { Skeleton } from "./skeleton";

interface DataStateProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage: string;
  onRetry: () => void;
  children: ReactNode;
}

export function DataState({ loading, error, empty, emptyMessage, onRetry, children }: DataStateProps) {
  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-[220px] w-[160px] shrink-0 bg-[#30292b]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 py-8">
        <p className="text-[#bababa]">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 font-semibold text-[#f8f8f8]"
          style={{ background: "#ff164c" }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (empty) {
    return <p className="py-8 text-[#bababa]">{emptyMessage}</p>;
  }

  return children;
}
