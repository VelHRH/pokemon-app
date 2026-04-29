import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon, PokemonDocument } from './pokemon.schema';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

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

  async update(
    id: string,
    updatePokemonDto: UpdatePokemonDto,
  ): Promise<Pokemon> {
    const updatedPokemon = await this.pokemonModel
      .findByIdAndUpdate(id, updatePokemonDto, { new: true })
      .exec();
    if (!updatedPokemon) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }
    return updatedPokemon;
  }

  async remove(id: string): Promise<void> {
    const result = await this.pokemonModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }
  }
}
