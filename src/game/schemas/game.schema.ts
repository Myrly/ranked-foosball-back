import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<Game>;

@Schema()
export class Game {

    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true })
    elo: number;

    @Prop({ required: true })
    wins: number;

    @Prop({ required: true })
    games: number;
}

export const GameSchema = SchemaFactory.createForClass(Game);
