import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { PokemonListFileEntry, PokemonListFileV2 } from '@shared';
import { Pokemon, PokemonDocument } from '../pokemon/pokemon.schema';
import { PokemonList, PokemonListDocument } from './list.schema';
import { CreateListDto } from './dto/create-list.dto';
import { MAX_LIST_TOTAL_WEIGHT_HG } from './list.constants';

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

  async findOne(id: string): Promise<PokemonListDocument> {
    const list = await this.listModel.findById(id).exec();
    if (!list) throw new NotFoundException(`List with ID ${id} not found`);
    return list;
  }

  async recreateFromFile(payload: {
    name: string;
    pokemonNumbers?: number[];
    pokemon?: { number: number }[];
  }): Promise<PokemonList> {
    let raw: number[] = [];
    if (payload.pokemonNumbers?.length) {
      raw = payload.pokemonNumbers;
    } else if (payload.pokemon?.length) {
      raw = payload.pokemon.map((p) => p.number);
    } else {
      throw new BadRequestException(
        'Payload must include pokemonNumbers or pokemon entries with number.',
      );
    }

    const pokemonNumbers = this.normalizeNumbers(raw);
    await this.validateListRules(pokemonNumbers);

    const name = await this.disambiguateUploadListName(payload.name.trim());

    const created = new this.listModel({
      name,
      pokemonNumbers,
    });
    return created.save();
  }

  /** If another list already uses this name, try `Name 1`, `Name 2`, … */
  private async disambiguateUploadListName(trimmed: string): Promise<string> {
    let candidate = trimmed;
    let i = 1;
    while (await this.listModel.exists({ name: candidate })) {
      candidate = `${trimmed} ${i}`;
      i += 1;
    }
    return candidate;
  }

  async buildDownloadPayload(
    list: PokemonListDocument,
  ): Promise<PokemonListFileV2> {
    const numbers = list.pokemonNumbers;
    const docs = await this.pokemonModel
      .find({ number: { $in: numbers } })
      .populate({ path: 'species', select: 'name' })
      .lean()
      .exec();

    const byNumber = new Map<number, Record<string, unknown>>(
      docs.map((d) => [d.number, d as Record<string, unknown>]),
    );

    const pokemon: PokemonListFileEntry[] = [];
    let totalWeightHg = 0;

    for (const n of numbers) {
      const d = byNumber.get(n);
      if (!d) {
        throw new BadRequestException(`Pokemon #${n} missing from catalogue.`);
      }

      const speciesField = d.species as
        | Types.ObjectId
        | { _id: Types.ObjectId; name: string }
        | string
        | null
        | undefined;

      let speciesName: string | undefined;
      if (
        speciesField &&
        typeof speciesField === 'object' &&
        'name' in speciesField
      ) {
        speciesName = speciesField.name;
      }

      const w = Number(d.weight ?? 0);
      totalWeightHg += w;

      pokemon.push({
        number: Number(d.number),
        name: String(d.name),
        types: d.type as string[],
        speciesName,
        weightHg: w,
      });
    }

    return {
      version: 2,
      name: list.name,
      exportedAt: new Date().toISOString(),
      sourceListId: String(list._id),
      pokemonNumbers: [...numbers],
      pokemon,
      totalWeightHg,
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
      throw new BadRequestException('List must include at least 3 Pokemon.');
    }

    const existingNumbers = await this.pokemonModel.distinct('number', {
      number: { $in: pokemonNumbers },
    });

    if (existingNumbers.length !== pokemonNumbers.length) {
      const existingSet = new Set<number>(existingNumbers);
      const missing = pokemonNumbers.filter((n) => !existingSet.has(n));
      throw new BadRequestException(
        `Some Pokemon were not found in the catalogue: ${missing.join(', ')}`,
      );
    }

    const distinctSpecies = await this.pokemonModel.distinct('species', {
      number: { $in: pokemonNumbers },
    });

    if (distinctSpecies.length < 3) {
      throw new BadRequestException(
        `At least 3 Pokemon of different species must be selected (currently: ${distinctSpecies.length}).`,
      );
    }

    await this.validateTotalWeightHg(pokemonNumbers);
  }

  private async validateTotalWeightHg(pokemonNumbers: number[]): Promise<void> {
    const docs = await this.pokemonModel
      .find({ number: { $in: pokemonNumbers } })
      .select({ weight: 1 })
      .lean()
      .exec();

    const totalHg = docs.reduce((sum, doc) => sum + (doc.weight ?? 0), 0);

    if (totalHg > MAX_LIST_TOTAL_WEIGHT_HG) {
      throw new BadRequestException(
        `Total weight of selected Pokemon must not exceed ${MAX_LIST_TOTAL_WEIGHT_HG} hectograms (current sum: ${totalHg}).`,
      );
    }
  }
}
