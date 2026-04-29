import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PokemonSpecies } from '../species/species.schema';

export type PokemonDocument = Pokemon & Document;

@Schema({ timestamps: true })
export class Pokemon {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  number: number;

  @Prop({ required: true })
  type: string[];

  @Prop({
    type: Types.ObjectId,
    ref: PokemonSpecies.name,
    required: true,
    index: true,
  })
  species: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: 0 })
  hp?: number;

  @Prop({ default: 0 })
  attack?: number;

  @Prop({ default: 0 })
  defense?: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
