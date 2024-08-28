import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./schemas/player.schema";
import {Model} from "mongoose";
import {PlayerEntity} from "./entities/player.entity";

@Injectable()
export class PlayerService {

  constructor(@InjectModel(Player.name) private playerModel: Model<Player>) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const DEFAULT_ELO: number = 1000;
    const DEFAULT_WINS_AMOUNT: number = 0;
    const DEFAULT_GAMES_AMOUNT: number = 0;
    let player: PlayerEntity = new PlayerEntity(
        createPlayerDto.id,
        createPlayerDto.name,
        DEFAULT_ELO,
        DEFAULT_WINS_AMOUNT,
        DEFAULT_GAMES_AMOUNT,
    );
    const createdPlayer = new this.playerModel(player);
    return createdPlayer.save();
  }

  async findAll(): Promise<Player[]> {
    return this.playerModel.find().exec();
  }

  async findOne(id: number) {
    return `This action returns a #${id} player`;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto) {
    return `This action updates a #${id} player`;
  }

  async remove(id: number) {
    return `This action removes a #${id} player`;
  }
}
