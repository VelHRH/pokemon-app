import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon, PokemonDocument } from './pokemon.schema';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private pokemonModel: Model<PokemonDocument>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    const createdPokemon = new this.pokemonModel(createPokemonDto);
    return createdPokemon.save();
  }

  async findAll(): Promise<Pokemon[]> {
    return this.pokemonModel.find().exec();
  }

  async findPage(
    page: number,
    limit: number,
  ): Promise<{
    items: Pokemon[];
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
    const [items, total] = await Promise.all([
      this.pokemonModel
        .find()
        .sort({ number: 1 })
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      this.pokemonModel.countDocuments().exec(),
    ]);
    return { items, total, page: safePage, limit: safeLimit };
  }

  async findOne(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findById(id).exec();
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }
    return pokemon;
  }

  async findByName(name: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel
      .findOne({ name: new RegExp(name, 'i') })
      .exec();
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with name ${name} not found`);
    }
    return pokemon;
  }

  async findByType(type: string): Promise<Pokemon[]> {
    return this.pokemonModel
      .find({ type: { $in: [new RegExp(type, 'i')] } })
      .exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.pokemonModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }
  }
}
