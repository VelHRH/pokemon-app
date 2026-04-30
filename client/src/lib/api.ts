import type {
  CreateListRequest,
  Paginated,
  Pokemon,
  PokemonList,
} from "@shared";

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function apiAssetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}${normalized}`;
  }
  return normalized.startsWith("/api") ? normalized : `/api${normalized}`;
}

export function listDownloadUrl(listId: string): string {
  return apiAssetUrl(`/lists/${encodeURIComponent(listId)}/download`);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error("API_BASE is not set");
  }
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || res.statusText;
    try {
      const j = JSON.parse(text) as { message?: string | string[] };
      if (Array.isArray(j.message)) message = j.message.join(", ");
      else if (typeof j.message === "string") message = j.message;
    } catch {
      /* plain text error */
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export function uploadListFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return request<PokemonList>("/lists/upload", {
    method: "POST",
    body: fd,
  });
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
