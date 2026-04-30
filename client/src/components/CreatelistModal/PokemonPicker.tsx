import type { RefObject } from "react";
import type { Pokemon } from "@shared";
import { toCardModel } from "@helpers/toCardModel";
import { PokemonCard } from "../PokemonCard";
import { MIN_SELECTED_POKEMON } from "@constants/pokemon";

type Props = {
  items: Pokemon[];
  totalCount: number;
  hasMore: boolean;
  initialLoading: boolean;
  loadingMore: boolean;
  error: string | null;
  selected: Set<number>;
  onToggleNumber: (n: number) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

export function PokemonPicker({
  items,
  totalCount,
  hasMore,
  initialLoading,
  loadingMore,
  error,
  selected,
  onToggleNumber,
  scrollRef,
  sentinelRef,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-neutral-700">Pokemon</label>
        <span className="text-sm text-neutral-600">
          {selected.size} selected
          {selected.size < MIN_SELECTED_POKEMON ? (
            <span className="text-neutral-400">
              {" "}
              (need at least {MIN_SELECTED_POKEMON})
            </span>
          ) : null}
        </span>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="min-h-[220px] flex-1 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 sm:min-h-[280px]"
      >
        {initialLoading ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-neutral-500">
            Loading Pokemon…
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((p) => (
                <PokemonCard
                  key={p._id}
                  pokemon={toCardModel(p)}
                  selected={selected.has(p.number)}
                  onToggle={() => onToggleNumber(p.number)}
                />
              ))}
            </div>
            <div ref={sentinelRef} className="h-4 shrink-0" aria-hidden />
            {loadingMore ? (
              <div className="py-3 text-center text-xs text-neutral-500">
                Loading more…
              </div>
            ) : null}
            {!hasMore && items.length > 0 ? (
              <div className="py-2 text-center text-xs text-neutral-400">
                End of list
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-neutral-500">
            No Pokemon loaded.
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 pt-2 text-xs text-neutral-500">
        {totalCount > 0
          ? `Showing ${items.length} of ${totalCount}`
          : initialLoading
            ? null
            : "0 Pokemon"}
      </div>
    </div>
  );
}
