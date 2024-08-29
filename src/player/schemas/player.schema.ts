import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlayerDocument = HydratedDocument<Player>;

@Schema()
export class Player {

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

export const PlayerSchema = SchemaFactory.createForClass(Player);
