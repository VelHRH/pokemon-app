import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_BASE, getList, listPokemons } from "@lib/api";
import { PokemonCard } from "@components/PokemonCard";
import { Button } from "@components/common/Button";
import { ButtonVariant } from "@components/common/Button/buttonVariants";
import { PageTitle } from "@components/common/Title/PageTitle";
import type { Pokemon, PokemonList } from "@shared";
import { toCardModel } from "@helpers/toCardModel";
import { titleCase } from "@helpers/titleCase";

export function ListDetailPage() {
  const { id } = useParams();

  const [list, setList] = useState<PokemonList | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    Promise.all([getList(id), listPokemons()])
      .then(([l, ps]) => {
        if (cancelled) return;
        setList(l);
        setPokemons(ps);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load list");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const cards = useMemo(() => {
    if (!list || !pokemons) return [];
    const byNumber = new Map<number, Pokemon>(
      pokemons.map((p) => [p.number, p]),
    );
    return list.pokemonNumbers
      .map((n) => byNumber.get(n))
      .filter((p): p is Pokemon => Boolean(p))
      .map(toCardModel);
  }, [list, pokemons]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-neutral-600 hover:underline">
            ← Back to lists
          </Link>
          <PageTitle className="mt-1">
            {list ? titleCase(list.name) : "List"}
          </PageTitle>
          {list ? (
            <div className="mt-1 text-sm text-neutral-600">
              {list.pokemonNumbers.length} Pokémon
            </div>
          ) : null}
        </div>

        {list ? (
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={() => navigate(`${API_BASE}/lists/${list._id}/download`)}
          >
            Download JSON
          </Button>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!error && (!list || !pokemons) ? (
        <div className="mt-6 text-sm text-neutral-600">Loading…</div>
      ) : error ? null : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <PokemonCard key={c.number} pokemon={c} />
          ))}
        </div>
      )}
    </div>
  );
}
