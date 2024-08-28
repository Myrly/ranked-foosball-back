import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import {Player, PlayerSchema} from "./schemas/player.schema";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }])],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
