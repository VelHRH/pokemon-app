import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { PokemonOutput } from '@shared';
import { Pokemon, PokemonDocument } from './pokemon.schema';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

@Injectable()
export class PokemonService {
  private readonly speciesPopulate = {
    path: 'species',
    select: 'name',
  } as const;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<PokemonDocument>,
  ) {}

  private toApi(
    raw: Record<string, unknown> | null | undefined,
  ): PokemonOutput | null {
    if (!raw) return null;
    const speciesField = raw.species as { name: string } | undefined;

    return {
      _id: String(raw._id),
      number: Number(raw.number),
      name: String(raw.name),
      type: raw.type as string[],
      imageUrl: raw.imageUrl as string | undefined,
      hp: raw.hp as number | undefined,
      attack: raw.attack as number | undefined,
      defense: raw.defense as number | undefined,
      speciesName: speciesField?.name,
      weight: raw.weight as number | undefined,
      createdAt: String(raw.createdAt),
      updatedAt: String(raw.updatedAt),
    };
  }

  private toApiList(docs: Record<string, unknown>[]): PokemonOutput[] {
    return docs
      .map((d) => this.toApi(d))
      .filter((p): p is PokemonOutput => p !== null);
  }

  async create(createPokemonDto: CreatePokemonDto): Promise<PokemonOutput> {
    const created = new this.pokemonModel(createPokemonDto);
    const saved = await created.save();
    const doc = await this.pokemonModel
      .findById(saved._id)
      .populate(this.speciesPopulate)
      .lean()
      .exec();
    const out = this.toApi(doc);
    if (!out) {
      throw new NotFoundException('Could not load created Pokemon');
    }
    return out;
  }

  async findAll(): Promise<PokemonOutput[]> {
    const docs = await this.pokemonModel
      .find()
      .populate(this.speciesPopulate)
      .lean()
      .exec();
    return this.toApiList(docs as Record<string, unknown>[]);
  }

  async findPage(
    page: number,
    limit: number,
  ): Promise<{
    items: PokemonOutput[];
    total: number;
    page: number;
    limit: number;
  }> {
    const safePage = Math.max(1, Number.isFinite(page) ? page : 1);
    const safeLimit = Math.min(
      100,
      Math.max(1, Number.isFinite(limit) ? limit : 20),
    );
    const skip = (safePage - 1) * safeLimit;
    const [docs, total] = await Promise.all([
      this.pokemonModel
        .find()
        .sort({ number: 1 })
        .skip(skip)
        .limit(safeLimit)
        .populate(this.speciesPopulate)
        .lean()
        .exec(),
      this.pokemonModel.countDocuments().exec(),
    ]);
    return {
      items: this.toApiList(docs as Record<string, unknown>[]),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async findOne(id: string): Promise<PokemonOutput> {
    const doc = await this.pokemonModel
      .findById(id)
      .populate(this.speciesPopulate)
      .lean()
      .exec();
    const json = this.toApi(doc as Record<string, unknown>);
    if (!json) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }
    return json;
  }

  async findByName(name: string): Promise<PokemonOutput> {
    const doc = await this.pokemonModel
      .findOne({ name: new RegExp(name, 'i') })
      .populate(this.speciesPopulate)
      .lean()
      .exec();
    const json = this.toApi(doc as Record<string, unknown>);
    if (!json) {
      throw new NotFoundException(`Pokemon with name ${name} not found`);
    }
    return json;
  }

  async findByType(type: string): Promise<PokemonOutput[]> {
    const docs = await this.pokemonModel
      .find({ type: { $in: [new RegExp(type, 'i')] } })
      .populate(this.speciesPopulate)
      .lean()
      .exec();
    return this.toApiList(docs as Record<string, unknown>[]);
  }

  async remove(id: string): Promise<void> {
    const result = await this.pokemonModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }
  }
}
