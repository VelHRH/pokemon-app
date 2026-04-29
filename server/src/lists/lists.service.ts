import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon, PokemonDocument } from '../pokemon/pokemon.schema';
import { PokemonList, PokemonListDocument } from './list.schema';
import { CreateListDto } from './dto/create-list.dto';

@Injectable()
export class ListsService {
  constructor(
    @InjectModel(PokemonList.name)
    private readonly listModel: Model<PokemonListDocument>,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<PokemonDocument>,
  ) {}

  async create(dto: CreateListDto): Promise<PokemonList> {
    const pokemonNumbers = this.normalizeNumbers(dto.pokemonNumbers);
    await this.validateListRules(pokemonNumbers);

    const created = new this.listModel({
      name: dto.name.trim(),
      pokemonNumbers,
    });
    return created.save();
  }

  async findAll(): Promise<PokemonList[]> {
    return this.listModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<PokemonList> {
    const list = await this.listModel.findById(id).exec();
    if (!list) throw new NotFoundException(`List with ID ${id} not found`);
    return list;
  }

  async recreateFromFile(payload: {
    name: string;
    pokemonNumbers: number[];
  }): Promise<PokemonList> {
    const pokemonNumbers = this.normalizeNumbers(payload.pokemonNumbers);
    await this.validateListRules(pokemonNumbers);

    const created = new this.listModel({
      name: payload.name.trim(),
      pokemonNumbers,
    });
    return created.save();
  }

  buildDownloadPayload(list: PokemonList) {
    return {
      version: 1,
      name: list.name,
      pokemonNumbers: list.pokemonNumbers,
    };
  }

  private normalizeNumbers(numbers: number[]): number[] {
    if (!Array.isArray(numbers)) return [];
    const seen = new Set<number>();
    const out: number[] = [];
    for (const n of numbers) {
      const num = Number(n);
      if (!Number.isFinite(num) || num < 1) continue;
      if (seen.has(num)) continue;
      seen.add(num);
      out.push(num);
    }
    return out;
  }

  private async validateListRules(pokemonNumbers: number[]): Promise<void> {
    if (pokemonNumbers.length === 0) {
      throw new BadRequestException('List must include at least 3 Pokémon.');
    }

    const existingNumbers = await this.pokemonModel.distinct('number', {
      number: { $in: pokemonNumbers },
    });

    if (existingNumbers.length !== pokemonNumbers.length) {
      const existingSet = new Set<number>(existingNumbers);
      const missing = pokemonNumbers.filter((n) => !existingSet.has(n));
      throw new BadRequestException(
        `Some Pokémon were not found in the catalogue: ${missing.join(', ')}`,
      );
    }

    const distinctSpecies = await this.pokemonModel.distinct('species', {
      number: { $in: pokemonNumbers },
    });

    if (distinctSpecies.length < 3) {
      throw new BadRequestException(
        `At least 3 Pokémon of different species must be selected (currently: ${distinctSpecies.length}).`,
      );
    }
  }
}
