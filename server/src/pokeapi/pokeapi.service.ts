import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type {
  PokeApiListResponse,
  PokeApiNamedResource,
  PokeApiPokemon,
} from './pokeapi.types';

@Injectable()
export class PokeApiService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  private async getJson<T>(pathOrUrl: string): Promise<T> {
    const url = pathOrUrl.startsWith('http')
      ? pathOrUrl
      : `${this.baseUrl}${pathOrUrl}`;

    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new ServiceUnavailableException(
        `PokeAPI request failed: ${res.status} ${res.statusText}`,
      );
    }

    return (await res.json()) as T;
  }

  async getByUrl<T>(url: string): Promise<T> {
    return this.getJson<T>(url);
  }

  async listPokemon(options?: {
    limit?: number;
    offset?: number;
    withDetails?: boolean;
  }): Promise<
    | PokeApiListResponse<PokeApiNamedResource>
    | (PokeApiListResponse<PokeApiNamedResource> & { items: PokeApiPokemon[] })
  > {
    const limit = options?.limit ?? 1;
    const offset = options?.offset ?? 0;
    const withDetails = options?.withDetails ?? false;

    const list = await this.getJson<PokeApiListResponse<PokeApiNamedResource>>(
      `/pokemon?limit=${limit}&offset=${offset}`,
    );

    if (!withDetails) return list;

    const items = await Promise.all(
      list.results.map((r) => this.getJson<PokeApiPokemon>(r.url)),
    );

    return { ...list, items };
  }
}
