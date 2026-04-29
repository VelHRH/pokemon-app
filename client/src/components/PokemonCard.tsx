import { titleCase } from "@helpers/titleCase";
import { cn } from "@lib/cn";
import type { PokemonCardModel } from "@helpers/toCardModel";

type Props = {
  pokemon: PokemonCardModel;
  selected?: boolean;
  onToggle?: () => void;
};

export function PokemonCard({ pokemon, selected, onToggle }: Props) {
  const interactive = Boolean(onToggle);
  const { number, name, speciesName, types, imageUrl, weight } = pokemon;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-500">#{number}</div>
          <div className="text-lg font-semibold">{titleCase(name)}</div>
          {speciesName ? (
            <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
              {titleCase(speciesName)} · {weight} kg
            </div>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-2">
            {types.map((t) => (
              <span
                key={t}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {interactive && selected ? (
            <span className="rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white">
              Selected
            </span>
          ) : null}
          <div className="h-16 w-16 overflow-hidden rounded-lg bg-neutral-50">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={
                  speciesName
                    ? `${titleCase(name)} (${titleCase(speciesName)})`
                    : name
                }
                className="h-full w-full object-contain"
                loading="lazy"
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-colors",
          selected
            ? "border-black ring-2 ring-black ring-offset-2"
            : "border-neutral-200 hover:border-neutral-400",
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      {inner}
    </div>
  );
}
