import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<Game>;

@Schema()
export class Game {

    @Prop({ type: mongoose.Schema.Types.ObjectId, index: true, required: true, auto: true })
    id: string;

    @Prop({ required: true })
    firstTeam: string[];

    @Prop({ required: true })
    secondTeam: string[];

}

export const GameSchema = SchemaFactory.createForClass(Game);
