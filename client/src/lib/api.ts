import type {
  CreateListRequest,
  Paginated,
  Pokemon,
  PokemonList,
} from "@shared";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error("API_BASE is not set");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(JSON.parse(text).message);
  }

  return (await res.json()) as T;
}

export function listLists() {
  return request<PokemonList[]>("/lists");
}

export function getList(id: string) {
  return request<PokemonList>(`/lists/${encodeURIComponent(id)}`);
}

export function createList(dto: CreateListRequest) {
  return request<PokemonList>("/lists", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function listPokemons() {
  return request<Pokemon[]>("/pokemon");
}

export function listPokemonsPage(page: number, limit: number) {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return request<Paginated<Pokemon>>(`/pokemon?${q}`);
}
