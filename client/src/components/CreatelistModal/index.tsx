import { useEffect, useId, useState, type FormEvent } from "react";
import { createList } from "@lib/api";
import { Button } from "../common/Button/Button";
import { ButtonVariant } from "../common/Button/buttonVariants";
import { SectionTitle } from "../common/Title/SectionTItle";
import type { PokemonList } from "@shared";
import { MIN_SELECTED_POKEMON, POKEMON_PAGE_SIZE } from "@constants/pokemon";
import { PokemonPicker } from "./PokemonPicker";
import { usePokemonInfiniteScroll } from "./hooks/usePokemonInfiniteScroll";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (list: PokemonList) => void;
};

export function CreateListModal({ open, onClose, onCreated }: Props) {
  const titleId = useId();

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    scrollRef,
    sentinelRef,
    items,
    totalCount,
    hasMore,
    initialLoading: listInitialLoading,
    loadingMore: listLoadingMore,
    error: listError,
  } = usePokemonInfiniteScroll({ open, pageSize: POKEMON_PAGE_SIZE });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

          <PokemonPicker
            items={items}
            totalCount={totalCount}
            hasMore={hasMore}
            initialLoading={listInitialLoading}
            loadingMore={listLoadingMore}
            error={listError}
            selected={selected}
            onToggleNumber={toggleNumber}
            scrollRef={scrollRef}
            sentinelRef={sentinelRef}
          />

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
