import { useCallback, useEffect, useRef, useState } from "react";
import { listPokemonsPage } from "@lib/api";
import type { Pokemon } from "@shared";

export function usePokemonInfiniteScroll(params: {
  open: boolean;
  pageSize: number;
}) {
  const { open, pageSize } = params;

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<() => void>(() => {});

  const [items, setItems] = useState<Pokemon[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listPokemonsPage(1, pageSize)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotalCount(data.total);
        setNextPage(2);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load Pokemon.");
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, pageSize]);

  const loadMore = useCallback(async () => {
    if (!open || initialLoading || fetchingRef.current) return;
    if (totalCount > 0 && items.length >= totalCount) return;

    fetchingRef.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const page = nextPage;
      const data = await listPokemonsPage(page, pageSize);
      setItems((prev) => [...prev, ...data.items]);
      setTotalCount(data.total);
      setNextPage(page + 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load more Pokemon.");
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [open, initialLoading, items.length, totalCount, nextPage, pageSize]);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    if (!open || initialLoading) return;
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
  }, [open, initialLoading, items.length]);

  const hasMore = totalCount === 0 ? true : items.length < totalCount;

  return {
    scrollRef,
    sentinelRef,
    items,
    totalCount,
    hasMore,
    initialLoading,
    loadingMore,
    error,
  };
}
