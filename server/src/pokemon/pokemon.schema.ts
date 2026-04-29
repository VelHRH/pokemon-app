import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PokemonDocument = Pokemon & Document;

@Schema({ timestamps: true })
export class Pokemon {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  type: string[];

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
