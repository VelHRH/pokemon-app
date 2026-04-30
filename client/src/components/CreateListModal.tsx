import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createList, listPokemonsPage } from "@lib/api";
import { Button } from "./common/Button/Button";
import { ButtonVariant } from "./common/Button/buttonVariants";
import { SectionTitle } from "./common/Title/SectionTItle";
import { PokemonCard } from "./PokemonCard";
import type { Pokemon, PokemonList } from "@shared";
import { toCardModel } from "@helpers/toCardModel";
import { MIN_SELECTED_POKEMON, POKEMON_PAGE_SIZE } from "../constants/pokemon";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (list: PokemonList) => void;
};

export function CreateListModal({ open, onClose, onCreated }: Props) {
  const titleId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<() => void>(() => {});

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [items, setItems] = useState<Pokemon[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(1);
  const [listInitialLoading, setListInitialLoading] = useState(false);
  const [listLoadingMore, setListLoadingMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listPokemonsPage(1, POKEMON_PAGE_SIZE)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotalCount(data.total);
        setNextPage(2);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setListError(
            e instanceof Error ? e.message : "Failed to load Pokemon.",
          );
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setListInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const loadMore = useCallback(async () => {
    if (!open || listInitialLoading || fetchingRef.current) return;
    if (totalCount > 0 && items.length >= totalCount) return;

    fetchingRef.current = true;
    setListLoadingMore(true);
    setListError(null);
    try {
      const page = nextPage;
      const data = await listPokemonsPage(page, POKEMON_PAGE_SIZE);
      setItems((prev) => {
        const next = [...prev, ...data.items];
        return next;
      });
      setTotalCount(data.total);
      setNextPage(page + 1);
    } catch (e: unknown) {
      setListError(
        e instanceof Error ? e.message : "Failed to load more Pokemon.",
      );
    } finally {
      fetchingRef.current = false;
      setListLoadingMore(false);
    }
  }, [open, listInitialLoading, items.length, totalCount, nextPage]);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    if (!open || listInitialLoading) return;
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        loadMoreRef.current();
      },
      { root, rootMargin: "120px", threshold: 0 },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [open, listInitialLoading, items.length]);

  if (!open) return null;

  function toggleNumber(n: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a list name.");
      return;
    }
    const pokemonNumbers = [...selected].sort((a, b) => a - b);
    if (pokemonNumbers.length < MIN_SELECTED_POKEMON) {
      setError("Select at least three Pokemon.");
      return;
    }

    setSubmitting(true);
    try {
      const list = await createList({ name: trimmed, pokemonNumbers });
      onCreated(list);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create list.");
    } finally {
      setSubmitting(false);
    }
  }

  const hasMore = totalCount === 0 ? true : items.length < totalCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(90vh,760px)] w-full max-w-3xl flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <SectionTitle id={titleId}>Create list</SectionTitle>
        <p className="mt-1 text-sm text-neutral-600">
          Tap Pokemon to select or deselect. The server requires at least three
          Pokemon that exist in your database and belong to different species.
          Scroll down to load more.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex min-h-0 flex-1 flex-col gap-4"
        >
          <div>
            <label
              htmlFor="create-list-name"
              className="block text-sm font-medium text-neutral-700"
            >
              Name
            </label>
            <input
              id="create-list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none ring-black focus:border-neutral-500 focus:ring-2 focus:ring-black/10"
              placeholder="My favorites"
              autoComplete="off"
              disabled={submitting}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Pokemon
              </label>
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

            {listError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {listError}
              </div>
            ) : null}

            <div
              ref={scrollRef}
              className="min-h-[220px] flex-1 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 sm:min-h-[280px]"
            >
              {listInitialLoading ? (
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
                        onToggle={() => toggleNumber(p.number)}
                      />
                    ))}
                  </div>
                  <div ref={sentinelRef} className="h-4 shrink-0" aria-hidden />
                  {listLoadingMore ? (
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
                : listInitialLoading
                  ? null
                  : "0 Pokemon"}
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant={ButtonVariant.SECONDARY}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                listInitialLoading ||
                selected.size < MIN_SELECTED_POKEMON
              }
            >
              {submitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
